/**
 * Утилиты для работы с паролем администратора
 * В production (Vercel) пароль берется из environment variables
 * Для смены пароля нужно обновить переменную ADMIN_PASSWORD в Vercel Dashboard
 */

/**
 * Получить текущий пароль администратора
 * Всегда берет из environment variable ADMIN_PASSWORD
 */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || '';
}

/**
 * Установить новый пароль администратора
 * В serverless окружении (Vercel) файловая система read-only,
 * поэтому изменение пароля через API не поддерживается.
 * Для смены пароля обновите переменную ADMIN_PASSWORD в Vercel Dashboard.
 */
export function setAdminPassword(newPassword: string): void {
  throw new Error(
    'Password change is not supported in serverless environment. ' +
    'Please update ADMIN_PASSWORD environment variable in Vercel Dashboard.'
  );
}

/**
 * Проверить, настроен ли пароль
 */
export function passwordFileExists(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}
