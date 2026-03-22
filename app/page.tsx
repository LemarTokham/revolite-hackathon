"use client";

import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  type: "in-person" | "online";
  amount: number;
  merchant: string;
  category: string;
  timestamp: string;
  balanceAfter: number;
}

interface PotTransaction {
  id: string;
  amount: number;
  merchant: string;
  timestamp: string;
  balanceAfter: number;
}

interface BankTheme {
  id: string;
  name: string;
  provider: string;
  primaryColor: string;
  accentColor: string;
  savingsColor: string;
  isDark: boolean;
}

interface ImpulseZone {
  id: number;
  name: string;
}

const ICON_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316"];

function merchantInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function merchantColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ICON_COLORS[Math.abs(hash) % ICON_COLORS.length];
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [theme, setTheme] = useState<BankTheme | null>(null);

  const [balance, setBalance] = useState(1000.0);
  const [pot, setPot] = useState(0.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [potTransactions, setPotTransactions] = useState<PotTransaction[]>([]);
  const [impulses, setImpulses] = useState<ImpulseZone[]>([]);
  const [showSavings, setShowSavings] = useState(false);

  const [inPersonAmount, setInPersonAmount] = useState("5.00");
  const [onlineAmount, setOnlineAmount] = useState("25.00");
  const [inPersonImpulse, setInPersonImpulse] = useState<number | "">("");
  const [onlineImpulse, setOnlineImpulse] = useState<number | "">("");
  const [loading, setLoading] = useState<"in-person" | "online" | null>(null);
  const [overLimit, setOverLimit] = useState(false);
  const [impulseLimit, setImpulseLimit] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    async function init() {
      const [themeRes, authRes] = await Promise.all([
        fetch("/api/theme"),
        fetch("/api/me"),
      ]);
      const themeData = await themeRes.json();
      setTheme(themeData);
      const authData = await authRes.json();
      if (authData.loggedIn) {
        setLoggedIn(true);
        setUsername(authData.username);
      }
      setCheckingAuth(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    async function fetchImpulses() {
      const res = await fetch("/api/impulses");
      if (res.ok) setImpulses(await res.json());
    }
    fetchImpulses();
    async function sync() {
      const res = await fetch("/api/pot");
      const data = await res.json();
      setBalance(data.balance);
      setPot(data.potBalance);
      setTransactions(data.transactions);
      setPotTransactions(data.potTransactions || []);
      setOverLimit(data.overLimit || false);
      setImpulseLimit(data.impulseLimit || 0);
      setTotalSpent(data.totalSpent || 0);
    }
    sync();
    const interval = setInterval(sync, 2000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoginLoading(false);
    if (data.success) setLoggedIn(true);
    else setLoginError(data.error || "Login failed");
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setImpulses([]);
    setTransactions([]);
  }

  async function handleSpend(type: "in-person" | "online") {
    const amount = parseFloat(type === "in-person" ? inPersonAmount : onlineAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;
    const impulseId = type === "in-person" ? inPersonImpulse : onlineImpulse;
    const impulseName = impulses.find((i) => i.id === impulseId)?.name || "Purchase";
    setLoading(type);
    const res = await fetch("/api/spend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount, merchant: impulseName, impulseZoneId: impulseId || null }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.success) {
      setBalance(data.balance);
      setPot(data.potBalance);
      if (data.overLimit) {
        setOverLimit(true);
        if (type === "in-person") {
          const audio = new Audio("/horse.mp3");
          audio.play().catch(() => {});
        }
      }
    }
  }

  const themeClass = theme?.isDark === false ? "theme-light" : "theme-dark";
  const primary = theme?.primaryColor || "#0666eb";

  const balanceWhole = Math.floor(balance).toLocaleString();
  const balancePence = (balance % 1).toFixed(2).slice(1);

  // Set CSS variable for focus rings
  const cssVars = { "--primary": primary } as React.CSSProperties;

  if (checkingAuth) {
    return (
      <div className={themeClass} style={cssVars}>
        <div className="login-screen">
          <div className="login-logo">{theme?.name || "Bank"}</div>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className={themeClass} style={cssVars}>
        <div className="login-screen">
          <div className="login-logo">{theme?.name || "Bank"}</div>
          <p className="login-subtitle">Sign in to your account</p>
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {loginError && <p className="login-error">{loginError}</p>}
            <button
              className="btn-spend"
              type="submit"
              disabled={loginLoading}
              style={{ background: primary, marginTop: "0.5rem" }}
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={themeClass} style={cssVars}>
      <div className="app-header">
        <h1>{theme?.name || "Bank"}</h1>
        <button className="btn-action" onClick={handleLogout}>Sign Out</button>
      </div>

      <div className="balance-hero">
        <div className="balance-label">Total Balance</div>
        <div className="balance-amount">
          <span className="currency">£</span>{balanceWhole}{balancePence}
        </div>
      </div>

      <div className="accounts-row">
        <div className="account-card">
          <span className="card-label">Current</span>
          <span className="card-amount">£{balance.toFixed(2)}</span>
          <span className="card-sub">Main account</span>
        </div>
        <div className="account-card savings" onClick={() => setShowSavings(!showSavings)}>
          <span className="card-label">Savings</span>
          <span className="card-amount savings-color">£{pot.toFixed(2)}</span>
          <span className="card-sub">Impulse tax pot</span>
        </div>
      </div>

      {overLimit && impulseLimit > 0 && (
        <div className="over-limit-banner">
          <div className="over-limit-text">
            You have exceeded your impulse limit of £{impulseLimit.toFixed(2)}
          </div>
          <div className="over-limit-sub">
            £{totalSpent.toFixed(2)} spent — in-person payments will trigger a sound alert
          </div>
        </div>
      )}

      {showSavings && (
        <div className="savings-panel">
          <div className="savings-panel-header">
            <h2>Savings Statements</h2>
            <button className="btn-action" onClick={() => setShowSavings(false)}>Close</button>
          </div>
          {potTransactions.length === 0 ? (
            <p className="empty-state">No savings yet. Tax from impulse spending will appear here.</p>
          ) : (
            <ul>
              {potTransactions.map((t) => (
                <li key={t.id}>
                  <div className="tx-item">
                    <div className="tx-icon" style={{ background: merchantColor(t.merchant) }}>
                      {merchantInitial(t.merchant)}
                    </div>
                    <div className="tx-details">
                      <div className="tx-merchant">Tax on {t.merchant}</div>
                      <div className="tx-meta">{formatTime(t.timestamp)}</div>
                    </div>
                    <span className="tx-amount savings-color">+£{t.amount.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="spend-section">
        <div className="spend-card">
          <label>In-Person Purchase</label>
          <div className="spend-inputs">
            <select
              value={inPersonImpulse}
              onChange={(e) => setInPersonImpulse(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Category</option>
              {impulses.map((imp) => (
                <option key={imp.id} value={imp.id}>{imp.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={inPersonAmount}
              onChange={(e) => setInPersonAmount(e.target.value)}
            />
          </div>
          <button
            className="btn-spend"
            onClick={() => handleSpend("in-person")}
            disabled={loading !== null}
            style={{ background: primary }}
          >
            {loading === "in-person" ? "Processing..." : "Tap to Pay"}
          </button>
        </div>

        <div className="spend-card">
          <label>Online Purchase</label>
          <div className="spend-inputs">
            <select
              value={onlineImpulse}
              onChange={(e) => setOnlineImpulse(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Category</option>
              {impulses.map((imp) => (
                <option key={imp.id} value={imp.id}>{imp.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={onlineAmount}
              onChange={(e) => setOnlineAmount(e.target.value)}
            />
          </div>
          <button
            className="btn-spend"
            onClick={() => handleSpend("online")}
            disabled={loading !== null}
            style={{ background: primary }}
          >
            {loading === "online" ? "Processing..." : "Buy Online"}
          </button>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="tx-section">
          <div className="tx-section-title">Recent Transactions</div>
          <ul className="tx-list">
            {transactions.map((t) => (
              <li key={t.id} className="tx-item">
                <div className="tx-icon" style={{ background: merchantColor(t.merchant) }}>
                  {merchantInitial(t.merchant)}
                </div>
                <div className="tx-details">
                  <div className="tx-merchant">{t.merchant}</div>
                  <div className="tx-meta">{t.type === "in-person" ? "In-store" : "Online"} · {formatTime(t.timestamp)}</div>
                </div>
                <span className="tx-amount">-£{t.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
