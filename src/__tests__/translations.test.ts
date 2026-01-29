/**
 * Тесты для проверки полноты переводов
 */

import lvTranslations from '@/locales/lv.json';
import ruTranslations from '@/locales/ru.json';

// Функция для получения всех ключей из объекта рекурсивно
function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }

  return keys;
}

describe('Translations completeness', () => {
  it('должен иметь одинаковую структуру ключей в обоих языках', () => {
    const lvKeys = getAllKeys(lvTranslations).sort();
    const ruKeys = getAllKeys(ruTranslations).sort();

    expect(lvKeys).toEqual(ruKeys);
  });

  it('должен иметь все необходимые ключи для booking', () => {
    const requiredKeys = [
      'booking.title',
      'booking.form.clientName',
      'booking.form.phone',
      'booking.form.service',
      'booking.form.date',
      'booking.form.time',
      'booking.form.comment',
      'booking.form.submit',
      'booking.validation.nameRequired',
      'booking.validation.phoneRequired',
      'booking.validation.serviceRequired',
      'booking.validation.dateRequired',
      'booking.validation.timeRequired',
      'booking.success.title',
      'booking.success.message',
      'booking.success.newBooking',
    ];

    const lvKeys = getAllKeys(lvTranslations);
    const ruKeys = getAllKeys(ruTranslations);

    requiredKeys.forEach((key) => {
      expect(lvKeys).toContain(key);
      expect(ruKeys).toContain(key);
    });
  });

  it('должен иметь все необходимые ключи для admin', () => {
    const requiredKeys = [
      'admin.title',
      'admin.login.title',
      'admin.login.password',
      'admin.login.login',
      'admin.records.title',
      'admin.records.addRecord',
      'admin.records.editRecord',
      'admin.records.status.new',
      'admin.records.status.confirmed',
      'admin.records.status.cancelled',
      'admin.stats.overview',
      'admin.stats.totalRecords',
      'admin.stats.totalRevenue',
    ];

    const lvKeys = getAllKeys(lvTranslations);
    const ruKeys = getAllKeys(ruTranslations);

    requiredKeys.forEach((key) => {
      expect(lvKeys).toContain(key);
      expect(ruKeys).toContain(key);
    });
  });

  it('должен иметь все необходимые ключи для common', () => {
    const requiredKeys = [
      'common.loading',
      'common.error',
      'common.cancel',
      'common.save',
      'common.delete',
      'common.edit',
      'common.add',
    ];

    const lvKeys = getAllKeys(lvTranslations);
    const ruKeys = getAllKeys(ruTranslations);

    requiredKeys.forEach((key) => {
      expect(lvKeys).toContain(key);
      expect(ruKeys).toContain(key);
    });
  });

  it('должен иметь переводы для всех услуг', () => {
    const serviceKeys = [
      'booking.services.haircut',
      'booking.services.coloring',
      'booking.services.styling',
      'booking.services.manicure',
      'booking.services.pedicure',
      'booking.services.massage',
      'booking.services.cosmetology',
      'booking.services.other',
    ];

    const lvKeys = getAllKeys(lvTranslations);
    const ruKeys = getAllKeys(ruTranslations);

    serviceKeys.forEach((key) => {
      expect(lvKeys).toContain(key);
      expect(ruKeys).toContain(key);
    });
  });

  it('должен иметь переводы для всех способов оплаты', () => {
    const paymentKeys = [
      'admin.records.paymentMethod.notSpecified',
      'admin.records.paymentMethod.cash',
      'admin.records.paymentMethod.card',
    ];

    const lvKeys = getAllKeys(lvTranslations);
    const ruKeys = getAllKeys(ruTranslations);

    paymentKeys.forEach((key) => {
      expect(lvKeys).toContain(key);
      expect(ruKeys).toContain(key);
    });
  });
});
