import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

interface CartItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  imageUrl?: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const body = await req.json();
    const { amount, productinfo, firstname, email, phone, address, items, couponCode, discount } = body;

    if (!productinfo || !firstname || !email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required payment fields or empty cart' }, { status: 400 });
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
    const finalAmount = serverTotal.toFixed(2);
    // --- END SERVER-SIDE PRICE CALCULATION ---

    const key = process.env.PAYU_MERCHANT_KEY!;
    const salt = process.env.PAYU_MERCHANT_SALT!;
    const payuBase = process.env.PAYU_BASE_URL!;

    const txnid = `SV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Save a pending order to DB so we can track it on callback
    await prisma.order.create({
      data: {
        txnid,
        status: 'pending',
        amount: serverTotal,
        customerName: firstname,
        customerEmail: email,
        customerPhone: phone || '',
        address: address || '',
        userId: session?.user?.id || null,
        items: validatedItems,
        couponCode: serverDiscount > 0 ? couponCode : null,
        discount: serverDiscount,
      },
    });

    // PayU SHA-512 hash
    const hashString = `${key}|${txnid}|${finalAmount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://website-seven-eta-98.vercel.app';

    return NextResponse.json({
      key,
      txnid,
      amount: finalAmount,
      productinfo,
      firstname,
      email,
      phone: phone || '',
      surl: `${baseUrl}/api/payment/success`,
      furl: `${baseUrl}/api/payment/failure`,
      hash,
      payuBase,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
