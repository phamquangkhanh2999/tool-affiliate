'use client';

export default function GuidePage() {
  const sectionStyle: React.CSSProperties = { background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' };
  const tipStyle: React.CSSProperties = { padding: '20px 24px', background: 'rgba(59,130,246,0.08)', borderRadius: '14px', borderLeft: '4px solid #3b82f6', marginTop: '16px' };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', color: '#f1f5f9' }}>
      <header style={{ marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)', marginBottom: '20px' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#22d3ee', letterSpacing: '0.1em' }}>TÀI LIỆU HƯỚNG DẪN V4.0</span>
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#fff', marginBottom: '12px' }}>
          📘 Hướng dẫn sử dụng
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '18px' }}>
          Hệ thống tạo nội dung AI đa nền tảng — Facebook, TikTok, YouTube
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* ═══════════════════ FACEBOOK ═══════════════════ */}
        <div style={{ padding: '4px 16px', borderRadius: '10px', background: 'rgba(24,119,242,0.1)', border: '1px solid rgba(24,119,242,0.2)', alignSelf: 'flex-start' }}>
          <span style={{ fontSize: '13px', fontWeight: '900', color: '#1877F2' }}>📘 FACEBOOK</span>
        </div>

        <section style={sectionStyle}>
          <h2 style={{ color: '#1877F2', marginBottom: '16px' }}>1. Tạo nội dung Facebook chuyên gia</h2>
          <p style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
            Vào menu <b>Chuyên gia Facebook</b>, nhập tên sản phẩm và dán link Affiliate của bạn (Shopee, Lazada, TikTok Shop...).
            Thêm thông tin bổ sung (giá, ưu đãi, mô tả) để AI tạo nội dung chất lượng hơn.<br /><br />
            Nhấn <b>EXECUTE FORGE ⚡</b> và đợi 10-15 giây. Hệ thống sẽ trả về:
          </p>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px', lineHeight: '2', marginTop: '12px' }}>
            <li>📝 <b>Bài viết dài</b> — Nội dung đầy đủ kèm hashtags</li>
            <li>🎯 <b>Hooks</b> — 3 câu mở đầu gây tò mò</li>
            <li>💬 <b>Comment Seeding</b> — 3-5 bình luận mồi kèm link</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ color: '#1877F2', marginBottom: '16px' }}>2. Tự động đăng bài lên Facebook</h2>
          <p style={{ lineHeight: '1.8', color: '#cbd5e1', marginBottom: '20px' }}>
            Hệ thống hỗ trợ đăng bài trực tiếp lên Facebook Page và tự động comment seeding. Để sử dụng tính năng này, bạn cần lấy Page Access Token theo hướng dẫn dưới đây.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(24,119,242,0.1)' }}>
            <h4 style={{ color: '#1877F2', marginBottom: '16px', fontSize: '15px', fontWeight: '800' }}>🔑 Cách lấy Page Access Token (7 bước)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { n: '1', t: 'Tạo tài khoản Developer', d: 'Truy cập developers.facebook.com → Đăng nhập Facebook → Nhấn "Bắt đầu" nếu chưa có tài khoản Developer.' },
                { n: '2', t: 'Tạo Facebook App', d: 'My Apps → Create App → Chọn "Business" → Đặt tên (VD: Tool Affiliate Auto Post) → Create App → Xác nhận mật khẩu.' },
                { n: '3', t: 'Mở Graph API Explorer', d: 'Truy cập developers.facebook.com/tools/explorer → Chọn App vừa tạo ở dropdown "Facebook App" → Chọn "Get Page Access Token" ở dropdown "User or Page".' },
                { n: '4', t: '⭐ Thêm 3 quyền bắt buộc', d: 'Nhấn "Add a Permission" → Tìm và tick: pages_manage_posts (đăng bài), pages_manage_engagement (comment), pages_read_engagement (đọc tương tác).' },
                { n: '5', t: '✅ Tạo Token', d: 'Nhấn "Generate Access Token" (nút xanh) → Popup hiện ra → Tick chọn Page muốn kết nối → Done → OK → Copy token.' },
                { n: '6', t: 'Dán Token vào Tool', d: 'Vào trang "Kết nối Facebook" → Dán token → Nhấn "Kiểm tra" → Nhấn "Kết nối" bên cạnh Page. Khi thấy ✅ là thành công!' },
                { n: '7', t: '⚡ Gia hạn Token (60 ngày)', d: 'Token mặc định sống ~1-2 giờ! Vào Access Token Debugger → Dán token → Debug → "Extend Access Token" → Copy token mới (sống 60 ngày).' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, background: 'linear-gradient(135deg,#1877F2,#00C6FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: '#fff' }}>{s.n}</div>
                  <div>
                    <span style={{ fontWeight: '700', color: '#fff', fontSize: '14px' }}>{s.t}: </span>
                    <span style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>{s.d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={tipStyle}>
            <h4 style={{ color: '#3b82f6', marginBottom: '6px' }}>💡 Sau khi kết nối thành công:</h4>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>
              1. Vào <b>Chuyên gia Facebook</b> → Tạo nội dung AI<br />
              2. Kéo xuống phần <b>🚀 ĐĂNG LÊN FACEBOOK</b><br />
              3. Chọn Page, bật/tắt Auto-Comment, điều chỉnh delay<br />
              4. Nhấn <b>🚀 ĐĂNG BÀI + AUTO COMMENT</b>
            </p>
          </div>

          <div style={{ ...tipStyle, borderLeftColor: '#f59e0b', background: 'rgba(245,158,11,0.08)' }}>
            <h4 style={{ color: '#f59e0b', marginBottom: '6px' }}>⚠️ Lưu ý quan trọng:</h4>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>
              • Comment seeding tự động delay 30-120 giây giữa mỗi comment để tránh spam<br />
              • Không nên đăng quá 5 bình luận/bài<br />
              • App không cần review nếu bạn là Admin/Developer (chỉ dùng cho Page mình quản lý)<br />
              • Token dài hạn sống 60 ngày — nhớ gia hạn trước khi hết hạn<br />
              • Xem hướng dẫn chi tiết hơn tại trang <a href="/dashboard/facebook-connect" style={{ color: '#1877F2', fontWeight: '600' }}>Kết nối Facebook</a>
            </p>
          </div>
        </section>

        {/* ═══════════════════ TIKTOK ═══════════════════ */}
        <div style={{ padding: '4px 16px', borderRadius: '10px', background: 'rgba(255,0,80,0.1)', border: '1px solid rgba(255,0,80,0.2)', alignSelf: 'flex-start', marginTop: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: '900', color: '#ff0050' }}>🎵 TIKTOK</span>
        </div>

        <section style={sectionStyle}>
          <h2 style={{ color: '#ff0050', marginBottom: '16px' }}>3. Tạo script video TikTok</h2>
          <p style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
            Vào menu <b>Chuyên gia TikTok</b>, nhập sản phẩm + link affiliate (đặt ở bio TikTok). AI sẽ tạo:
          </p>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px', lineHeight: '2', marginTop: '12px' }}>
            <li>🎯 <b>Hook 3 giây đầu</b> — 3 câu mở đầu video gây chú ý</li>
            <li>📹 <b>Kịch bản 15s / 30s / 60s</b> — Chuyển tab để xem từng phiên bản</li>
            <li>🎶 <b>Gợi ý nhạc trending</b> — Nhạc nền phù hợp nội dung</li>
            <li>📝 <b>Caption + Hashtags</b> — Tối ưu cho thuật toán TikTok</li>
            <li>🎯 <b>CTA cuối video</b> — Hướng người xem vào link bio</li>
            <li>💬 <b>Comment seeding</b> — Bình luận kích tương tác</li>
          </ul>
          <div style={tipStyle}>
            <h4 style={{ color: '#3b82f6', marginBottom: '6px' }}>💡 Mẹo TikTok Affiliate:</h4>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>
              • TikTok không cho phép link trong caption → Đặt link ở bio profile<br />
              • Sử dụng format trending (POV, Before/After, Day-in-my-life) để tăng reach<br />
              • Đăng bài vào khung giờ vàng: 7-9h sáng, 12-15h chiều, 19-23h tối
            </p>
          </div>
        </section>

        {/* ═══════════════════ YOUTUBE ═══════════════════ */}
        <div style={{ padding: '4px 16px', borderRadius: '10px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', alignSelf: 'flex-start', marginTop: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: '900', color: '#FF0000' }}>🎬 YOUTUBE</span>
        </div>

        <section style={sectionStyle}>
          <h2 style={{ color: '#FF0000', marginBottom: '16px' }}>4. Tạo nội dung YouTube SEO</h2>
          <p style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
            Vào menu <b>Chuyên gia YouTube</b>, nhập sản phẩm + link affiliate. AI sẽ tạo nội dung chuyên nghiệp với 3 tab:
          </p>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px', lineHeight: '2', marginTop: '12px' }}>
            <li>📹 <b>Tab SCRIPT</b> — Hook 30s + Nội dung chính + CTA cuối</li>
            <li>🔍 <b>Tab SEO</b> — Description tối ưu SEO + 15-20 tags liên quan</li>
            <li>💬 <b>Tab ENGAGE</b> — Comment ghim kèm link + Bài Community tab</li>
            <li>🎯 <b>Tiêu đề</b> — 3-5 tiêu đề tối ưu CTR (click-through rate)</li>
            <li>🖼️ <b>Thumbnail text</b> — Gợi ý text ngắn cho ảnh thumbnail</li>
          </ul>
          <div style={tipStyle}>
            <h4 style={{ color: '#3b82f6', marginBottom: '6px' }}>💡 Mẹo YouTube Affiliate:</h4>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>
              • Đặt link affiliate ở 3 dòng đầu tiên của Description (trước nút "Xem thêm")<br />
              • Ghim comment chứa link để tăng visibility<br />
              • Đăng Community post trước/sau khi upload video để kéo lượt xem<br />
              • Đăng bài vào 14-16h chiều (Thứ 5, 6, 7) cho hiệu quả cao nhất
            </p>
          </div>
        </section>

        {/* ═══════════════════ TOOLS ═══════════════════ */}
        <div style={{ padding: '4px 16px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', alignSelf: 'flex-start', marginTop: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: '900', color: '#6366f1' }}>🔧 CÔNG CỤ</span>
        </div>

        <section style={sectionStyle}>
          <h2 style={{ color: '#6366f1', marginBottom: '16px' }}>5. Tạo link UTM theo dõi hiệu quả</h2>
          <p style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
            Vào <b>Tạo link UTM</b> → Nhập link affiliate gốc + tên chiến dịch. Chọn 1 trong 2 chế độ:
          </p>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px', lineHeight: '2', marginTop: '12px' }}>
            <li>🎯 <b>Từng Platform</b> — Chọn Facebook/TikTok/YouTube → Tạo 1 link UTM</li>
            <li>🌐 <b>Tất Cả Platforms</b> — Tạo UTM cho tất cả nền tảng cùng lúc</li>
          </ul>
          <p style={{ lineHeight: '1.8', color: '#cbd5e1', marginTop: '12px' }}>
            Link UTM giúp bạn biết chính xác bao nhiêu click/đơn hàng đến từ Facebook, bao nhiêu từ TikTok, bao nhiêu từ YouTube.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ color: '#a855f7', marginBottom: '16px' }}>6. Thư viện mẫu nội dung</h2>
          <p style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
            Vào <b>Mẫu nội dung</b> → Xem 12 template sẵn có cho cả 3 nền tảng. Mỗi template bao gồm:
          </p>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px', lineHeight: '2', marginTop: '12px' }}>
            <li>📝 <b>Preview text</b> — Xem trước nội dung mẫu</li>
            <li>🏷️ <b>Tone & Type</b> — Phong cách và loại bài viết</li>
            <li>🚀 <b>Dùng Template</b> — Nhấn để mở Studio tương ứng</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ color: '#f59e0b', marginBottom: '16px' }}>7. Tạo nội dung hàng loạt</h2>
          <p style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
            Vào <b>Tạo hàng loạt</b> → Thêm tối đa 10 sản phẩm (tên + link) → Chọn nền tảng (FB, TikTok, YouTube) → Nhấn Generate. AI sẽ tạo nội dung cho tất cả sản phẩm × tất cả nền tảng đã chọn.
          </p>
          <div style={{ ...tipStyle, borderLeftColor: '#f59e0b', background: 'rgba(245,158,11,0.08)' }}>
            <h4 style={{ color: '#f59e0b', marginBottom: '6px' }}>⚠️ Giới hạn:</h4>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              Tối đa 10 sản phẩm/lần để tránh quá tải API Gemini. Mỗi sản phẩm × mỗi nền tảng = 1 lần gọi API.
            </p>
          </div>
        </section>

        {/* ═══════════════════ ARCHIVE ═══════════════════ */}
        <div style={{ padding: '4px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', alignSelf: 'flex-start', marginTop: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: '900', color: '#10b981' }}>📚 LƯU TRỮ</span>
        </div>

        <section style={sectionStyle}>
          <h2 style={{ color: '#10b981', marginBottom: '16px' }}>8. Quản lý lịch sử & Kho link</h2>
          <p style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
            Tất cả nội dung bạn tạo đều được lưu tự động trong database. Truy cập:
          </p>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px', lineHeight: '2', marginTop: '12px' }}>
            <li>🏛️ <b>Lịch sử Facebook/TikTok/YouTube</b> — Xem lại tất cả nội dung đã tạo theo từng nền tảng</li>
            <li>🔗 <b>Kho Affiliate Links</b> — Tổng hợp tất cả link affiliate đã dùng, tìm kiếm và copy nhanh</li>
            <li>📟 <b>Nhật ký hệ thống</b> — Xem log chi tiết các lần gọi API, debug lỗi</li>
          </ul>
        </section>

        {/* Summary Tip */}
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(99,102,241,0.08))', borderRadius: '20px', border: '1px solid rgba(34,211,238,0.15)' }}>
          <h4 style={{ color: '#22d3ee', marginBottom: '12px', fontSize: '16px' }}>🚀 Quy trình làm việc khuyến nghị:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              '1️⃣  Kết nối Facebook Page (nếu muốn auto-post)',
              '2️⃣  Chọn Studio phù hợp (Facebook / TikTok / YouTube)',
              '3️⃣  Nhập sản phẩm + link affiliate → Tạo nội dung',
              '4️⃣  Copy nội dung hoặc đăng trực tiếp lên Facebook',
              '5️⃣  Dùng UTM Builder để tạo link tracking riêng cho từng kênh',
              '6️⃣  Xem lại lịch sử và quản lý kho link tại phần Lưu trữ',
            ].map((step, i) => (
              <div key={i} style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.8', paddingLeft: '8px' }}>{step}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
