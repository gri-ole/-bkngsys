/**
 * Утилиты для валидации данных
 */

/**
 * Валидация телефона (базовая проверка)
 */
export function validatePhone(phone: string): boolean {
  // Удаляем все нецифровые символы кроме +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Проверяем, что есть хотя бы 10 цифр
  return cleaned.replace(/\+/g, '').length >= 10;
}

/**
 * Валидация email (базовая проверка)
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидация даты (проверка, что дата не в прошлом)
 */
export function validateFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Форматирование телефона для отображения
 */
export function formatPhone(phone: string): string {
  // Простое форматирование: +7 (999) 123-45-67
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
}
