/**
 * Хук для работы с закупками
 */

import { useState, useEffect, useCallback } from 'react';
import { Purchase, CreatePurchaseData, UpdatePurchaseData } from '@/models/Purchase';

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузить закупки
  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/purchases');
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch purchases');
        }
        throw new Error('Failed to fetch purchases');
      }
      
      const data = await response.json();
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавить закупку
  const addPurchase = useCallback(async (data: CreatePurchaseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create purchase');
        }
        throw new Error('Failed to create purchase');
      }

      const newPurchase = await response.json();
      setPurchases((prev) => [newPurchase, ...prev]);
      return newPurchase;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error adding purchase:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновить закупку
  const updatePurchase = useCallback(async (data: UpdatePurchaseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/purchases/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update purchase');
        }
        throw new Error('Failed to update purchase');
      }

      const updatedPurchase = await response.json();
      setPurchases((prev) =>
        prev.map((pur) => (pur.id === data.id ? updatedPurchase : pur))
      );
      return updatedPurchase;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error updating purchase:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удалить закупку
  const deletePurchase = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to delete purchase');
        }
        throw new Error('Failed to delete purchase');
      }

      setPurchases((prev) => prev.filter((pur) => pur.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error deleting purchase:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить закупки при монтировании
  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    purchases,
    loading,
    error,
    fetchPurchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
  };
}
