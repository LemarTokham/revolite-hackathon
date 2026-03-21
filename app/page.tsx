"use client";

import { useState, useEffect } from "react";
import { IN_PERSON_MERCHANTS, ONLINE_MERCHANTS } from "@/lib/merchants";

interface Transaction {
  id: string;
  type: "in-person" | "online";
  amount: number;
  merchant: string;
  category: string;
  timestamp: string;
  balanceAfter: number;
}

export default function Home() {
  const [balance, setBalance] = useState(1000.0);
  const [pot, setPot] = useState(0.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inPersonAmount, setInPersonAmount] = useState("5.00");
  const [onlineAmount, setOnlineAmount] = useState("25.00");
  const [inPersonMerchant, setInPersonMerchant] = useState(0);
  const [onlineMerchant, setOnlineMerchant] = useState(0);
  const [loading, setLoading] = useState<"in-person" | "online" | null>(null);

  // Poll server state
  useEffect(() => {
    async function sync() {
      const res = await fetch("/api/pot");
      const data = await res.json();
      setBalance(data.balance);
      setPot(data.potBalance);
      setTransactions(data.transactions);
    }
    sync();
    const interval = setInterval(sync, 2000);
    return () => clearInterval(interval);
  }, []);

  async function handleSpend(type: "in-person" | "online") {
    const amount = parseFloat(type === "in-person" ? inPersonAmount : onlineAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;

    const merchantIndex = type === "in-person" ? inPersonMerchant : onlineMerchant;

    setLoading(type);

    const res = await fetch("/api/spend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount, merchantIndex }),
    });
    const data = await res.json();

    setLoading(null);
    if (data.success) {
      setBalance(data.balance);
      setPot(data.potBalance);
      setTransactions((prev) => [data.transaction, ...prev]);
    }
  }

  return (
    <div className="container">
      <h1>Revolite</h1>
      <div className="balance">
        <span className="balance-label">Balance</span>
        <span className="balance-amount">£{balance.toFixed(2)}</span>
      </div>

      <div className="pot">
        <span className="pot-label">Impulse Tax Pot</span>
        <span className="pot-amount">£{pot.toFixed(2)}</span>
      </div>

      <div className="spend-section">
        <div className="spend-card">
          <label>In-Person Purchase</label>
          <select
            value={inPersonMerchant}
            onChange={(e) => setInPersonMerchant(Number(e.target.value))}
          >
            {IN_PERSON_MERCHANTS.map((m, i) => (
              <option key={m.name} value={i}>{m.name}</option>
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
          >
            {loading === "in-person" ? "Processing..." : "Tap to Pay"}
          </button>
        </div>

        <div className="spend-card">
          <label>Online Purchase</label>
          <select
            value={onlineMerchant}
            onChange={(e) => setOnlineMerchant(Number(e.target.value))}
          >
            {ONLINE_MERCHANTS.map((m, i) => (
              <option key={m.name} value={i}>{m.name}</option>
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
                    <span className="tx-category">{t.category}</span>
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
