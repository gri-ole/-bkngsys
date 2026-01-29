/**
 * Модель записи клиента
 * Каждая запись соответствует строке в Google Sheet
 */
export type RecordStatus = 'new' | 'confirmed' | 'cancelled';
export type RecordSource = 'client' | 'master';
export type PaymentMethod = 'cash' | 'card' | '';

export interface Record {
  id: string;
  clientName: string;
  phone: string;
  socialMedia?: string; // Instagram или другая соц. сеть
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (только часы, без минут)
  comment?: string;
  status: RecordStatus;
  source: RecordSource;
  amount?: number; // Сумма оплаты
  paymentMethod?: PaymentMethod; // Способ оплаты
  createdAt?: string; // ISO timestamp
}

/**
 * Данные для создания новой записи (без id и служебных полей)
 */
export interface CreateRecordData {
  clientName: string;
  phone: string;
  socialMedia?: string;
  service: string;
  date: string;
  time: string;
  comment?: string;
  status?: RecordStatus;
  source: RecordSource;
  amount?: number;
  paymentMethod?: PaymentMethod;
}

/**
 * Данные для обновления записи (все поля опциональны, кроме id)
 */
export interface UpdateRecordData {
  id: string;
  clientName?: string;
  phone?: string;
  socialMedia?: string;
  service?: string;
  date?: string;
  time?: string;
  comment?: string;
  status?: RecordStatus;
  source?: RecordSource;
  amount?: number;
  paymentMethod?: PaymentMethod;
}
