import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getUserState, setUserState } from "@/lib/state";
import type { Transaction } from "@/lib/state";

const MAIN_APP_URL = process.env.MAIN_APP_URL || "http://localhost:8000";

// called when a spend is done in the app, this will update the balance and send it to our real main app
export async function POST(req: NextRequest) {
  const { type, amount, merchant, impulseZoneId } = await req.json();

  const username = getCurrentUser();
  if (!username) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const user = getUserState(username);
  if (!user.accessToken) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  if (type !== "in-person" && type !== "online") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (amount > user.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // Check if user has exceeded their impulse limit
  const totalSpent = user.transactions.reduce((sum, t) => sum + t.amount, 0);
  const overLimit = user.impulseLimit > 0 && totalSpent >= user.impulseLimit;

  // Calculate impulse tax
  const taxAmount = user.taxPercentage > 0
    ? Math.round((amount * user.taxPercentage / 100) * 100) / 100
    : 0;

  const newBalance = Math.round((user.balance - amount - taxAmount) * 100) / 100;
  const newPot = Math.round((user.potBalance + taxAmount) * 100) / 100;

  const transaction: Transaction = {
    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    type,
    amount,
    merchant: merchant || "Unknown",
    category: "",
    location: { lat: 0, lng: 0 },
    timestamp: new Date().toISOString(),
    balanceAfter: newBalance,
  };

  // Record pot transaction if tax was applied
  const newPotTransactions = taxAmount > 0
    ? [{
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        amount: taxAmount,
        merchant: merchant || "Unknown",
        timestamp: transaction.timestamp,
        balanceAfter: newPot,
      }, ...(user.potTransactions || [])]
    : (user.potTransactions || []);

  // Update this user's state
  setUserState(username, {
    balance: newBalance,
    potBalance: newPot,
    transactions: [transaction, ...user.transactions],
    potTransactions: newPotTransactions,
  });

  console.log(transaction);

  // Send transaction to main app webhook
  try {
    const webhookRes = await fetch(`${MAIN_APP_URL}/api/bank/transactions/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        sort_code: user.sortCode || "000000",
        account_number: user.accountNumber || "00000000",
        amount: Math.round(amount * 100), // convert pounds to pence
        timestamp: transaction.timestamp,
        merchant: transaction.merchant,
        impulse_zone_id: impulseZoneId || null,
      }),
    });
    const webhookData = await webhookRes.json();
    console.log("Main app response:", webhookData);
  } catch (err) {
    console.log("Main app not reachable:", err);
  }

  return NextResponse.json({
    success: true,
    transaction,
    balance: newBalance,
    potBalance: newPot,
    overLimit,
  });
}
