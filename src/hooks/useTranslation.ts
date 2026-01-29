/**
 * Hook для работы с переводами
 * Для админа (/admin) - русский язык
 * Для booking (/booking) - латышский язык
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export type Language = 'lv' | 'ru';

// Загружаем переводы динамически
const translations: Record<Language, () => Promise<Record<string, any>>> = {
  lv: () => import('@/locales/lv.json'),
  ru: () => import('@/locales/ru.json'),
};

let cachedTranslations: Record<Language, Record<string, any> | null> = {
  lv: null,
  ru: null,
};

// Базовые переводы для fallback (чтобы избежать белого экрана)
const fallbackTranslations: Record<string, any> = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
  },
  booking: {
    title: 'Online Booking',
    form: {
      clientName: 'Your name',
      phone: 'Phone',
      service: 'Service',
      date: 'Date',
      time: 'Time',
    },
  },
};

/**
 * Определяет язык на основе пути
 * /admin -> ru (русский)
 * /booking или другие -> lv (латышский)
 */
function getLanguageFromPath(pathname: string): Language {
  if (pathname.startsWith('/admin')) {
    return 'ru';
  }
  return 'lv';
}

export function useTranslation() {
  const pathname = usePathname();
  const language = getLanguageFromPath(pathname || '');

  // Инициализируем с fallback переводами, чтобы избежать белого экрана
  const [t, setT] = useState<Record<string, any>>(fallbackTranslations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      // Пропускаем загрузку на сервере
      if (typeof window === 'undefined') {
        return;
      }

      setLoading(true);
      try {
        // Обновляем lang атрибут в html
        if (document.documentElement) {
          document.documentElement.lang = language;
        }

        // Используем кеш, если есть
        if (cachedTranslations[language]) {
          // Создаем новый объект, чтобы React увидел изменение
          setT({ ...cachedTranslations[language]! });
          setLoading(false);
          return;
        }

        // Загружаем переводы
        const translationModule = await translations[language]();
        const translationsData = translationModule.default || translationModule;
        
        // Проверяем, что данные валидны
        if (!translationsData || typeof translationsData !== 'object') {
          throw new Error('Invalid translation data received');
        }
        
        cachedTranslations[language] = translationsData;
        // Создаем новый объект, чтобы React увидел изменение
        setT({ ...translationsData });
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback на латышский, если загрузка не удалась
        if (language !== 'lv' && cachedTranslations.lv) {
          setT({ ...cachedTranslations.lv });
        } else {
          // Используем fallback переводы
          setT({ ...fallbackTranslations });
        }
      } finally {
        setLoading(false);
      }
    };

    // Небольшая задержка для обеспечения правильной инициализации
    const timer = setTimeout(() => {
      loadTranslations();
    }, 0);

    return () => clearTimeout(timer);
  }, [language]);

  // Функция для получения перевода по пути (например, 'booking.title')
  // Используем language в зависимостях, чтобы функция обновлялась при смене языка
  const getTranslation = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Защита от пустого объекта переводов
      if (!t || typeof t !== 'object' || Object.keys(t).length === 0) {
        return key;
      }

      const keys = key.split('.');
      let value: any = t;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // Возвращаем ключ, если перевод не найден
        }
      }

      if (typeof value !== 'string') {
        return key;
      }

      // Замена параметров в строке (например, {name} -> значение)
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match;
        });
      }

      return value;
    },
    [t] // t уже включает language, дополнительная зависимость не нужна
  );

  return {
    t: getTranslation,
    language,
    loading,
  };
}
