import { Merchant } from "./merchants";

// TODO: Replace with real app's API endpoint
const API_URL = "http://localhost:4000/api/spend";

export interface Transaction {
  id: string;
  type: "in-person" | "online";
  amount: number;
  merchant: string;
  category: string;
  location: { lat: number; lng: number };
  timestamp: string;
  balanceAfter: number;
}

export async function triggerSpend(
  type: "in-person" | "online",
  amount: number,
  merchant: Merchant,
  balanceAfter: number
): Promise<{ success: boolean; transaction: Transaction }> {
  const transaction: Transaction = {
    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    type,
    amount,
    merchant: merchant.name,
    category: merchant.category,
    location: merchant.location,
    timestamp: new Date().toISOString(),
    balanceAfter,
  };

  console.log("Transaction:", JSON.stringify(transaction, null, 2));

  // TODO: Uncomment when real app's API is ready
  // const res = await fetch(API_URL, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(transaction),
  // });
  // return res.json();

  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: true, transaction };
}
