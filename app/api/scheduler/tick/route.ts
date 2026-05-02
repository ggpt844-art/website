import { NextResponse } from "next/server";
import { tick } from "@/lib/jobs/scheduler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const result = await tick();
  return NextResponse.json(result);
}
