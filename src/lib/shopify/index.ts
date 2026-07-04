export const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
export const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
export const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || '2024-01';

type ShopifyFetchParams = {
  cache?: RequestCache;
  headers?: HeadersInit;
  query: string;
  tags?: string[];
  variables?: any;
};

export async function shopifyFetch<T>({
  cache = 'force-cache',
  headers,
  query,
  tags,
  variables
}: ShopifyFetchParams): Promise<{ status: number; body: T } | never> {
  try {
    const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
        ...headers
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables })
      }),
      cache,
      ...(tags && { next: { tags } })
    });

    let body;
    try {
      body = await result.json();
    } catch (err) {
      console.warn('Failed to parse Shopify response as JSON');
      return { status: result.status, body: {} as T };
    }

    if (body.errors) {
      console.warn('Shopify GraphQL errors', body.errors);
      return { status: result.status, body: {} as T };
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }

    throw new Error('An unknown error occurred while fetching from Shopify');
  }
}
