# 🛒 Shopee Affiliate AI SaaS

Chào mừng bạn đến với **Shopee Affiliate AI SaaS** – Nền tảng tự động hóa và tối ưu hóa chuyển đổi Affiliate Shopee sử dụng sức mạnh thực sự của Trí Tuệ Nhân Tạo (Gemini 1.5).

Hệ thống được thiết kế theo phễu tự động hóa (AI Agent Loop) 10 Bước chuẩn xác, hỗ trợ Creator từ khâu đánh giá tiềm năng sản phẩm cho đến tối ưu ngược lại khi video ra mắt.

---

## 🛠 Bộ Công Nghệ (Tech Stack)
- **Framework:** Next.js 15 (App Router - React 19)
- **Database:** PostgreSQL (Khởi tạo qua Docker local) + Prisma ORM
- **AI Engine:** Google Gemini 1.5 Flash (Sức mạnh suy luận & xử lý 10-Step Logic)
- **UI/UX:** Dark Theme Premium, Glassmorphism, CSS Modules thuần.
- **API Standard:** OpenAPI 3.0 với Swagger UI (có sẵn trên trang `http://localhost:3000/api-docs`).

---

## 🚀 10 Bước Làm Việc Thực Tế Với Hệ Thống (AI Flow)

Hệ thống cung cấp một luồng làm việc tuyến tính, giúp bạn **Sản xuất hàng trăm Affiliate content mỗi ngày với tỷ lệ chuyển đổi cao nhất**:

### 🔍 DÒNG CHẢY 1: TÌM & ĐÁNH GIÁ (RESEARCH)
**📍 Step 1: Product Analyzer (`/dashboard/analyze`)**
- Bỏ 1 sản phẩm vào, AI sẽ chấm điểm tiềm năng (Mức độ Viral, Nhu cầu thị trường, Độ cạnh tranh, Khả năng chuyển đổi).
- AI xác định **Nỗi Đau (Pain Point)** và **Điểm Nổi Bật (USP)** giúp bạn xoáy thẳng vào tử huyệt khách hàng.

**📍 Step 2: Content Strategy (`/dashboard/strategy`)**
- Với sản phẩm đủ điểm chuẩn, AI sẽ đề xuất **10 Angle (Góc máy/Nội dung)** bao gồm: Shock (Gây sốc), Curiosity (Tò mò), Problem-Solution, và Review. 
- Tìm ra góc "bắt Trend" nhất.

### 🎬 DÒNG CHẢY 2: SẢN XUẤT NỘI DUNG (AI CONTENT)
**📍 Step 3: Hook & Script Generator (`/dashboard/scripts`)**
- Sinh ra **5 Hooks < 10 từ**, đánh gục sự chú ý của người xem trong 3 giây đầu.
- Trả về kịch bản 30 giây bóc tách từng giây một: *Dây 0-5 làm gì, hiện text gì, lồng tiếng gì.* (Bao gồm luôn cả **Step 8: Video Gen Guideline** — Ánh sáng, góc máy).

**📍 Step 4: Caption & Hashtag (`/dashboard/content`)**
- Sinh tự động loạt Caption đa nền tảng (TikTok, FB, Insta) có nhúng Call-to-Action (CTA).
- Nặn ra 15 Hashtags dẫn đầu xu hướng ngách.

**📍 Step 5: 7-Day Content Plan (`/dashboard/planner`)**
- Nhận lịch ra video nguyên vòng tuần (chia 2 videos/ngày). 
- Thuật toán lên lịch: Thứ 2-3 dùng để Text-Angle, Thứ 4-5 tập trung khoét sâu, Thứ 6-7 lùa views kéo Sale.

### 📈 DÒNG CHẢY 3: TỐI ƯU VÀ THEO DÕI (OPTIMIZE)
**📍 Step 6 + Step 7: Performance & Auto-Optimization (`/dashboard/performance`)**
- *Tính năng đắt giá nhất*: Video bạn làm ra không có đơn? Nhập Views, Clicks, và Sales vào đây. 
- AI sẽ **Bắt Mạch** lỗi sai: Lỗi tại Hook? Nội dung quảng cáo lố? Hay CTA sai chỗ?
- Tự động rút ra **Pattern (Khuôn mẫu)** từ các video lên xu hướng, và tự động **Viết lại Script hoàn hảo hơn** cho lần quay tới.

**📍 Step 9: Nền Tảng (Core System)**
- Trang `/dashboard/links`: Tạo Shopee Custom Link chuẩn và Short Link Tracking tự động.
- Trang `/dashboard/campaigns`: Quản lý các nhóm chiến dịch Affiliate trên MXH.

**📍 Step 10: Auto Agent Loop (Tương lai)**
- Chu trình tự hoàn lưu từ tìm kiếm → sáng tạo → đo đạc → tự rút kinh nghiệm. (Tính năng Auto-Post sẽ được mở trong Phase 2 API).

---

## ⚙️ Hướng Dẫn Cài Đặt (Local Development)

### 1. Khởi động Database (Docker)
Cấu hình PostgreSQL chạy ngầm tại Port `8020`.
```bash
cd docker
docker-compose up -d
```

### 2. Thiết lập Môi trường (.env)
Khai báo tại root dự án file `.env`:
```env
DATABASE_URL="postgresql://affiliate_user:affiliate_pass_2024@localhost:8020/affiliate_db"
GEMINI_API_KEY="AIzaSy...YourKey"
SHOPEE_APP_ID="[Tùy chọn: Để rút gọn link]"
SHOPEE_SECRET_KEY="[Tùy chọn]"
```

### 3. Migration Prisma
Nạp Database Schema:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed # (Nếu có file seed)
```

### 4. Bật Server
```bash
npm run dev
```
Trang Web chạy tại: `http://localhost:3000/dashboard`
Tài liệu APIs (Swagger): `http://localhost:3000/api-docs`

---
*Phát triển và kiến trúc bởi Google AI Agent — Đóng gói tư duy Senior Fullstack + AI Blueprint System.*
