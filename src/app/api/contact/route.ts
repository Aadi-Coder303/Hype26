import { NextResponse } from 'next/server';

export const runtime = 'edge';
// Basic in-memory rate limiting (Note: In a serverless environment like Vercel, this resets on cold starts.
// For true distributed rate limiting, use Redis/Upstash, but this blocks naive bot floods efficiently.)
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    
    if (ip !== 'unknown') {
      const record = rateLimitCache.get(ip);
      if (record) {
        if (now - record.timestamp < RATE_LIMIT_WINDOW_MS) {
          if (record.count >= MAX_REQUESTS_PER_WINDOW) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
          }
          record.count++;
        } else {
          // Reset window
          rateLimitCache.set(ip, { count: 1, timestamp: now });
        }
      } else {
        rateLimitCache.set(ip, { count: 1, timestamp: now });
      }
    }

    const body = await req.json();
    const { name, email, orderNumber, message, a_password } = body;

    // 2. Honeypot check
    // "a_password" is a hidden field. If a bot fills it out, silently reject.
    if (a_password) {
      console.warn(`[Anti-Spam] Honeypot triggered by IP: ${ip}`);
      // Return 200 to trick the bot into thinking it succeeded
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 3. Basic Validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Here you would typically send an email via Resend, SendGrid, etc.
    // Or save the message to the database.
    console.log(`New contact message from ${name} (${email}): ${message}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
