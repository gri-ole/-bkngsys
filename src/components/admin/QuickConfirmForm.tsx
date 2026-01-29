/**
 * Быстрая форма подтверждения новых записей
 * Позволяет подтвердить/изменить дату, время, сумму и статус
 */

'use client';

import { useState, FormEvent } from 'react';
import { Record, UpdateRecordData, PaymentMethod } from '@/models/Record';
import { useTranslation } from '@/hooks/useTranslation';

interface QuickConfirmFormProps {
  record: Record;
  onConfirm: (data: UpdateRecordData) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function QuickConfirmForm({ record, onConfirm, onCancel, loading }: QuickConfirmFormProps) {
  const { t, language } = useTranslation();
  
  const [formData, setFormData] = useState({
    date: record.date || '',
    time: record.time || '',
    amount: record.amount || '',
    paymentMethod: (record.paymentMethod || '') as PaymentMethod,
    status: 'confirmed' as const,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Парсим amount перед отправкой
    const parsedAmount = formData.amount ? parseFloat(String(formData.amount)) : undefined;
    
    const updateData: UpdateRecordData = {
      id: record.id,
      clientName: record.clientName,
      phone: record.phone,
      socialMedia: record.socialMedia,
      service: record.service,
      date: formData.date,
      time: formData.time,
      comment: record.comment,
      status: formData.status,
      source: record.source,
      amount: parsedAmount,
      paymentMethod: formData.paymentMethod,
    };

    onConfirm(updateData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' 
        ? value // Сохраняем как строку для корректного ввода
        : (name === 'paymentMethod' ? value as PaymentMethod : value),
    }));
  };

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onCancel}
    >
      <div 
        className="card"
        style={{ 
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            ✅ {language === 'ru' ? 'Подтверждение записи' : 'Apstiprināt ierakstu'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              lineHeight: '1',
            }}
          >
            ×
          </button>
        </div>

        {/* Информация о клиенте */}
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            <strong>{language === 'ru' ? 'Клиент:' : 'Klients:'}</strong> {record.clientName}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            <strong>{language === 'ru' ? 'Телефон:' : 'Tālrunis:'}</strong> {record.phone}
          </div>
          {record.socialMedia && (
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              <strong>{language === 'ru' ? 'Соц. сеть:' : 'Soc. tīkls:'}</strong> {record.socialMedia}
            </div>
          )}
          {record.comment && (
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              <strong>{language === 'ru' ? 'Комментарий:' : 'Komentārs:'}</strong> {record.comment}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Дата */}
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              {language === 'ru' ? 'Дата' : 'Datums'} *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Время */}
          <div className="form-group">
            <label htmlFor="time" className="form-label">
              {language === 'ru' ? 'Время' : 'Laiks'} *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              className="form-input"
              value={formData.time}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Сумма */}
          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              {language === 'ru' ? 'Сумма (EUR)' : 'Summa (EUR)'} *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-input"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              disabled={loading}
              placeholder={language === 'ru' ? 'Введите сумму' : 'Ievadiet summu'}
            />
          </div>

          {/* Способ оплаты */}
          <div className="form-group">
            <label htmlFor="paymentMethod" className="form-label">
              {language === 'ru' ? 'Способ оплаты' : 'Maksājuma veids'}
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              className="form-select"
              value={formData.paymentMethod}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">{language === 'ru' ? 'Не указано' : 'Nav norādīts'}</option>
              <option value="cash">{language === 'ru' ? 'Наличные' : 'Skaidra nauda'}</option>
              <option value="card">{language === 'ru' ? 'Карта (в т.ч. онлайн)' : 'Karte (arī tiešsaiste)'}</option>
            </select>
          </div>

          {/* Статус */}
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              {language === 'ru' ? 'Статус' : 'Statuss'} *
            </label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="confirmed">{language === 'ru' ? 'Подтверждена' : 'Apstiprināts'}</option>
              <option value="cancelled">{language === 'ru' ? 'Отменена' : 'Atcelts'}</option>
            </select>
          </div>

          {/* Кнопки */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading 
                ? (language === 'ru' ? 'Сохранение...' : 'Saglabā...')
                : (language === 'ru' ? '✅ Подтвердить' : '✅ Apstiprināt')
              }
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {language === 'ru' ? 'Отмена' : 'Atcelt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
