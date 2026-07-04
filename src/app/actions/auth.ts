'use server';

import { cookies } from 'next/headers';
import { shopifyFetch } from '@/lib/shopify';
import { 
  customerAccessTokenCreateMutation, 
  customerCreateMutation, 
  customerAccessTokenDeleteMutation 
} from '@/lib/shopify/mutations/customer';

const COOKIE_NAME = 'shopify_customer_access_token';

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const { body } = await shopifyFetch<any>({
      query: customerAccessTokenCreateMutation,
      variables: {
        input: { email, password }
      },
      cache: 'no-store'
    });

    const data = body.data?.customerAccessTokenCreate;

    if (data?.customerUserErrors?.length > 0) {
      return { error: data.customerUserErrors[0].message };
    }

    const accessToken = data?.customerAccessToken?.accessToken;
    const expiresAt = data?.customerAccessToken?.expiresAt;

    if (accessToken) {
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(expiresAt),
        path: '/'
      });
      return { success: true };
    }

    return { error: 'Unknown error occurred during login' };
  } catch (error: any) {
    return { error: error.message || 'Failed to connect to Shopify' };
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password || !firstName || !lastName) {
    return { error: 'All fields are required' };
  }

  try {
    const { body } = await shopifyFetch<any>({
      query: customerCreateMutation,
      variables: {
        input: { firstName, lastName, email, password }
      },
      cache: 'no-store'
    });

    const data = body.data?.customerCreate;

    if (data?.customerUserErrors?.length > 0) {
      return { error: data.customerUserErrors[0].message };
    }

    // Automatically log them in after registration
    return await loginUser(prevState, formData);
  } catch (error: any) {
    return { error: error.message || 'Failed to register account' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    try {
      await shopifyFetch<any>({
        query: customerAccessTokenDeleteMutation,
        variables: { customerAccessToken: token },
        cache: 'no-store'
      });
    } catch (e) {
      console.warn('Failed to invalidate token on Shopify', e);
    }
  }

  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}
