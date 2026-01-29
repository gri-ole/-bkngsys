/**
 * Hook для работы с услугами
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Service {
  id: string;
  nameLv: string; // Название на латышском
  nameRu: string; // Название на русском
}

const STORAGE_KEY = 'app_services';

// Услуги по умолчанию
const DEFAULT_SERVICES: Service[] = [
  { id: 'haircut', nameLv: 'Frizūra', nameRu: 'Стрижка' },
  { id: 'coloring', nameLv: 'Krāsošana', nameRu: 'Окрашивание' },
  { id: 'styling', nameLv: 'Sakārtošana', nameRu: 'Укладка' },
  { id: 'manicure', nameLv: 'Manikīrs', nameRu: 'Маникюр' },
  { id: 'pedicure', nameLv: 'Pedikīrs', nameRu: 'Педикюр' },
  { id: 'massage', nameLv: 'Masāža', nameRu: 'Массаж' },
  { id: 'cosmetology', nameLv: 'Kosmetoloģija', nameRu: 'Косметология' },
  { id: 'other', nameLv: 'Cits', nameRu: 'Другое' },
];

export function useServices() {
  // Всегда начинаем с дефолтных услуг для SSR
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Загружаем услуги из localStorage только на клиенте
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setServices(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved services:', e);
        }
      }
    }
    setLoading(false);
  }, []);

  // Сохраняем услуги в localStorage при изменении (только на клиенте)
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    }
  }, [services, isClient]);

  const addService = useCallback((service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setServices((prev) => [...prev, newService]);
    return newService;
  }, []);

  const updateService = useCallback((id: string, updates: Partial<Omit<Service, 'id'>>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const reorderServices = useCallback((newOrder: Service[]) => {
    setServices(newOrder);
  }, []);

  const resetToDefault = useCallback(() => {
    setServices(DEFAULT_SERVICES);
  }, []);

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    reorderServices,
    resetToDefault,
  };
}
