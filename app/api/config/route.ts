import { NextResponse } from "next/server"

export async function GET() {
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY)
  if (!hasKey) {
    // Do not expose details; return a generic message and 503
    return NextResponse.json(
      { available: false, message: "Service temporarily unavailable" },
      { status: 503 }
    )
  }
  return NextResponse.json({ available: true })
}
