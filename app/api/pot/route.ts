import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getUserState, setUserState } from "@/lib/state";

// Called by the main app during the taxing process to add money to the pot
export async function POST(req: NextRequest) {
  const { amount } = await req.json();
  const username = getCurrentUser();
  if (!username) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const user = getUserState(username);

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (amount > user.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const newBalance = Math.round((user.balance - amount) * 100) / 100;
  const newPot = Math.round((user.potBalance + amount) * 100) / 100;

  setUserState(username, {
    balance: newBalance,
    potBalance: newPot,
  });

  return NextResponse.json({
    success: true,
    balance: newBalance,
    potBalance: newPot,
  });
}

// Return current state for the logged-in user
export async function GET() {
  const username = getCurrentUser();
  if (!username) {
    return NextResponse.json({
      balance: 0,
      potBalance: 0,
      transactions: [],
    });
  }

  const user = getUserState(username);
  return NextResponse.json({
    balance: user.balance,
    potBalance: user.potBalance,
    transactions: user.transactions,
    potTransactions: user.potTransactions || [],
  });
}
