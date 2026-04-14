'use client';

import { useDbProducts } from '@/hooks/useProducts';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Interface matching the Gemini result
interface ExpertResult {
  hooks: string[];
  shortVersion: string;
  longVersion: string;
}

function FacebookExpertStudio() {
  const searchParams = useSearchParams();
  const { products: dbProducts } = useDbProducts();

  const [selectedId, setSelectedId] = useState(searchParams.get('productId') || '');
  const [productName, setProductName] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExpertResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-fill form if product is selected via URL or dropdown
  const selectProduct = (id: string) => {
    setSelectedId(id);
    const p = dbProducts.find((p) => p.id === id || p.shopeeItemId === id);
    if (p) {
      setProductName(p.name);
      // Generate a mock or real affiliate link if possible, here we leave it for user
    }
  };

  useEffect(() => {
    if (selectedId && dbProducts.length > 0) {
      selectProduct(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbProducts, selectedId]);

  const handleGenerate = async () => {
    if (!productName.trim() || !affiliateLink.trim()) {
      alert('Vui lòng điền tên sản phẩm và link affiliate');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/content/expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          affiliateLink,
          additionalInfo,
          productId: selectedId || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        alert('Lỗi: ' + json.error);
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className='animate-in' style={{ animation: 'slideUp 0.4s ease' }}>
      <div className='page-header'>
        <div>
          <h1 className='page-title' style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🚀</span> Chuyên gia Facebook Content
          </h1>
          <p className='page-subtitle'>
            Sáng tạo nội dung bán hàng đẳng cấp từ AI chuyên gia dành riêng cho thị trường Việt Nam
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 350px) 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Form */}
        <div className='card-glass' style={{ position: 'sticky', top: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                width: '3px',
                height: '20px',
                background: 'var(--orange)',
                borderRadius: '2px',
              }}
            ></div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Thiết lập bài đăng
            </h2>
          </div>

          <div className='form-group'>
            <label className='label'>Chọn sản phẩm (từ kho lưu trữ)</label>
            <select
              className='input select'
              value={selectedId}
              onChange={(e) => selectProduct(e.target.value)}
            >
              <option value=''>-- Tự nhập thủ công --</option>
              {dbProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label className='label'>Tên sản phẩm *</label>
            <input
              className='input'
              placeholder='VD: Kem chống nắng Anessa Gold...'
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className='form-group'>
            <label className='label'>Link Affiliate *</label>
            <input
              className='input'
              placeholder='https://shope.ee/...'
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
            />
          </div>

          <div className='form-group'>
            <label className='label'>Thông tin bổ sung (Ưu đãi, quà tặng...)</label>
            <textarea
              className='input'
              style={{ minHeight: '100px', resize: 'vertical', lineHeight: '1.5' }}
              placeholder='VD: Giảm ngay 50k cho đơn từ 200k, tặng kèm túi tote...'
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          <button
            className='btn btn-primary'
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '10px',
              justifyContent: 'center',
              fontSize: '15px',
            }}
            disabled={loading}
            onClick={handleGenerate}
          >
            {loading ? (
              <>
                <div
                  className='loading-spinner'
                  style={{ width: '18px', height: '18px', borderWidth: '2px' }}
                />
                <span>AI đang suy nghĩ...</span>
              </>
            ) : (
              <>✨ Tạo bài đăng chuyên gia</>
            )}
          </button>
        </div>

        {/* Right Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading && (
            <div
              className='card'
              style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--bg-card)' }}
            >
              <div
                className='loading-spinner'
                style={{ margin: '0 auto 24px', width: '48px', height: '48px' }}
              />
              <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>
                🚀 Đang khởi tạo kịch bản chuyên gia...
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  maxWidth: '400px',
                  margin: '0 auto',
                }}
              >
                Hệ thống đang phân tích tâm lý khách hàng và tối ưu hóa các điểm chạm (touch points)
                để mang lại tỉ lệ chuyển đổi cao nhất.
              </p>
            </div>
          )}

          {!loading && !result && (
            <div
              className='empty-state'
              style={{
                background: 'var(--bg-card)',
                borderRadius: '20px',
                border: '2px dashed var(--border)',
                padding: '120px 40px',
              }}
            >
              <div className='empty-state-icon' style={{ fontSize: '64px', marginBottom: '24px' }}>
                📘
              </div>
              <div className='empty-state-title' style={{ fontSize: '22px' }}>
                Bạn cần viết bài đăng Facebook?
              </div>
              <div className='empty-state-text' style={{ fontSize: '15px' }}>
                Hệ thống chuyên gia AI sẽ tạo ra 3 phương án tiêu đề viral, 1 bài đăng ngắn và 1 bài
                đăng storytelling dài giúp bạn nổ đơn chỉ trong vài giây.
              </div>
            </div>
          )}

          {result && (
            <div
              className='animate-in-up'
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                animation: 'slideUp 0.5s ease',
              }}
            >
              {/* Hooks Section */}
              <div
                className='card'
                style={{ borderLeft: '4px solid var(--purple)', background: 'var(--bg-card)' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🪝</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                      Danh sách 3 Hooks Viral (Dùng để thay đổi tiêu đề)
                    </h3>
                  </div>
                  <span className='badge badge-purple' style={{ padding: '4px 12px' }}>
                    High Curiosity
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.hooks.map((hook, idx) => (
                    <div
                      key={idx}
                      className='content-card'
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border)',
                        position: 'relative',
                        padding: '16px 50px 16px 16px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          lineHeight: '1.5',
                        }}
                      >
                        {hook}
                      </div>
                      <button
                        className='btn btn-sm btn-secondary btn-icon'
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                        title='Copy tiêu đề'
                        onClick={() => copyToClipboard(hook, `hook-${idx}`)}
                      >
                        {copiedId === `hook-${idx}` ? '✅' : '📋'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
                {/* Short Post */}
                <div
                  className='card'
                  style={{
                    borderLeft: '4px solid var(--blue)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>📱</span>
                      <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Phiên bản ngắn gọn</h3>
                    </div>
                    <button
                      className='btn btn-sm btn-secondary'
                      onClick={() => copyToClipboard(result.shortVersion, 'short')}
                    >
                      {copiedId === 'short' ? '✅ Đã copy' : '📋 Copy'}
                    </button>
                  </div>
                  <div
                    className='content-text'
                    style={{
                      fontSize: '13.5px',
                      padding: '16px',
                      background: 'rgba(0,0,0,0.15)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      flex: 1,
                    }}
                  >
                    {result.shortVersion}
                  </div>
                </div>

                {/* Long Post */}
                <div
                  className='card'
                  style={{
                    borderLeft: '4px solid var(--orange)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>📝</span>
                      <h3 style={{ fontSize: '15px', fontWeight: '700' }}>
                        Bản Storytelling (Dài)
                      </h3>
                    </div>
                    <button
                      className='btn btn-sm btn-primary'
                      onClick={() => copyToClipboard(result.longVersion, 'long')}
                    >
                      {copiedId === 'long' ? '✅ Đã copy' : '✨ Copy bài viết'}
                    </button>
                  </div>
                  <div
                    className='content-text'
                    style={{
                      fontSize: '14.5px',
                      padding: '20px',
                      background: 'rgba(0,0,0,0.15)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      flex: 1,
                    }}
                  >
                    {result.longVersion}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in-up {
          animation: slideUp 0.5s ease;
        }
      `}</style>
    </div>
  );
}

export default function FacebookExpertPage() {
  return (
    <Suspense fallback={<div className='loading-spinner' />}>
      <FacebookExpertStudio />
    </Suspense>
  );
}
