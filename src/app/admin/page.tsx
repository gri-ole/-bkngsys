/**
 * Meistara admin panelis - ierakstu pārvaldība
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRecords } from '@/hooks/useRecords';
import RecordsList from '@/components/admin/RecordsList';
import RecordForm from '@/components/admin/RecordForm';
import StatsPanel from '@/components/admin/StatsPanel';
import Breadcrumbs from '@/components/admin/Breadcrumbs';
import { Record, CreateRecordData, UpdateRecordData } from '@/models/Record';
import { useTranslation } from '@/hooks/useTranslation';

export default function AdminPage() {
  const { t } = useTranslation();
  const { records, loading, error, addRecord, updateRecord, deleteRecord } = useRecords();
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Проверяем, нужно ли автоматически открыть форму (из меню)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldOpenForm = sessionStorage.getItem('openAddForm');
      if (shouldOpenForm === 'true') {
        setShowForm(true);
        sessionStorage.removeItem('openAddForm');
        // Прокрутка к форме
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      
      // Слушаем событие открытия формы (когда уже на странице)
      const handleOpenForm = () => {
        setEditingRecord(null);
        setShowForm(true);
        
        // Принудительная прокрутка (даже если форма уже открыта)
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
      };
      
      window.addEventListener('openAddForm', handleOpenForm);
      
      return () => {
        window.removeEventListener('openAddForm', handleOpenForm);
      };
    }
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  // Плавная прокрутка к форме, когда она появляется
  useEffect(() => {
    if (showForm && formRef.current) {
      // Небольшая задержка для того, чтобы форма успела отрендериться
      setTimeout(() => {
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [showForm]);

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setShowForm(true);
    // Прокрутка произойдет автоматически через useEffect при изменении showForm
  };

  // Быстрое обновление записи БЕЗ открытия формы редактирования
  const handleQuickUpdate = async (data: UpdateRecordData) => {
    try {
      await updateRecord(data);
      // Форма редактирования НЕ открывается
    } catch (err) {
      // Kļūda tiek apstrādāta useRecords hookā
      throw err; // Пробрасываем ошибку для обработки в QuickConfirmForm
    }
  };

  const handleFormSubmit = async (data: CreateRecordData | UpdateRecordData) => {
    try {
      if (editingRecord) {
        await updateRecord(data as UpdateRecordData);
      } else {
        await addRecord(data as CreateRecordData);
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (err) {
      // Kļūda tiek apstrādāta useRecords hookā
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.records.deleteConfirm'))) {
      try {
        await deleteRecord(id);
      } catch (err) {
        // Kļūda tiek apstrādāta useRecords hookā
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <Breadcrumbs />
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h1>{t('admin.records.title')}</h1>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#fee2e2', border: '1px solid #dc2626' }}>
          <div className="error-message" style={{ margin: 0 }}>{t('common.error')}: {error}</div>
        </div>
      )}

      {/* Статистика */}
      <StatsPanel records={records} />

      {showForm && (
        <div ref={formRef} className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '20px' }}>
            {editingRecord ? t('admin.records.editRecord') : t('admin.records.addRecord')}
          </h2>
          <RecordForm
            record={editingRecord}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        </div>
      )}

      <RecordsList
        records={records}
        loading={loading}
        onEdit={handleEdit}
        onQuickUpdate={handleQuickUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
