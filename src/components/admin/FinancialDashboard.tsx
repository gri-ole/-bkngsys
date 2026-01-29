/**
 * Компонент финансовой статистики с графиками и расчетом налогов
 */

'use client';

import { useMemo, useState } from 'react';
import { Record as RecordModel } from '@/models/Record';
import { Purchase } from '@/models/Purchase';
import { useTranslation } from '@/hooks/useTranslation';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FinancialDashboardProps {
  records: RecordModel[];
  purchases?: Purchase[];
}

// Налоговые ставки для Латвии (2026)
// Прогрессивная шкала налогообложения
const MINIMUM_WAGE_LV = 780; // Минимальная зарплата в Латвии (2026)
const TAX_RATE_LOW = 0.10; // 10% до минимальной зарплаты
const TAX_RATE_HIGH = 0.25; // 25% свыше минимальной зарплаты

// Функция расчета налога с прогрессивной шкалой
const calculateProgressiveTax = (amount: number): number => {
  if (amount <= MINIMUM_WAGE_LV) {
    // Весь доход облагается по 10%
    return amount * TAX_RATE_LOW;
  } else {
    // Первые 780€ по 10%, остальное по 25%
    const taxOnMinWage = MINIMUM_WAGE_LV * TAX_RATE_LOW;
    const taxOnExcess = (amount - MINIMUM_WAGE_LV) * TAX_RATE_HIGH;
    return taxOnMinWage + taxOnExcess;
  }
};

interface MonthlyData {
  month: string;
  monthKey: string;
  cash: number;
  card: number;
  total: number;
  taxableAmount: number; // Только карта
  taxAmount: number;
  expenses: number; // Закупки
  netIncome: number;
}

const COLORS = {
  cash: '#f59e0b',
  card: '#3b82f6',
  tax: '#ef4444',
  net: '#22c55e',
};

