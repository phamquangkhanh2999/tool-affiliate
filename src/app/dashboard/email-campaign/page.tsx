'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';

export default function EmailCampaign() {
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
      const res = await fetch('/api/content/email-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
        success('Đã tạo nội dung Email thành công!');
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
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>📧 Email Campaign</h1>
        <p style={{ color: '#64748b' }}>Tạo chiến dịch Email Marketing tăng chuyển đổi (Open Rate & CTR) cho Affiliate Link</p>
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
                placeholder="Vd: Khoá học Marketing..."
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
                placeholder="Đối tượng mục tiêu, khuyến mãi, call to action đặc biệt..."
                rows={4}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-tech" style={{ padding: '16px', fontSize: '16px', marginTop: '10px' }}>
              {loading ? 'Đang tạo nội dung...' : '✨ Tạo Email Marketing'}
            </button>
          </form>
        </div>

        <div className="col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading && (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>⚙️</div>
              <h3 style={{ color: '#22d3ee', fontWeight: '700' }}>AI đang thiết kế chiến dịch Email...</h3>
            </div>
          )}

          {!loading && result && (
            <>
              {/* Email Meta */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '8px' }}>SUBJECT LINE</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34,211,238,0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #22d3ee' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{result.subject}</span>
                      <button onClick={() => copyToClipboard(result.subject)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Copy</button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '8px' }}>PREVIEW TEXT</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '14px', color: '#e2e8f0', fontStyle: 'italic' }}>{result.previewText}</span>
                      <button onClick={() => copyToClipboard(result.previewText)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Copy</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>📝 Email Body (HTML Code)</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => copyToClipboard(result.bodyHtml)} style={{ padding: '6px 12px', background: 'rgba(34,211,238,0.2)', color: '#22d3ee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                      Copy HTML Code
                    </button>
                  </div>
                </div>
                
                {/* HTML Output preview */}
                <div style={{ padding: '20px', background: '#fff', borderRadius: '16px', color: '#000', fontSize: '15px', lineHeight: '1.6', overflowX: 'auto', marginBottom: '20px' }}>
                   <div dangerouslySetInnerHTML={{ __html: result.bodyHtml }} />
                </div>

                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '16px', color: '#a5b4fc', fontSize: '13px', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {result.bodyHtml}
                </div>
              </div>
            </>
          )}

          {!loading && !result && (
            <div className="glass-panel" style={{ padding: '60px', borderRadius: '24px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>📧</div>
              <p style={{ fontSize: '16px' }}>Điền thông tin bên trái để thiết kế Email tự động</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
