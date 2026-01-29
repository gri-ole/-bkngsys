/**
 * Настройки часов работы
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface WorkingHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

const STORAGE_KEY = 'app_working_hours';

const DEFAULT_HOURS: WorkingHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true },
};

const DAYS = [
  { key: 'monday' as const, labelRu: 'Понедельник', labelLv: 'Pirmdiena' },
  { key: 'tuesday' as const, labelRu: 'Вторник', labelLv: 'Otrdiena' },
  { key: 'wednesday' as const, labelRu: 'Среда', labelLv: 'Trešdiena' },
  { key: 'thursday' as const, labelRu: 'Четверг', labelLv: 'Ceturtdiena' },
  { key: 'friday' as const, labelRu: 'Пятница', labelLv: 'Piektdiena' },
  { key: 'saturday' as const, labelRu: 'Суббота', labelLv: 'Sestdiena' },
  { key: 'sunday' as const, labelRu: 'Воскресенье', labelLv: 'Svētdiena' },
];

export default function WorkingHoursSettings() {
  const { t, language } = useTranslation();
  const [hours, setHours] = useState<WorkingHours>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Загружаем сохраненные часы работы
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHours({ ...DEFAULT_HOURS, ...parsed });
        } catch (e) {
          console.error('Failed to parse saved working hours:', e);
        }
      }
    }
  }, []);

  const handleDayChange = (day: keyof WorkingHours, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    setLoading(true);
    
    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hours));
    }

    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const handleReset = () => {
    if (confirm(language === 'ru' ? 'Сбросить к значениям по умолчанию?' : 'Atiestatīt uz noklusējuma vērtībām?')) {
      setHours(DEFAULT_HOURS);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>
          {language === 'ru' ? 'Часы работы' : 'Darba laiks'}
        </h2>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          style={{ fontSize: '14px', padding: '8px 16px' }}
        >
          {language === 'ru' ? 'Сбросить' : 'Atiestatīt'}
        </button>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
        {language === 'ru' 
          ? 'Настройте часы работы, которые будут отображаться на странице записи для клиентов'
          : 'Iestatiet darba laiku, kas tiks rādīts klientu pieraksta lapā'
        }
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {DAYS.map((day) => {
          const dayHours = hours[day.key];
          const label = language === 'ru' ? day.labelRu : day.labelLv;

          return (
            <div
              key={day.key}
              className="card"
              style={{ padding: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '120px', fontWeight: '600' }}>
                  {label}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!dayHours.closed}
                    onChange={(e) => handleDayChange(day.key, 'closed', !e.target.checked)}
                  />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {language === 'ru' ? 'Работаем' : 'Strādājam'}
                  </span>
                </label>

                {!dayHours.closed && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '14px', color: '#6b7280' }}>
                        {language === 'ru' ? 'С' : 'No'}
                      </label>
                      <input
                        type="time"
                        value={dayHours.open}
                        onChange={(e) => handleDayChange(day.key, 'open', e.target.value)}
                        className="form-input"
                        style={{ width: '120px', padding: '8px 12px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '14px', color: '#6b7280' }}>
                        {language === 'ru' ? 'До' : 'Līdz'}
                      </label>
                      <input
                        type="time"
                        value={dayHours.close}
                        onChange={(e) => handleDayChange(day.key, 'close', e.target.value)}
                        className="form-input"
                        style={{ width: '120px', padding: '8px 12px' }}
                      />
                    </div>
                  </>
                )}

                {dayHours.closed && (
                  <span style={{ fontSize: '14px', color: '#dc2626', fontStyle: 'italic' }}>
                    {language === 'ru' ? 'Выходной' : 'Brīvdiena'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {saved && (
        <div className="success-message" style={{ marginTop: '16px' }}>
          {language === 'ru' ? 'Настройки сохранены' : 'Iestatījumi saglabāti'}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading
            ? (language === 'ru' ? 'Сохранение...' : 'Saglabā...')
            : (language === 'ru' ? 'Сохранить' : 'Saglabāt')
          }
        </button>
      </div>
    </div>
  );
}