export default function FinancialDashboard({ records, purchases = [] }: FinancialDashboardProps) {
  const { language } = useTranslation();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth); // По умолчанию текущий месяц

  // Фильтруем записи с суммой
  const paidRecords = useMemo(() => {
    return records.filter(r => r.amount && r.amount > 0);
  }, [records]);

  // Группировка по месяцам
  const monthlyData = useMemo(() => {
    const grouped: { [key: string]: MonthlyData } = {};

    paidRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString(language === 'lv' ? 'lv-LV' : 'ru-RU', {
        month: 'short',
        year: 'numeric',
      });

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthLabel,
          monthKey,
          cash: 0,
          card: 0,
          total: 0,
          taxableAmount: 0,
          taxAmount: 0,
          expenses: 0,
          netIncome: 0,
        };
      }

      const amount = record.amount || 0;
      grouped[monthKey].total += amount;

      // Распределение по способам оплаты
      if (record.paymentMethod === 'cash') {
        grouped[monthKey].cash += amount;
      } else if (record.paymentMethod === 'card') {
        grouped[monthKey].card += amount;
        grouped[monthKey].taxableAmount += amount; // Налог только с карты (в т.ч. онлайн)
      }
    });

    // Добавляем расходы (закупки) по месяцам
    purchases.forEach(purchase => {
      const date = new Date(purchase.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (grouped[monthKey]) {
        grouped[monthKey].expenses += purchase.amount;
      }
    });

    // Расчет налогов с прогрессивной шкалой и чистого дохода
    Object.values(grouped).forEach(month => {
      month.taxAmount = calculateProgressiveTax(month.taxableAmount);
      // Чистый доход = доход - налоги - расходы
      month.netIncome = month.total - month.taxAmount - month.expenses;
    });

    // Сортируем по месяцам
    return Object.values(grouped).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [paidRecords, language, purchases]);

  // Получаем список доступных лет из данных
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    monthlyData.forEach(m => {
      const year = parseInt(m.monthKey.split('-')[0]);
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // От новых к старым
  }, [monthlyData]);

  // Получаем список доступных месяцев для выбранного года
  const availableMonths = useMemo(() => {
    if (selectedYear === 'all') return [];
    
    const months = new Set<number>();
    monthlyData.forEach(m => {
      if (m.monthKey.startsWith(String(selectedYear))) {
        const month = parseInt(m.monthKey.split('-')[1]);
        months.add(month);
      }
    });
    return Array.from(months).sort((a, b) => a - b); // От января к декабрю
  }, [monthlyData, selectedYear]);

  // Фильтрация по периоду
  const filteredData = useMemo(() => {
    if (selectedYear === 'all') {
      return monthlyData;
    }

    let filtered = monthlyData.filter(m => m.monthKey.startsWith(String(selectedYear)));

    if (selectedMonth !== 'all') {
      const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      filtered = filtered.filter(m => m.monthKey === monthKey);
    }

    return filtered;
  }, [monthlyData, selectedYear, selectedMonth]);

  // Общая статистика
  const totalStats = useMemo(() => {
    return filteredData.reduce(
      (acc, month) => ({
        total: acc.total + month.total,
        cash: acc.cash + month.cash,
        card: acc.card + month.card,
        taxableAmount: acc.taxableAmount + month.taxableAmount,
        taxAmount: acc.taxAmount + month.taxAmount,
        expenses: acc.expenses + month.expenses,
        netIncome: acc.netIncome + month.netIncome,
      }),
      { total: 0, cash: 0, card: 0, taxableAmount: 0, taxAmount: 0, expenses: 0, netIncome: 0 }
    );
  }, [filteredData]);

  // Данные для круговой диаграммы (способы оплаты)
  const paymentMethodsData = useMemo(() => {
    return [
      { name: language === 'ru' ? 'Наличные' : 'Skaidra nauda', value: totalStats.cash, color: COLORS.cash },
      { name: language === 'ru' ? 'Карта (в т.ч. онлайн)' : 'Karte (arī tiešsaiste)', value: totalStats.card, color: COLORS.card },
    ].filter(item => item.value > 0);
  }, [totalStats, language]);

  const formatCurrency = (amount: number) => {
    const locale = language === 'lv' ? 'lv-LV' : 'ru-RU';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Получить название месяца
  const getMonthName = (month: number) => {
    const monthNames = {
      ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      lv: ['Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs', 'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris']
    };
    return language === 'ru' ? monthNames.ru[month - 1] : monthNames.lv[month - 1];
  };

  // Вычисляем эффективную ставку налога для отображения
  const effectiveTaxRate = totalStats.taxableAmount > 0 
    ? (totalStats.taxAmount / totalStats.taxableAmount) * 100 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Стильная панель фильтрации */}
      <div className="card" style={{ 
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Левая часть - фильтры */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Выбор года */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📅 {language === 'ru' ? 'Период' : 'Periods'}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
                  setSelectedYear(value);
                  if (value !== 'all') {
                    setSelectedMonth('all'); // Сбрасываем месяц при смене года
                  }
                }}
                className="form-select"
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '2px solid #cbd5e1',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  minWidth: '160px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="all">{language === 'ru' ? '📊 Все время' : '📊 Viss laiks'}</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Разделитель */}
            {selectedYear !== 'all' && availableMonths.length > 0 && (
              <div style={{ width: '1px', height: '48px', backgroundColor: '#e2e8f0', margin: '0 4px' }}></div>
            )}

            {/* Выбор месяца (только если выбран конкретный год и есть данные за месяцы) */}
            {selectedYear !== 'all' && availableMonths.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📆 {language === 'ru' ? 'Месяц' : 'Mēnesis'}
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
                    setSelectedMonth(value);
                  }}
                  className="form-select"
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '2px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    minWidth: '160px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {availableMonths.length > 1 && (
                    <option value="all">{language === 'ru' ? 'Весь год' : 'Viss gads'}</option>
                  )}
                  {availableMonths.map(month => (
                    <option key={month} value={month}>{getMonthName(month)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Правая часть - информация о периоде */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
              {language === 'ru' ? 'Записей:' : 'Ieraksti:'}
            </span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
              {filteredData.length > 0 ? filteredData.reduce((sum, m) => {
                const monthRecords = records.filter(r => {
                  const recordMonth = r.date.substring(0, 7); // YYYY-MM
                  return recordMonth === m.monthKey;
                });
                return sum + monthRecords.length;
              }, 0) : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Ключевые показатели - компактно */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div className="card" style={{ padding: '16px', background: '#f3f4f6' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>
            {language === 'ru' ? 'ДОХОД' : 'IENĀKUMI'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#374151' }}>
            {formatCurrency(totalStats.total)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', background: '#dbeafe' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '6px', fontWeight: '500' }}>
            💳 {language === 'ru' ? 'КАРТА' : 'KARTE'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
            {formatCurrency(totalStats.taxableAmount)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', background: '#fef3c7' }}>
          <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '6px', fontWeight: '500' }}>
            💵 {language === 'ru' ? 'НАЛИЧНЫЕ' : 'SKAIDRA NAUDA'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#92400e' }}>
            {formatCurrency(totalStats.cash)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', background: '#fee2e2' }}>
          <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '6px', fontWeight: '500' }}>
            {language === 'ru' ? `НАЛОГ (~${effectiveTaxRate.toFixed(1)}%)` : `NODOKLIS (~${effectiveTaxRate.toFixed(1)}%)`}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
            {formatCurrency(totalStats.taxAmount)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', background: '#fef3c7' }}>
          <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '6px', fontWeight: '500' }}>
            📦 {language === 'ru' ? 'РАСХОДЫ' : 'IZDEVUMI'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#92400e' }}>
            {formatCurrency(totalStats.expenses)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', background: '#d1fae5' }}>
          <div style={{ fontSize: '12px', color: '#065f46', marginBottom: '6px', fontWeight: '500' }}>
            {language === 'ru' ? 'ЧИСТЫМИ' : 'NETO'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#065f46' }}>
            {formatCurrency(totalStats.netIncome)}
          </div>
        </div>
      </div>

      {/* График - показывать только если выбран весь год (иначе одна точка) */}
      {selectedMonth === 'all' && filteredData.length > 1 && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
            {language === 'ru' ? 'Доход и налоги' : 'Ienākumi un nodokļi'}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Line
                type="monotone"
                dataKey="total"
                name={language === 'ru' ? 'Доход' : 'Ienākumi'}
                stroke="#667eea"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="taxAmount"
                name={language === 'ru' ? 'Налог' : 'Nodoklis'}
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name={language === 'ru' ? 'Расходы' : 'Izdevumi'}
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="netIncome"
                name={language === 'ru' ? 'Чистыми' : 'Neto'}
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Компактная таблица */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
          {language === 'ru' ? 'По месяцам' : 'Pa mēnešiem'}
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>
                  {language === 'ru' ? 'Месяц' : 'Mēnesis'}
                </th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>
                  {language === 'ru' ? 'Доход' : 'Ienākumi'}
                </th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>
                  {language === 'ru' ? 'Карта 💳' : 'Karte 💳'}
                </th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>
                  {language === 'ru' ? 'Налог' : 'Nodoklis'}
                </th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>
                  {language === 'ru' ? 'Расходы' : 'Izdevumi'}
                </th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>
                  {language === 'ru' ? 'Чистыми' : 'Neto'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((month) => (
                <tr key={month.monthKey} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 8px', textTransform: 'capitalize', color: '#374151' }}>
                    {month.month}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(month.total)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#3b82f6' }}>
                    {formatCurrency(month.card)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#ef4444' }}>
                    -{formatCurrency(month.taxAmount)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#f59e0b' }}>
                    -{formatCurrency(month.expenses)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#22c55e' }}>
                    {formatCurrency(month.netIncome)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: '700', background: '#f9fafb' }}>
                <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                  {language === 'ru' ? 'ИТОГО' : 'KOPĀ'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '15px' }}>
                  {formatCurrency(totalStats.total)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '15px', color: '#3b82f6' }}>
                  {formatCurrency(totalStats.card)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '15px', color: '#ef4444' }}>
                  -{formatCurrency(totalStats.taxAmount)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '15px', color: '#f59e0b' }}>
                  -{formatCurrency(totalStats.expenses)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '15px', color: '#22c55e' }}>
                  {formatCurrency(totalStats.netIncome)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
