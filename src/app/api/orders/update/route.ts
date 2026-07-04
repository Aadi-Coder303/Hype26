import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, status, trackingId, trackingCarrier } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status required' }, { status: 400 });
    }

    const data: Record<string, any> = { status };

    // If tracking info is provided, save it
    if (trackingId !== undefined) data.trackingId = trackingId || null;
    if (trackingCarrier !== undefined) data.trackingCarrier = trackingCarrier || null;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
