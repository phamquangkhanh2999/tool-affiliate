'use client';

import { useState, useEffect } from 'react';
import { useDbProducts, DbProduct } from '@/hooks/useProducts';

export default function ProductCmsPage() {
  const { products: initialProducts, loading } = useDbProducts();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editDiscountPrice, setEditDiscountPrice] = useState(0);
  const [editCommission, setEditCommission] = useState(0);

  useEffect(() => {
    if (initialProducts.length > 0) setProducts(initialProducts);
  }, [initialProducts]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn sản phẩm: ${name}?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        showToast('Đã xóa thành công');
      } else {
        showToast('Lỗi khi xóa', 'error');
      }
    } catch {
      showToast('Lỗi mạng', 'error');
    }
  };

  const openEdit = (p: DbProduct) => {
    setSelectedProduct(p);
    setEditName(p.name);
    setEditPrice(p.originalPrice);
    setEditDiscountPrice(p.discountedPrice);
    setEditCommission(p.commissionRate);
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedProduct) return;
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          originalPrice: editPrice,
          discountedPrice: editDiscountPrice,
          commissionRate: editCommission,
        })
      });
      if (res.ok) {
        showToast('Đã cập nhật sản phẩm');
        setProducts(products.map(p => 
          p.id === selectedProduct.id 
            ? { ...p, name: editName, originalPrice: editPrice, discountedPrice: editDiscountPrice, commissionRate: editCommission } 
            : p
        ));
        setEditModalOpen(false);
      } else {
        showToast('Sửa thất bại', 'error');
      }
    } catch {
      showToast('Lỗi mạng', 'error');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Quản Trị Sản Phẩm (CMS)</h1>
          <p className="page-subtitle">Danh sách tất cả sản phẩm đang lưu trong Database</p>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' }}>
              <th style={{ padding: '16px' }}>Hình Ảnh</th>
              <th style={{ padding: '16px' }}>Tên Sản Phẩm</th>
              <th style={{ padding: '16px' }}>Giá Khuyến Mãi</th>
              <th style={{ padding: '16px' }}>Hoa Hồng</th>
              <th style={{ padding: '16px' }}>Đã bán</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>Chưa có sản phẩm nào.</td></tr>
            ) : products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <img src={p.imageUrl} alt={p.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                </td>
                <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {p.shopeeItemId} • {p.category}</div>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>₫{p.discountedPrice.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}><span className="badge badge-green">{p.commissionRate}%</span></td>
                <td style={{ padding: '12px 16px' }}>{p.soldCount}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedProduct(p); setViewModalOpen(true); }}>👁️ Xem</button>
                    <button className="btn btn-primary btn-sm" onClick={() => openEdit(p)}>✏️ Sửa</button>
                    <button className="btn btn-sm" style={{ background: 'var(--red)', color: 'white' }} onClick={() => handleDelete(p.id, p.name)}>🗑️ Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>✏️ Sửa Lợi Nhuận</h3>
            <div className="form-group">
              <label className="label">Tên Sản Phẩm (Hiển thị nội bộ)</label>
              <input type="text" className="input" value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Giá Gốc (VND)</label>
              <input type="number" className="input" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Giá Khuyến Mãi (VND)</label>
              <input type="number" className="input" value={editDiscountPrice} onChange={e => setEditDiscountPrice(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Hoa Hồng (%)</label>
              <input type="number" className="input" value={editCommission} onChange={e => setEditCommission(Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>💾 Lưu lại</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>👁️ Chi Tiết Product</h3>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }} onClick={() => setViewModalOpen(false)}>✕</button>
            </div>
            <img src={selectedProduct.imageUrl} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} alt="" />
            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>{selectedProduct.name}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{selectedProduct.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div><b>Shop:</b> {selectedProduct.shopName}</div>
              <div><b>Ngành:</b> {selectedProduct.category}</div>
              <div><b>Shopee ID:</b> {selectedProduct.shopeeItemId}</div>
              <div><b>Rating:</b> {selectedProduct.rating}⭐</div>
            </div>
            <a href={`/dashboard/analyze?productId=${selectedProduct.shopeeItemId}`} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>🔬 Ném vào AI Analyze</a>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>
      )}
    </>
  );
}
