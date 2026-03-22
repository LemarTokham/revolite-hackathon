import { NextResponse } from "next/server";
import { getCurrentUser, setUserState, setCurrentUser } from "@/lib/state";

export async function POST() {
  const username = getCurrentUser();
  if (username) {
    setUserState(username, {
      accessToken: null,
      refreshToken: null,
      accountNumber: null,
      sortCode: null,
    });
  }
  setCurrentUser(null);

  return NextResponse.json({ success: true });
}
