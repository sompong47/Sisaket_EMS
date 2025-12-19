import './globals.css';
import '@/styles/layout.css'; // Import layout specific styles
import Sidebar from '@/components/layout/Sidebar';

export const metadata = {
  title: 'Sisaket EMS',
  description: 'Shelter Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}