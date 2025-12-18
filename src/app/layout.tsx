import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sisaket EMS - ระบบจัดการศูนย์พักพิง',
  description: 'ระบบจัดการศูนย์พักพิงจังหวัดศรีสะเกษ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}