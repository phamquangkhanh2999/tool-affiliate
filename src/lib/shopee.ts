import crypto from 'crypto';

export interface ShopeeProduct {
  itemId: string;
  shopId: string;
  name: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  commissionRate: number;
  category: string;
  shopName: string;
  rating: number;
  soldCount: number;
  affiliateUrl?: string;
}

export interface SearchFilters {
  keyword?: string;
  category?: string;
  minCommission?: number;
  maxPrice?: number;
  sortBy?: "commission" | "sold" | "price" | "rating";
  page?: number;
  limit?: number;
}

// ─── Generate API Signature ────────────────────────────────────────────────
function generateShopeeSignature(appId: string, secretKey: string, payload: string): string {
  // Shopee Affiliate API v2 uses HMAC-SHA256
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const factor = appId + timestamp + payload;
  const hash = crypto.createHmac('sha256', secretKey).update(factor).digest('hex');
  return hash;
}

// ─── Real Shopee API (Fallback to Mock) ──────────────────────────────────
export async function fetchShopeeProducts(filters: SearchFilters): Promise<ShopeeProduct[]> {
  const appId = process.env.SHOPEE_APP_ID;
  const secretKey = process.env.SHOPEE_SECRET_KEY;

  if (!appId || !secretKey || appId.includes('your-')) {
    // Return mock data when no valid API key
    return getMockProducts(filters);
  }

  try {
    const payload = JSON.stringify({
      keyword: filters.keyword || '',
      limit: filters.limit || 20,
      offset: ((filters.page || 1) - 1) * (filters.limit || 20)
    });

    const signature = generateShopeeSignature(appId, secretKey, payload);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // NOTE: This URL is illustrative. Please replace with actual Shopee API v2 endpoint.
    const url = 'https://open-api.affiliate.shopee.vn/graphql';
    
    // For now, even if keys exist, we return mock data to prevent errors during demo
    // Uncomment actual fetch when endpoint is verified.
    /*
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `SHA256 Credential=${appId}, Signature=${signature}, Timestamp=${timestamp}`
      },
      body: payload
    });
    */
    
    return getMockProducts(filters);
  } catch (err) {
    console.error('Shopee API Error:', err);
    return getMockProducts(filters);
  }
}

// ─── Generate Affiliate Link ──────────────────────────────────────────────
export function generateAffiliateUrl(
  productUrl: string,
  trackingCode: string
): string {
  const appId = process.env.SHOPEE_APP_ID;
  const baseUrl = new URL(productUrl);
  
  if (appId && !appId.includes('your-')) {
    baseUrl.searchParams.set("smtt", appId);
  }
  
  baseUrl.searchParams.set("utm_source", "affiliate");
  baseUrl.searchParams.set("utm_medium", "affiliate");
  baseUrl.searchParams.set("utm_campaign", trackingCode);
  return baseUrl.toString();
}

// ─── Mock Data for Development ────────────────────────────────────────────
export function getMockProducts(filters: SearchFilters): ShopeeProduct[] {
  const mockDb: ShopeeProduct[] = [
    {
      itemId: "10001", shopId: "S001",
      name: "Áo Thun Nam Nữ Cổ Tròn Cotton 100% Form Rộng Oversize Cao Cấp (Nhiều Màu)",
      description: "Áo thun phong cách unisex, vải mát, thấm hút mồ hôi.",
      imageUrl: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lstbyl3b3x3z46",
      originalPrice: 150000, discountedPrice: 99000,
      commissionRate: 15.5, category: "Thời Trang",
      shopName: "Fashion Hub", rating: 4.8, soldCount: 5200
    },
    {
      itemId: "10002", shopId: "S002",
      name: "Tai nghe Bluetooth không dây TWS chống ồn chủ động ANC",
      description: "Pin 24h, âm thanh hi-res, chống nước IPX4.",
      imageUrl: "https://down-vn.img.susercontent.com/file/vn-11134201-7qukw-lexx72p98c3938",
      originalPrice: 450000, discountedPrice: 289000,
      commissionRate: 12.0, category: "Điện Tử",
      shopName: "Audio Official", rating: 4.6, soldCount: 12500
    },
    {
      itemId: "10003", shopId: "S003",
      name: "Serum cấp ẩm phục hồi da mụn, tinh chất rau má",
      description: "Hàng chính hãng, trị mụn hiệu quả sau 7 ngày.",
      imageUrl: "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lexx72p98c3938", // Placeholder
      originalPrice: 350000, discountedPrice: 185000,
      commissionRate: 20.0, category: "Mỹ Phẩm",
      shopName: "Beauty Store", rating: 4.9, soldCount: 3400
    }
  ];

  let results = [...mockDb];
  
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    results = results.filter(p => p.name.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw));
  }
  
  if (filters.sortBy === 'commission') results.sort((a, b) => b.commissionRate - a.commissionRate);
  if (filters.sortBy === 'sold') results.sort((a, b) => b.soldCount - a.soldCount);
  
  return results;
}
