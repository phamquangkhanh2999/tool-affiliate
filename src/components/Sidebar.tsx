'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const SECTIONS = [
  {
    label: 'Điều hướng',
    items: [
      { href: '/dashboard', icon: '⚡', label: 'Bảng điều khiển' },
    ],
  },
  {
    label: 'Xưởng nội dung AI',
    items: [
      { href: '/dashboard/facebook-expert', icon: '📘', label: 'Chuyên gia Facebook' },
      { href: '/dashboard/facebook-connect', icon: '🔌', label: 'Kết nối Facebook' },
      { href: '/dashboard/tiktok-expert', icon: '🎵', label: 'Chuyên gia TikTok' },
      { href: '/dashboard/youtube-expert', icon: '🎬', label: 'Chuyên gia YouTube' },
    ],
  },
  {
    label: 'Công cụ & Tiện ích',
    items: [
      { href: '/dashboard/utm-builder', icon: '🔗', label: 'Tạo link UTM' },
      { href: '/dashboard/templates', icon: '📋', label: 'Mẫu nội dung' },
      { href: '/dashboard/bulk-generate', icon: '📦', label: 'Tạo hàng loạt' },
    ],
  },
  {
    label: 'Kho lưu trữ',
    items: [
      { href: '/dashboard/facebook-expert/history', icon: '🏛️', label: 'Lịch sử Facebook' },
      { href: '/dashboard/tiktok-expert/history', icon: '🎵', label: 'Lịch sử TikTok' },
      { href: '/dashboard/youtube-expert/history', icon: '🎬', label: 'Lịch sử YouTube' },
      { href: '/dashboard/links', icon: '🔗', label: 'Kho Affiliate Links' },
      { href: '/dashboard/debug-logs', icon: '📟', label: 'Nhật ký hệ thống' },
    ],
  },
  {
    label: 'Tài nguyên',
    items: [
      { href: '/dashboard/guide', icon: '📖', label: 'Hướng dẫn sử dụng' },
      { href: '/api-docs', icon: '⚙️', label: 'Tài liệu API' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Mobile Header (Floating) */}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '70px', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Image src="/logo.png" alt="Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
             <span style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '0.1em' }}>STUDIO</span>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>{isOpen ? '✕' : '☰'}</button>
        </div>
      )}

      <aside
        style={{
          width: '280px',
          background: 'rgba(2, 6, 23, 0.9)',
          backdropFilter: 'blur(30px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.03)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 95,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: '40px 0 100px rgba(0,0,0,0.5)',
        }}
      >
        {/* Brand Identity */}
        <div style={{ padding: '50px 30px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(to right, transparent, rgba(34, 211, 238, 0.2), transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #22d3ee, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' }}>
               <div style={{ background: '#020617', width: '100%', height: '100%', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Image src="/logo.png" alt="Logo" width={40} height={40} />
               </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff', letterSpacing: '0.15em', fontFamily: 'Space Grotesk' }}>EXPERT</div>
              <div style={{ fontSize: '10px', color: '#22d3ee', fontWeight: '800', opacity: 0.8 }}>MULTI-PLATFORM</div>
            </div>
          </div>
        </div>

        {/* Neural Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>
          {SECTIONS.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '14px', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <span>{section.label}</span>
                 <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.03)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => isMobile && setIsOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 15px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: isActive ? '#fff' : '#94a3b8',
                        background: isActive ? 'rgba(34, 211, 238, 0.05)' : 'transparent',
                        border: isActive ? '1px solid rgba(34, 211, 238, 0.1)' : '1px solid transparent',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <span style={{ fontSize: '16px', filter: isActive ? 'drop-shadow(0 0 8px #22d3ee)' : 'none' }}>{item.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500', letterSpacing: '0.02em' }}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System Vitals Footer */}
        <div style={{ padding: '20px 30px' }}>
          <div style={{ padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee' }} />
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#fff' }}>SYSTEM ONLINE</span>
             </div>
             <div style={{ fontSize: '9px', color: '#475569', fontWeight: '600' }}>MULTI-PLATFORM ENGINE V4.0</div>
          </div>
        </div>
      </aside>
    </>
  );
}
