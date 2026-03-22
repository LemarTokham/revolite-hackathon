import { NextResponse } from "next/server";
import { getCurrentUser, getUserState } from "@/lib/state";

const MAIN_APP_URL = process.env.MAIN_APP_URL || "http://localhost:8000";

// Fetch impulse zones (categories) from the main app
export async function GET() {
  const username = getCurrentUser();
  if (!username) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const user = getUserState(username);
  if (!user.accessToken) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    const res = await fetch(`${MAIN_APP_URL}/api/impulses`, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch impulses" }, { status: res.status });
    }

    const impulses = await res.json();
    return NextResponse.json(impulses);
  } catch (err) {
    console.log("Main app not reachable:", err);
    return NextResponse.json({ error: "Main app not reachable" }, { status: 502 });
  }
}
