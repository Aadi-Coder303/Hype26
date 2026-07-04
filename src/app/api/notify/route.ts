import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, email, status } = await req.json();

    if (!orderId || !email || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real MVP, you would integrate Resend or SendGrid here:
    // await resend.emails.send({
    //   from: 'updates@solevault.com',
    //   to: email,
    //   subject: `Order Update: ${status}`,
    //   html: `<p>Your order #${orderId} is now ${status}.</p>`
    // });

    console.log(`[Mock Notification] Email sent to ${email} for Order #${orderId}. Status: ${status}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({ success: true, message: `Notification sent to ${email}` }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
