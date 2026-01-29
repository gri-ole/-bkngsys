/**
 * Компонент для управления услугами в админке
 */

'use client';

import { useState, FormEvent } from 'react';
import { useServices, Service } from '@/hooks/useServices';
import { useTranslation } from '@/hooks/useTranslation';

export default function ServicesManager() {
  const { t } = useTranslation();
  const { services, addService, updateService, deleteService } = useServices();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ nameLv: '', nameRu: '' });
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nameLv.trim() || !formData.nameRu.trim()) {
      setError('Заполните оба поля (латышский и русский)');
      return;
    }

    addService({
      nameLv: formData.nameLv.trim(),
      nameRu: formData.nameRu.trim(),
    });

    setFormData({ nameLv: '', nameRu: '' });
    setShowAddForm(false);
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({ nameLv: service.nameLv, nameRu: service.nameRu });
    setShowAddForm(false);
    setError(null);
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nameLv.trim() || !formData.nameRu.trim()) {
      setError('Заполните оба поля (латышский и русский)');
      return;
    }

    if (editingId) {
      updateService(editingId, {
        nameLv: formData.nameLv.trim(),
        nameRu: formData.nameRu.trim(),
      });
      setEditingId(null);
      setFormData({ nameLv: '', nameRu: '' });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ nameLv: '', nameRu: '' });
    setError(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
      deleteService(id);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Управление услугами</h2>
        {!showAddForm && !editingId && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setFormData({ nameLv: '', nameRu: '' });
            }}
          >
            + Добавить услугу
          </button>
        )}
      </div>

      {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

      {(showAddForm || editingId) && (
        <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingId ? 'Редактировать услугу' : 'Добавить услугу'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Название (LV) *</label>
              <input
                type="text"
                className="form-input"
                value={formData.nameLv}
                onChange={(e) => setFormData({ ...formData, nameLv: e.target.value })}
                required
                placeholder="Например: Frizūra"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Название (RU) *</label>
              <input
                type="text"
                className="form-input"
                value={formData.nameRu}
                onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                required
                placeholder="Например: Стрижка"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Отменить
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {services.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
            Нет услуг. Добавьте первую услугу.
          </p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: editingId === service.id ? '#eff6ff' : '#ffffff',
                border: editingId === service.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                borderRadius: '12px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <strong style={{ color: '#6b7280', fontSize: '12px' }}>LV:</strong>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{service.nameLv}</div>
                  </div>
                  <div>
                    <strong style={{ color: '#6b7280', fontSize: '12px' }}>RU:</strong>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{service.nameRu}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(service)}
                  style={{ fontSize: '14px', padding: '8px 16px' }}
                  disabled={editingId !== null && editingId !== service.id}
                >
                  Редактировать
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(service.id)}
                  style={{ fontSize: '14px', padding: '8px 16px' }}
                  disabled={editingId !== null}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
