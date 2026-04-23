'use client';

export default function GuidePage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px', color: '#f1f5f9' }}>
      <header style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#fff', marginBottom: '16px' }}>
          📘 Hướng dẫn sử dụng FB Expert Studio
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '18px' }}>Quy trình 3 bước để tạo nội dung Affiliate nghìn đơn</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* Step 1 */}
        <section style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#3b82f6', marginBottom: '16px' }}>1. Tạo nội dung chuyên gia</h2>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Vào mục <b>Chuyên gia Facebook</b>, nhập tên sản phẩm và dán link Affiliate của bạn (Shopee, Lazada, TikTok...). 
            Thêm một vài thông tin bổ sung nếu cần để AI hiểu sâu về sản phẩm hơn. Bấm "Tạo nội dung" và đợi 10-15s.
          </p>
        </section>

        {/* Step 2 */}
        <section style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#c084fc', marginBottom: '16px' }}>2. Quản lý & Tối ưu bài viết</h2>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Hệ thống sẽ trả về 2 phiên bản (Ngắn & Dài), cùng danh sách Hooks và Seeding. 
            Bạn có thể xem lại tất cả bài đã tạo trong mục <b>Quản lý bài viết FB</b>. Mọi dữ liệu đã được lưu trữ an toàn.
          </p>
        </section>

        {/* Step 3 */}
        <section style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#10b981', marginBottom: '16px' }}>3. Khai thác Kho Affiliate Links</h2>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
            Tất cả các link bạn từng dùng sẽ được tổng hợp tại mục <b>Affiliate Links</b>. 
            Tại đây, bạn có thể nhanh chóng tìm lại link của sản phẩm cũ để copy và dán vào các bình luận dạo hoặc chia sẻ nhanh mà không cần tạo lại bài mới.
          </p>
        </section>

        {/* Tip */}
        <div style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
          <h4 style={{ color: '#3b82f6', marginBottom: '8px' }}>💡 Mẹo nhỏ:</h4>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Sử dụng công cụ <b>Log Hệ Thống (AI)</b> nếu bạn cảm thấy AI đang trả về kết quả không như ý hoặc muốn kiểm tra kỹ thuật.
          </p>
        </div>
      </div>
    </div>
  );
}
