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
}

interface ImpulseZone {
  id: number;
  name: string;
}

export default function Home() {
  // Auth
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [theme, setTheme] = useState<BankTheme | null>(null);

  // Bank state
  const [balance, setBalance] = useState(1000.0);
  const [pot, setPot] = useState(0.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [potTransactions, setPotTransactions] = useState<PotTransaction[]>([]);
  const [impulses, setImpulses] = useState<ImpulseZone[]>([]);
  const [showSavings, setShowSavings] = useState(false);

  // Spend form
  const [inPersonAmount, setInPersonAmount] = useState("5.00");
  const [onlineAmount, setOnlineAmount] = useState("25.00");
  const [inPersonImpulse, setInPersonImpulse] = useState<number | "">("");
  const [onlineImpulse, setOnlineImpulse] = useState<number | "">("");
  const [loading, setLoading] = useState<"in-person" | "online" | null>(null);

  // Fetch theme + check if already logged in on load
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

  // Fetch impulses + poll server state when logged in
  useEffect(() => {
    if (!loggedIn) return;

    // Fetch impulse zones from main app
    async function fetchImpulses() {
      const res = await fetch("/api/impulses");
      if (res.ok) {
        const data = await res.json();
        setImpulses(data);
      }
    }
    fetchImpulses();

    // Poll balance/transactions
    async function sync() {
      const res = await fetch("/api/pot");
      const data = await res.json();
      setBalance(data.balance);
      setPot(data.potBalance);
      setTransactions(data.transactions);
      setPotTransactions(data.potTransactions || []);
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
    if (data.success) {
      setLoggedIn(true);
    } else {
      setLoginError(data.error || "Login failed");
    }
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
      body: JSON.stringify({
        type,
        amount,
        merchant: impulseName,
        impulseZoneId: impulseId || null,
      }),
    });
    const data = await res.json();

    setLoading(null);
    if (data.success) {
      setBalance(data.balance);
      setPot(data.potBalance);
    }
  }

  // Loading check
  if (checkingAuth) {
    return (
      <div className="container">
        <h1>{theme?.name || "Bank"}</h1>
      </div>
    );
  }

  // Login screen
  if (!loggedIn) {
    return (
      <div className="container">
        <h1>{theme?.name || "Bank"}</h1>
        <p className="login-subtitle">Sign in with your account</p>
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
          <button className="btn-spend" type="submit" disabled={loginLoading} style={{ background: theme?.primaryColor }}>
            {loginLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  // Main bank UI
  return (
    <div className="container">
      <div className="header">
        <h1>{theme?.name || "Bank"}</h1>
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>

      <p className="welcome">Welcome, {username}</p>

      <div className="accounts">
        <div className="account">
          <span className="account-label">Current Account</span>
          <span className="account-amount">£{balance.toFixed(2)}</span>
        </div>
        <div className="account savings" onClick={() => setShowSavings(!showSavings)} style={{ cursor: "pointer" }}>
          <span className="account-label">Savings Account</span>
          <span className="account-amount savings-amount">£{pot.toFixed(2)}</span>
        </div>
      </div>

      {showSavings && (
        <div className="transactions savings-statements">
          <div className="savings-header">
            <h2>Savings Statements</h2>
            <button className="btn-logout" onClick={() => setShowSavings(false)}>Close</button>
          </div>
          {potTransactions.length === 0 ? (
            <p className="empty-state">No savings yet. Tax from impulse spending will appear here.</p>
          ) : (
            <ul>
              {potTransactions.map((t) => (
                <li key={t.id}>
                  <div className="tx-row">
                    <div className="tx-left">
                      <span className="tx-merchant">Tax on {t.merchant}</span>
                      <span className="tx-category">{new Date(t.timestamp).toLocaleDateString()}</span>
                    </div>
                    <span className="tx-amount savings-amount">+£{t.amount.toFixed(2)}</span>
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
          <select
            value={inPersonImpulse}
            onChange={(e) => setInPersonImpulse(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select category</option>
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
          <button
            className="btn-spend"
            onClick={() => handleSpend("in-person")}
            disabled={loading !== null}
            style={{ background: theme?.primaryColor }}
          >
            {loading === "in-person" ? "Processing..." : "Tap to Pay"}
          </button>
        </div>

        <div className="spend-card">
          <label>Online Purchase</label>
          <select
            value={onlineImpulse}
            onChange={(e) => setOnlineImpulse(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select category</option>
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
          <button
            className="btn-spend"
            onClick={() => handleSpend("online")}
            disabled={loading !== null}
            style={{ background: theme?.primaryColor }}
          >
            {loading === "online" ? "Processing..." : "Buy Online"}
          </button>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="transactions">
          <h2>Transactions</h2>
          <ul>
            {transactions.map((t) => (
              <li key={t.id}>
                <div className="tx-row">
                  <div className="tx-left">
                    <span className="tx-merchant">{t.merchant}</span>
                    <span className="tx-category">{t.type}</span>
                  </div>
                  <span className="tx-amount">-£{t.amount.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
