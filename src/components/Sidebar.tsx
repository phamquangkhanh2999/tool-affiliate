'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECTIONS = [
  {
    label: '🔍 Research',
    items: [
      { href: '/dashboard', icon: '📊', label: 'Dashboard' },
      { href: '/dashboard/products', icon: '🛍️', label: 'Sản phẩm', badge: 'HOT' },
      { href: '/dashboard/analyze', icon: '🔬', label: 'Phân tích AI', step: '1' },
      { href: '/dashboard/strategy', icon: '🧠', label: 'Content Strategy', step: '2' },
    ],
  },
  {
    label: '🎬 AI Content',
    items: [
      { href: '/dashboard/scripts', icon: '🎣', label: 'Hook & Script', step: '3' },
      { href: '/dashboard/facebook-expert', icon: '🚀', label: 'Chuyên gia Facebook', step: '4' },
      { href: '/dashboard/content', icon: '📝', label: 'Caption & Hashtag', step: '4' },
      { href: '/dashboard/planner', icon: '📅', label: '7-Day Planner', step: '5' },
    ],
  },
  {
    label: '📈 Optimize',
    items: [
      { href: '/dashboard/performance', icon: '📊', label: 'Performance AI', step: '6-7' },
      { href: '/dashboard/campaigns', icon: '🎯', label: 'Chiến dịch' },
      { href: '/dashboard/links', icon: '🔗', label: 'Affiliate Links' },
      { href: '/dashboard/analytics', icon: '📈', label: 'Analytics' },
    ],
  },
  {
    label: '⚙️ Quản Trị (CMS)',
    items: [
      { href: '/dashboard/cms/products', icon: '📦', label: 'Quản lý Sản phẩm' },
      { href: '/dashboard/cms/products/import', icon: '🚀', label: 'Nhập hàng AI (Bulk)' },
      { href: '/dashboard/cms/campaigns', icon: '📉', label: 'Quản lý Chiến dịch' },
    ],
  },
];

const settingItems = [
  { href: '/dashboard/guide', icon: '📖', label: 'Hướng dẫn SD' },
  { href: '/api-docs', icon: '📝', label: 'API Builder (Swagger)' },
  { href: '/dashboard/settings', icon: '⚙️', label: 'Cài đặt' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className='sidebar'>
      <div className='sidebar-header'>
        <Link href='/dashboard' className='sidebar-logo'>
          <div className='sidebar-logo-icon'>🛒</div>
          <div>
            <div className='sidebar-logo-text'>Affiliate AI</div>
            <div className='sidebar-logo-sub'>Shopee Automation</div>
          </div>
        </Link>
      </div>

      <nav className='sidebar-nav'>
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <span className='nav-section-label'>{section.label}</span>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              >
                <span className='nav-icon'>{item.icon}</span>
                {item.label}
                {'step' in item && item.step && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '9px',
                      fontWeight: '800',
                      color: 'var(--orange)',
                      background: 'var(--orange-glow)',
                      border: '1px solid rgba(255,107,53,0.3)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    S{item.step}
                  </span>
                )}
                {'badge' in item && item.badge && <span className='nav-badge'>{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}

        <span className='nav-section-label'>Hệ thống</span>
        {settingItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className='nav-icon'>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className='sidebar-footer'>
        <div
          style={{
            padding: '12px',
            background: 'var(--orange-glow)',
            borderRadius: '10px',
            border: '1px solid rgba(255,107,53,0.2)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '6px',
              fontWeight: '600',
            }}
          >
            🤖 AI AGENT LOOP
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'].map((s, i) => (
              <span
                key={s}
                style={{
                  fontSize: '9px',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: i < 5 ? 'rgba(16,185,129,0.2)' : 'rgba(255,107,53,0.2)',
                  color: i < 5 ? 'var(--green)' : 'var(--orange)',
                  fontWeight: '700',
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
            → Scale đến Step 10
          </div>
        </div>
      </div>
    </aside>
  );
}
