/**
 * Список закупок с группировкой по месяцам
 */

'use client';

import { useState } from 'react';
import { Purchase } from '@/models/Purchase';
import { PurchaseCategory } from '@/models/PurchaseCategory';
import { useTranslation } from '@/hooks/useTranslation';

interface PurchasesListProps {
  purchases: Purchase[];
  categories: PurchaseCategory[];
  onEdit: (purchase: Purchase) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function PurchasesList({ purchases, categories, onEdit, onDelete, loading }: PurchasesListProps) {
  const { language } = useTranslation();
  const [expandedPurchases, setExpandedPurchases] = useState<Set<string>>(new Set());

  const togglePurchase = (purchaseId: string) => {
    setExpandedPurchases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseId)) {
        newSet.delete(purchaseId);
      } else {
        newSet.add(purchaseId);
      }
      return newSet;
    });
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return language === 'ru' ? 'Без категории' : 'Bez kategorijas';
    return language === 'ru' ? category.nameRu : category.nameLv;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '📦';
    
    // Иконки по категориям
    if (category.nameRu.includes('Краски')) return '🎨';
    if (category.nameRu.includes('Инструменты')) return '🔧';
    if (category.nameRu.includes('Защитные')) return '🧤';
    if (category.nameRu.includes('Уход')) return '💆‍♀️';
    if (category.nameRu.includes('Оборудование')) return '⚙️';
    return '📦';
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

  const formatCurrency = (amount: number) => {
    const locale = language === 'lv' ? 'lv-LV' : 'ru-RU';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Группировка по месяцам
  const groupedPurchases = purchases.reduce((acc, purchase) => {
    const date = new Date(purchase.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString(language === 'lv' ? 'lv-LV' : 'ru-RU', {
      month: 'long',
      year: 'numeric',
    });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthLabel,
        monthDate: date,
        purchases: [],
        total: 0,
      };
    }

    acc[monthKey].purchases.push(purchase);
    acc[monthKey].total += purchase.amount;
    return acc;
  }, {} as Record<string, { monthLabel: string; monthDate: Date; purchases: Purchase[]; total: number }>);

  const months = Object.values(groupedPurchases).sort((a, b) => 
    b.monthDate.getTime() - a.monthDate.getTime()
  );

  if (purchases.length === 0 && !loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#6b7280' }}>
          {language === 'ru' ? 'Нет закупок. Добавьте первую закупку.' : 'Nav pirkumu. Pievienojiet pirmo pirkumu.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {months.map((monthData) => (
        <div key={`month-${monthData.monthDate.getTime()}`}>
          {/* Заголовок месяца */}
          <div style={{ 
            marginBottom: '12px',
            padding: '12px 16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#374151',
              textTransform: 'capitalize',
            }}>
              {monthData.monthLabel}
            </h3>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#dc2626',
            }}>
              {formatCurrency(monthData.total)}
            </div>
          </div>

          {/* Закупки месяца */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {monthData.purchases.map((purchase) => {
              const isExpanded = expandedPurchases.has(purchase.id);
              
              return (
                <div 
                  key={purchase.id} 
                  className="card"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => togglePurchase(purchase.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Сжатый вид */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '20px' }}>{getCategoryIcon(purchase.categoryId)}</span>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{purchase.name}</h3>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '500',
                              backgroundColor: '#e0e7ff',
                              color: '#4f46e5',
                            }}
                          >
                            {getCategoryLabel(purchase.categoryId)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '14px', color: '#6b7280' }}>
                          <span>📅 {formatDate(purchase.date)}</span>
                          {purchase.supplier && <span>🏪 {purchase.supplier}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '18px' }}>
                          {formatCurrency(purchase.amount)}
                        </span>
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

                    {/* Раскрытая информация */}
                    {isExpanded && (
                      <div 
                        style={{ 
                          paddingTop: '12px', 
                          borderTop: '1px solid #e5e7eb',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Описание */}
                        {purchase.description && (
                          <div style={{ 
                            padding: '12px', 
                            backgroundColor: '#f9fafb', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <p style={{ color: '#374151', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                              <span style={{ marginRight: '6px' }}>💬</span>
                              {purchase.description}
                            </p>
                          </div>
                        )}
                        
                        {/* Кнопки действий */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: '14px', padding: '8px 16px', minHeight: '36px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(purchase);
                            }}
                            disabled={loading}
                          >
                            {language === 'ru' ? 'Редактировать' : 'Rediģēt'}
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ fontSize: '14px', padding: '8px 16px', minHeight: '36px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(language === 'ru' 
                                ? `Удалить закупку "${purchase.name}"?` 
                                : `Dzēst pirkumu "${purchase.name}"?`
                              )) {
                                onDelete(purchase.id);
                              }
                            }}
                            disabled={loading}
                          >
                            {language === 'ru' ? 'Удалить' : 'Dzēst'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
