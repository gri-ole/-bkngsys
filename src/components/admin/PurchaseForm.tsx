/**
 * Форма добавления/редактирования закупки
 */

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePurchaseCategories } from '@/hooks/usePurchaseCategories';
import { Purchase, CreatePurchaseData } from '@/models/Purchase';

interface PurchaseFormProps {
  purchase?: Purchase | null;
  onSubmit: (data: CreatePurchaseData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PurchaseForm({ purchase, onSubmit, onCancel, loading }: PurchaseFormProps) {
  const { language } = useTranslation();
  const { categories } = usePurchaseCategories();
  
  const [formData, setFormData] = useState({
    categoryId: purchase?.categoryId || '',
    name: purchase?.name || '',
    amount: purchase?.amount || '',
    date: purchase?.date || new Date().toISOString().split('T')[0],
    description: purchase?.description || '',
    supplier: purchase?.supplier || '',
  });
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (purchase) {
      setFormData({
        categoryId: purchase.categoryId,
        name: purchase.name,
        amount: purchase.amount || '',
        date: purchase.date,
        description: purchase.description || '',
        supplier: purchase.supplier || '',
      });
    }
  }, [purchase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация
    if (!formData.categoryId) {
      setError(language === 'ru' ? 'Выберите категорию' : 'Izvēlieties kategoriju');
      return;
    }
    if (!formData.name.trim()) {
      setError(language === 'ru' ? 'Введите название закупки' : 'Ievadiet pirkuma nosaukumu');
      return;
    }
    const amount = parseFloat(String(formData.amount));
    if (isNaN(amount) || amount <= 0) {
      setError(language === 'ru' ? 'Сумма должна быть больше 0' : 'Summai jābūt lielākai par 0');
      return;
    }
    if (!formData.date) {
      setError(language === 'ru' ? 'Выберите дату' : 'Izvēlieties datumu');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        amount: amount,
      });
    } catch (err) {
      setError(language === 'ru' ? 'Ошибка при сохранении' : 'Kļūda saglabājot');
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    return language === 'ru' ? category.nameRu : category.nameLv;
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && (
        <div className="error-message" style={{ margin: 0 }}>
          {error}
        </div>
      )}

      {/* Категория */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
          {language === 'ru' ? 'Категория' : 'Kategorija'} <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <select
          className="form-input"
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          required
          disabled={loading}
          style={{ width: '100%' }}
        >
          <option value="">
            {language === 'ru' ? '-- Выберите категорию --' : '-- Izvēlieties kategoriju --'}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {language === 'ru' ? category.nameRu : category.nameLv}
              {category.description && ` (${category.description})`}
            </option>
          ))}
        </select>
      </div>

      {/* Название */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
          {language === 'ru' ? 'Название закупки' : 'Pirkuma nosaukums'} <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={language === 'ru' ? 'Например: Краска L\'Oreal' : 'Piemēram: Krāsa L\'Oreal'}
          required
          disabled={loading}
        />
      </div>

      {/* Сумма и Дата в одной строке */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
            {language === 'ru' ? 'Сумма (€)' : 'Summa (€)'} <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder={language === 'ru' ? 'Введите сумму' : 'Ievadiet summu'}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
            {language === 'ru' ? 'Дата' : 'Datums'} <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="date"
            className="form-input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Поставщик */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
          {language === 'ru' ? 'Поставщик' : 'Piegādātājs'}
        </label>
        <input
          type="text"
          className="form-input"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          placeholder={language === 'ru' ? 'Название магазина или поставщика' : 'Veikala vai piegādātāja nosaukums'}
          disabled={loading}
        />
      </div>

      {/* Описание */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
          {language === 'ru' ? 'Описание/комментарий' : 'Apraksts/komentārs'}
        </label>
        <textarea
          className="form-input"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={language === 'ru' ? 'Дополнительная информация о закупке' : 'Papildu informācija par pirkumu'}
          rows={3}
          disabled={loading}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Кнопки */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {purchase
            ? (language === 'ru' ? 'Сохранить' : 'Saglabāt')
            : (language === 'ru' ? 'Добавить закупку' : 'Pievienot pirkumu')
          }
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          {language === 'ru' ? 'Отмена' : 'Atcelt'}
        </button>
      </div>
    </form>
  );
}
