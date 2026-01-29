/**
 * Модель закупки
 */

export interface Purchase {
  id: string;
  categoryId: string; // ID категории (обязательное поле)
  name: string; // Название закупки
  amount: number; // Сумма закупки
  date: string; // Дата закупки (YYYY-MM-DD)
  description?: string; // Описание/комментарий
  supplier?: string; // Поставщик
  createdAt: string; // Дата создания записи
}

export interface CreatePurchaseData {
  categoryId: string;
  name: string;
  amount: number;
  date: string;
  description?: string;
  supplier?: string;
}

export interface UpdatePurchaseData extends CreatePurchaseData {
  id: string;
}
