import { getAnnouncements, getScanCount } from "@/lib/data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const [items, scans] = await Promise.all([getAnnouncements(), getScanCount()]);
  return NextResponse.json({ items, scans });
}
