/**
 * Компонент для управления категориями закупок в админке
 */

'use client';

import { useState, FormEvent } from 'react';
import { usePurchaseCategories } from '@/hooks/usePurchaseCategories';
import { useTranslation } from '@/hooks/useTranslation';
import { PurchaseCategory } from '@/models/PurchaseCategory';

export default function PurchaseCategoriesManager() {
  const { language } = useTranslation();
  const { categories, addCategory, updateCategory, deleteCategory, loading } = usePurchaseCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ 
    nameLv: '', 
    nameRu: '', 
    description: '',
    order: 999 
  });
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nameLv.trim() || !formData.nameRu.trim()) {
      setError(language === 'ru' ? 'Заполните оба поля (латышский и русский)' : 'Aizpildiet abus laukus (latviešu un krievu)');
      return;
    }

    try {
      addCategory({
        name: language === 'ru' ? formData.nameRu : formData.nameLv,
        nameLv: formData.nameLv.trim(),
        nameRu: formData.nameRu.trim(),
        description: formData.description.trim(),
        order: formData.order || 999,
      });

      setFormData({ nameLv: '', nameRu: '', description: '', order: 999 });
      setShowAddForm(false);
    } catch (err) {
      setError(language === 'ru' ? 'Ошибка при добавлении категории' : 'Kļūda pievienojot kategoriju');
    }
  };

  const handleEdit = (category: PurchaseCategory) => {
    setEditingId(category.id);
    setFormData({ 
      nameLv: category.nameLv, 
      nameRu: category.nameRu,
      description: category.description || '',
      order: category.order,
    });
    setShowAddForm(false);
    setError(null);
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nameLv.trim() || !formData.nameRu.trim()) {
      setError(language === 'ru' ? 'Заполните оба поля (латышский и русский)' : 'Aizpildiet abus laukus (latviešu un krievu)');
      return;
    }

    if (editingId) {
      try {
        updateCategory({
          id: editingId,
          name: language === 'ru' ? formData.nameRu : formData.nameLv,
          nameLv: formData.nameLv.trim(),
          nameRu: formData.nameRu.trim(),
          description: formData.description.trim(),
          order: formData.order || 999,
        });
        setEditingId(null);
        setFormData({ nameLv: '', nameRu: '', description: '', order: 999 });
      } catch (err) {
        setError(language === 'ru' ? 'Ошибка при обновлении категории' : 'Kļūda atjauninot kategoriju');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ nameLv: '', nameRu: '', description: '', order: 999 });
    setError(null);
  };

  const handleDelete = (id: string, category: PurchaseCategory) => {
    const message = language === 'ru' 
      ? `Вы уверены, что хотите удалить категорию "${category.nameRu}"?`
      : `Vai tiešām vēlaties dzēst kategoriju "${category.nameLv}"?`;
    
    if (confirm(message)) {
      try {
        deleteCategory(id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (errorMessage.includes('last category')) {
          setError(language === 'ru' 
            ? 'Невозможно удалить последнюю категорию. Должна остаться хотя бы одна категория.'
            : 'Nevar dzēst pēdējo kategoriju. Jābūt vismaz vienai kategorijai.');
        } else {
          setError(language === 'ru' ? 'Ошибка при удалении категории' : 'Kļūda dzēšot kategoriju');
        }
      }
    }
  };

  const moveUp = (category: PurchaseCategory) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index > 0) {
      const prevCategory = categories[index - 1];
      updateCategory({ ...category, order: prevCategory.order });
      updateCategory({ ...prevCategory, order: category.order });
    }
  };

  const moveDown = (category: PurchaseCategory) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index < categories.length - 1) {
      const nextCategory = categories[index + 1];
      updateCategory({ ...category, order: nextCategory.order });
      updateCategory({ ...nextCategory, order: category.order });
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>
          {language === 'ru' ? 'Категории закупок' : 'Pirkumu kategorijas'}
        </h2>
        {!showAddForm && !editingId && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setFormData({ nameLv: '', nameRu: '', description: '', order: 999 });
            }}
            disabled={loading}
          >
            + {language === 'ru' ? 'Добавить категорию' : 'Pievienot kategoriju'}
          </button>
        )}
      </div>

      {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

      {(showAddForm || editingId) && (
        <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>
            {editingId 
              ? (language === 'ru' ? 'Редактировать категорию' : 'Rediģēt kategoriju')
              : (language === 'ru' ? 'Добавить категорию' : 'Pievienot kategoriju')
            }
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                {language === 'ru' ? 'Название (Latviešu):' : 'Nosaukums (Latviešu):'}
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.nameLv}
                onChange={(e) => setFormData({ ...formData, nameLv: e.target.value })}
                placeholder={language === 'ru' ? 'Краски и химия' : 'Krāsas un ķīmija'}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                {language === 'ru' ? 'Название (Русский):' : 'Nosaukums (Krievu):'}
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.nameRu}
                onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                placeholder="Краски и химия"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                {language === 'ru' ? 'Описание (необязательно):' : 'Apraksts (neobligāts):'}
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'ru' ? 'Краски, осветлители, оксиды...' : 'Krāsas, balinātāji, oksīdi...'}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editingId 
                  ? (language === 'ru' ? 'Сохранить' : 'Saglabāt')
                  : (language === 'ru' ? 'Добавить' : 'Pievienot')
                }
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                {language === 'ru' ? 'Отмена' : 'Atcelt'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {categories.length === 0 && !loading && (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
            {language === 'ru' ? 'Нет категорий. Добавьте первую категорию.' : 'Nav kategoriju. Pievienojiet pirmo kategoriju.'}
          </p>
        )}
        {categories.map((category, index) => (
          <div
            key={category.id}
            style={{
              padding: '12px 16px',
              background: editingId === category.id ? '#fef3c7' : '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {language === 'ru' ? category.nameRu : category.nameLv}
              </div>
              {category.description && (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {category.description}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                className="btn btn-secondary"
                onClick={() => moveUp(category)}
                disabled={index === 0 || loading}
                style={{ padding: '6px 12px', fontSize: '14px' }}
                title={language === 'ru' ? 'Переместить вверх' : 'Pārvietot uz augšu'}
              >
                ↑
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => moveDown(category)}
                disabled={index === categories.length - 1 || loading}
                style={{ padding: '6px 12px', fontSize: '14px' }}
                title={language === 'ru' ? 'Переместить вниз' : 'Pārvietot uz leju'}
              >
                ↓
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleEdit(category)}
                disabled={loading}
                style={{ padding: '6px 12px', fontSize: '14px' }}
              >
                {language === 'ru' ? 'Редактировать' : 'Rediģēt'}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(category.id, category)}
                disabled={loading || categories.length === 1}
                style={{ padding: '6px 12px', fontSize: '14px' }}
              >
                {language === 'ru' ? 'Удалить' : 'Dzēst'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
