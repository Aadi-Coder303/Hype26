import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Please enter a coupon code.' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code.' });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: 'This coupon is no longer active.' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired.' });
    }

    // Check global max uses
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'This coupon has been fully redeemed.' });
    }

    // Check per-account limit (requires auth)
    if (coupon.maxUsesPerAccount > 0) {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        return NextResponse.json({ valid: false, error: 'Please log in to use this coupon.' });
      }

      const accountUses = await prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId: session.user.id },
      });

      if (accountUses >= coupon.maxUsesPerAccount) {
        return NextResponse.json({
          valid: false,
          error: `This coupon can only be used ${coupon.maxUsesPerAccount} time${coupon.maxUsesPerAccount > 1 ? 's' : ''} per account.`,
        });
      }
    }

    const total = parseFloat(cartTotal) || 0;
    if (total < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon.`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = Math.round((total * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    // Cap discount to cart total
    discountAmount = Math.min(discountAmount, total);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ valid: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
