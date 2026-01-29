/**
 * Настройки отпуска
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface VacationPeriod {
  id: string;
  startDate: string;
  endDate: string;
  note?: string;
}

const STORAGE_KEY = 'app_vacation_periods';

export default function VacationSettings() {
  const { t, language } = useTranslation();
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    note: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем сохраненные периоды отпуска только один раз при монтировании
    if (typeof window !== 'undefined' && !isInitialized) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== 'null' && saved !== 'undefined' && saved !== '[]') {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVacations(parsed);
          }
        } catch (e) {
          console.error('[VacationSettings] Failed to parse saved vacations:', e);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    // Сохраняем в localStorage при изменении (только после инициализации)
    if (typeof window !== 'undefined' && isInitialized) {
      const dataToSave = JSON.stringify(vacations);
      localStorage.setItem(STORAGE_KEY, dataToSave);
      
      // Отправляем кастомное событие для синхронизации в той же вкладке
      window.dispatchEvent(new CustomEvent('vacationUpdated'));
    }
  }, [vacations, isInitialized]);

  const handleAdd = () => {
    if (!formData.startDate || !formData.endDate) {
      alert(language === 'ru' ? 'Заполните даты начала и окончания' : 'Aizpildiet sākuma un beigu datumu');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert(language === 'ru' ? 'Дата начала не может быть позже даты окончания' : 'Sākuma datums nevar būt vēlāks par beigu datumu');
      return;
    }

    if (editingId) {
      setVacations((prev) =>
        prev.map((v) =>
          v.id === editingId
            ? { ...v, startDate: formData.startDate, endDate: formData.endDate, note: formData.note }
            : v
        )
      );
      setEditingId(null);
    } else {
      const newVacation: VacationPeriod = {
        id: `vacation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note || undefined,
      };
      setVacations((prev) => [...prev, newVacation].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ));
    }

    setFormData({ startDate: '', endDate: '', note: '' });
    setShowForm(false);
  };

  const handleEdit = (vacation: VacationPeriod) => {
    setFormData({
      startDate: vacation.startDate,
      endDate: vacation.endDate,
      note: vacation.note || '',
    });
    setEditingId(vacation.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'ru' ? 'Удалить период отпуска?' : 'Dzēst atvaļinājuma periodu?')) {
      setVacations((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({ startDate: '', endDate: '', note: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateStr: string) => {
    // Парсим дату из формата YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) {
      return dateStr; // Вернуть исходную строку, если формат неверный
    }
    const date = new Date(year, month - 1, day); // month - 1 потому что месяцы в JS начинаются с 0
    const locale = language === 'lv' ? 'lv-LV' : 'ru-RU';
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isActive = (vacation: VacationPeriod) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(vacation.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(vacation.endDate);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
  };

  const activeVacations = vacations.filter(isActive);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>
          {language === 'ru' ? 'Отпуск' : 'Atvaļinājums'}
        </h2>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            style={{ fontSize: '14px', padding: '8px 16px' }}
          >
            {language === 'ru' ? '+ Добавить отпуск' : '+ Pievienot atvaļinājumu'}
          </button>
        )}
      </div>

      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
        {language === 'ru' 
          ? 'Добавьте периоды отпуска. Во время активного отпуска часы работы не будут отображаться на странице записи для клиентов.'
          : 'Pievienojiet atvaļinājuma periodus. Aktīvā atvaļinājuma laikā darba laiks netiks rādīts klientu pieraksta lapā.'
        }
      </p>

      {/* Активные отпуска */}
      {activeVacations.length > 0 && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #fbbf24'
        }}>
          <strong style={{ color: '#92400e' }}>
            {language === 'ru' ? '⚠️ Сейчас активен отпуск:' : '⚠️ Pašlaik aktīvs atvaļinājums:'}
          </strong>
          {activeVacations.map((v) => (
            <div key={v.id} style={{ marginTop: '8px', color: '#92400e' }}>
              {formatDate(v.startDate)} - {formatDate(v.endDate)}
              {v.note && ` (${v.note})`}
            </div>
          ))}
        </div>
      )}

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingId 
              ? (language === 'ru' ? 'Редактировать отпуск' : 'Rediģēt atvaļinājumu')
              : (language === 'ru' ? 'Добавить отпуск' : 'Pievienot atvaļinājumu')
            }
          </h3>
          
          <div className="form-group">
            <label className="form-label">
              {language === 'ru' ? 'Дата начала' : 'Sākuma datums'} *
            </label>
            <input
              type="date"
              className="form-input"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {language === 'ru' ? 'Дата окончания' : 'Beigu datums'} *
            </label>
            <input
              type="date"
              className="form-input"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {language === 'ru' ? 'Примечание (необязательно)' : 'Piezīme (nav obligāti)'}
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder={language === 'ru' ? 'Например: Летний отпуск' : 'Piemēram: Vasaras atvaļinājums'}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              {language === 'ru' ? 'Отмена' : 'Atcelt'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
            >
              {editingId 
                ? (language === 'ru' ? 'Сохранить' : 'Saglabāt')
                : (language === 'ru' ? 'Добавить' : 'Pievienot')
              }
            </button>
          </div>
        </div>
      )}

      {/* Список отпусков */}
      {vacations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {vacations.map((vacation) => {
            const active = isActive(vacation);
            return (
              <div
                key={vacation.id}
                className="card"
                style={{
                  padding: '16px',
                  border: active ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                  backgroundColor: active ? '#fffbeb' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <strong>
                        {formatDate(vacation.startDate)} - {formatDate(vacation.endDate)}
                      </strong>
                      {active && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: '#fbbf24',
                          color: '#92400e',
                          fontWeight: '600',
                        }}>
                          {language === 'ru' ? 'Активен' : 'Aktīvs'}
                        </span>
                      )}
                    </div>
                    {vacation.note && (
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                        {vacation.note}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(vacation)}
                      style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                      {language === 'ru' ? 'Изменить' : 'Mainīt'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(vacation.id)}
                      style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                      {language === 'ru' ? 'Удалить' : 'Dzēst'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p style={{ margin: 0 }}>
            {language === 'ru' 
              ? 'Периоды отпуска не добавлены'
              : 'Atvaļinājuma periodi nav pievienoti'
            }
          </p>
        </div>
      )}
    </div>
  );
}
