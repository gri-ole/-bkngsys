/**
 * Тесты для хука useTranslation
 */

import { renderHook, act, waitFor } from '@testing-library/react';

// Мокаем localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Мокаем document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    lang: 'lv',
  },
  writable: true,
});

describe('useTranslation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    if (document.documentElement) {
      document.documentElement.lang = 'lv';
    }
  });

  it('должен использовать латышский язык по умолчанию', async () => {
    const { useTranslation } = await import('@/hooks/useTranslation');
    const { result } = renderHook(() => useTranslation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.language).toBe('lv');
    expect(result.current.t('common.loading')).toBe('Ielādē...');
    expect(result.current.t('booking.title')).toBe('Tiešsaistes pieraksts');
  });

  it('должен определять язык автоматически (не из localStorage)', async () => {
    localStorageMock.setItem('app_language', 'ru'); // Игнорируется
    const { useTranslation } = await import('@/hooks/useTranslation');
    const { result } = renderHook(() => useTranslation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // Язык определяется по pathname (/, /booking -> lv), не по localStorage
    expect(result.current.language).toBe('lv');
    expect(result.current.t('common.loading')).toBe('Ielādē...');
    expect(result.current.t('booking.title')).toBe('Tiešsaistes pieraksts');
  });

  it('должен определять язык автоматически по пути', async () => {
    const { useTranslation } = await import('@/hooks/useTranslation');
    const { result } = renderHook(() => useTranslation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // По умолчанию язык определяется из pathname (если не /admin, то lv)
    expect(['lv', 'ru']).toContain(result.current.language);
  });

  it('должен возвращать ключ, если перевод не найден', async () => {
    const { useTranslation } = await import('@/hooks/useTranslation');
    const { result } = renderHook(() => useTranslation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('должен обрабатывать вложенные ключи', async () => {
    const { useTranslation } = await import('@/hooks/useTranslation');
    const { result } = renderHook(() => useTranslation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.t('booking.form.clientName')).toBe('Jūsu vārds');
  });

  it('должен определять язык автоматически по пути', async () => {
    const { useTranslation } = await import('@/hooks/useTranslation');
    const { result } = renderHook(() => useTranslation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    // Язык определяется по pathname, не сохраняется в localStorage
    expect(result.current.language).toBe('lv');
  });
});
