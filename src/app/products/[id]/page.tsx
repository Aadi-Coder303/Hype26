import ProductClient from '@/components/ProductClient';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { shopifyFetch } from '@/lib/shopify';
import { getProductQuery } from '@/lib/shopify/queries/product';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  
  const { body } = await shopifyFetch<any>({
    query: getProductQuery,
    variables: { handle: id }
  });

  const product = body?.data?.productByHandle;

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const imageUrls = product.images?.edges?.map((e: any) => e.node.url) || [];

  return {
    title: `${product.vendor} ${product.title}`,
    description: `Buy ${product.vendor} ${product.title} at Hype26. 100% authentic.`,
    openGraph: {
      title: `${product.vendor} ${product.title} | Hype26`,
      description: `Buy ${product.vendor} ${product.title} at Hype26. 100% authentic.`,
      images: imageUrls.length > 0 ? [imageUrls[0], ...previousImages] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.vendor} ${product.title} | Hype26`,
      description: `Buy ${product.vendor} ${product.title} at Hype26. 100% authentic.`,
      images: imageUrls.length > 0 ? [imageUrls[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { body } = await shopifyFetch<any>({
    query: getProductQuery,
    variables: { handle: id }
  });

  const rawProduct = body?.data?.productByHandle;

  if (!rawProduct) {
    return notFound();
  }

  // Map to old product structure for the UI component temporarily
  const product = {
    id: rawProduct.id,
    name: rawProduct.title,
    brand: rawProduct.vendor,
    price: parseFloat(rawProduct.priceRange.minVariantPrice.amount),
    imageUrl: rawProduct.images?.edges?.map((e: any) => e.node.url).join(',') || '',
    description: rawProduct.descriptionHtml,
    sizes: rawProduct.variants?.edges?.reduce((acc: any, edge: any) => {
      acc[edge.node.title] = edge.node.availableForSale ? 10 : 0;
      return acc;
    }, {}) || {}
  };

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
      availability: 'https://schema.org/InStock',
      url: `https://hype26.com/products/${id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="container mx-auto px-4 pt-8">
        <Breadcrumbs 
          items={[
            { label: 'Products', href: '/products' },
            { label: product.name }
          ]} 
        />
      </div>
      <ProductClient product={product} colorVariants={[]} />
    </>
  );
}
