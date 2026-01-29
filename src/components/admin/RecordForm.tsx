/**
 * Komponents ieraksta pievienošanai/rediģēšanai admin panelī
 */

'use client';

import { useState, FormEvent, useEffect, useMemo, useCallback } from 'react';
import { Record, CreateRecordData, UpdateRecordData, RecordStatus, PaymentMethod } from '@/models/Record';
import { useTranslation } from '@/hooks/useTranslation';
import { useServices } from '@/hooks/useServices';
import { getServices } from '@/utils/services';

interface RecordFormProps {
  record?: Record | null;
  onSubmit: (data: CreateRecordData | UpdateRecordData) => void;
  onCancel: () => void;
  loading: boolean;
}

// Дефолтные услуги для SSR
const DEFAULT_SERVICES_FOR_SSR = [
  { id: 'haircut', nameLv: 'Frizūra', nameRu: 'Стрижка' },
  { id: 'coloring', nameLv: 'Krāsošana', nameRu: 'Окрашивание' },
  { id: 'styling', nameLv: 'Sakārtošana', nameRu: 'Укладка' },
  { id: 'manicure', nameLv: 'Manikīrs', nameRu: 'Маникюр' },
  { id: 'pedicure', nameLv: 'Pedikīrs', nameRu: 'Педикюр' },
  { id: 'massage', nameLv: 'Masāža', nameRu: 'Массаж' },
  { id: 'cosmetology', nameLv: 'Kosmetoloģija', nameRu: 'Косметология' },
  { id: 'other', nameLv: 'Cits', nameRu: 'Другое' },
];

