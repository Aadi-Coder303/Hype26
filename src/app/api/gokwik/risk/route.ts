import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, pincode, amount } = await req.json();

    const appId = process.env.GOKWIK_APP_ID;
    const appSecret = process.env.GOKWIK_APP_SECRET;
    const env = process.env.GOKWIK_ENV || 'sandbox';

    // If GoKwik credentials aren't configured yet, default to allowing COD
    if (!appId || appId === 'your_gokwik_appid' || !appSecret || appSecret === 'your_gokwik_appsecret') {
      return NextResponse.json({ allowCod: true, riskLevel: 'low', source: 'stub' });
    }

    const gokwikBaseUrl = env === 'production'
      ? 'https://api.gokwik.co/v1/merchant/rto-predict'
      : 'https://api.sandbox.gokwik.co/v1/merchant/rto-predict';

    const res = await fetch(gokwikBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'app-id': appId,
        'app-secret': appSecret,
      },
      body: JSON.stringify({
        phone,
        pincode,
        orderAmount: amount,
      }),
    });

    if (!res.ok) {
      // Fail open: allow COD if GoKwik is unavailable
      return NextResponse.json({ allowCod: true, riskLevel: 'unknown', source: 'fallback' });
    }

    const data = await res.json();
    const riskLevel = data?.data?.riskLevel || 'low';
    const allowCod = riskLevel !== 'high';

    return NextResponse.json({ allowCod, riskLevel, source: 'gokwik' });
  } catch (error) {
    console.error('GoKwik risk check error:', error);
    // Fail open
    return NextResponse.json({ allowCod: true, riskLevel: 'unknown', source: 'error' });
  }
}
