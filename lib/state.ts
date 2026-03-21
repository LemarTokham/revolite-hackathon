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

// In-memory state - TODO send to real db
const state = {
  balance: 1000.0,
  potBalance: 0.0,
  transactions: [] as Transaction[],
};

export default state;
