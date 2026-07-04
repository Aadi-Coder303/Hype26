import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';

// GET — list all coupons (dashboard)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST — create a new coupon
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt } = await req.json();

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Code and discount value are required.' }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists.' }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: discountType || 'percent',
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue) || 0,
        maxUses: parseInt(maxUses) || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Failed to create coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

// PUT — update a coupon (toggle active, edit fields)
export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required.' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.code !== undefined) updateData.code = data.code.toUpperCase().trim();
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = parseFloat(data.discountValue);
    if (data.minOrderValue !== undefined) updateData.minOrderValue = parseFloat(data.minOrderValue);
    if (data.maxUses !== undefined) updateData.maxUses = parseInt(data.maxUses);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Failed to update coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

// DELETE — delete a coupon
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required.' }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
