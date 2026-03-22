import { NextRequest, NextResponse } from "next/server";
import { setUserState, setCurrentUser } from "@/lib/state";
import { getTheme } from "@/lib/themes";

// backend
const MAIN_APP_URL = process.env.MAIN_APP_URL || "http://localhost:8000";

// Proxy login to the main app's auth endpoint
export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${MAIN_APP_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      return NextResponse.json({ error: err.detail || "Login failed" }, { status: res.status });
    }

    const data = await res.json();

    // Store tokens for this user
    setUserState(username, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });
    setCurrentUser(username);
    console.log("Token stored for user:", username);

    const authHeader = { Authorization: `Bearer ${data.access_token}` };

    // Fetch the user's tax percentage from the main app
    try {
      const meRes = await fetch(`${MAIN_APP_URL}/api/auth/me`, { headers: authHeader });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUserState(username, {
          taxPercentage: meData.tax_percentage || 0,
        });
        console.log("Tax percentage:", meData.tax_percentage);
      }
    } catch {
      console.log("Could not fetch tax percentage");
    }

    // Fetch the user's bank accounts from the main app

    const accountsRes = await fetch(`${MAIN_APP_URL}/api/bank/accounts`, {
      headers: authHeader,
    });

    if (accountsRes.ok) {
      const accounts = await accountsRes.json();
      const provider = getTheme().provider;
      // Find the account matching this bank's provider
      const currentAccount = accounts.find(
        (a: { type: string; provider: string }) => a.type === "CURRENT" && a.provider === provider
      );
      if (currentAccount) {
        setUserState(username, {
          accountNumber: currentAccount.account_number,
          sortCode: currentAccount.sort_code,
        });
        console.log("Bank account found for", provider, ":", currentAccount.account_number);
      } else {
        console.log("No account found for provider:", provider, "- user needs to onboard in the main app first");
      }
    }

    return NextResponse.json({
      success: true,
      username,
    });
  } catch (err) {
    console.log("Main app not reachable:", err);
    return NextResponse.json({ error: "Main app not reachable" }, { status: 502 });
  }
}
