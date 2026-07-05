'use server';

import { shopifyFetch } from '@/lib/shopify';
import { createCartMutation } from '@/lib/shopify/mutations/cart';

export async function createCheckout(lines: { variantId: string; quantity: number }[]) {
  try {
    const formattedLines = lines.map(line => ({
      merchandiseId: line.variantId,
      quantity: line.quantity
    }));

    const res = await shopifyFetch<any>({
      query: createCartMutation,
      variables: {
        lineItems: formattedLines
      },
      cache: 'no-store'
    });

    const checkoutUrl = res.body?.data?.cartCreate?.cart?.checkoutUrl;

    if (!checkoutUrl) {
      console.error('Failed to create checkout:', res.body?.data?.cartCreate?.userErrors);
      return { error: 'Failed to create secure checkout link.' };
    }

    return { checkoutUrl };
  } catch (error) {
    console.error('Checkout error:', error);
    return { error: 'An unexpected error occurred during checkout.' };
  }
}
