/**
 * Компонент breadcrumbs (хлебные крошки) для навигации
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { language } = useTranslation();

  // Маппинг путей к названиям
  const pathNames: Record<string, { lv: string; ru: string }> = {
    '/admin': { lv: 'Sākums', ru: 'Главная' },
    '/admin/finances': { lv: 'Finanses', ru: 'Финансы' },
    '/admin/settings': { lv: 'Iestatījumi', ru: 'Настройки' },
    '/admin/statistics': { lv: 'Statistika', ru: 'Статистика' },
  };

  // Разбиваем путь на части
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  
  // Если на главной админ странице, не показываем breadcrumbs
  if (pathname === '/admin') {
    return null;
  }

  // Строим массив breadcrumbs
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    const label = pathNames[path] 
      ? (language === 'ru' ? pathNames[path].ru : pathNames[path].lv)
      : segment;

    return {
      path,
      label,
      isLast,
    };
  });

  return (
    <nav 
      aria-label="Breadcrumb"
      style={{
        marginBottom: '24px',
        fontSize: '14px',
      }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {breadcrumbs.map((crumb, index) => (
          <li
            key={crumb.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {index > 0 && (
              <span style={{ color: '#9ca3af' }}>/</span>
            )}
            {crumb.isLast ? (
              <span
                style={{
                  color: '#374151',
                  fontWeight: '600',
                }}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1e40af';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
