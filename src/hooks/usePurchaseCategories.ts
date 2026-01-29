/**
 * Хук для работы с категориями закупок (localStorage)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PurchaseCategory, DEFAULT_PURCHASE_CATEGORIES } from '@/models/PurchaseCategory';

const STORAGE_KEY = 'app_purchase_categories';

// Преобразуем DEFAULT_PURCHASE_CATEGORIES в полные объекты с ID
const getDefaultCategories = (): PurchaseCategory[] => {
  return DEFAULT_PURCHASE_CATEGORIES.map((cat, index) => ({
    id: `cat_default_${index + 1}`,
    ...cat,
    createdAt: new Date().toISOString(),
  }));
};

export function usePurchaseCategories() {
  const [categories, setCategories] = useState<PurchaseCategory[]>(getDefaultCategories());
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Загружаем категории из localStorage только на клиенте
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved categories:', e);
        }
      }
    }
    setLoading(false);
  }, []);

  // Сохраняем категории в localStorage при изменении
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories, isClient]);

  const addCategory = useCallback((data: { name: string; nameRu: string; nameLv: string; description?: string; order: number }) => {
    const newCategory: PurchaseCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory].sort((a, b) => a.order - b.order));
    return newCategory;
  }, []);

  const updateCategory = useCallback((data: { id: string; name: string; nameRu: string; nameLv: string; description?: string; order: number }) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === data.id ? { ...cat, ...data } : cat)).sort((a, b) => a.order - b.order)
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const remaining = prev.filter((cat) => cat.id !== id);
      // Не позволяем удалить последнюю категорию
      if (remaining.length === 0) {
        throw new Error('Cannot delete the last category');
      }
      return remaining;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setCategories(getDefaultCategories());
  }, []);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefault,
  };
}
