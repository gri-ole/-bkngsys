/**
 * Ieraksta veidlapas komponents klientiem
 */

'use client';

import { useState, FormEvent, useMemo, useEffect } from 'react';
import { CreateRecordData } from '@/models/Record';
import { useTranslation } from '@/hooks/useTranslation';
import { useServices } from '@/hooks/useServices';
import { getServices } from '@/utils/services';
import { getVacationForDate, getAvailableHoursForDate } from '@/utils/workingHours';

// Состояние предупреждения об отпуске
interface VacationWarningState {
  show: boolean;
  message: string;
}

interface BookingFormProps {
  onSuccess: () => void;
}

export default function BookingForm({ onSuccess }: BookingFormProps) {
  const { t, language } = useTranslation();
  const { services, loading: servicesLoading } = useServices();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vacationWarning, setVacationWarning] = useState<VacationWarningState>({ show: false, message: '' });
  const [formData, setFormData] = useState<CreateRecordData>({
    clientName: '',
    phone: '',
    socialMedia: '',
    service: '',
    date: '',
    time: '', // Время - только час из рабочих часов
    comment: '',
    source: 'client',
  });

  // Анти-спам защита
  const [honeypot, setHoneypot] = useState(''); // Honeypot поле
  const [formStartTime, setFormStartTime] = useState<number>(0); // Время начала заполнения
  const [userActivity, setUserActivity] = useState({
    clicks: 0,
    focuses: 0,
    keystrokes: 0,
  });

  // Получаем список услуг с переводами (зависит от языка)
  // Для SSR используем дефолтные услуги, чтобы избежать hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const [availableHours, setAvailableHours] = useState<number[]>([]);
  
  useEffect(() => {
    setIsMounted(true);
    // Засекаем время начала работы с формой
    setFormStartTime(Date.now());

    // Отслеживание активности пользователя
    const handleClick = () => setUserActivity(prev => ({ ...prev, clicks: prev.clicks + 1 }));
    const handleFocus = () => setUserActivity(prev => ({ ...prev, focuses: prev.focuses + 1 }));
    const handleKeypress = () => setUserActivity(prev => ({ ...prev, keystrokes: prev.keystrokes + 1 }));

    document.addEventListener('click', handleClick);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('keypress', handleKeypress);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('keypress', handleKeypress);
    };
  }, []);
  
  // Обновляем доступные часы при изменении даты
  useEffect(() => {
    if (formData.date) {
      const hours = getAvailableHoursForDate(formData.date);
      setAvailableHours(hours);
      
      // Если выбранное время не входит в доступные часы, сбрасываем его
      if (formData.time) {
        const selectedHour = parseInt(formData.time.split(':')[0], 10);
        if (!hours.includes(selectedHour)) {
          setFormData(prev => ({ ...prev, time: '' }));
        }
      }
    } else {
      setAvailableHours([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date]);

  const SERVICES = useMemo(() => {
    // На сервере и до монтирования используем дефолтные услуги
    if (!isMounted) {
      return getServices([
        { id: 'haircut', nameLv: 'Frizūra', nameRu: 'Стрижка' },
        { id: 'coloring', nameLv: 'Krāsošana', nameRu: 'Окрашивание' },
        { id: 'styling', nameLv: 'Sakārtošana', nameRu: 'Укладка' },
        { id: 'manicure', nameLv: 'Manikīrs', nameRu: 'Маникюр' },
        { id: 'pedicure', nameLv: 'Pedikīrs', nameRu: 'Педикюр' },
        { id: 'massage', nameLv: 'Masāža', nameRu: 'Массаж' },
        { id: 'cosmetology', nameLv: 'Kosmetoloģija', nameRu: 'Косметология' },
        { id: 'other', nameLv: 'Cits', nameRu: 'Другое' },
      ], language);
    }
    return getServices(services, language);
  }, [services, language, isMounted]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    
    // Проверяем отпуск при изменении даты
    if (name === 'date' && value) {
      checkVacationWarning(value);
    }
  };
  
  const checkVacationWarning = (dateStr: string) => {
    const vacation = getVacationForDate(dateStr);
    if (vacation) {
      // Форматируем даты
      const formatDate = (d: string) => {
        const [year, month, day] = d.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const locale = language === 'lv' ? 'lv-LV' : 'ru-RU';
        return date.toLocaleDateString(locale, {
          day: 'numeric',
          month: 'long',
        });
      };
      
      const startDate = formatDate(vacation.startDate);
      const endDate = formatDate(vacation.endDate);
      
      const messageRu = `🏖️ Обратите внимание: ${startDate} - ${endDate} мастер в отпуске. Ваша запись будет принята, и мастер свяжется с вами для переноса на другую удобную дату.`;
      const messageLv = `🏖️ Lūdzu, ņemiet vērā: ${startDate} - ${endDate} meistars atvaļinājumā. Jūsu ieraksts tiks pieņemts, un meistars sazināsies ar jums, lai pārceltu uz citu ērtu datumu.`;
      
      setVacationWarning({
        show: true,
        message: language === 'ru' ? messageRu : messageLv,
      });
    } else {
      setVacationWarning({ show: false, message: '' });
    }
  };

  const validateForm = (): boolean => {
    // Анти-спам проверки
    // 1. Honeypot: если заполнено скрытое поле - это бот
    if (honeypot) {
      console.log('[Anti-spam] Honeypot triggered');
      setError(language === 'ru' ? 'Ошибка отправки формы' : 'Kļūda nosūtot veidlapu');
      return false;
    }

    // 2. Минимальное время заполнения формы (3 секунды)
    const timeSpent = Date.now() - formStartTime;
    if (timeSpent < 3000) {
      console.log('[Anti-spam] Form submitted too quickly:', timeSpent, 'ms');
      setError(language === 'ru' ? 'Пожалуйста, заполните форму внимательно' : 'Lūdzu, aizpildiet veidlapu rūpīgi');
      return false;
    }

    // 3. Проверка активности пользователя (хотя бы 2 клика или фокуса)
    if (userActivity.clicks + userActivity.focuses < 2) {
      console.log('[Anti-spam] Insufficient user activity:', userActivity);
      setError(language === 'ru' ? 'Пожалуйста, заполните все поля' : 'Lūdzu, aizpildiet visus laukus');
      return false;
    }

    // Валидация имени
    if (!formData.clientName || !formData.clientName.trim()) {
      setError(t('booking.validation.nameRequired'));
      return false;
    }
    if (formData.clientName.trim().length < 2) {
      setError(t('booking.validation.nameMinLength'));
      return false;
    }
    
    // Валидация телефона
    if (!formData.phone || !formData.phone.trim()) {
      setError(t('booking.validation.phoneRequired'));
      return false;
    }
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError(t('booking.validation.phoneInvalid'));
      return false;
    }
    
    // Валидация услуги
    if (!formData.service || !services.some(s => s.id === formData.service)) {
      setError(t('booking.validation.serviceRequired'));
      return false;
    }
    
    // Валидация даты
    if (!formData.date) {
      setError(t('booking.validation.dateRequired'));
      return false;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      setError(t('booking.validation.dateInvalid'));
      return false;
    }
    
    // Время не обязательно - мастер договорится с клиентом позже
    
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Проверяем, записывается ли клиент во время отпуска
      const vacation = getVacationForDate(formData.date);
      
      const dataToSubmit = {
        ...formData,
        duringVacation: !!vacation, // Добавляем флаг, что запись во время отпуска
        // Добавляем анти-спам метаданные
        _antiSpam: {
          timeSpent: Date.now() - formStartTime,
          userActivity: userActivity,
          timestamp: Date.now(),
        },
      };
      
      console.log('[BookingForm] Отправка данных:', dataToSubmit);
      
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });
      
      console.log('[BookingForm] Статус ответа:', response.status, response.statusText);

      if (!response.ok) {
        // Проверяем, является ли ответ JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || t('booking.error.submitError'));
        } else {
          // Если не JSON, выводим общую ошибку
          console.error('Server returned non-JSON response:', await response.text());
          throw new Error(t('booking.error.submitError'));
        }
      }

      // Очищаем форму после успешной отправки
      setFormData({
        clientName: '',
        phone: '',
        socialMedia: '',
        service: '',
        date: '',
        time: '',
        comment: '',
        source: 'client',
      });
      setVacationWarning({ show: false, message: '' });
      setAvailableHours([]);
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('booking.error.genericError'));
    } finally {
      setLoading(false);
    }
  };

  // Minimālais datums - šodiena
  const today = new Date().toISOString().split('T')[0];
  // Maksimālais datums - pēc 3 mēnešiem
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="clientName" className="form-label">
            {t('booking.form.clientName')} *
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
            {t('booking.form.phone')} *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="form-input"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t('booking.form.phonePlaceholder')}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="socialMedia" className="form-label">
            {language === 'ru' ? 'Ссылка на соц. сеть' : 'Saite uz sociālo tīklu'}
          </label>
          <input
            type="text"
            id="socialMedia"
            name="socialMedia"
            className="form-input"
            value={formData.socialMedia}
            onChange={handleChange}
            placeholder={language === 'ru' ? '@username или ссылка' : '@lietotājvārds vai saite'}
            disabled={loading}
          />
        </div>

        {/* Honeypot поле - скрыто для людей, видимо для ботов */}
        <div className="honeypot-field" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="service" className="form-label">
            {t('booking.form.service')} *
          </label>
          <select
            id="service"
            name="service"
            className="form-select"
            value={formData.service}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">{t('booking.form.selectService')}</option>
            {SERVICES.map((service) => (
              <option key={service.key} value={service.key}>
                {service.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">
            {t('booking.form.date')} *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-input"
            value={formData.date}
            onChange={handleChange}
            min={today}
            max={maxDateStr}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="time" className="form-label">
            {language === 'ru' ? 'Желаемое время' : 'Vēlamais laiks'}
          </label>
          {!formData.date ? (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '8px',
              color: '#6b7280',
              fontSize: '14px',
            }}>
              {language === 'ru' ? 'Сначала выберите дату' : 'Vispirms izvēlieties datumu'}
            </div>
          ) : availableHours.length === 0 ? (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fef3c7', 
              borderRadius: '8px',
              color: '#92400e',
              fontSize: '14px',
            }}>
              {language === 'ru' ? '⚠️ В этот день не работаем' : '⚠️ Šajā dienā nestrādājam'}
            </div>
          ) : (
            <select
              id="time"
              name="time"
              className="form-select"
              value={formData.time}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">
                {language === 'ru' ? '-- Выберите час --' : '-- Izvēlieties stundu --'}
              </option>
              {availableHours.map((hour) => (
                <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                  {`${hour}:00`}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            {t('booking.form.comment')}
          </label>
          <textarea
            id="comment"
            name="comment"
            className="form-textarea"
            value={formData.comment}
            onChange={handleChange}
            placeholder={t('booking.form.commentPlaceholder')}
            disabled={loading}
          />
        </div>

        {vacationWarning.show && (
          <div style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginTop: '16px',
            boxShadow: '0 8px 30px rgba(251, 191, 36, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideIn 0.5s ease-out',
          }}>
            <div style={{
              fontSize: '40px',
              textAlign: 'center',
              marginBottom: '10px',
            }}>
              🏖️
            </div>
            <div style={{
              color: '#ffffff',
              fontSize: '15px',
              lineHeight: '1.6',
              textAlign: 'center',
              fontWeight: '500',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}>
              {vacationWarning.message}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginTop: '16px',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideIn 0.5s ease-out',
          }}>
            <div style={{
              fontSize: '40px',
              textAlign: 'center',
              marginBottom: '10px',
            }}>
              ⚠️
            </div>
            <div style={{
              color: '#ffffff',
              fontSize: '15px',
              lineHeight: '1.6',
              textAlign: 'center',
              fontWeight: '500',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}>
              {error}
            </div>
          </div>
        )}
        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? t('common.submitting') : t('booking.form.submit')}
        </button>
      </form>
    </div>
  );
}
