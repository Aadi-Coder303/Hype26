import { NextResponse } from 'next/server';

// Basic in-memory rate limiting
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    
    // 1. Rate Limiting
    if (ip !== 'unknown') {
      const record = rateLimitCache.get(ip);
      if (record) {
        if (now - record.timestamp < RATE_LIMIT_WINDOW_MS) {
          if (record.count >= MAX_REQUESTS_PER_WINDOW) {
            return NextResponse.json({ error: 'Too many subscription attempts. Please try again later.' }, { status: 429 });
          }
          record.count++;
        } else {
          rateLimitCache.set(ip, { count: 1, timestamp: now });
        }
      } else {
        rateLimitCache.set(ip, { count: 1, timestamp: now });
      }
    }

    const { email } = await req.json();

    // 2. Validation
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // 3. Logic (e.g., save to DB or send to provider)
    console.log(`Newsletter signup: ${email}`);

    return NextResponse.json({ success: true, message: 'Subscription successful' });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 });
  }
}
