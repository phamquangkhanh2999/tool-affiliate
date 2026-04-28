'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ShopeeProduct {
  itemId: string;
  shopId: string;
  name: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  commissionRate: number;
  soldCount: number;
  rating: number;
}

export default function ProductResearch() {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<ShopeeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('commission');

  // Trigger search on component mount (for mock data initial load)
  useEffect(() => {
    handleSearch(new Event('submit') as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      // Vì chưa có API thật trên Next.js backend, ta tạo một mock endpoint tạm
      // Hoặc gọi thẳng thư viện (nhưng lib ở server-side nên cần API route)
      // Tạm thời fetch tới /api/scraper/shopee-search
      const res = await fetch(`/api/scraper/shopee-search?keyword=${keyword}&sortBy=${sortBy}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Nghiên Cứu Sản Phẩm</h1>
        <p style={{ color: '#64748b' }}>Tìm kiếm sản phẩm hoa hồng cao từ Shopee</p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', marginBottom: '30px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px' }}>🔍</span>
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập tên sản phẩm hoặc ngành hàng..." 
              style={{ width: '100%', padding: '16px 16px 16px 50px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '16px', outline: 'none' }}
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="commission">Hoa hồng cao nhất</option>
            <option value="sold">Bán chạy nhất</option>
          </select>
          <button type="submit" disabled={loading} className="btn-tech" style={{ padding: '0 30px', borderRadius: '16px' }}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </form>
      </div>

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {products.map(p => (
          <div key={p.itemId} className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
              <Image 
                src={p.imageUrl} 
                alt={p.name} 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg, #ff0050, #ff6b6b)', color: '#fff', padding: '4px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: '800', boxShadow: '0 4px 10px rgba(255,0,80,0.3)' }}>
                Hoa hồng: {p.commissionRate}%
              </div>
            </div>
            
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.name}
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#22d3ee' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.discountedPrice)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Đã bán {p.soldCount}</div>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                <button className="btn-tech" style={{ flex: 1, padding: '10px', fontSize: '13px' }}>Tạo Link Affiliate</button>
                <button style={{ padding: '10px', width: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>✨</button>
              </div>
            </div>
          </div>
        ))}

        {!loading && products.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p>Không tìm thấy sản phẩm nào. Vui lòng thử từ khóa khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
