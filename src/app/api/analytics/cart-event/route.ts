import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';

// POST: Log a cart add event
export async function POST(req: Request) {
  try {
    const { productName, productId, size, price, visitorId } = await req.json();

    if (!productId || !visitorId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await prisma.cartEvent.create({
      data: {
        productName: productName || 'Unknown',
        productId,
        size: size || 'N/A',
        price: parseFloat(String(price)) || 0,
        visitorId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart event error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// GET: Fetch recent cart events (for dashboard)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.cartEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Fetch cart events error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
