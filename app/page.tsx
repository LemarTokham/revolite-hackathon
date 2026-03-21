"use client";

import { useState } from "react";
import { triggerSpend, Transaction } from "@/lib/api";
import { IN_PERSON_MERCHANTS, ONLINE_MERCHANTS } from "@/lib/merchants";

export default function Home() {
  const [balance, setBalance] = useState(1000.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inPersonAmount, setInPersonAmount] = useState("5.00");
  const [onlineAmount, setOnlineAmount] = useState("25.00");
  const [inPersonMerchant, setInPersonMerchant] = useState(0);
  const [onlineMerchant, setOnlineMerchant] = useState(0);
  const [loading, setLoading] = useState<"in-person" | "online" | null>(null);

  async function handleSpend(type: "in-person" | "online") {
    const amount = parseFloat(type === "in-person" ? inPersonAmount : onlineAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;

    const merchant = type === "in-person"
      ? IN_PERSON_MERCHANTS[inPersonMerchant]
      : ONLINE_MERCHANTS[onlineMerchant];

    setLoading(type);

    const newBalance = Math.round((balance - amount) * 100) / 100;
    const result = await triggerSpend(type, amount, merchant, newBalance);

    setLoading(null);
    if (result.success) {
      setBalance(newBalance);
      setTransactions((prev) => [result.transaction, ...prev]);
    }
  }

  return (
    <div className="container">
      <h1>Revolite</h1>
      <div className="balance">
        <span className="balance-label">Balance</span>
        <span className="balance-amount">£{balance.toFixed(2)}</span>
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
