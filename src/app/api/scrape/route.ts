import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { createClient } from '@/utils/supabase/server';
import { OWNER_EMAILS } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email || !OWNER_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Improved headers to help bypass basic blocks like Adidas
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
    }

    const html = await response.text();
    
    // Load HTML into cheerio
    const $ = cheerio.load(html);

    // Extract Open Graph Data
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    let ogImage = $('meta[property="og:image"]').attr('content') || '';

    // Extract all potential product images from img tags
    let images: string[] = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.startsWith('http') && !src.includes('.svg') && !src.includes('icon') && !src.includes('logo')) {
        if (!images.includes(src)) images.push(src);
      }
    });

    // Ensure the main OG image is the first one
    if (ogImage) {
      images = images.filter(img => img !== ogImage);
      images.unshift(ogImage);
    }

    // Attempt to extract brand from title or URL
    let brand = '';
    const lowercaseTitle = title.toLowerCase();
    const lowercaseUrl = url.toLowerCase();
    
    if (lowercaseTitle.includes('nike') || lowercaseUrl.includes('nike.com')) brand = 'Nike';
    else if (lowercaseTitle.includes('adidas') || lowercaseUrl.includes('adidas.com') || lowercaseUrl.includes('adidas.co')) brand = 'Adidas';
    else if (lowercaseTitle.includes('jordan')) brand = 'Jordan';
    else if (lowercaseTitle.includes('new balance') || lowercaseUrl.includes('newbalance.com')) brand = 'New Balance';

    // --- Price Extraction ---
    let price: number | null = null;

    // 1. JSON-LD structured data (most reliable)
    $('script[type="application/ld+json"]').each((_, el) => {
      if (price !== null) return;
      try {
        const json = JSON.parse($(el).html() || '');
        const extractFromObj = (obj: any) => {
          if (!obj) return;
          if (obj.offers) {
            const offer = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
            if (offer?.price) { price = parseFloat(String(offer.price)); return; }
            if (offer?.lowPrice) { price = parseFloat(String(offer.lowPrice)); return; }
          }
          if (obj.price) { price = parseFloat(String(obj.price)); return; }
        };
        if (Array.isArray(json)) {
          json.forEach(extractFromObj);
        } else {
          extractFromObj(json);
        }
      } catch { /* ignore malformed JSON-LD */ }
    });

    // 2. OG / meta price tags
    if (price === null) {
      const ogPrice = $('meta[property="og:price:amount"]').attr('content')
        || $('meta[property="product:price:amount"]').attr('content')
        || $('meta[name="twitter:data1"]').attr('content');
      if (ogPrice) {
        const parsed = parseFloat(ogPrice.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) price = parsed;
      }
    }

    // 3. Common CSS selectors for price
    if (price === null) {
      const priceSelectors = [
        '[data-testid="product-price"]', '[data-testid="currentPrice-container"]',
        '.product-price', '.price', '.product__price', '.pdp-price',
        '.price-tag', '.current-price', '.sale-price', '.offer-price',
        '[class*="productPrice"]', '[class*="product-price"]',
        '[itemprop="price"]',
      ];
      for (const sel of priceSelectors) {
        if (price !== null) break;
        const text = $(sel).first().text() || $(sel).first().attr('content') || '';
        const match = text.match(/[\d,]+\.?\d*/);
        if (match) {
          const parsed = parseFloat(match[0].replace(/,/g, ''));
          if (!isNaN(parsed) && parsed > 0) price = parsed;
        }
      }
    }

    // 4. Regex fallback on full HTML for ₹ / Rs / INR / $ patterns
    if (price === null) {
      const priceRegex = /(?:₹|Rs\.?|INR|MRP)\s*([\d,]+(?:\.\d{1,2})?)/i;
      const match = html.match(priceRegex);
      if (match) {
        const parsed = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(parsed) && parsed > 0) price = parsed;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        title: title.trim(),
        description: description.trim(),
        image: ogImage.trim(),
        images: images,
        brand,
        price,
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape the website. It might be blocking automated requests.' }, 
      { status: 500 }
    );
  }
}
