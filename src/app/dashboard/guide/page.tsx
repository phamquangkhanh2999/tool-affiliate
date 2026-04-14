import React from 'react';

export default function GuidePage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Hướng Dẫn Sử Dụng & Quy Trình 10-Step AI</h1>
          <p className="page-subtitle">Cẩm nang vận hành Shopee Affiliate AI SaaS</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Mục Đích Sử Dụng */}
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--primary)' }}>🎯 Mục Đích Của Phần Mềm Này Là Gì?</h2>
          <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            Hệ thống <b>Shopee Affiliate AI SaaS</b> ra đời nhằm giải quyết nỗi đau của Affiliate Creator: <i>Bí ý tưởng, không biết phân tích sản phẩm, và tốn quá nhiều thời gian viết góc quay (kịch bản).</i> 
            Phần mềm này đóng vai trò như một <b>Đội ngũ Marketing ảo</b>, giúp bạn tìm ra tử huyệt cảm xúc của người mua và tự động sinh ra hàng trăm nội dung bám sát tâm lý học để tối đa tỷ lệ chuyển đổi.
          </p>
        </div>

        {/* 10 Step Flow */}
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>🚀 Vòng Lặp Vận Hành 10 Bước (AI Flow)</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Cột 1: Research & AI */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>1️⃣ Lọc Tiềm Năng Sản Phẩm</span>
                  <span className="badge badge-purple">Research</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Vào <b>Tìm Sản Phẩm</b> (lưu về kho) ➜ Sang <b>Phân Tích AI</b>. Máy học sẽ trả về điểm tiềm năng viral và pain point mua hàng.
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>2️⃣ Định Hình Góc Nhìn (Content Angle)</span>
                  <span className="badge badge-purple">AI Content</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Tại <b>Chiến Lược Content</b>, AI sẽ xoáy vào Pain point bước 1 để sinh 10 góc làm video (Shock, Tò Mò, Giải Cứu, v.v).
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>3️⃣ Viết Kịch Bản 30 Giây & Hook</span>
                  <span className="badge badge-purple">AI Content</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                   Bê Angle sang <b>Kịch Bản Reels</b>. Tại đây AI cấp 5 mồi câu 3 giây đầu (Hook) cháy nhất. Và làm sẵn Timeline từng giây khi lên hình.
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>4️⃣ Tạo Caption Đi Kèm Mã Tracking</span>
                  <span className="badge badge-purple">AI Content</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                   Qua tab <b>Content & Caption</b>. Hệ thống sinh lời dẫn dụ khách hàng mượt mà có Call-to-action đính kèm Link Shortener Affiliate nội bộ.
                </p>
              </div>
            </div>

            {/* Cột 2: System & Optimize */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--orange)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>5️⃣ Gom Video Lên Lịch (7-Day Plan)</span>
                  <span className="badge badge-orange">System</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Ở mục <b>Lịch Content Tuần</b>, nhét đủ thứ bạn nghĩ ra vào. Thuật toán sẽ chia 2 video/ngày chuẩn chỉ theo nhịp điệu kích sales.
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--green)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>6️⃣ Bắt Mạch Video (Chuẩn Đoán Flop)</span>
                  <span className="badge badge-green">Optimize</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Đăng lên mà FLOP? Nhập view vào <b>Tối Ưu Hiệu Suất</b>. AI sẽ đấm thẳng vào sai lầm của bạn: Do hook chán? Hay do CTA chưa chạm?
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--green)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>7️⃣ Ép Khuôn Viral (Rewrite Script)</span>
                  <span className="badge badge-green">Optimize</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Khi nhận ra lỗi, ở bước 6 AI sẽ ngay lập tức viết lại một phiên bản Kịch bản mới tối tân hơn cởi trói nhược điểm của video cũ.
                </p>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(255,107,53,0.1))', padding: '16px', borderRadius: '12px', border: '1px solid rgba(124,58,237,0.3)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ∞ Bước 8, 9, 10: Vạn Vật Hoàn Lưu (Tương Lai)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Hệ thống đang trang bị Tracking Links nội bộ cùng Database. Trong bản Updates tới, hệ thống sẽ tự sinh API móc Auto-post lên nền tảng.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Mẹo Nhỏ */}
        <div style={{
          padding: '20px', background: 'var(--bg-secondary)', 
          borderLeft: '4px solid var(--green)', borderRadius: '12px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>💡 Lời Khuyên Dành Riêng Cho Bạn</h3>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <li><b>Không bỏ bước:</b> Bạn có thể nhảy luôn vào tạo Caption, nhưng nếu đi từ Analysis → Strategy → Script, Gemini sẽ học sâu về Pain Point sản phẩm khiến nội dung sắc bén gấp 5 lần.</li>
            <li><b>Chủ Động Lưu Database:</b> Máy AI hoạt động dựa trên Database Của Bạn. Dành ra mỗi tối nhặt 20 sản phẩm Hot trên Shopee ấn nút lưu vào hệ thống để AI có nguyên liệu xào nấu nhé.</li>
            <li><b>Trình Duyệt:</b> Hãy xài bộ UI Darkmode này trong lúc Stream Content hoặc Mở rộng 2 màn hình để quy trình copy-paste diễn ra mượt mà nhất.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
