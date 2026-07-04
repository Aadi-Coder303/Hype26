import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        brand: true,
        price: true,
        imageUrl: true,
      },
      take: 6,
      orderBy: { name: 'asc' },
    });

    const suggestions = products.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.imageUrl?.split(',')[0] || null,
    }));

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
