'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';

export default function ZaloExpert() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    affiliateLink: '',
    additionalInfo: ''
  });
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.affiliateLink) {
      error('Vui lòng nhập Tên sản phẩm và Link Affiliate');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/content/zalo-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
        success('Đã tạo nội dung Zalo thành công!');
      } else {
        error(data.error || 'Lỗi tạo nội dung');
      }
    } catch (err) {
      error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Đã copy vào bộ nhớ tạm');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>💬 Zalo Expert</h1>
        <p style={{ color: '#64748b' }}>Tạo tin nhắn Broadcast và Bài đăng Nhật ký Zalo chốt sale hiệu quả</p>
      </div>

      <div className="grid-container">
        <div className="glass-panel col-span-5" style={{ padding: '30px', borderRadius: '24px', alignSelf: 'start' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Thông tin sản phẩm</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>TÊN SẢN PHẨM *</label>
              <input 
                value={formData.productName}
                onChange={e => setFormData({...formData, productName: e.target.value})}
                placeholder="Vd: Serum cấp ẩm phục hồi da..."
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>LINK AFFILIATE *</label>
              <input 
                value={formData.affiliateLink}
                onChange={e => setFormData({...formData, affiliateLink: e.target.value})}
                placeholder="https://shope.ee/..."
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>THÔNG TIN BỔ SUNG (Tuỳ chọn)</label>
              <textarea 
                value={formData.additionalInfo}
                onChange={e => setFormData({...formData, additionalInfo: e.target.value})}
                placeholder="Khuyến mãi đang có, đặc điểm nổi bật..."
                rows={4}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-tech" style={{ padding: '16px', fontSize: '16px', marginTop: '10px' }}>
              {loading ? 'Đang tạo nội dung...' : '✨ Tạo Nội Dung Zalo'}
            </button>
          </form>
        </div>

        <div className="col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading && (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>⚙️</div>
              <h3 style={{ color: '#22d3ee', fontWeight: '700' }}>AI đang soạn nội dung Zalo chuyên nghiệp...</h3>
            </div>
          )}

          {!loading && result && (
            <>
              {/* Zalo Message */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>📩 Tin Nhắn / Broadcast Zalo OA</h3>
                  <button onClick={() => copyToClipboard(result.zaloMessage)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                    Copy Tin Nhắn
                  </button>
                </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap', borderLeft: '4px solid #0068ff' }}>
                  {result.zaloMessage}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>* Thích hợp để gửi tin nhắn hàng loạt hoặc tư vấn 1-1.</p>
              </div>

              {/* Zalo Article */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>📝 Bài Đăng Nhật Ký Zalo</h3>
                  <button onClick={() => copyToClipboard(result.zaloArticle)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                    Copy Bài Đăng
                  </button>
                </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {result.zaloArticle}
                </div>
              </div>
            </>
          )}

          {!loading && !result && (
            <div className="glass-panel" style={{ padding: '60px', borderRadius: '24px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>💬</div>
              <p style={{ fontSize: '16px' }}>Điền thông tin bên trái để tạo mẫu tin nhắn và bài đăng Zalo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
