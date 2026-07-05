'use server';

import { shopifyFetch } from '@/lib/shopify';
import { createCartMutation } from '@/lib/shopify/mutations/cart';

export async function createCheckout(lines: { variantId: string; quantity: number }[]) {
  try {
    const validLines = lines.filter(l => l.variantId && l.variantId.trim() !== '');
    
    if (validLines.length === 0) {
      console.error('Checkout error: No valid variant IDs provided. Lines:', lines);
      return { error: 'Your cart contains items that are no longer available or have invalid IDs. Please remove them and try again.' };
    }

    const formattedLines = validLines.map(line => ({
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

    const cartCreate = res.body?.data?.cartCreate;
    const checkoutUrl = cartCreate?.cart?.checkoutUrl;

    if (cartCreate?.userErrors?.length > 0) {
      console.error('Shopify user errors:', JSON.stringify(cartCreate.userErrors, null, 2));
      return { error: `Shopify error: ${cartCreate.userErrors[0].message}` };
    }

    if (!checkoutUrl) {
      console.error('Failed to create checkout. Raw response:', JSON.stringify(res.body, null, 2));
      return { error: 'Failed to create secure checkout link.' };
    }

    return { checkoutUrl };
  } catch (error) {
    console.error('Checkout error:', error);
    return { error: 'An unexpected error occurred during checkout.' };
  }
}
