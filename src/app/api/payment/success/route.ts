import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const params: Record<string, string> = {};
    body.forEach((value, key) => { params[key] = value.toString(); });

    const salt = process.env.PAYU_MERCHANT_SALT!;

    // Verify reverse hash from PayU
    const reverseHashStr = `${salt}|${params.status}|||||||||||${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${params.key}`;
    const expectedHash = crypto.createHash('sha512').update(reverseHashStr).digest('hex');

    if (params.hash !== expectedHash) {
      console.error('PayU hash mismatch — possible tampered response');
      return NextResponse.redirect(new URL('/checkout?payment_failed=true&reason=tampered', req.url));
    }

    const txnid = params.txnid;

    if (params.status === 'success') {
      // Fetch the pending order we saved during initiation
      const order = await prisma.order.findUnique({ where: { txnid } });

      if (order && order.status === 'pending') {
        // Atomically: mark order as paid + decrement stock for each item
        const items = order.items as Array<{ productId: string; size: string; qty?: number }>;

        await prisma.$transaction(async (tx) => {
          // 1. Mark order as paid
          await tx.order.update({
            where: { txnid },
            data: {
              status: 'paid',
              payuResponse: params as any,
            },
          });

          // 2. Decrement stock for each item
          for (const item of items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (!product) continue;

            const sizes = product.sizes as Record<string, number | { stock: number; price: number }>;
            const qty = item.qty ?? 1;
            const currentVal = sizes[item.size];
            
            let newSizes: Record<string, any>;
            if (typeof currentVal === 'object') {
              const newStock = Math.max(0, currentVal.stock - qty);
              newSizes = { ...sizes, [item.size]: { ...currentVal, stock: newStock } };
              console.log(`[Inventory] ${product.name} | ${item.size}: ${currentVal.stock} → ${newStock}`);
            } else {
              const currentStock = (currentVal as number) ?? 0;
              const newStock = Math.max(0, currentStock - qty);
              newSizes = { ...sizes, [item.size]: newStock };
              console.log(`[Inventory] ${product.name} | ${item.size}: ${currentStock} → ${newStock}`);
            }

            await tx.product.update({
              where: { id: item.productId },
              data: { sizes: newSizes },
            });
          }

          // 3. Increment coupon usage and record redemption if applicable
          if (order.couponCode) {
            const dbCoupon = await tx.coupon.findUnique({
              where: { code: order.couponCode }
            });
            if (dbCoupon) {
              await tx.coupon.update({
                where: { id: dbCoupon.id },
                data: { usedCount: { increment: 1 } },
              });
              await tx.couponRedemption.create({
                data: {
                  couponId: dbCoupon.id,
                  userId: order.userId || 'anonymous',
                  orderId: order.txnid,
                }
              });
            }
          }
        });
      }

      return NextResponse.redirect(
        new URL(`/orders/confirmation?txnid=${txnid}&amount=${params.amount}`, req.url)
      );
    } else {
      // Mark as failed
      await prisma.order.update({
        where: { txnid },
        data: { status: 'failed', payuResponse: params as any },
      }).catch(() => {}); // Ignore if not found

      return NextResponse.redirect(new URL('/checkout?payment_failed=true', req.url));
    }
  } catch (error) {
    console.error('Payment success callback error:', error);
    return NextResponse.redirect(new URL('/checkout?payment_failed=true', req.url));
  }
}
