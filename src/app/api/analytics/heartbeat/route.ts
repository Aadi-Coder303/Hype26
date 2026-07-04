import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';

// POST: Send heartbeat (upsert visitor)
export async function POST(req: Request) {
  try {
    const { visitorId, page } = await req.json();

    if (!visitorId) {
      return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
    }

    await prisma.siteVisitor.upsert({
      where: { id: visitorId },
      update: { lastSeen: new Date(), page: page || '/' },
      create: { id: visitorId, page: page || '/', lastSeen: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// GET: Count active visitors (seen within last 2 minutes)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    // Clean up stale visitors (older than 10 minutes)
    await prisma.siteVisitor.deleteMany({
      where: { lastSeen: { lt: new Date(Date.now() - 10 * 60 * 1000) } },
    });

    const activeVisitors = await prisma.siteVisitor.findMany({
      where: { lastSeen: { gte: twoMinutesAgo } },
      orderBy: { lastSeen: 'desc' },
    });

    return NextResponse.json({
      count: activeVisitors.length,
      visitors: activeVisitors,
    });
  } catch (error) {
    console.error('Heartbeat GET error:', error);
    return NextResponse.json({ count: 0, visitors: [] }, { status: 500 });
  }
}
