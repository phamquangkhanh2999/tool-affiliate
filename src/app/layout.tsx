import type { Metadata } from "next";
import "@/app/globals.css";
import { validateEnv } from "@/lib/env-check";

// Run environment validation when the app starts
validateEnv();

export const metadata: Metadata = {
  title: "Shopee Affiliate AI | Tự động hóa kiếm tiền affiliate",
  description: "Tool AI tự động hóa affiliate Shopee: tìm sản phẩm hot, tạo nội dung, theo dõi doanh thu",
  keywords: ["shopee affiliate", "affiliate marketing", "ai content", "kiếm tiền online"],
};

import { ToastProvider } from "@/components/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

