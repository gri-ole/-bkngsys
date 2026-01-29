/**
 * Layout для страницы записи клиентов
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pierakstīties Online | Записаться Онлайн - ColorLAB',
  description: 'Pierakstieties skaistuma pakalpojumiem tiešsaistē. Ātri, ērti un vienkārši! | Запишитесь на услуги красоты онлайн. Быстро, удобно и просто!',
  keywords: [
    'pieraksts online',
    'skaistuma salons',
    'онлайн запись',
    'салон красоты',
    'matu griezums',
    'manikīrs',
    'pedikīrs',
    'стрижка',
    'ColorLAB',
    'Latvia',
    'Rīga',
  ],
  openGraph: {
    title: 'Pierakstīties Online - ColorLAB Skaistuma Salons',
    description: 'Pierakstieties skaistuma pakalpojumiem tiešsaistē ātri un ērti!',
    type: 'website',
  },
  robots: {
    index: true, // Эту страницу можно индексировать
    follow: true,
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
