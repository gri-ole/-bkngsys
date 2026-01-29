import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import NavigationMenu from '@/components/NavigationMenu';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ColorLAB';
const APP_DESCRIPTION = 'Profesionāla skaistuma salona vadības sistēma ar tiešsaistes pierakstu, finanšu uzskaiti un klientu pārvaldību | Профессиональная система управления салоном красоты с онлайн записью, финансовым учетом и управлением клиентами';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: `${APP_NAME} - Skaistuma Salona Vadība | Система управления салоном`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    'skaistuma salons',
    'pieraksts online',
    'salona vadība',
    'klientu pārvaldība',
    'finanšu uzskaite',
    'салон красоты',
    'онлайн запись',
    'управление салоном',
    'учет финансов',
    'CRM',
    'booking system',
    'Latvia',
    'Latvija',
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  manifest: '/manifest.json',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'lv_LV',
    alternateLocale: ['ru_RU'],
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://colorlab.lv',
    siteName: APP_NAME,
    title: `${APP_NAME} - Skaistuma Salona Vadība`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - Skaistuma salona vadības sistēma`,
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} - Skaistuma Salona Vadība`,
    description: APP_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@colorlab',
  },
  
  // Apple
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
    startupImage: [
      {
        url: '/apple-splash.png',
        media: '(device-width: 390px) and (device-height: 844px)',
      },
    ],
  },
  
  // Format Detection
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  
  // Robots
  robots: {
    index: false, // Не индексировать систему управления
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#2563eb' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lv" suppressHydrationWarning>
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        
        {/* MS Tiles */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect для производительности */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <NavigationMenu />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
