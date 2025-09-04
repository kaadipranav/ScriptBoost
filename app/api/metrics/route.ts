import { NextRequest, NextResponse } from 'next/server'

// Minimal ingestion endpoint for performance metrics and API timings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    // In production, forward to real analytics/logging provider
    // For now, no-op to avoid log noise; respond 204
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
