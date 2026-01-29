/**
 * Утилиты для работы с паролем администратора
 * Пароль хранится в файле .password.json в корне проекта
 */

import fs from 'fs';
import path from 'path';

const PASSWORD_FILE = path.join(process.cwd(), '.password.json');

interface PasswordData {
  password: string;
  updatedAt: string;
}

/**
 * Инициализация файла с паролем
 * Создает файл, если его нет, и записывает пароль из .env.local
 */
function initPasswordFile(): void {
  if (!fs.existsSync(PASSWORD_FILE)) {
    const initialPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const data: PasswordData = {
      password: initialPassword,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(PASSWORD_FILE, JSON.stringify(data, null, 2));
  }
}

/**
 * Получить текущий пароль администратора
 */
export function getAdminPassword(): string {
  try {
    initPasswordFile();
    const fileContent = fs.readFileSync(PASSWORD_FILE, 'utf-8');
    const data: PasswordData = JSON.parse(fileContent);
    return data.password;
  } catch (error) {
    console.error('Error reading password file:', error);
    // Fallback на переменную окружения
    return process.env.ADMIN_PASSWORD || '';
  }
}

/**
 * Установить новый пароль администратора
 */
export function setAdminPassword(newPassword: string): void {
  const data: PasswordData = {
    password: newPassword,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(PASSWORD_FILE, JSON.stringify(data, null, 2));
}

/**
 * Проверить, существует ли файл с паролем
 */
export function passwordFileExists(): boolean {
  return fs.existsSync(PASSWORD_FILE);
}
