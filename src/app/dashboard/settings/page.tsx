'use client';

import { useEffect, useState } from 'react';

interface SettingSection {
  title: string;
  icon: string;
  description: string;
}

function SettingSection({
  title,
  icon,
  description,
  children,
}: SettingSection & { children: React.ReactNode }) {
  return (
    <div className='card' style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <h2 style={{ fontSize: '16px', fontWeight: '700' }}>{title}</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '30px' }}>
          {description}
        </p>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid rgba(42,42,61,0.5)',
      }}
    >
      <div>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>{label}</div>
        {hint && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {hint}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [shopeeAppId, setShopeeAppId] = useState('');
  const [shopeeSecret, setShopeeSecret] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showShopeeSecret, setShowShopeeSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, 'ok' | 'fail' | null>>({});

  // 1. Load settings from DB on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data) {
          setGeminiKey(json.data.geminiApiKey || '');
          setGeminiModel(json.data.geminiModel || 'gemini-2.5-flash');
          setShopeeAppId(json.data.shopeeAppId || '');
          setShopeeSecret(json.data.shopeeSecretKey || '');
        }
      } catch (err) {
        console.error('Lỗi khi load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // 2. Save settings to DB
  async function handleSave() {
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiApiKey: geminiKey,
          geminiModel,
          shopeeAppId,
          shopeeSecretKey: shopeeSecret,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Lỗi khi lưu settings:', err);
    }
  }

  async function testGemini() {
    setTesting('gemini');
    try {
      // Lưu tạm trước khi test hoặc gửi kèm key trong body nếu backend hỗ trợ
      // Ở đây ta cứ lưu luôn cho chắc ăn và đồng bộ
      await handleSave();

      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: 'Test Product',
          price: 100000,
          discountedPrice: 80000,
          commissionRate: 10,
          platform: 'facebook',
          tone: 'engaging',
          affiliateLink: 'https://shope.ee/test',
          count: 1,
        }),
      });
      setTestResult((prev) => ({ ...prev, gemini: res.ok ? 'ok' : 'fail' }));
    } catch {
      setTestResult((prev) => ({ ...prev, gemini: 'fail' }));
    } finally {
      setTesting(null);
    }
  }

  async function testShopee() {
    setTesting('shopee');
    try {
      const res = await fetch('/api/products?source=shopee&limit=1');
      setTestResult((prev) => ({ ...prev, shopee: res.ok ? 'ok' : 'fail' }));
    } catch {
      setTestResult((prev) => ({ ...prev, shopee: 'fail' }));
    } finally {
      setTesting(null);
    }
  }

  return (
    <>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>⚙️ Cài đặt</h1>
          <p className='page-subtitle'>Cấu hình API keys, model AI và kết nối dịch vụ</p>
        </div>
        <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`} onClick={handleSave}>
          {saved ? '✅ Đã lưu!' : '💾 Lưu thay đổi'}
        </button>
      </div>

      {/* Status Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {[
          {
            label: 'Gemini AI',
            status: testResult.gemini,
            icon: '🤖',
            action: testGemini,
            key: 'gemini',
          },
          {
            label: 'Shopee API',
            status: testResult.shopee,
            icon: '🛒',
            action: testShopee,
            key: 'shopee',
          },
          { label: 'PostgreSQL', status: 'ok' as const, icon: '🗄️', action: null, key: 'db' },
        ].map((service) => (
          <div
            key={service.key}
            className='card'
            style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>{service.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{service.label}</div>
                <div style={{ fontSize: '11px' }}>
                  {service.status === 'ok' ? (
                    <span style={{ color: 'var(--green)' }}>● Kết nối thành công</span>
                  ) : service.status === 'fail' ? (
                    <span style={{ color: 'var(--red)' }}>● Lỗi kết nối</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>● Chưa test</span>
                  )}
                </div>
              </div>
            </div>
            {service.action && (
              <button
                className='btn btn-sm btn-secondary'
                onClick={service.action}
                disabled={testing === service.key}
              >
                {testing === service.key ? '⏳' : '🧪 Test'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Gemini AI */}
      <SettingSection
        title='Gemini AI'
        icon='🤖'
        description='Cấu hình Google Gemini API để tạo nội dung affiliate tự động'
      >
        <SettingRow
          label='Gemini API Key'
          hint="Lấy miễn phí tại ai.google.dev — chọn 'Get API key'"
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type={showGeminiKey ? 'text' : 'password'}
              className='input'
              style={{ width: '280px' }}
              placeholder='AIza...'
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
            <button
              className='btn btn-ghost btn-icon btn-sm'
              onClick={() => setShowGeminiKey(!showGeminiKey)}
            >
              {showGeminiKey ? '🙈' : '👁️'}
            </button>
          </div>
        </SettingRow>

        <SettingRow label='Model AI' hint='Flash: nhanh, rẻ hơn. Pro: chất lượng cao hơn.'>
          <select
            className='input select'
            style={{ width: '220px' }}
            value={geminiModel}
            onChange={(e) => setGeminiModel(e.target.value)}
          >
            <option value='gemini-2.5-flash'>gemini-2.5-flash (Khuyên dùng - Cân bằng nhất)</option>
            <option value='gemini-2.5-pro'>gemini-2.5-pro (Mạnh mẽ, cho task khó)</option>
            <option value='gemini-3.1-pro-preview'>
              gemini-3.1-pro-preview (Tiên tiến nhất - Preview)
            </option>
            <option value='gemini-3.1-flash-lite-preview'>
              gemini-3.1-flash-lite-preview (Siêu nhanh)
            </option>
            <option value='gemini-1.5-flash'>gemini-1.5-flash (Legacy)</option>
          </select>
        </SettingRow>

        <div style={{ paddingTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className='btn btn-secondary btn-sm'
            onClick={testGemini}
            disabled={testing === 'gemini'}
          >
            {testing === 'gemini' ? '⏳ Đang test...' : '🧪 Test kết nối Gemini'}
          </button>
          {testResult.gemini === 'ok' && (
            <span style={{ color: 'var(--green)', fontSize: '13px' }}>✅ Kết nối thành công!</span>
          )}
          {testResult.gemini === 'fail' && (
            <span style={{ color: 'var(--red)', fontSize: '13px' }}>
              ❌ Lỗi — Kiểm tra API key trong .env
            </span>
          )}
        </div>
      </SettingSection>

      {/* Shopee Affiliate */}
      <SettingSection
        title='Shopee Affiliate API'
        icon='🛒'
        description='Kết nối Shopee Partner Program để tạo link affiliate thật và xem data sản phẩm thực tế'
      >
        <SettingRow label='App ID' hint='Lấy tại affiliate.shopee.vn → Apps → Create App'>
          <input
            type='text'
            className='input'
            style={{ width: '280px' }}
            placeholder='1234567890'
            value={shopeeAppId}
            onChange={(e) => setShopeeAppId(e.target.value)}
          />
        </SettingRow>

        <SettingRow label='Secret Key' hint='App Secret từ Shopee Partner Portal'>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type={showShopeeSecret ? 'text' : 'password'}
              className='input'
              style={{ width: '280px' }}
              placeholder='xxxxxxxxxxxxxxxx'
              value={shopeeSecret}
              onChange={(e) => setShopeeSecret(e.target.value)}
            />
            <button
              className='btn btn-ghost btn-icon btn-sm'
              onClick={() => setShowShopeeSecret(!showShopeeSecret)}
            >
              {showShopeeSecret ? '🙈' : '👁️'}
            </button>
          </div>
        </SettingRow>

        <div style={{ paddingTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className='btn btn-secondary btn-sm'
            onClick={testShopee}
            disabled={testing === 'shopee'}
          >
            {testing === 'shopee' ? '⏳ Đang test...' : '🧪 Test kết nối'}
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Nếu chưa có API, mock data sẽ được dùng tự động
          </span>
        </div>
      </SettingSection>

      {/* Database */}
      <SettingSection title='Database' icon='🗄️' description='PostgreSQL chạy qua Docker Compose'>
        <SettingRow label='Connection' hint='Cấu hình trong .env → DATABASE_URL'>
          <code
            style={{
              fontSize: '12px',
              color: 'var(--orange)',
              background: 'var(--orange-glow)',
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            localhost:8020/affiliate_db
          </code>
        </SettingRow>
        <SettingRow label='pgAdmin UI' hint='Quản lý DB trực quan'>
          <a
            href='http://localhost:8021'
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-sm btn-secondary'
          >
            🔗 Mở pgAdmin →
          </a>
        </SettingRow>
        <SettingRow label='Prisma Studio' hint='GUI editor cho database'>
          <code
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            npm run db:studio
          </code>
        </SettingRow>
      </SettingSection>

      {/* .env Guide */}
      <div
        className='card'
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(124,58,237,0.08))',
          border: '1px solid rgba(255,107,53,0.2)',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
          📝 File .env của bạn
        </h3>
        <pre
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-primary)',
            padding: '16px',
            borderRadius: '10px',
            overflow: 'auto',
            lineHeight: '1.8',
          }}
        >
          {`DATABASE_URL="postgresql://affiliate_user:affiliate_pass_2024@localhost:8020/affiliate_db"
GEMINI_API_KEY="your-key-here"          # 👈 Cần điền
GEMINI_MODEL="gemini-1.5-flash"
SHOPEE_APP_ID=""                        # Optional
SHOPEE_SECRET_KEY=""                    # Optional
NEXTAUTH_SECRET="change-in-production"
NEXTAUTH_URL="http://localhost:3000"`}
        </pre>
      </div>
    </>
  );
}
