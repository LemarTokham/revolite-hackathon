import { NextResponse } from "next/server";
import { getTheme } from "@/lib/themes";

export async function GET() {
  return NextResponse.json(getTheme());
}
