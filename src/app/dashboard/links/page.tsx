'use client';

import { useState, useEffect } from 'react';

interface AffiliateLink {
  productName: string;
  affiliateLink: string;
  lastUsed: string;
}

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setLinks(json.data);
      }
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredLinks = links.filter(link => 
    link.productName.toLowerCase().includes(search.toLowerCase()) ||
    link.affiliateLink.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <header style={{ 
        marginBottom: '40px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        marginTop: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '900', color: '#f8fafc', marginBottom: '8px' }}>
            🔗 Kho Affiliate Links
          </h1>
          <p style={{ color: '#94a3b8' }}>Tự động tổng hợp từ lịch sử tạo bài viết chuyên gia</p>
        </div>
        
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Tìm sản phẩm hoặc link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '14px 20px', 
              borderRadius: '16px', 
              background: '#1e293b', 
              border: '1px solid #334155', 
              color: 'white',
              fontSize: '15px'
            }}
          />
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Đang tải...</div>
      ) : filteredLinks.length > 0 ? (
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          borderRadius: '24px', 
          overflowX: 'auto', 
          border: '1px solid #334155',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '20px' }}>Sản phẩm</th>
                <th style={{ padding: '20px' }}>Affiliate Link</th>
                <th style={{ padding: '20px' }}>Ngày tạo</th>
                <th style={{ padding: '20px', textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '20px', color: '#f1f5f9', fontWeight: '600' }}>{link.productName}</td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: '13px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {link.affiliateLink}
                    </div>
                  </td>
                  <td style={{ padding: '20px', color: '#64748b', fontSize: '13px' }}>
                    {new Date(link.lastUsed).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleCopy(link.affiliateLink)}
                      style={{ 
                        padding: '10px 20px', 
                        borderRadius: '12px', 
                        background: copied === link.affiliateLink ? '#10b981' : '#334155', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                    >
                      {copied === link.affiliateLink ? '✅ Đã Copy' : '📋 Copy'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '32px', border: '2px dashed #334155', color: '#64748b' }}>
          Không tìm thấy liên kết nào phù hợp.
        </div>
      )}
    </div>
  );
}
