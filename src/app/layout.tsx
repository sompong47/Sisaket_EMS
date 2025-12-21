import './globals.css';
import '@/styles/layout.css';
import { Prompt } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import LayoutWrapper from '@/components/layout/LayoutWrapper'; // ✅ เรียกใช้ตัวที่เราเพิ่งสร้าง

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Sisaket EMS',
  description: 'ระบบบริหารจัดการศูนย์พักพิงจังหวัดศรีสะเกษ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={prompt.className}>
        <ThemeProvider>
          {/* ✅ ส่งต่อให้ LayoutWrapper จัดการเรื่อง Sidebar/Footer */}
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}