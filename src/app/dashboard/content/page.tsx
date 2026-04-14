'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '📘', color: 'badge-blue' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'badge-gray' },
  { id: 'zalo', label: 'Zalo', icon: '💬', color: 'badge-blue' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'badge-purple' },
];

const TONES = [
  { id: 'engaging', label: '💫 Hấp dẫn' },
  { id: 'urgency', label: '🔥 Gấp gáp' },
  { id: 'funny', label: '😄 Hài hước' },
  { id: 'professional', label: '💼 Chuyên nghiệp' },
];

interface GeneratedContent {
  id: string;
  content: string;
  hashtags: string[];
  platform: string;
  createdAt: string;
}

function ContentStudio() {
  const searchParams = useSearchParams();

  const [productName, setProductName] = useState(searchParams.get('productName') || '');
  const [price, setPrice] = useState(searchParams.get('price') || '');
  const [discountedPrice, setDiscountedPrice] = useState(searchParams.get('discountedPrice') || '');
  const [commissionRate, setCommissionRate] = useState(searchParams.get('commissionRate') || '');
  const [affiliateLink, setAffiliateLink] = useState('https://shope.ee/your-link-here');
  const [platform, setPlatform] = useState<string>('facebook');
  const [tone, setTone] = useState<string>('engaging');
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const res = await fetch('/api/content/generate?limit=10');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setHistory(json.data);
      }
    } catch {}
  }

  async function handleGenerate() {
    if (!productName.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      // dev check
    }

    setLoading(true);
    setContents([]);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          price: parseFloat(price) || 0,
          discountedPrice: parseFloat(discountedPrice) || 0,
          commissionRate: parseFloat(commissionRate) || 0,
          platform,
          tone,
          affiliateLink,
          count,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setContents(json.data);
        loadHistory();
      } else {
        alert('Lỗi: ' + json.error);
      }
    } catch (err) {
      alert('Không thể kết nối API. Kiểm tra GEMINI_API_KEY trong .env');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const selectedPlatform = PLATFORMS.find(p => p.id === platform);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 AI Content Studio</h1>
          <p className="page-subtitle">Tạo caption, script bằng Gemini AI — đa nền tảng, tự động</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Form */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>⚙️ Cấu hình</h2>

          <div className="form-group">
            <label className="label">Tên sản phẩm *</label>
            <input
              type="text"
              className="input"
              placeholder="Kem chống nắng Anessa..."
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="label">Giá gốc (đ)</label>
              <input type="number" className="input" placeholder="520000" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Giá sale (đ)</label>
              <input type="number" className="input" placeholder="380000" value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="label">Hoa hồng (%)</label>
              <input type="number" className="input" placeholder="15" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Số versions</label>
              <select className="input select" value={count} onChange={e => setCount(+e.target.value)}>
                <option value={1}>1 version</option>
                <option value={2}>2 version</option>
                <option value={3}>3 version</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Affiliate Link</label>
            <input type="text" className="input" placeholder="https://shope.ee/..." value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Nền tảng</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`btn ${platform === p.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Tone giọng văn</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {TONES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`btn ${tone === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? '⏳ Đang tạo...' : `✨ Tạo ${count} content với Gemini AI`}
          </button>
        </div>

        {/* Right: Results */}
        <div>
          <div className="tabs">
            <button className={`tab ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>
              ✨ Kết quả mới
            </button>
            <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              📋 Lịch sử ({history.length})
            </button>
          </div>

          {activeTab === 'generate' && (
            <>
              {loading && (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Gemini AI đang viết nội dung cho {selectedPlatform?.label}...
                  </div>
                </div>
              )}

              {contents.length === 0 && !loading && (
                <div className="empty-state">
                  <div className="empty-state-icon">🤖</div>
                  <div className="empty-state-title">Sẵn sàng tạo content</div>
                  <div className="empty-state-text">Điền thông tin sản phẩm và nhấn tạo</div>
                </div>
              )}

              {contents.map((content, idx) => (
                <div key={content.id || idx} className="content-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={`badge ${selectedPlatform?.color || 'badge-blue'}`}>
                      {selectedPlatform?.icon} {selectedPlatform?.label}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className={`badge ${TONES.find(t => t.id === tone)?.id === 'urgency' ? 'badge-red' : 'badge-orange'}`}>
                        {TONES.find(t => t.id === tone)?.label}
                      </span>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => copyToClipboard(content.content, content.id || String(idx))}
                      >
                        {copied === (content.id || String(idx)) ? '✅ Đã copy' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="content-text">{content.content}</div>
                  {content.hashtags?.length > 0 && (
                    <div className="content-hashtags">
                      {content.hashtags.map((tag, i) => (
                        <span key={i} className="hashtag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-title">Chưa có lịch sử</div>
                  <div className="empty-state-text">Nội dung đã tạo sẽ xuất hiện ở đây</div>
                </div>
              ) : (
                history.map((item, idx) => {
                  const plt = PLATFORMS.find(p => p.id === item.platform);
                  return (
                    <div key={item.id || idx} className="content-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span className={`badge ${plt?.color || 'badge-gray'}`}>
                          {plt?.icon} {plt?.label || item.platform}
                        </span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => copyToClipboard(item.content, 'h-' + idx)}
                          >
                            {copied === 'h-' + idx ? '✅' : '📋'}
                          </button>
                        </div>
                      </div>
                      <div className="content-text" style={{ fontSize: '13px', maxHeight: '120px', overflow: 'hidden' }}>
                        {item.content}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ContentPage() {
  return (
    <Suspense fallback={<div className="loading-spinner" />}>
      <ContentStudio />
    </Suspense>
  );
}
