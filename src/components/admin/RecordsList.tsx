/**
 * Ierakstu saraksta komponents administrācijai
 */

'use client';

import { useState } from 'react';
import { Record as RecordModel } from '@/models/Record';
import { useTranslation } from '@/hooks/useTranslation';
import { useServices } from '@/hooks/useServices';
import { getServiceLabel } from '@/utils/services';
import QuickConfirmForm from './QuickConfirmForm';

interface RecordsListProps {
  records: RecordModel[];
  loading: boolean;
  onEdit: (record: RecordModel) => void;
  onQuickUpdate: (data: any) => Promise<void>;
  onDelete: (id: string) => void;
}

type RecordStatus = RecordModel['status'];

const STATUS_COLORS: Record<RecordStatus, string> = {
  new: '#fbbf24',
  confirmed: '#16a34a',
  cancelled: '#dc2626',
};

export default function RecordsList({ records, loading, onEdit, onQuickUpdate, onDelete }: RecordsListProps) {
  const { t, language } = useTranslation();
  const { services } = useServices();
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [confirmingRecord, setConfirmingRecord] = useState<RecordModel | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const toggleRecord = (recordId: string) => {
    setExpandedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const handleQuickConfirm = (record: RecordModel) => {
    setConfirmingRecord(record);
  };

  const handleConfirmSubmit = async (data: any) => {
    setIsConfirming(true);
    try {
      // Используем onQuickUpdate вместо onEdit, чтобы НЕ открывать форму редактирования
      await onQuickUpdate(data);
      setConfirmingRecord(null);
      // Закрываем раскрытую запись после подтверждения
      if (data.id) {
        setExpandedRecords((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.id);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error confirming record:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading && records.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p>{t('admin.records.loading')}</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#6b7280' }}>{t('admin.records.noRecords')}</p>
      </div>
    );
  }

  // Разделяем на новые (необработанные) и остальные записи
  const newRecords = records.filter(r => r.status === 'new');
  const processedRecords = records.filter(r => r.status !== 'new');

  // Kārtošana pēc datuma и времени создания (jaunākie augšā)
  const sortedNewRecords = [...newRecords].sort((a, b) => {
    // Для новых записей - сортируем по createdAt, если доступно
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateB.getTime() - dateA.getTime();
  });

  const sortedRecords = [...processedRecords].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateB.getTime() - dateA.getTime(); // Новые сверху
  });

  // Функция для получения начала недели (понедельник)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Понедельник = 1
    return new Date(d.setDate(diff));
  };

  // Функция для получения номера недели в месяце
  const getWeekNumberInMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstMonday = getWeekStart(firstDay);
    const currentWeekStart = getWeekStart(date);
    
    // Разница в днях между началом первой недели и текущей недели
    const diffInDays = Math.floor((currentWeekStart.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    
    return weekNumber;
  };

  // Функция для форматирования месяца
  const formatMonth = (date: Date): string => {
    const locale = language === 'lv' ? 'lv-LV' : 'ru-RU';
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  // Функция для форматирования недели
  const formatWeek = (weekStart: Date, monthDate: Date): string => {
    const weekNumber = getWeekNumberInMonth(weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const locale = language === 'lv' ? 'lv-LV' : 'ru-RU';
    const startStr = weekStart.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const endStr = weekEnd.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    
    // Форматируем номер недели в месяце
    const weekLabel = language === 'ru' 
      ? `${weekNumber}-ая неделя` 
      : `${weekNumber}. nedēļa`;
    
    return `${weekLabel} (${startStr} - ${endStr})`;
  };

  // Группировка записей по месяцам и неделям
  const groupedRecords = sortedRecords.reduce((acc, record) => {
    const recordDate = new Date(`${record.date}T${record.time || '00:00'}`);
    const monthKey = `${recordDate.getFullYear()}-${recordDate.getMonth()}`;
    const weekStart = getWeekStart(recordDate);
    const weekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthDate: new Date(recordDate.getFullYear(), recordDate.getMonth(), 1),
        weeks: {},
      };
    }

    if (!acc[monthKey].weeks[weekKey]) {
      acc[monthKey].weeks[weekKey] = {
        weekStart,
        records: [],
      };
    }

    acc[monthKey].weeks[weekKey].records.push(record);
    return acc;
  }, {} as Record<string, { monthDate: Date; weeks: Record<string, { weekStart: Date; records: RecordModel[] }> }>);

  // Преобразуем в массив и сортируем по дате (новые месяцы сверху)
  const months = Object.values(groupedRecords).sort((a, b) => 
    b.monthDate.getTime() - a.monthDate.getTime()
  );

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

  const formatCurrency = (amount?: number) => {
    if (!amount || amount === 0) return null;
    const locale = language === 'lv' ? 'lv-LV' : 'ru-RU';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'cash':
        return `💵 ${t('admin.records.paymentMethod.cash')}`;
      case 'card':
        return `💳 ${t('admin.records.paymentMethod.card')}`;
      default:
        return null;
    }
  };

  // Функция для рендеринга записи
  const renderRecord = (record: RecordModel, isNew: boolean = false) => {
    const isExpanded = expandedRecords.has(record.id);
    
    return (
      <div 
        key={record.id} 
        className="card"
        style={{ 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          ...(isNew ? {
            border: '2px solid #fbbf24',
            backgroundColor: '#fffbeb',
          } : {}),
        }}
        onClick={() => toggleRecord(record.id)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Сжатый вид - всегда видимый */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{record.clientName}</h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '500',
                    backgroundColor: STATUS_COLORS[record.status] + '20',
                    color: STATUS_COLORS[record.status],
                  }}
                >
                  {t(`admin.records.status.${record.status}`)}
                </span>
                {isNew && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: '#fbbf24',
                      color: '#fff',
                      animation: 'pulse 2s infinite',
                    }}
                  >
                    🔔 {language === 'ru' ? 'НОВАЯ' : 'JAUNS'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '14px', color: '#6b7280' }}>
                <span>📞 {record.phone}</span>
                <span>🎯 {getServiceLabel(record.service, services, language)}</span>
                <span>📅 {formatDate(record.date)} {record.time && `plkst. ${record.time}`}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {record.amount && record.amount > 0 && (
                <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>
                  💰 {formatCurrency(record.amount)}
                </span>
              )}
              <span
                style={{
                  fontSize: '18px',
                  color: '#9ca3af',
                  transition: 'transform 0.2s ease',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
            </div>
          </div>

          {/* Раскрытая информация - показывается только при клике */}
          {isExpanded && (
            <div 
              style={{ 
                paddingTop: '16px', 
                borderTop: '2px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
              onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике внутри
            >
              {/* Детальная информация о клиенте и записи */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
              }}>
                {/* Левая колонка - Контактная информация */}
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: '12px',
                  border: '1px solid #bae6fd',
                }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: '#0369a1',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    👤 {language === 'ru' ? 'Контактная информация' : 'Kontaktinformācija'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                        {language === 'ru' ? 'Имя клиента' : 'Klienta vārds'}
                      </span>
                      <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>
                        {record.clientName}
                      </span>
                    </div>
                    <div style={{ height: '1px', backgroundColor: '#bae6fd' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                        📞 {language === 'ru' ? 'Телефон' : 'Tālrunis'}
                      </span>
                      <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>
                        {record.phone}
                      </span>
                    </div>
                    {record.socialMedia && (
                      <>
                        <div style={{ height: '1px', backgroundColor: '#bae6fd' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                            💬 {language === 'ru' ? 'Соц. сеть' : 'Sociālie tīkli'}
                          </span>
                          <a 
                            href={record.socialMedia.startsWith('http') ? record.socialMedia : `https://${record.socialMedia}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              fontSize: '14px', 
                              color: '#0369a1', 
                              fontWeight: '500',
                              textDecoration: 'none',
                              wordBreak: 'break-all',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {record.socialMedia}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Правая колонка - Детали записи */}
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e9d5ff',
                }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: '#7c3aed',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    📋 {language === 'ru' ? 'Детали записи' : 'Ieraksta detaļas'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                        🎯 {language === 'ru' ? 'Услуга' : 'Pakalpojums'}
                      </span>
                      <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>
                        {getServiceLabel(record.service, services, language)}
                      </span>
                    </div>
                    <div style={{ height: '1px', backgroundColor: '#e9d5ff' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                        📅 {language === 'ru' ? 'Дата и время' : 'Datums un laiks'}
                      </span>
                      <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>
                        {formatDate(record.date)} {record.time ? `• ${record.time}` : ''}
                      </span>
                    </div>
                    <div style={{ height: '1px', backgroundColor: '#e9d5ff' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                        📌 {language === 'ru' ? 'Статус' : 'Statuss'}
                      </span>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          backgroundColor: STATUS_COLORS[record.status] + '20',
                          color: STATUS_COLORS[record.status],
                          width: 'fit-content',
                        }}
                      >
                        {t(`admin.records.status.${record.status}`)}
                      </span>
                    </div>
                    {record.createdAt && (
                      <>
                        <div style={{ height: '1px', backgroundColor: '#e9d5ff' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                            🕐 {language === 'ru' ? 'Создана' : 'Izveidota'}
                          </span>
                          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                            {new Date(record.createdAt).toLocaleString(language === 'lv' ? 'lv-LV' : 'ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </>
                    )}
                    <div style={{ height: '1px', backgroundColor: '#e9d5ff' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                        🔗 {language === 'ru' ? 'Источник' : 'Avots'}
                      </span>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                        {t(`admin.records.source.${record.source}`)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Финансовая информация - выделенная секция */}
              {(record.amount && record.amount > 0) || record.paymentMethod ? (
                <div style={{ 
                  padding: '20px',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  borderRadius: '12px',
                  border: '2px solid #6ee7b7',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)',
                }}>
                  <h4 style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: '#047857',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{ fontSize: '20px' }}>💰</span>
                    {language === 'ru' ? 'Финансовая информация' : 'Finanšu informācija'}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#065f46', fontWeight: '600', textTransform: 'uppercase' }}>
                        {t('admin.records.form.amount')}
                      </span>
                      {record.amount && record.amount > 0 ? (
                        <span style={{ color: '#047857', fontWeight: '800', fontSize: '28px', lineHeight: '1' }}>
                          {formatCurrency(record.amount)}
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '15px', fontWeight: '500', fontStyle: 'italic' }}>
                          {t('admin.records.paymentMethod.notSpecified')}
                        </span>
                      )}
                    </div>
                    {record.paymentMethod && (
                      <>
                        <div style={{ width: '2px', height: '40px', backgroundColor: '#6ee7b7' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#065f46', fontWeight: '600', textTransform: 'uppercase' }}>
                            {t('admin.records.form.paymentMethod')}
                          </span>
                          <span style={{ color: '#047857', fontWeight: '700', fontSize: '16px' }}>
                            {getPaymentMethodLabel(record.paymentMethod)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
              
              {/* Комментарий */}
              {record.comment && (
                <div style={{ 
                  padding: '16px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  border: '1px solid #fbbf24',
                }}>
                  <h4 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '13px', 
                    fontWeight: '700',
                    color: '#92400e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span style={{ fontSize: '16px' }}>💬</span>
                    {language === 'ru' ? 'Комментарий' : 'Komentārs'}
                  </h4>
                  <p style={{ color: '#78350f', margin: 0, fontSize: '14px', lineHeight: '1.6', fontWeight: '500' }}>
                    {record.comment}
                  </p>
                </div>
              )}
              
              {/* Кнопки действий */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                flexWrap: 'wrap', 
                marginTop: '8px',
                paddingTop: '16px',
                borderTop: '2px solid #e5e7eb',
              }}>
                {/* Кнопка быстрого подтверждения для новых записей */}
                {isNew && (
                  <button
                    className="btn btn-primary"
                    style={{ 
                      fontSize: '15px', 
                      padding: '12px 24px', 
                      minHeight: '44px',
                      backgroundColor: '#16a34a',
                      borderColor: '#16a34a',
                      fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickConfirm(record);
                    }}
                  >
                    ✅ {language === 'ru' ? 'Подтвердить запись' : 'Apstiprināt ierakstu'}
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '15px', padding: '12px 24px', minHeight: '44px', fontWeight: '600' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(record);
                  }}
                >
                  ✏️ {t('common.edit')}
                </button>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: '15px', padding: '12px 24px', minHeight: '44px', fontWeight: '600' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record.id);
                  }}
                >
                  🗑️ {t('common.delete')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Блок с новыми необработанными записями */}
      {sortedNewRecords.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            padding: '16px 20px',
            backgroundColor: '#fbbf24',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '700',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '24px' }}>🔔</span>
              {language === 'ru' ? 'Новые необработанные записи' : 'Jauni neapstrādāti ieraksti'}
            </h2>
            <span style={{ 
              fontSize: '28px', 
              fontWeight: '700',
              color: '#fff',
              backgroundColor: '#f59e0b',
              padding: '4px 16px',
              borderRadius: '20px',
              minWidth: '50px',
              textAlign: 'center',
            }}>
              {sortedNewRecords.length}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            padding: '16px',
            backgroundColor: '#fffbeb',
            borderRadius: '0 0 12px 12px',
            border: '2px solid #fbbf24',
            borderTop: 'none',
          }}>
            {sortedNewRecords.map((record) => renderRecord(record, true))}
          </div>
        </div>
      )}

      {/* Обычные записи, сгруппированные по месяцам и неделям */}
      {months.map((monthData) => {
        const weeks = Object.values(monthData.weeks).sort((a, b) => 
          b.weekStart.getTime() - a.weekStart.getTime()
        );

        return (
          <div key={`month-${monthData.monthDate.getTime()}`}>
            {/* Заголовок месяца */}
            <div style={{ 
              marginBottom: '12px',
              padding: '8px 0',
              borderBottom: '2px solid #e5e7eb',
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#374151',
                textTransform: 'capitalize',
              }}>
                {formatMonth(monthData.monthDate)}
              </h2>
            </div>

            {/* Недели внутри месяца */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {weeks.map((weekData) => (
                <div key={`week-${weekData.weekStart.getTime()}`}>
                  {/* Заголовок недели */}
                  <div style={{ 
                    marginBottom: '8px',
                    paddingLeft: '8px',
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'capitalize',
                    }}>
                      {formatWeek(weekData.weekStart, monthData.monthDate)}
                    </h3>
                  </div>

                  {/* Записи недели */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {weekData.records.map((record) => renderRecord(record, false))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Форма быстрого подтверждения */}
      {confirmingRecord && (
        <QuickConfirmForm
          record={confirmingRecord}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setConfirmingRecord(null)}
          loading={isConfirming}
        />
      )}
    </div>
  );
}
