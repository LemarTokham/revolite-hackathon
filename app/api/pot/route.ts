import { NextRequest, NextResponse } from "next/server";
import state from "@/lib/state";


// Called by ur main app during the taxing process to add money to the pot (taxing done in main app, this just updates the pot)
export async function POST(req: NextRequest) {
  const { amount } = await req.json();

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (amount > state.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // change baalnce and pot
  state.balance = Math.round((state.balance - amount) * 100) / 100;
  state.potBalance = Math.round((state.potBalance + amount) * 100) / 100;

  // return updated state
  return NextResponse.json({
    success: true,
    balance: state.balance,
    potBalance: state.potBalance,
  });
}

// reuturn current state
export async function GET() {
  return NextResponse.json({
    balance: state.balance,
    potBalance: state.potBalance,
    transactions: state.transactions,
  });
}
