/**
 * Компонент формы входа в админку
 */

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginForm() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Загружаем сохраненный пароль при монтировании компонента
  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password');
    const savedRemember = localStorage.getItem('admin_remember') === 'true';
    if (savedPassword && savedRemember) {
      setPassword(savedPassword);
      setRememberPassword(true);
    }
  }, []); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || t('admin.login.error'));
      }

      // Сохраняем пароль если установлена галочка
      if (rememberPassword) {
        localStorage.setItem('admin_password', password);
        localStorage.setItem('admin_remember', 'true');
      } else {
        localStorage.removeItem('admin_password');
        localStorage.removeItem('admin_remember');
      }

      // Перенаправляем на админку с полной перезагрузкой страницы
      // Это необходимо для того, чтобы cookie установился и layout перепроверил аутентификацию
      window.location.href = '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.login.authError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="card">
          <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>
            {t('admin.login.title')}
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('admin.login.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                    fontSize: '20px',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                  disabled={loading}
                  aria-label={showPassword ? t('admin.login.hidePassword') : t('admin.login.showPassword')}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  disabled={loading}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  {t('admin.login.rememberPassword')}
                </span>
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? t('common.loading') : t('admin.login.login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}