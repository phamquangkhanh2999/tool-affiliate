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

// ─── Real Shopee API (khi có credentials) ──────────────────

export async function fetchShopeeProducts(filters: SearchFilters): Promise<ShopeeProduct[]> {
  const appId = process.env.SHOPEE_APP_ID;
  const secretKey = process.env.SHOPEE_SECRET_KEY;

  if (!appId || !secretKey) {
    // Return empty when no API key
    return [];
  }

  // TODO: Implement Shopee Affiliate API
  // https://affiliate.shopee.vn/open_api/vi/
  return [];
}

// ─── Generate Affiliate Link ──────────────────────────────

export function generateAffiliateUrl(
  productUrl: string,
  trackingCode: string
): string {
  const appId = process.env.SHOPEE_APP_ID;
  if (!appId) {
    // Return placeholder
    return `https://shopee.vn/product-url?tracking=${trackingCode}`;
  }

  const baseUrl = new URL(productUrl);
  baseUrl.searchParams.set("smtt", appId);
  baseUrl.searchParams.set("utm_source", "affiliate");
  baseUrl.searchParams.set("utm_medium", "affiliate");
  baseUrl.searchParams.set("utm_campaign", trackingCode);
  return baseUrl.toString();
}

// ─── Placeholder for future use ────────────────────────────

export function getMockProducts(filters: SearchFilters): ShopeeProduct[] {
  return [];
}
