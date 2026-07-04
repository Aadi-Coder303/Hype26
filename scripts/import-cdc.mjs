/**
 * Import sneakers from CrepDogCrew Shopify store into SoleVault database.
 * Resume-safe: skips products already in DB by name.
 * Uses connection pooling fixes and batched inserts.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const BASE = 'https://crepdogcrew.com/collections/sneakers/products.json';
const PER_PAGE = 50;

function normalizeBrand(vendor) {
  const v = vendor?.toLowerCase() || '';
  if (v.includes('jordan') || v.includes('air jordan')) return 'Jordan';
  if (v.includes('nike dunk')) return 'Nike';
  if (v.includes('nike running')) return 'Nike';
  if (v.includes('nike')) return 'Nike';
  if (v.includes('adidas')) return 'Adidas';
  if (v.includes('new balance')) return 'New Balance';
  if (v.includes('on')) return 'On Running';
  if (v.includes('asics')) return 'Asics';
  if (v.includes('puma')) return 'Puma';
  if (v.includes('yeezy')) return 'Yeezy';
  if (v.includes('vans')) return 'Vans';
  if (v.includes('salomon')) return 'Salomon';
  if (v.includes('hoka')) return 'Hoka';
  if (v.includes('reebok')) return 'Reebok';
  return vendor || 'Unknown';
}

function getCategory(product) {
  const tags = (product.tags || []).map(t => t.toLowerCase());
  const title = (product.title || '').toLowerCase();
  if (tags.includes('runwomen') || title.includes('(w)')) return 'Women';
  if (tags.includes('kids')) return 'Kids';
  return 'Men';
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1000);
}

async function fetchAllProducts() {
  let page = 1;
  let allProducts = [];
  
  while (true) {
    const url = `${BASE}?limit=${PER_PAGE}&page=${page}`;
    console.log(`Fetching page ${page}...`);
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed page ${page}: ${res.status}`);
      break;
    }
    
    const data = await res.json();
    if (!data.products || data.products.length === 0) break;
    
    allProducts = allProducts.concat(data.products);
    console.log(`  Got ${data.products.length} products (total: ${allProducts.length})`);
    
    if (data.products.length < PER_PAGE) break;
    page++;
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  return allProducts;
}

function transformProduct(product) {
  const brand = normalizeBrand(product.vendor);
  const category = getCategory(product);
  const description = stripHtml(product.body_html);
  
  const images = (product.images || [])
    .slice(0, 4)
    .map(img => img.src)
    .filter(Boolean);
  const imageUrl = images.join(',') || null;
  
  const sizes = {};
  let lowestPrice = Infinity;
  
  for (const variant of (product.variants || [])) {
    const size = variant.option2;
    if (!size) continue;
    
    const price = parseFloat(variant.price) || 0;
    const stock = variant.available ? 1 : 0;
    
    if (sizes[size]) {
      const existing = sizes[size];
      sizes[size] = {
        stock: existing.stock + stock,
        price: Math.min(existing.price, price),
      };
    } else {
      sizes[size] = { stock, price };
    }
    
    if (price > 0 && price < lowestPrice) lowestPrice = price;
  }
  
  const basePrice = lowestPrice === Infinity ? 0 : lowestPrice;
  
  const uniquePrices = [...new Set(Object.values(sizes).map(s => s.price))];
  let finalSizes;
  if (uniquePrices.length <= 1) {
    finalSizes = {};
    for (const [size, val] of Object.entries(sizes)) {
      finalSizes[size] = val.stock;
    }
  } else {
    finalSizes = sizes;
  }
  
  return {
    name: product.title,
    brand,
    description,
    price: basePrice,
    imageUrl,
    category,
    sizes: finalSizes,
    isSourced: true,
    sourcedDeliveryEstimate: '7-21 business days',
    sourcedNote: 'Sourced upon order',
  };
}

async function main() {
  console.log('🔍 Fetching products from CrepDogCrew...\n');
  const products = await fetchAllProducts();
  console.log(`\n✅ Fetched ${products.length} products total.\n`);
  
  // Get all existing product names to skip duplicates (fast check)
  const existingProducts = await prisma.product.findMany({ select: { name: true } });
  const existingNames = new Set(existingProducts.map(p => p.name));
  console.log(`📦 ${existingNames.size} products already in DB — will skip those.\n`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const product of products) {
    const data = transformProduct(product);
    
    if (!data.name || data.price === 0) {
      skipped++;
      continue;
    }
    
    if (existingNames.has(data.name)) {
      skipped++;
      continue;
    }
    
    try {
      await prisma.product.create({ data });
      existingNames.add(data.name);
      imported++;
      console.log(`  ✅ [${imported}] ${data.brand} — ${data.name} — ₹${data.price}`);
      
      // Small delay every 10 products to avoid pool exhaustion
      if (imported % 10 === 0) {
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      console.error(`  ❌ Error: "${data.name}":`, err.message?.slice(0, 100));
      skipped++;
      // If connection error, wait longer
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`\n🎉 Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Total in DB: ${existingNames.size}`);
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
