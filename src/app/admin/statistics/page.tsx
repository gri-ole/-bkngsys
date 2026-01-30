/**
 * Страница детальной статистики
 */

'use client';

import { useRecords } from '@/hooks/useRecords';
import { useTranslation } from '@/hooks/useTranslation';
import { useServices } from '@/hooks/useServices';
import { getServiceLabel } from '@/utils/services';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import { Record as RecordModel } from '@/models/Record';

export default function StatisticsPage() {
  const { t, language } = useTranslation();
  const { records, loading, error } = useRecords();
  const { services } = useServices();

  // Статистика по статусам
  const statusStats = {
    new: records.filter((r) => r.status === 'new').length,
    confirmed: records.filter((r) => r.status === 'confirmed').length,
    cancelled: records.filter((r) => r.status === 'cancelled').length,
  };

  // Статистика по источникам
  const sourceStats = {
    client: records.filter((r) => r.source === 'client').length,
    master: records.filter((r) => r.source === 'master').length,
  };

  // Финансовая статистика
  const cashAmount = records
    .filter((r) => r.paymentMethod === 'cash' && r.amount != null && !isNaN(Number(r.amount)) && r.amount > 0)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const cardAmount = records
    .filter((r) => r.paymentMethod === 'card' && r.amount != null && !isNaN(Number(r.amount)) && r.amount > 0)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);


  // Статистика по услугам
  const serviceStats = records.reduce((acc, record) => {
    acc[record.service] = (acc[record.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topServices = Object.entries(serviceStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Топ 10 услуг

  const formatCurrency = (amount: number) => {
    const locale = language === 'lv' ? 'lv-LV' : 'ru-RU';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (loading && records.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
        <Breadcrumbs />
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('admin.records.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-statistics" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <Breadcrumbs />
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>
          {language === 'ru' ? 'Статистика' : 'Statistika'}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px', wordWrap: 'break-word' }}>
          {language === 'ru'
            ? 'Детальная статистика записей, услуг и источников клиентов'
            : 'Detalizēta ierakstu, pakalpojumu un klientu avotu statistika'
          }
        </p>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#fee2e2', border: '1px solid #dc2626', marginBottom: '24px' }}>
          <div className="error-message" style={{ margin: 0 }}>
            {t('common.error')}: {error}
          </div>
        </div>
      )}

      <div className="admin-statistics-grid">
        {/* Статистика по статусам */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
            📊 {language === 'ru' ? 'По статусу' : 'Pēc statusa'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>{t('admin.stats.statusNew')}</span>
              <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '24px' }}>{statusStats.new}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>{t('admin.stats.statusConfirmed')}</span>
              <span style={{ fontWeight: '700', color: '#16a34a', fontSize: '24px' }}>{statusStats.confirmed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>{t('admin.stats.statusCancelled')}</span>
              <span style={{ fontWeight: '700', color: '#dc2626', fontSize: '24px' }}>{statusStats.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Статистика по источникам */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
            👥 {language === 'ru' ? 'По источнику' : 'Pēc avota'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>{t('admin.stats.fromClients')}</span>
              <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '24px' }}>{sourceStats.client}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>{t('admin.stats.fromMaster')}</span>
              <span style={{ fontWeight: '700', color: '#4f46e5', fontSize: '24px' }}>{sourceStats.master}</span>
            </div>
          </div>
        </div>

        {/* Доход по способу оплаты */}
        {(cashAmount > 0 || cardAmount > 0) && (
          <div className="card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              💳 {language === 'ru' ? 'Доход по способу оплаты' : 'Ienākumi pēc maksājuma veida'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cashAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>💵 {t('admin.records.paymentMethod.cash')}</span>
                  <span style={{ fontWeight: '700', color: '#92400e', fontSize: '20px' }}>{formatCurrency(cashAmount)}</span>
                </div>
              )}
              {cardAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>💳 {t('admin.records.paymentMethod.card')}</span>
                  <span style={{ fontWeight: '700', color: '#1e40af', fontSize: '20px' }}>{formatCurrency(cardAmount)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Популярные услуги */}
        {topServices.length > 0 && (
          <div className="card admin-statistics-services-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              ⭐ {language === 'ru' ? 'Популярные услуги' : 'Populāri pakalpojumi'}
            </h3>
            <div className="admin-statistics-services-inner">
              {topServices.map(([service, count], index) => (
                <div 
                  key={service} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: index === 0 ? '#fef3c7' : '#f9fafb',
                    borderRadius: '8px',
                    border: index === 0 ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: index === 0 ? '600' : '500' }}>
                    {index === 0 && '🥇 '}
                    {index === 1 && '🥈 '}
                    {index === 2 && '🥉 '}
                    {getServiceLabel(service, services, language)}
                  </span>
                  <span style={{ fontWeight: '700', color: index === 0 ? '#f59e0b' : '#374151', fontSize: '18px' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
