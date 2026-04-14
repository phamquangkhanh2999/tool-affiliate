import { useState, useEffect } from 'react';

export interface DbProduct {
  id: string;
  shopeeItemId: string;
  shopeeShopId: string;
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
}

export function useDbProducts() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/products?source=db');
        const json = await res.json();
        if (json.success) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error('Lỗi khi fetch products từ DB', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { products, loading };
}
