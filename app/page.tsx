"use client";

import { useState } from "react";
import { triggerSpend } from "@/lib/api";

export default function Home() {
  const [balance, setBalance] = useState(1000.0);
  const [inPersonAmount, setInPersonAmount] = useState("5.00");
  const [onlineAmount, setOnlineAmount] = useState("25.00");
  const [loading, setLoading] = useState<"in-person" | "online" | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSpend(type: "in-person" | "online") {
    const amount = parseFloat(type === "in-person" ? inPersonAmount : onlineAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;

    setLoading(type);
    setStatus(null);

    const result = await triggerSpend(type, amount);

    setLoading(null);
    if (result.success) {
      setBalance((b) => b - amount);
      setStatus(`${type === "in-person" ? "In-person" : "Online"} purchase of £${amount.toFixed(2)} triggered!`);
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
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={inPersonAmount}
            onChange={(e) => setInPersonAmount(e.target.value)}
          />
          <button
            className="btn-inperson"
            onClick={() => handleSpend("in-person")}
            disabled={loading !== null}
          >
            {loading === "in-person" ? "Processing..." : "Tap to Pay"}
          </button>
        </div>

        <div className="spend-card">
          <label>Online Purchase</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={onlineAmount}
            onChange={(e) => setOnlineAmount(e.target.value)}
          />
          <button
            className="btn-online"
            onClick={() => handleSpend("online")}
            disabled={loading !== null}
          >
            {loading === "online" ? "Processing..." : "Buy Online"}
          </button>
        </div>

        {status && <p className="status">{status}</p>}
      </div>
    </div>
  );
}
