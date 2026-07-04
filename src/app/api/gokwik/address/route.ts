import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface GokwikAddress {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ addresses: [], source: 'unauthorized' }, { status: 401 });
    }

    // Securely use the authenticated user's email and phone, ignore client payload
    const email = session.user.email;
    const phone = session.user.phone || session.user.user_metadata?.phone || session.user.user_metadata?.phone_number;

    if (!phone) {
      return NextResponse.json({ addresses: [], source: 'missing_phone' });
    }

    const appId = process.env.GOKWIK_APP_ID;
    const appSecret = process.env.GOKWIK_APP_SECRET;
    const env = process.env.GOKWIK_ENV || 'sandbox';

    // If GoKwik credentials aren't configured, return empty
    if (!appId || appId === 'your_gokwik_appid' || !appSecret || appSecret === 'your_gokwik_appsecret') {
      return NextResponse.json({ addresses: [], source: 'stub' });
    }

    const baseUrl = env === 'production'
      ? 'https://api.gokwik.co'
      : 'https://api.sandbox.gokwik.co';

    // Attempt to fetch saved customer addresses from GoKwik's network
    const res = await fetch(`${baseUrl}/v1/merchant/customer/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'app-id': appId,
        'app-secret': appSecret,
      },
      body: JSON.stringify({
        phone: phone?.startsWith('+91') ? phone : `+91${phone}`,
        ...(email && { email }),
      }),
    });

    if (!res.ok) {
      // Fail gracefully — endpoint may not be available or may differ
      console.warn(`GoKwik address lookup returned ${res.status}`);
      return NextResponse.json({ addresses: [], source: 'fallback' });
    }

    const data = await res.json();

    // Normalize the response — GoKwik may return addresses in various formats
    const addresses: GokwikAddress[] = Array.isArray(data?.data?.addresses)
      ? data.data.addresses
      : Array.isArray(data?.data)
        ? data.data
        : data?.data?.address
          ? [data.data.address]
          : [];

    return NextResponse.json({ addresses, source: 'gokwik' });
  } catch (error) {
    console.error('GoKwik address lookup error:', error);
    return NextResponse.json({ addresses: [], source: 'error' });
  }
}
