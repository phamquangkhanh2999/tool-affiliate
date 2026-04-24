# 🚀 Tool Affiliate - AI Powered Multi-Platform Marketing Suite

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Neural%20Engine-4285F4?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)

**Tool Affiliate** là hệ điều hành nội dung AI tối thượng, được thiết kế dành riêng cho Affiliate Marketer. Tự động hóa quy trình sáng tạo nội dung, tự động đăng bài, quản lý link liên kết và tối ưu hóa chiến dịch trên **3 nền tảng chính: Facebook, TikTok, YouTube**.

---

## ✨ Tính năng nổi bật

### ⚡ 1. Intelligence & Automation (MỚI)
- **Smart Product Scraper**: Tự động quét thông tin sản phẩm từ Shopee, Lazada, TikTok Shop... qua URL.
- **📅 Post Scheduling**: Lên lịch đăng bài tự động vào "giờ vàng" cho Facebook Feed.
- **🎬 Facebook Reels Publishing**: Đăng video Reels trực tiếp kèm auto-seeding bình luận.
- **🤖 Automation Engine**: Hệ thống xử lý hàng đợi đăng bài tự động qua Cron.

### 📘 2. Chuyên gia Facebook (AI Content + Auto-Post)
- **Tự động tạo nội dung**: Caption, bài review chuyên sâu, hooks gây tò mò.
- **🚀 Auto-Post lên Facebook Page**: Đăng bài trực tiếp qua Facebook Graph API.
- **💬 Auto-Comment Seeding**: Tự động comment 3-5 bình luận mồi (delay 30-120s chống spam).
- **Kết nối Facebook Page**: Quản lý token, kết nối/ngắt kết nối Page.

### 🎵 2. Chuyên gia TikTok
- **Script video 3 phiên bản**: 15 giây, 30 giây, 60 giây.
- **Hook 3 giây đầu**: 3 câu mở đầu gây chú ý ngay lập tức.
- **Gợi ý nhạc trending**: Nhạc nền phù hợp cho từng sản phẩm.
- **Caption + Hashtags**: Tối ưu cho thuật toán TikTok (#fyp #viral).
- **Comment seeding**: Bình luận kích tương tác.

### 🎬 3. Chuyên gia YouTube
- **Tiêu đề tối ưu CTR**: 3-5 tiêu đề A/B test.
- **Thumbnail text**: Gợi ý text ngắn cho ảnh bìa video.
- **Script video**: Hook 30s → Nội dung chính → CTA.
- **Description SEO**: Mô tả tối ưu kèm timestamps, link, keywords.
- **Tags**: 15-20 tags SEO liên quan.
- **Pinned comment**: Comment ghim kèm link affiliate.
- **Community post**: Bài đăng Community tab promote video.

### 🔗 4. UTM Link Builder
- **Tạo UTM theo platform**: Facebook, TikTok, YouTube, Zalo, Instagram.
- **Multi-platform mode**: Tạo UTM cho tất cả nền tảng cùng lúc.
- **Đo lường ROI**: Biết chính xác nguồn click từ nền tảng nào.

### 📋 5. Mẫu nội dung (Templates)
### 📋 6. Mẫu nội dung (Templates)
- **12 template sẵn có**: Review, Flash Sale, Unboxing, Tutorial, So sánh...
- **Phân loại theo platform**: Lọc Facebook / TikTok / YouTube.
- **Quick-use**: Nhấn "Dùng Template" để mở Studio tương ứng.

### 📦 7. Tạo hàng loạt (Bulk Generator)
- **Tối đa 10 sản phẩm/batch**: Nhập tên + link cho nhiều sản phẩm.
- **Đa nền tảng**: Chọn Facebook + TikTok + YouTube cùng lúc.
- **Kết quả tổng hợp**: Xem và copy từng nội dung theo platform.

### 🔗 8. Shopee & Affiliate Management
- **Smart Link Transformation**: Chuyển đổi link Shopee sang link Affiliate cá nhân hóa.
- **Link Repository**: Lưu trữ và quản lý tập trung toàn bộ kho link sản phẩm.

### 📊 9. Dashboard & Analytics
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
