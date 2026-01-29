/**
 * Custom hook для работы с записями
 * Управляет состоянием и операциями CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import { Record, CreateRecordData, UpdateRecordData } from '@/models/Record';

interface UseRecordsReturn {
  records: Record[];
  loading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  addRecord: (data: CreateRecordData) => Promise<Record>;
  updateRecord: (data: UpdateRecordData) => Promise<Record>;
  deleteRecord: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRecords(): UseRecordsReturn {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/records');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch records');
      }
      const data = await response.json();
      // Валидация данных
      if (Array.isArray(data)) {
        setRecords(data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addRecord = useCallback(async (data: CreateRecordData): Promise<Record> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add record');
      }
      const newRecord = await response.json();
      if (!newRecord || !newRecord.id) {
        throw new Error('Invalid record data received');
      }
      setRecords((prev) => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRecord = useCallback(async (data: UpdateRecordData): Promise<Record> => {
    setLoading(true);
    setError(null);
    try {
      if (!data.id) {
        throw new Error('Record ID is required');
      }
      const response = await fetch(`/api/records/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update record');
      }
      const updatedRecord = await response.json();
      if (!updatedRecord || !updatedRecord.id) {
        throw new Error('Invalid record data received');
      }
      setRecords((prev) =>
        prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
      );
      return updatedRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRecord = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      if (!id) {
        throw new Error('Record ID is required');
      }
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete record');
      }
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh,
  };
}
