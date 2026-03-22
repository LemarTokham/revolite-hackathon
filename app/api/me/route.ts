import { NextResponse } from "next/server";
import { getCurrentUser, getUserState } from "@/lib/state";

// Check if user is logged in
export async function GET() {
  const username = getCurrentUser();
  if (!username) {
    return NextResponse.json({ loggedIn: false });
  }

  const user = getUserState(username);
  if (!user.accessToken) {
    return NextResponse.json({ loggedIn: false });
  }

  return NextResponse.json({
    loggedIn: true,
    username,
  });
}
