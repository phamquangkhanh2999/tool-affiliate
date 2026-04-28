'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const steps = [
    { num: 1, title: 'Welcome', desc: 'Chào mừng bạn' },
    { num: 2, title: 'API Keys', desc: 'Kết nối hệ thống' },
    { num: 3, title: 'Facebook', desc: 'Kết nối Fanpage' },
    { num: 4, title: 'Hoàn tất', desc: 'Bắt đầu sử dụng' },
  ];

  const handleNext = () => setStep(s => Math.min(4, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      {/* Background Effect */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }} />

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', borderRadius: '32px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'row', position: 'relative', zIndex: 1 }}>
        
        {/* Left Sidebar - Progress */}
        <div style={{ width: '300px', background: 'rgba(2, 6, 23, 0.4)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
            <Image src="/logo.png" alt="Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
            <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '0.1em' }}>STUDIO</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {steps.map((s, idx) => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <div key={s.num} style={{ display: 'flex', gap: '16px', opacity: isActive || isPast ? 1 : 0.4, transition: 'all 0.3s' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isActive ? 'linear-gradient(135deg, #22d3ee, #6366f1)' : isPast ? '#22d3ee' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive || isPast ? '#000' : '#fff', fontWeight: '800', fontSize: '14px', boxShadow: isActive ? '0 0 15px rgba(34,211,238,0.5)' : 'none' }}>
                      {isPast ? '✓' : s.num}
                    </div>
                    {idx < steps.length - 1 && (
                      <div style={{ width: '2px', height: '40px', background: isPast ? '#22d3ee' : 'rgba(255,255,255,0.1)', marginTop: '8px' }} />
                    )}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{s.title}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, padding: '50px 60px', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
          <div style={{ flex: 1 }}>
            
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>
                <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '20px', lineHeight: '1.1' }}>
                  Chào mừng đến với <span style={{ color: '#22d3ee' }}>Studio</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                  Hệ điều hành nội dung Affiliate tự động hóa của bạn. Chúng tôi sẽ hướng dẫn bạn thiết lập các kết nối cơ bản để bắt đầu tối đa hóa doanh thu ngay hôm nay.
                </p>
                <div style={{ padding: '24px', background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', color: '#fff' }}>Bạn sẽ nhận được:</h3>
                  <ul style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '2', paddingLeft: '20px' }}>
                    <li>Tự động hóa đăng bài viết Facebook, TikTok</li>
                    <li>Sử dụng AI Gemini để viết Content chuyên gia</li>
                    <li>Quản lý toàn bộ chiến dịch Affiliate tập trung</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: API Keys */}
            {step === 2 && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px' }}>Thiết lập API Keys</h1>
                <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Bạn có thể điền thông tin này sau trong phần Cài đặt.</p>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Gemini API Key (Bắt buộc cho AI)</label>
                  <input type="password" placeholder="AIzaSy..." style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', outline: 'none' }} />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Shopee Affiliate App ID</label>
                  <input type="text" placeholder="12345678" style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', outline: 'none' }} />
                </div>
              </div>
            )}

            {/* Step 3: Facebook Connect */}
            {step === 3 && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px' }}>Kết nối Facebook Fanpage</h1>
                <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Cho phép hệ thống tự động đăng bài lên Fanpage của bạn.</p>
                
                <div style={{ padding: '40px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📘</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>Chưa có Fanpage nào được kết nối</h3>
                  <button className="btn-tech" style={{ padding: '10px 24px', fontSize: '14px' }}>Kết nối với Facebook</button>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '16px' }}>Bạn có thể thực hiện bước này sau.</p>
                </div>
              </div>
            )}

            {/* Step 4: Finish */}
            {step === 4 && (
              <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center', paddingTop: '40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                  <span style={{ fontSize: '40px' }}>🚀</span>
                </div>
                <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px' }}>Mọi thứ đã sẵn sàng!</h1>
                <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '400px', margin: '0 auto 40px' }}>
                  Hệ thống đã được thiết lập thành công. Hãy bắt đầu tạo chiến dịch Affiliate đầu tiên của bạn.
                </p>
              </div>
            )}

          </div>

          {/* Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              onClick={handlePrev}
              disabled={step === 1}
              style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: step === 1 ? '#475569' : '#fff', borderRadius: '12px', cursor: step === 1 ? 'not-allowed' : 'pointer', fontWeight: '600', transition: 'all 0.3s' }}
            >
              Quay lại
            </button>
            
            {step < steps.length ? (
              <button 
                onClick={handleNext}
                className="btn-tech"
              >
                Tiếp tục
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                disabled={loading}
                className="btn-tech"
                style={{ background: loading ? '#475569' : undefined }}
              >
                {loading ? 'Đang vào hệ thống...' : 'Đến Bảng điều khiển'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
