# 🚀 Tool Affiliate - AI Powered Multi-Platform Marketing Suite

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Neural%20Engine-4285F4?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)

**Tool Affiliate** là hệ điều hành nội dung AI tối thượng, được thiết kế dành riêng cho Affiliate Marketer. Tự động hóa quy trình sáng tạo nội dung, tự động đăng bài, quản lý link liên kết và tối ưu hóa chiến dịch.

---

## ✨ Tính năng nổi bật

### 🛡️ 1. Security & Stability (MỚI)
- **Rate Limiting (In-memory)**: Chống spam và brute-force các API quan trọng.
- **Secure Logging**: Tự động mã hóa (mask) API Key và dữ liệu nhạy cảm trước khi lưu log. Rotate log thông minh.
- **Environment Validation**: Hệ thống tự động kiểm tra biến môi trường khi startup.
- **Security Headers**: Hỗ trợ CSP, HSTS, X-Frame-Options chống XSS, Clickjacking.

### ⚡ 2. Intelligence & Automation
- **Smart Product Scraper**: Tự động quét thông tin sản phẩm từ Shopee, Lazada, TikTok Shop... qua URL.
- **📅 Content Calendar**: Quản lý lịch đăng bài đa nền tảng trực quan (Facebook, TikTok, Zalo).
- **🎬 Facebook Reels Publishing**: Đăng video Reels trực tiếp kèm auto-seeding bình luận.
- **🤖 Automation Engine**: Hệ thống xử lý hàng đợi đăng bài tự động qua Cron.

### 📘 3. Chuyên gia Nội dung Đa nền tảng (AI Content)
- **Facebook Expert**: Tạo caption đánh trúng nỗi đau, auto-comment seeding.
- **Instagram Expert**: Gợi ý Carousel Images (Aesthetic), phong cách Lifestyle, tối ưu hashtag.
- **Zalo Expert**: Tạo tin nhắn Broadcast (chốt sale) & bài đăng Nhật ký gần gũi.
- **TikTok Expert**: Lên kịch bản 15s/30s/60s, gợi ý hook và nhạc trending.
- **YouTube Expert**: Tạo kịch bản, description chuẩn SEO, tags, thumbnail text.
- **Email Campaign**: Viết Subject Line tối đa Open Rate và thiết kế HTML Body tăng CTR.

### 🔗 4. Affiliate Expert & Tooling
- **Shopee Affiliate API**: Tự động tìm kiếm sản phẩm hoa hồng cao, gen link affiliate qua HMAC-SHA256.
- **Multi-Platform Link Shortener**: Rút gọn link (có custom UTM), tạo mã QR code tự động.
- **UTM Link Builder**: Tạo UTM tracking đồng loạt cho nhiều nền tảng.
- **Mẫu nội dung (Templates)**: 12 template (Review, Unboxing...) + Bulk Generator tạo hàng loạt 10 sản phẩm/batch.

### 📊 5. Dashboard & Analytics
- **Phân tích Doanh thu**: Theo dõi tổng doanh thu, clicks, conversion và top sản phẩm hiệu quả.
- **Bảng điều khiển trực quan**: Giao diện hiện đại với hiệu ứng Glassmorphism.
- **System Diagnostics**: Kiểm tra trạng thái Database (Neon) và AI Engine thời gian thực.
- **Quick Access**: Truy cập nhanh tất cả Studios và công cụ.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS.
- **Backend**: Next.js Server Actions & API Routes.
- **Database**: PostgreSQL (Managed by [Neon](https://neon.tech/)), Prisma ORM.
- **AI**: Google Gemini AI (1.5 Flash / 2.0 Flash / 3.0 Flash).
- **Facebook API**: Facebook Graph API v21.0 (Auto-Post + Auto-Comment).
- **Auth**: NextAuth.js.
- **Documentation**: Swagger UI / OpenAPI 3.1.

---

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Node.js 18.x trở lên.
- PostgreSQL (Hoặc tài khoản Neon.tech).
- Google Gemini API Key.
- (Tùy chọn) Facebook App + Page Access Token.

### 2. Cài đặt các phụ thuộc
```bash
npm install
# hoặc
pnpm install
```

### 3. Cấu hình môi trường
Tạo file `.env` từ `.env.example` và điền đầy đủ các thông số:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-2.0-flash"
```

### 4. Thiết lập Database
```bash
npx prisma db push
npx prisma generate
```

### 5. Chạy dự án
```bash
npm run dev
```

Truy cập `http://localhost:3000` để bắt đầu.

---

## 📖 Cấu trúc dự án

```
src/
├── app/
│   ├── api/
│   │   ├── content/
│   │   │   ├── expert/         # Facebook Expert API
│   │   │   ├── tiktok-expert/  # TikTok Expert API
│   │   │   ├── youtube-expert/ # YouTube Expert API
│   │   │   └── bulk/           # Bulk Generate API
│   │   ├── facebook/
│   │   │   ├── publish/        # Auto-Post API
│   │   │   ├── pages/          # Pages Management API
│   │   │   └── token-check/    # Token Validation API
│   │   ├── utm/                # UTM Builder API
│   │   ├── affiliate/          # Shopee Affiliate API
│   │   └── links/              # Link Repository API
│   └── dashboard/
│       ├── facebook-expert/    # FB Studio + History
│       ├── facebook-connect/   # FB Page Connection
│       ├── tiktok-expert/      # TikTok Studio + History
│       ├── youtube-expert/     # YouTube Studio + History
│       ├── utm-builder/        # UTM Link Builder
│       ├── templates/          # Content Templates
│       ├── bulk-generate/      # Bulk Generator
│       ├── links/              # Affiliate Links
│       └── guide/              # User Guide
├── components/
│   └── Sidebar.tsx             # Multi-platform navigation
└── lib/
    ├── gemini.ts               # Gemini AI integration
    ├── facebook-api.ts         # Facebook Graph API
    ├── tiktok-prompts.ts       # TikTok prompt templates
    ├── youtube-prompts.ts      # YouTube prompt templates
    ├── utm-builder.ts          # UTM URL builder
    └── shopee-links.ts         # Shopee link management
```

---

## 📖 Tài liệu API
Hệ thống tích hợp sẵn Swagger UI để tra cứu API:
- Truy cập: `/api-docs`

---

## 🛡️ Bảo mật & Tối ưu
- **Token Security**: Access Token lưu trong Database, không hiển thị trên UI.
- **Anti-Spam**: Comment seeding có delay 30-120s, tối đa 5 comments/bài.
- **Responsive Design**: Tối ưu hóa trải nghiệm trên Mobile và Desktop.
- **Performance**: Sử dụng Next.js Streaming và Caching để đạt tốc độ phản hồi tối ưu.

---

*Phát triển bởi **Antigravity AI Team**.*
