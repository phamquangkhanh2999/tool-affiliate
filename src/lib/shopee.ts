import { MOCK_PRODUCTS } from "@/data/mock-products";

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

async function fetchShopeeProducts(filters: SearchFilters): Promise<ShopeeProduct[]> {
  const appId = process.env.SHOPEE_APP_ID;
  const secretKey = process.env.SHOPEE_SECRET_KEY;

  if (!appId || !secretKey) {
    // Fallback to mock data
    return getMockProducts(filters);
  }

  // TODO: Implement Shopee Affiliate API
  // https://affiliate.shopee.vn/open_api/vi/
  return getMockProducts(filters);
}

// ─── Generate Affiliate Link ──────────────────────────────

export function generateAffiliateUrl(
  productUrl: string,
  trackingCode: string
): string {
  const appId = process.env.SHOPEE_APP_ID;
  if (!appId) {
    // Return mock shortened URL for dev
    return `https://shope.ee/dev-${trackingCode}`;
  }

  const baseUrl = new URL(productUrl);
  baseUrl.searchParams.set("smtt", appId);
  baseUrl.searchParams.set("utm_source", "affiliate");
  baseUrl.searchParams.set("utm_medium", "affiliate");
  baseUrl.searchParams.set("utm_campaign", trackingCode);
  return baseUrl.toString();
}

// ─── Mock Data for Development ────────────────────────────

function getMockProducts(filters: SearchFilters): ShopeeProduct[] {
  let products = [...MOCK_PRODUCTS];

  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.category.toLowerCase().includes(kw)
    );
  }

  if (filters.category) {
    products = products.filter((p) =>
      p.category.toLowerCase().includes(filters.category!.toLowerCase())
    );
  }

  if (filters.minCommission) {
    products = products.filter(
      (p) => p.commissionRate >= filters.minCommission!
    );
  }

  if (filters.maxPrice) {
    products = products.filter(
      (p) => p.discountedPrice <= filters.maxPrice!
    );
  }

  // Sort
  if (filters.sortBy === "commission") {
    products.sort((a, b) => b.commissionRate - a.commissionRate);
  } else if (filters.sortBy === "sold") {
    products.sort((a, b) => b.soldCount - a.soldCount);
  } else if (filters.sortBy === "price") {
    products.sort((a, b) => a.discountedPrice - b.discountedPrice);
  } else if (filters.sortBy === "rating") {
    products.sort((a, b) => b.rating - a.rating);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const start = (page - 1) * limit;
  return products.slice(start, start + limit);
}

export { fetchShopeeProducts, getMockProducts };
