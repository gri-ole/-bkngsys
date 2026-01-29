/**
 * Страница финансовой статистики и налогов
 */

'use client';

import { useState } from 'react';
import { useRecords } from '@/hooks/useRecords';
import { usePurchases } from '@/hooks/usePurchases';
import { usePurchaseCategories } from '@/hooks/usePurchaseCategories';
import { useTranslation } from '@/hooks/useTranslation';
import FinancialDashboard from '@/components/admin/FinancialDashboard';
import PurchaseForm from '@/components/admin/PurchaseForm';
import PurchasesList from '@/components/admin/PurchasesList';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import { Purchase, CreatePurchaseData } from '@/models/Purchase';

export default function FinancesPage() {
  const { t, language } = useTranslation();
  const { records, loading: recordsLoading, error: recordsError } = useRecords();
  const { purchases, addPurchase, updatePurchase, deletePurchase, loading: purchasesLoading, error: purchasesError } = usePurchases();
  const { categories } = usePurchaseCategories();
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases'>('overview');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  // Для вкладки "Обзор" нужны только записи, закупки могут быть пустыми
  const loading = activeTab === 'overview' ? recordsLoading : purchasesLoading;
  const error = activeTab === 'overview' ? recordsError : (purchasesError || recordsError);

  const handleAddPurchase = async (data: CreatePurchaseData) => {
    try {
      await addPurchase(data);
      setShowPurchaseForm(false);
      setEditingPurchase(null);
    } catch (err) {
      console.error('Error adding purchase:', err);
    }
  };

  const handleUpdatePurchase = async (data: CreatePurchaseData) => {
    if (!editingPurchase) return;
    try {
      await updatePurchase({ ...data, id: editingPurchase.id });
      setShowPurchaseForm(false);
      setEditingPurchase(null);
    } catch (err) {
      console.error('Error updating purchase:', err);
    }
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setShowPurchaseForm(true);
  };

  const handleCancelForm = () => {
    setShowPurchaseForm(false);
    setEditingPurchase(null);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <Breadcrumbs />
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>
          {language === 'ru' ? 'Финансы и налоги' : 'Finanses un nodokļi'}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          {language === 'ru'
            ? 'Полная статистика доходов, расходов и налоговых обязательств для самозанятых в Латвии'
            : 'Pilnīga ienākumu, izdevumu un nodokļu saistību statistika pašnodarbinātajiem Latvijā'
          }
        </p>
      </div>

      {/* Вкладки */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '8px',
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: activeTab === 'overview' ? '#2563eb' : 'transparent',
            color: activeTab === 'overview' ? '#ffffff' : '#6b7280',
            fontWeight: activeTab === 'overview' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
          }}
        >
          <span>📊</span>
          <span>{language === 'ru' ? 'Обзор' : 'Pārskats'}</span>
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          style={{
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: activeTab === 'purchases' ? '#2563eb' : 'transparent',
            color: activeTab === 'purchases' ? '#ffffff' : '#6b7280',
            fontWeight: activeTab === 'purchases' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
          }}
        >
          <span>📦</span>
          <span>{language === 'ru' ? 'Закупки' : 'Pirkumi'}</span>
          {purchases.length > 0 && (
            <span style={{
              backgroundColor: activeTab === 'purchases' ? '#ffffff' : '#2563eb',
              color: activeTab === 'purchases' ? '#2563eb' : '#ffffff',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {purchases.length}
            </span>
          )}
        </button>
      </div>

      {error && activeTab === 'overview' && (
        <div className="card" style={{ backgroundColor: '#fee2e2', border: '1px solid #dc2626', marginBottom: '24px' }}>
          <div className="error-message" style={{ margin: 0 }}>
            {t('common.error')}: {error}
          </div>
        </div>
      )}
      
      {purchasesError && activeTab === 'purchases' && (
        <div className="card" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', marginBottom: '24px' }}>
          <div style={{ margin: 0, color: '#92400e' }}>
            <strong>⚠️ {language === 'ru' ? 'Внимание' : 'Uzmanību'}:</strong>
            <p style={{ marginTop: '8px' }}>
              {language === 'ru' 
                ? 'Лист "Purchases" не найден в Google Sheets. Создайте его, следуя инструкции:'
                : 'Lapa "Purchases" nav atrasta Google Sheets. Izveidojiet to, sekojot instrukcijām:'
              }
            </p>
            <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>{language === 'ru' ? 'Откройте Google Sheets таблицу' : 'Atveriet Google Sheets tabulu'}</li>
              <li>{language === 'ru' ? 'Создайте лист "Purchases"' : 'Izveidojiet lapu "Purchases"'}</li>
              <li>{language === 'ru' ? 'Добавьте заголовки в строку 1' : 'Pievienojiet virsrakstus 1. rindā'}</li>
            </ol>
            <p style={{ marginTop: '8px', fontSize: '12px', fontFamily: 'monospace', backgroundColor: '#fff', padding: '8px', borderRadius: '4px' }}>
              ID	CategoryID	Name	Amount	Date	Description	Supplier	CreatedAt
            </p>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          {loading && records.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>{t('admin.records.loading')}</p>
            </div>
          ) : (
            <FinancialDashboard records={records} purchases={purchases} />
          )}
        </>
      )}

      {activeTab === 'purchases' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0 }}>
              {language === 'ru' ? 'Управление закупками' : 'Pirkumu pārvaldība'}
            </h2>
            {!showPurchaseForm && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowPurchaseForm(true);
                  setEditingPurchase(null);
                }}
              >
                + {language === 'ru' ? 'Добавить закупку' : 'Pievienot pirkumu'}
              </button>
            )}
          </div>

          {showPurchaseForm && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>
                {editingPurchase
                  ? (language === 'ru' ? 'Редактировать закупку' : 'Rediģēt pirkumu')
                  : (language === 'ru' ? 'Добавить закупку' : 'Pievienot pirkumu')
                }
              </h3>
              <PurchaseForm
                purchase={editingPurchase}
                onSubmit={editingPurchase ? handleUpdatePurchase : handleAddPurchase}
                onCancel={handleCancelForm}
                loading={loading}
              />
            </div>
          )}

          <PurchasesList
            purchases={purchases}
            categories={categories}
            onEdit={handleEditPurchase}
            onDelete={deletePurchase}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
