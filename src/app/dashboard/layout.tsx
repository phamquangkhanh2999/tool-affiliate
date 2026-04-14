import { Sidebar } from '@/components/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Shopee Affiliate AI',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
