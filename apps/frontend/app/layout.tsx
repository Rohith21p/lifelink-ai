import './globals.css';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="Unls7d0aCwztfT0OAQduqqQi2JwHaGGcxaSUDNHi3Zc"
        />
        <title>LifeLink AI</title>
        <meta
          name="description"
          content="Smart patient, donor, and hospital workflow system"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