export default function RecordForm({ record, onSubmit, onCancel, loading }: RecordFormProps) {
  const { t, language } = useTranslation();
  const { services } = useServices();
  const [isMounted, setIsMounted] = useState(false);
  // Сохраняем исходное значение услуги из записи для отображения
  const [originalServiceValue, setOriginalServiceValue] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const SERVICES = useMemo(() => {
    // На сервере и до монтирования используем дефолтные услуги
    if (!isMounted) {
      return getServices(DEFAULT_SERVICES_FOR_SSR, language);
    }
    // Если услуги еще не загружены, используем дефолтные
    if (services.length === 0) {
      return getServices(DEFAULT_SERVICES_FOR_SSR, language);
    }
    return getServices(services, language);
  }, [services, language, isMounted]);

  // Функция для поиска ID услуги по названию (для обратной совместимости со старыми записями)
  const findServiceIdByName = useCallback((serviceName: string): string => {
    if (!serviceName) return '';
    
    // Сначала проверяем, может это уже ID
    const allServices = isMounted && services.length > 0 ? services : DEFAULT_SERVICES_FOR_SSR;
    if (allServices.some(s => s.id === serviceName)) {
      return serviceName;
    }
    
    // Ищем по переведенному названию
    const service = allServices.find(
      s => s.nameLv === serviceName || s.nameRu === serviceName
    );
    return service ? service.id : serviceName; // Возвращаем ID или исходное значение
  }, [services, isMounted]);

  const STATUS_OPTIONS: { value: RecordStatus; label: string }[] = useMemo(() => [
    { value: 'new', label: t('admin.records.status.new') },
    { value: 'confirmed', label: t('admin.records.status.confirmed') },
    { value: 'cancelled', label: t('admin.records.status.cancelled') },
  ], [t]);

  const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = useMemo(() => [
    { value: '', label: t('admin.records.paymentMethod.notSpecified') },
    { value: 'cash', label: t('admin.records.paymentMethod.cash') },
    { value: 'card', label: t('admin.records.paymentMethod.card') },
  ], [t]);

  const [formData, setFormData] = useState<CreateRecordData | UpdateRecordData>({
    clientName: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    comment: '',
    status: 'new',
    source: 'master',
    amount: undefined,
    paymentMethod: '',
    ...(record && { id: record.id }),
  });

  // Заполняем форму данными записи при редактировании
  useEffect(() => {
    if (record) {
      // Сохраняем исходное значение услуги из записи
      setOriginalServiceValue(record.service || '');
      
      // Преобразуем название услуги в ID, если нужно
      const serviceId = findServiceIdByName(record.service || '');
      
      setFormData({
        id: record.id,
        clientName: record.clientName || '',
        phone: record.phone || '',
        service: serviceId,
        date: record.date || '',
        time: record.time || '',
        comment: record.comment || '',
        status: record.status || 'new',
        source: record.source || 'master',
        amount: record.amount,
        paymentMethod: record.paymentMethod || '',
      });
    } else {
      // Сбрасываем форму при закрытии редактирования
      setOriginalServiceValue('');
      setFormData({
        clientName: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        comment: '',
        status: 'new',
        source: 'master',
        amount: undefined,
        paymentMethod: '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id, findServiceIdByName]); // Зависим только от ID, чтобы избежать лишних пересозданий формы

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="clientName" className="form-label">
          {t('admin.records.form.clientName')} *
        </label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          className="form-input"
          value={formData.clientName}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          {t('admin.records.form.phone')} *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="form-input"
          value={formData.phone}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="service" className="form-label">
          {t('admin.records.form.service')} *
        </label>
        <select
          id="service"
          name="service"
          className="form-select"
          value={formData.service || ''}
          onChange={handleChange}
          required
          disabled={loading}
        >
          <option value="">{t('admin.records.form.selectService')}</option>
          {SERVICES.map((service) => (
            <option key={service.key} value={service.key}>
              {service.label}
            </option>
          ))}
          {/* Показываем текущее значение, даже если его нет в списке (для старых данных или удаленных услуг) */}
          {formData.service && !SERVICES.some(s => s.key === formData.service) && (
            <option value={formData.service}>
              {originalServiceValue || formData.service}
            </option>
          )}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="date-time-grid">
        <div className="form-group">
          <label htmlFor="date" className="form-label">
            {t('admin.records.form.date')} *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-input"
            value={formData.date || ''}
            onChange={handleChange}
            min={today}
            max={maxDateStr}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="time" className="form-label">
            {t('admin.records.form.time')}
          </label>
          <select
            id="time"
            name="time"
            className="form-select"
            value={formData.time || ''}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">{language === 'ru' ? '-- Не указано --' : '-- Nav norādīts --'}</option>
            {Array.from({ length: 27 }, (_, i) => {
              const totalMinutes = 9 * 60 + i * 30; // Начинаем с 9:00, шаг 30 минут
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              if (hours > 22) return null; // Останавливаемся на 22:00
              const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              return (
                <option key={timeValue} value={timeValue}>
                  {timeValue}
                </option>
              );
            }).filter(Boolean)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="status" className="form-label">
          {t('admin.records.form.status')} *
        </label>
        <select
          id="status"
          name="status"
          className="form-select"
          value={formData.status || 'new'}
          onChange={handleChange}
          required
          disabled={loading}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="date-time-grid">
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            {t('admin.records.form.amount')}
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            className="form-input"
            value={formData.amount || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setFormData((prev) => ({ ...prev, amount: undefined }));
              } else {
                const parsed = parseFloat(value);
                setFormData((prev) => ({
                  ...prev,
                  amount: isNaN(parsed) ? undefined : parsed,
                }));
              }
            }}
            min="0"
            step="0.01"
            placeholder={t('admin.records.form.amountPlaceholder')}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod" className="form-label">
            {t('admin.records.form.paymentMethod')}
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            className="form-select"
            value={formData.paymentMethod || ''}
            onChange={handleChange}
            disabled={loading}
          >
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="comment" className="form-label">
          {t('admin.records.form.comment')}
        </label>
        <textarea
          id="comment"
          name="comment"
          className="form-textarea"
          value={formData.comment || ''}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? t('admin.records.form.saving') : record ? t('admin.records.form.saveChanges') : t('admin.records.form.addRecord')}
        </button>
      </div>
    </form>
  );
}
