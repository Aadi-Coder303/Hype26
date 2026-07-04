import prisma from '@/lib/prisma';
import ProductClient from '@/components/ProductClient';
import ProductRecommendationsServer from '@/components/ProductRecommendationsServer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const imageUrls = product.imageUrl ? product.imageUrl.split(',').map(url => url.trim()) : [];

  return {
    title: `${product.brand} ${product.name}`,
    description: product.description || `Buy ${product.brand} ${product.name} at Sole Vault. 100% authentic, verified by experts.`,
    openGraph: {
      title: `${product.brand} ${product.name} | Sole Vault`,
      description: product.description || `Buy ${product.brand} ${product.name} at Sole Vault. 100% authentic.`,
      images: imageUrls.length > 0 ? [imageUrls[0], ...previousImages] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.brand} ${product.name} | Sole Vault`,
      description: product.description || `Buy ${product.brand} ${product.name} at Sole Vault. 100% authentic.`,
      images: imageUrls.length > 0 ? [imageUrls[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    return notFound();
  }

  // Fetch color variants: find all products in the same color group
  let colorVariants: { id: string; name: string; colorName: string | null; imageUrl: string | null }[] = [];
  
  const hasChildren = await prisma.product.count({ where: { parentId: product.id } });
  
  if (product.parentId || product.colorName || hasChildren > 0) {
    const groupId = product.parentId || product.id;
    
    const variants = await prisma.product.findMany({
      where: {
        OR: [
          { id: groupId },
          { parentId: groupId },
        ],
      },
      select: { id: true, name: true, colorName: true, imageUrl: true },
      orderBy: { createdAt: 'asc' },
    });

    if (variants.length >= 2) {
      colorVariants = variants;
    }
  }

  const colorVariantIds = colorVariants.map(v => v.id);

  const sizesMap = (product.sizes as Record<string, number | { stock: number; price: number }>) || {};
  const totalStock = Object.values(sizesMap).reduce((a: number, b) => {
    return a + (typeof b === 'object' ? b.stock : (b as number));
  }, 0);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl ? product.imageUrl.split(',')[0] : '',
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://solevault.com/products/${product.id}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://solevault.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Products',
        'item': 'https://solevault.com/products'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': `https://solevault.com/products/${product.id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 pt-8">
        <Breadcrumbs 
          items={[
            { label: 'Products', href: '/products' },
            { label: product.name }
          ]} 
        />
      </div>
      <ProductClient product={product} colorVariants={colorVariants} />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[4/5] bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      }>
        <ProductRecommendationsServer
          productId={product.id}
          brand={product.brand}
          category={product.category}
          colorVariantIds={colorVariantIds}
        />
      </Suspense>
    </>
  );
}
