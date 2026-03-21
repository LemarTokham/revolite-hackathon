import { NextRequest, NextResponse } from "next/server";
import state, { Transaction } from "@/lib/state";
import { IN_PERSON_MERCHANTS, ONLINE_MERCHANTS } from "@/lib/merchants";


// called when a spend is done in the app, this will update the balance and send it to our real main app
export async function POST(req: NextRequest) {
  const { type, amount, merchantIndex } = await req.json(); // read request body

  if (type !== "in-person" && type !== "online") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (amount > state.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const merchants = type === "in-person" ? IN_PERSON_MERCHANTS : ONLINE_MERCHANTS;
  const merchant = merchants[merchantIndex] ?? merchants[0];

  state.balance = Math.round((state.balance - amount) * 100) / 100;

  const transaction: Transaction = {
    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    type,
    amount,
    merchant: merchant.name,
    category: merchant.category,
    location: merchant.location,
    timestamp: new Date().toISOString(),
    balanceAfter: state.balance,
  };

  // new elem is added to the start of the array
  state.transactions.unshift(transaction);

  // TODO: have call to actual app to post transaction

  return NextResponse.json({
    success: true,
    transaction,
    balance: state.balance,
    potBalance: state.potBalance,
  });
}
