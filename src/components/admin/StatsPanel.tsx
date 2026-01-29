/**
 * Компонент панели статистики для админки
 */

'use client';

import { Record as RecordModel } from '@/models/Record';
import { useTranslation } from '@/hooks/useTranslation';
import { useServices } from '@/hooks/useServices';
import { getServiceLabel } from '@/utils/services';
import Link from 'next/link';

interface StatsPanelProps {
  records: RecordModel[];
}

export default function StatsPanel({ records }: StatsPanelProps) {
  const { t, language } = useTranslation();
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

  // Финансовая статистика (с защитой от NaN и undefined)
  const totalAmount = records
    .filter((r) => r.amount != null && !isNaN(Number(r.amount)) && r.amount > 0)
    .reduce((sum, r) => {
      const amount = Number(r.amount) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  const cashAmount = records
    .filter((r) => r.paymentMethod === 'cash' && r.amount != null && !isNaN(Number(r.amount)) && r.amount > 0)
    .reduce((sum, r) => {
      const amount = Number(r.amount) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  const cardAmount = records
    .filter((r) => r.paymentMethod === 'card' && r.amount != null && !isNaN(Number(r.amount)) && r.amount > 0)
    .reduce((sum, r) => {
      const amount = Number(r.amount) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);


  // Статистика по услугам
  const serviceStats = records.reduce((acc, record) => {
    acc[record.service] = (acc[record.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topServices = Object.entries(serviceStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    const locale = language === 'lv' ? 'lv-LV' : 'ru-RU';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }} className="stats-grid">
      {/* Финансовая статистика - кликабельная карточка */}
      <Link href="/admin/finances" style={{ textDecoration: 'none' }}>
        <div 
          className="card" 
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>{t('admin.stats.overview')}</h3>
            <span style={{ 
              fontSize: '20px',
              color: '#2563eb',
              transition: 'transform 0.2s ease',
            }}>
              📊
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb' }}>
                {records.length}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>{t('admin.stats.totalRecords')}</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a' }}>
                {formatCurrency(totalAmount)}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>{t('admin.stats.totalRevenue')}</div>
            </div>
          </div>
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
            color: '#2563eb',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {language === 'ru' ? 'Финансы и налоги' : 'Finanses un nodokļi'} →
          </div>
        </div>
      </Link>

      {/* Детальная статистика - кликабельная карточка */}
      <Link href="/admin/statistics" style={{ textDecoration: 'none' }}>
        <div 
          className="card" 
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>
              {language === 'ru' ? 'Статистика' : 'Statistika'}
            </h3>
            <span style={{ 
              fontSize: '20px',
              color: '#8b5cf6',
              transition: 'transform 0.2s ease',
            }}>
              📈
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                {statusStats.new}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>{t('admin.stats.statusNew')}</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a' }}>
                {statusStats.confirmed}
              </div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>{t('admin.stats.statusConfirmed')}</div>
            </div>
          </div>
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
            color: '#8b5cf6',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {language === 'ru' ? 'Детальная статистика' : 'Detalizēta statistika'} →
          </div>
        </div>
      </Link>
    </div>
  );
}
