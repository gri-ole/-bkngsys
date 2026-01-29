/**
 * Утилиты для работы с услугами
 */

import { Service } from '@/hooks/useServices';

/**
 * Получает список услуг с переводами на основе текущего языка
 */
export function getServices(
  services: Service[],
  language: 'lv' | 'ru'
): Array<{ key: string; label: string }> {
  return services.map((service) => ({
    key: service.id,
    label: language === 'lv' ? service.nameLv : service.nameRu,
  }));
}

/**
 * Получает название услуги по ID на основе текущего языка
 */
export function getServiceLabel(
  serviceId: string,
  services: Service[],
  language: 'lv' | 'ru'
): string {
  const service = services.find((s) => s.id === serviceId);
  if (service) {
    return language === 'lv' ? service.nameLv : service.nameRu;
  }
  // Fallback для старых данных, которые могут быть сохранены как строки
  return serviceId;
}
