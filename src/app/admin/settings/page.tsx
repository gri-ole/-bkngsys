/**
 * Страница настроек админ панели
 */

'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import ServicesManager from '@/components/admin/ServicesManager';
import PurchaseCategoriesManager from '@/components/admin/PurchaseCategoriesManager';
import WorkingHoursSettings from '@/components/admin/WorkingHoursSettings';
import VacationSettings from '@/components/admin/VacationSettings';
import ContactInfoSettings from '@/components/admin/ContactInfoSettings';
import Breadcrumbs from '@/components/admin/Breadcrumbs';

export default function SettingsPage() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'hours' | 'vacation' | 'services' | 'purchaseCategories' | 'contact'>('contact');

  const tabs = [
    {
      id: 'contact' as const,
      label: language === 'ru' ? 'Контакты' : 'Kontakti',
      icon: '📞',
    },
    {
      id: 'hours' as const,
      label: language === 'ru' ? 'Часы работы' : 'Darba laiks',
      icon: '🕐',
    },
    {
      id: 'vacation' as const,
      label: language === 'ru' ? 'Отпуск' : 'Atvaļinājums',
      icon: '🏖️',
    },
    {
      id: 'services' as const,
      label: language === 'ru' ? 'Услуги' : 'Pakalpojumi',
      icon: '⚙️',
    },
    {
      id: 'purchaseCategories' as const,
      label: language === 'ru' ? 'Категории закупок' : 'Pirkumu kategorijas',
      icon: '🏷️',
    },
  ];

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <Breadcrumbs />
      <h1 style={{ marginBottom: '24px' }}>
        {language === 'ru' ? 'Настройки' : 'Iestatījumi'}
      </h1>

      {/* Вкладки */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '8px',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#6b7280',
              fontWeight: activeTab === tab.id ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Содержимое вкладок */}
      <div className="card">
        {activeTab === 'contact' && <ContactInfoSettings />}
        {activeTab === 'hours' && <WorkingHoursSettings />}
        {activeTab === 'vacation' && <VacationSettings />}
        {activeTab === 'services' && <ServicesManager />}
        {activeTab === 'purchaseCategories' && <PurchaseCategoriesManager />}
      </div>
    </div>
  );
}
