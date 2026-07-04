import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  try {
    const userData = await prisma.userData.findUnique({
      where: { userId },
      select: { addresses: true }
    });
    
    return NextResponse.json(userData?.addresses || []);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  try {
    const { addresses } = await request.json();
    
    if (!Array.isArray(addresses)) {
      return NextResponse.json({ error: 'Invalid addresses payload' }, { status: 400 });
    }
    
    // Save to user profile
    await prisma.userData.upsert({
      where: { userId },
      update: { addresses },
      create: { userId, addresses },
    });
    
    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error('Error saving addresses:', error);
    return NextResponse.json({ error: 'Failed to save addresses' }, { status: 500 });
  }
}
