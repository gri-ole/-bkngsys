/**
 * Форма для смены пароля
 */

'use client';

import { useState, FormEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PasswordChangeForm() {
  const { t, language } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Валидация
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(language === 'ru' ? 'Заполните все поля' : 'Aizpildiet visus laukus');
      return;
    }

    if (newPassword.length < 6) {
      setError(language === 'ru' ? 'Новый пароль должен быть не менее 6 символов' : 'Jaunajai parolei jābūt vismaz 6 simboliem');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(language === 'ru' ? 'Пароли не совпадают' : 'Paroles nesakrīt');
      return;
    }

    setLoading(true);

    try {
      // Отправляем запрос на смену пароля
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (language === 'ru' ? 'Ошибка при смене пароля' : 'Kļūda, mainot paroli'));
        return;
      }

      // Успешная смена пароля
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Скрываем сообщение об успехе через 5 секунд
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(language === 'ru' ? 'Ошибка при смене пароля' : 'Kļūda, mainot paroli');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>
        {language === 'ru' ? 'Смена пароля' : 'Paroles maiņa'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword" className="form-label">
            {language === 'ru' ? 'Текущий пароль' : 'Pašreizējā parole'} *
          </label>
          <input
            type="password"
            id="currentPassword"
            className="form-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword" className="form-label">
            {language === 'ru' ? 'Новый пароль' : 'Jaunā parole'} *
          </label>
          <input
            type="password"
            id="newPassword"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
            autoComplete="new-password"
          />
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {language === 'ru' ? 'Минимум 6 символов' : 'Vismaz 6 simboli'}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            {language === 'ru' ? 'Подтвердите новый пароль' : 'Apstipriniet jauno paroli'} *
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" style={{ marginBottom: '16px' }}>
            {language === 'ru' ? 'Пароль успешно изменен' : 'Parole veiksmīgi nomainīta'}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading 
              ? (language === 'ru' ? 'Сохранение...' : 'Saglabā...')
              : (language === 'ru' ? 'Изменить пароль' : 'Mainīt paroli')
            }
          </button>
        </div>
      </form>
    </div>
  );
}
