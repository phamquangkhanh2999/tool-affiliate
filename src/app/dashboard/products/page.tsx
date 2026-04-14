'use client';

import { useState, useCallback } from 'react';
import { useDbProducts } from '@/hooks/useProducts';
import type { ShopeeProduct } from '@/lib/shopee';

const CATEGORIES = ['Tất cả', 'Laptop & Máy Tính', 'Tai Nghe & Âm Thanh', 'Điện Thoại', 'Đồ Gia Dụng', 'Chăm Sóc Da', 'Bàn Ghế Văn Phòng', 'Robot Hút Bụi', 'Nồi & Chảo'];

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

function ProductCard({ product, onAction }: { product: ShopeeProduct; onAction: (product: ShopeeProduct, action: 'save' | 'content' | 'analyze' | 'strategy') => void }) {
  const discount = product.originalPrice > 0
    ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      <div style={{ position: 'relative' }}>
        <img
          src={`https://picsum.photos/seed/${product.itemId}/400/200`}
          alt={product.name}
          className="product-image"
        />
        {discount > 0 && (
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'var(--orange)', color: 'white',
            fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px'
          }}>
            -{discount}%
          </span>
        )}
        <span style={{
          position: 'absolute', top: '8px', left: '8px',
          background: 'rgba(16,185,129,0.9)', color: 'white',
          fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px'
        }}>
          💰 {product.commissionRate}% hoa hồng
        </span>
      </div>

      <div className="product-body">
        <div className="product-name">{product.name}</div>

        <div className="product-price">
          <span className="product-price-sale">{formatVND(product.discountedPrice)}</span>
          {discount > 0 && (
            <span className="product-price-original">{formatVND(product.originalPrice)}</span>
          )}
        </div>

        <div className="product-meta">
          <span>⭐ {product.rating} • 🛒 {product.soldCount.toLocaleString('vi-VN')} đã bán</span>
          <span className="badge badge-gray">{product.category}</span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          🏪 {product.shopName}
        </div>

        <div className="product-actions">
          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={() => onAction(product, 'content')}
          >
            🤖 AI Content
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAction(product, 'analyze')}
            title="Phân tích tiềm năng affiliate"
          >
            🔬
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAction(product, 'strategy')}
            title="Tạo Content Strategy"
          >
            🎬
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAction(product, 'save')}
          >
            💾
          </button>
        </div>
      </div>
    </div>
  );
}


export default function ProductsPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState<'commission' | 'sold' | 'price' | 'rating'>('commission');
  const [minCommission, setMinCommission] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { products: dbProducts, loading } = useDbProducts();
  const rawProducts: ShopeeProduct[] = dbProducts.map(p => ({
    ...p,
    itemId: p.shopeeItemId,
    shopId: p.shopeeShopId,
    affiliateUrl: '', // mockup
  }));

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = useCallback(async (product: ShopeeProduct, action: 'save' | 'content' | 'analyze' | 'strategy') => {
    if (action === 'content') {
      const params = new URLSearchParams({
        productName: product.name,
        price: product.originalPrice.toString(),
        discountedPrice: product.discountedPrice.toString(),
        commissionRate: product.commissionRate.toString(),
      });
      window.location.href = `/dashboard/content?${params}`;
      return;
    }

    if (action === 'analyze') {
      const params = new URLSearchParams({ productId: product.itemId });
      window.location.href = `/dashboard/analyze?${params}`;
      return;
    }

    if (action === 'strategy') {
      const params = new URLSearchParams({ productId: product.itemId });
      window.location.href = `/dashboard/strategy?${params}`;
      return;
    }

    // Save product
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopeeItemId: product.itemId,
          shopeeShopId: product.shopId,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          originalPrice: product.originalPrice,
          discountedPrice: product.discountedPrice,
          commissionRate: product.commissionRate,
          category: product.category,
          shopName: product.shopName,
          rating: product.rating,
          soldCount: product.soldCount,
        }),
      });
      if (res.ok) showToast(`✅ Đã lưu "${product.name.slice(0, 30)}..."`);
      else showToast('❌ Lỗi khi lưu sản phẩm', 'error');
    } catch {
      showToast('❌ Không thể kết nối server', 'error');
    }
  }, []);

  // Filter products
  let products = [...rawProducts];
  if (keyword) {
    const kw = keyword.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw));
  }
  if (category !== 'Tất cả') {
    products = products.filter(p => p.category === category);
  }
  if (minCommission > 0) {
    products = products.filter(p => p.commissionRate >= minCommission);
  }
  if (sortBy === 'commission') products.sort((a, b) => b.commissionRate - a.commissionRate);
  else if (sortBy === 'sold') products.sort((a, b) => b.soldCount - a.soldCount);
  else if (sortBy === 'price') products.sort((a, b) => a.discountedPrice - b.discountedPrice);
  else products.sort((a, b) => b.rating - a.rating);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">🛍️ Tìm sản phẩm</h1>
          <p className="page-subtitle">Khám phá sản phẩm hot Shopee với hoa hồng cao nhất</p>
        </div>
        <span className="badge badge-orange" style={{ fontSize: '13px', padding: '6px 14px' }}>
          {products.length} sản phẩm
        </span>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">🔍 Tìm kiếm</label>
            <div className="input-group">
              <span className="input-icon">🔍</span>
              <input
                type="text"
                className="input"
                placeholder="Tên sản phẩm, danh mục..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Danh mục</label>
            <select className="input select" value={category} onChange={e => setCategory(e.target.value)} style={{ width: '180px' }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Hoa hồng tối thiểu</label>
            <select className="input select" value={minCommission} onChange={e => setMinCommission(+e.target.value)} style={{ width: '140px' }}>
              <option value={0}>Tất cả</option>
              <option value={5}>≥ 5%</option>
              <option value={10}>≥ 10%</option>
              <option value={15}>≥ 15%</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Sắp xếp</label>
            <select className="input select" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{ width: '140px' }}>
              <option value="commission">Hoa hồng cao nhất</option>
              <option value="sold">Bán chạy nhất</option>
              <option value="price">Giá thấp nhất</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Đang tải danh sách sản phẩm...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Không tìm thấy sản phẩm</div>
          <div className="empty-state-text">Thử thay đổi bộ lọc</div>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard key={(product as any).id || `${product.itemId}-${index}`} product={product} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </>
  );
}
