import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'LifeLink AI',
  description: 'Smart patient, donor, and hospital workflow system',
  verification: {
    google: 'Unls7d0aCwztfT0OAQduqqQi2JwHaGGcxaSUDNHi3Zc',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
