'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';

export default function InstagramExpert() {
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
      const res = await fetch('/api/content/instagram-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
        success('Đã tạo nội dung Instagram thành công!');
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
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>📸 Instagram Expert</h1>
        <p style={{ color: '#64748b' }}>Tạo nội dung phong cách sống (Lifestyle) tối ưu cho Instagram Feed & Threads</p>
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
                placeholder="Vd: Máy ảnh Fujifilm X-T5"
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
                placeholder="Ưu đãi độc quyền, tính năng nổi bật, tone giọng mong muốn..."
                rows={4}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-tech" style={{ padding: '16px', fontSize: '16px', marginTop: '10px' }}>
              {loading ? 'Đang tạo nội dung...' : '✨ Tạo Bài Đăng Instagram'}
            </button>
          </form>
        </div>

        <div className="col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading && (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>⚙️</div>
              <h3 style={{ color: '#22d3ee', fontWeight: '700' }}>AI đang phân tích thẩm mỹ và viết caption...</h3>
            </div>
          )}

          {!loading && result && (
            <>
              {/* Image Concepts */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>🎨 Ý Tưởng Hình Ảnh (Carousel)</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.imageConcepts.map((concept: string, idx: number) => (
                    <div key={idx} style={{ padding: '16px', background: 'rgba(34,211,238,0.05)', borderRadius: '12px', borderLeft: '4px solid #22d3ee', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>
                      <span style={{ fontWeight: '800', marginRight: '8px', color: '#22d3ee' }}>Slide {idx + 1}:</span>
                      {concept}
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>📝 Caption (Bao gồm Hashtag)</h3>
                  <button onClick={() => copyToClipboard(`${result.caption}\n\n${result.hashtags.join(' ')}`)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                    Copy Full
                  </button>
                </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {result.caption}
                  <br /><br />
                  <span style={{ color: '#6366f1' }}>{result.hashtags.join(' ')}</span>
                </div>
              </div>

              {/* AI Generation Prompts */}
              {(result.imagePrompt || result.videoPrompt || result.videoScript) && (
                <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>🤖 AI Generation Assets</h3>
                  
                  {result.videoScript && (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#22d3ee', marginBottom: '8px' }}>🎬 VIDEO SCRIPT (REELS)</div>
                      <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                        {result.videoScript}
                      </div>
                      <button onClick={() => copyToClipboard(result.videoScript!)} style={{ marginTop: '8px', background: 'none', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Copy Script</button>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {result.imagePrompt && (
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#c084fc', marginBottom: '8px' }}>🎨 IMAGE PROMPT</div>
                        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', fontSize: '12px', fontStyle: 'italic', color: '#94a3b8' }}>{result.imagePrompt}</div>
                        <button onClick={() => copyToClipboard(result.imagePrompt!)} style={{ marginTop: '6px', background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Copy Prompt</button>
                      </div>
                    )}
                    {result.videoPrompt && (
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>🎥 VIDEO PROMPT</div>
                        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', fontSize: '12px', fontStyle: 'italic', color: '#94a3b8' }}>{result.videoPrompt}</div>
                        <button onClick={() => copyToClipboard(result.videoPrompt!)} style={{ marginTop: '6px', background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Copy Prompt</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !result && (
            <div className="glass-panel" style={{ padding: '60px', borderRadius: '24px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>📸</div>
              <p style={{ fontSize: '16px' }}>Điền thông tin bên trái để tạo nội dung Instagram triệu view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
