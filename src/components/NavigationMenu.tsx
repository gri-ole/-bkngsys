/**
 * Компонент навигационного меню с гамбургером
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function NavigationMenu() {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Блокируем скролл при открытом меню
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Закрываем меню при изменении страницы
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Проверяем аутентификацию
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const data = await response.json();
          setAuthenticated(data.authenticated);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setAuthenticated(false);
      setIsOpen(false);
      router.refresh();
      if (pathname?.startsWith('/admin')) {
        router.push('/admin');
      }
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      href: '/admin/settings',
      label: language === 'ru' ? 'Настройки' : 'Iestatījumi',
      icon: '⚙️',
      requireAuth: true,
    },
  ];

  const handleAddRecord = () => {
    setIsOpen(false);
    
    // Если уже на странице /admin, отправляем событие
    if (pathname === '/admin') {
      window.dispatchEvent(new CustomEvent('openAddForm'));
    } else {
      // Если на другой странице, сохраняем в sessionStorage и переходим
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('openAddForm', 'true');
      }
      router.push('/admin');
    }
  };

  // Показываем меню только для авторизованных пользователей
  if (!authenticated) {
    return null;
  }

  return (
    <>
      {/* Кнопка "Домой" - показывается везде кроме главной админ страницы */}
      {pathname !== '/admin' && pathname?.startsWith('/admin') && (
        <button
          onClick={() => router.push('/admin')}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 1001,
            width: '44px',
            height: '44px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            fontSize: '24px',
          }}
          aria-label={language === 'ru' ? 'На главную' : 'Uz sākumlapu'}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🏠
        </button>
      )}

      {/* Кнопка "Настройки" - показывается всегда для авторизованных */}
      <button
        onClick={() => router.push('/admin/settings')}
        style={{
          position: 'fixed',
          top: '16px',
          left: pathname !== '/admin' && pathname?.startsWith('/admin') ? '76px' : '16px', // Смещается в зависимости от наличия кнопки "Домой"
          zIndex: 1001,
          width: '44px',
          height: '44px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: pathname === '/admin/settings' ? '#eff6ff' : '#ffffff',
          border: pathname === '/admin/settings' ? '2px solid #2563eb' : '2px solid #e5e7eb',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          fontSize: '22px',
        }}
        aria-label={language === 'ru' ? 'Настройки' : 'Iestatījumi'}
        onMouseEnter={(e) => {
          if (pathname !== '/admin/settings') {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#d1d5db';
          }
        }}
        onMouseLeave={(e) => {
          if (pathname !== '/admin/settings') {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }
        }}
      >
        ⚙️
      </button>

      {/* Кнопка "Добавить запись" - показывается всегда для авторизованных */}
      <button
        onClick={handleAddRecord}
        style={{
          position: 'fixed',
          top: '16px',
          left: pathname !== '/admin' && pathname?.startsWith('/admin') ? '136px' : '76px', // Смещается в зависимости от наличия кнопки "Домой"
          zIndex: 1001,
          width: '44px',
          height: '44px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          fontSize: '24px',
        }}
        aria-label={language === 'ru' ? 'Добавить запись' : 'Pievienot ierakstu'}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        ➕
      </button>

      {/* Кнопка "Выйти" - в правом верхнем углу */}
      <button
        onClick={handleLogout}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 1001,
          width: '44px',
          height: '44px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          fontSize: '24px',
        }}
        aria-label={language === 'ru' ? 'Выйти' : 'Iziet'}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#fee2e2';
          e.currentTarget.style.borderColor = '#dc2626';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        🔓
      </button>
    </>
  );
}
