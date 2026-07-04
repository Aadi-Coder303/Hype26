import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const all = searchParams.get('all');

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const isOwner = session?.user?.email && OWNER_EMAILS.includes(session.user.email);

    // Dashboard: fetch all orders
    if (all === 'true') {
      if (!isOwner) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      return NextResponse.json(orders);
    }

    // Security check: Must be logged in
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where: any = { OR: [] };

    if (isOwner) {
      // Owners can query by the requested email or phone params
      if (email) where.OR.push({ customerEmail: email });
      if (phone) where.OR.push({ customerPhone: phone });
      
      // If owner didn't provide email or phone but didn't request 'all', just return empty to prevent accidental full table dump
      if (!email && !phone) {
         return NextResponse.json([], { status: 200 });
      }
    } else {
      // Regular users: COMPLETELY IGNORE query parameters to prevent IDOR.
      // Fetch ONLY based on their verified session data.
      const userEmail = session.user.email;
      const userPhone = session.user.phone;
      
      if (userEmail) where.OR.push({ customerEmail: userEmail });
      if (userPhone) where.OR.push({ customerPhone: userPhone });
      
      if (where.OR.length === 0) {
        return NextResponse.json([]);
      }
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
