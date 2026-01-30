/**
 * Layout для админки с проверкой аутентификации
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { useTranslation } from '@/hooks/useTranslation';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    
    // Слушаем события изменения фокуса окна для перепроверки аутентификации
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Слушаем события изменения фокуса окна для перепроверки аутентификации
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setAuthenticated(false);
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm />;
  }

  return (
    <>
      {children}
    </>
  );
}
