import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // PayU posts to furl on failure
  return NextResponse.redirect(new URL('/checkout?payment_failed=true', req.url));
}

export async function GET(req: Request) {
  return NextResponse.redirect(new URL('/checkout?payment_failed=true', req.url));
}
