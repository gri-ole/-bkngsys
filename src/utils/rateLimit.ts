/**
 * Простой rate limiter для защиты от спама
 * Ограничивает количество запросов с одного IP адреса
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// Хранилище запросов по IP (in-memory)
const requestStore = new Map<string, RateLimitEntry>();

// Очистка старых записей каждые 10 минут
setInterval(() => {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  
  for (const [ip, entry] of requestStore.entries()) {
    if (now - entry.lastRequest > tenMinutes) {
      requestStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

/**
 * Проверяет, не превышен ли лимит запросов для данного IP
 * @param ip IP адрес клиента
 * @param maxRequests Максимальное количество запросов
 * @param windowMs Временное окно в миллисекундах
 * @returns true если лимит НЕ превышен, false если превышен
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 5, // Максимум 5 запросов
  windowMs: number = 15 * 60 * 1000 // За 15 минут
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = requestStore.get(ip);

  if (!entry) {
    // Первый запрос от этого IP
    requestStore.set(ip, {
      count: 1,
      firstRequest: now,
      lastRequest: now,
    });
    return { allowed: true };
  }

  // Проверяем, не истекло ли временное окно
  const timeSinceFirstRequest = now - entry.firstRequest;
  
  if (timeSinceFirstRequest > windowMs) {
    // Временное окно истекло, начинаем новое
    requestStore.set(ip, {
      count: 1,
      firstRequest: now,
      lastRequest: now,
    });
    return { allowed: true };
  }

  // Проверяем количество запросов
  if (entry.count >= maxRequests) {
    // Лимит превышен
    const retryAfter = Math.ceil((entry.firstRequest + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Увеличиваем счетчик
  entry.count++;
  entry.lastRequest = now;
  requestStore.set(ip, entry);

  return { allowed: true };
}

/**
 * Получает IP адрес клиента из запроса
 * @param request Next.js Request object
 * @returns IP адрес
 */
export function getClientIp(request: Request): string {
  // Проверяем различные заголовки для получения реального IP
  const headers = request.headers;
  
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for может содержать несколько IP через запятую
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback на localhost для development
  return '127.0.0.1';
}

/**
 * Сбрасывает счетчик для IP (например, после успешной записи)
 * @param ip IP адрес
 */
export function resetRateLimit(ip: string): void {
  requestStore.delete(ip);
}
