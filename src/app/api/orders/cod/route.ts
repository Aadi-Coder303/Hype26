import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const { fullName, email, phone, address, items, codRequest, couponCode } = await req.json();

    if (!fullName || !email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields or empty cart' }, { status: 400 });
    }

    // Security: If user is logged in, ensure they are not spoofing another email
    if (session?.user && session.user.email !== email) {
      return NextResponse.json({ error: 'Identity mismatch. Please use your account email.' }, { status: 403 });
    }

    // --- SERVER-SIDE PRICE CALCULATION ---
    let serverSubtotal = 0;
    const validatedItems = [];
    
    // Fetch products from database
    const productIds = [...new Set(items.map((i: any) => i.productId))];
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    for (const item of items) {
      const dbProduct = dbProducts.find(p => p.id === item.productId);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
      }

      const sizes = (dbProduct.sizes as Record<string, any>) || {};
      const sizeVal = sizes[item.size];
      
      let itemPrice = dbProduct.price;
      if (typeof sizeVal === 'object' && sizeVal !== null && 'price' in sizeVal && sizeVal.price > 0) {
        itemPrice = sizeVal.price;
      }
      
      const rawQty = Number(item.qty);
      const qty = isNaN(rawQty) || rawQty < 1 ? 1 : Math.floor(rawQty);
      
      serverSubtotal += itemPrice * qty;
      
      validatedItems.push({
        ...item,
        qty, // securely store validated qty
        price: itemPrice // override client price with server price
      });
    }

    let serverDiscount = 0;
    if (couponCode) {
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() }
      });
      
      if (dbCoupon && dbCoupon.isActive) {
        // Validation checks
        const isExpired = dbCoupon.expiresAt && new Date() > new Date(dbCoupon.expiresAt);
        const isMaxedOut = dbCoupon.maxUses > 0 && dbCoupon.usedCount >= dbCoupon.maxUses;
        const meetsMinOrder = serverSubtotal >= dbCoupon.minOrderValue;

        if (!isExpired && !isMaxedOut && meetsMinOrder) {
          if (dbCoupon.discountType === 'percent') {
            serverDiscount = serverSubtotal * (dbCoupon.discountValue / 100);
          } else if (dbCoupon.discountType === 'flat') {
            serverDiscount = dbCoupon.discountValue;
          }
        }
      }
    }

    const serverTotal = Math.max(0, serverSubtotal - serverDiscount);
    // --- END SERVER-SIDE PRICE CALCULATION ---

    const txnid = `COD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // If codRequest is true, mark as 'cod_requested' (needs owner approval)
    // Otherwise mark as 'cod_pending' (direct COD)
    const status = codRequest ? 'cod_requested' : 'cod_pending';

    await prisma.order.create({
      data: {
        txnid,
        status,
        amount: serverTotal,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        address,
        userId: session?.user?.id || null,
        items: validatedItems,
        couponCode: serverDiscount > 0 ? couponCode : null,
        discount: serverDiscount,
      },
    });

    // Increment coupon usage and record redemption if a coupon was applied
    if (serverDiscount > 0 && couponCode) {
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() }
      });

      if (dbCoupon) {
        await prisma.$transaction([
          prisma.coupon.update({
            where: { id: dbCoupon.id },
            data: { usedCount: { increment: 1 } },
          }),
          prisma.couponRedemption.create({
            data: {
              couponId: dbCoupon.id,
              userId: session?.user?.id || 'anonymous',
              orderId: txnid,
            }
          })
        ]);
      }
    }

    return NextResponse.json({ success: true, txnid });
  } catch (error) {
    console.error('COD order creation error:', error);
    return NextResponse.json({ error: 'Failed to place COD order' }, { status: 500 });
  }
}
