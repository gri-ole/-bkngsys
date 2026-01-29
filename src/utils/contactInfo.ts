/**
 * Утилиты для работы с контактной информацией
 */

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  instagram: string;
  showInBooking: boolean;
}

const STORAGE_KEY = 'contactInfo';

const DEFAULT_CONTACT_INFO: ContactInfo = {
  address: '',
  phone: '',
  email: '',
  instagram: '',
  showInBooking: true,
};

/**
 * Получает контактную информацию из localStorage
 */
export function getContactInfo(): ContactInfo {
  if (typeof window === 'undefined') {
    return DEFAULT_CONTACT_INFO;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading contact info:', error);
  }

  return DEFAULT_CONTACT_INFO;
}

/**
 * Сохраняет контактную информацию в localStorage
 */
export function saveContactInfo(contactInfo: ContactInfo): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contactInfo));
  } catch (error) {
    console.error('Error saving contact info:', error);
    throw error;
  }
}
