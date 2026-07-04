import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side WhatsApp redirect.
 * Keeps the real phone number out of client-side JavaScript bundles.
 * The number is read from a server-only env var (no NEXT_PUBLIC_ prefix).
 */
export function GET(req: NextRequest) {
  const number = process.env.WHATSAPP_NUMBER || '918888888888';
  const { searchParams } = new URL(req.url);
  const message = searchParams.get('text') || '';

  const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return NextResponse.redirect(url, 302);
}
