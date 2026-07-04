import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// GET: fetch user's cart & wishlist
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ cart: [], wishlist: [] });
    }

    const userId = session.user.id;
    const data = await prisma.userData.findUnique({ where: { userId } });
    
    return NextResponse.json({
      cart: data?.cart ?? [],
      wishlist: data?.wishlist ?? [],
    });
  } catch (error) {
    console.error('Sync GET error:', error);
    return NextResponse.json({ cart: [], wishlist: [] });
  }
}

// POST: save user's cart & wishlist
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { cart, wishlist } = await req.json();

    await prisma.userData.upsert({
      where: { userId },
      update: {
        ...(cart !== undefined ? { cart } : {}),
        ...(wishlist !== undefined ? { wishlist } : {}),
      },
      create: {
        userId,
        cart: cart ?? [],
        wishlist: wishlist ?? [],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}
