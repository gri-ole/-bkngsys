/**
 * Модель категории закупок
 */

export interface PurchaseCategory {
  id: string;
  name: string;
  nameRu: string;
  nameLv: string;
  description?: string;
  order: number;
  createdAt: string;
}

export interface CreatePurchaseCategoryData {
  name: string;
  nameRu: string;
  nameLv: string;
  description?: string;
  order: number;
}

export interface UpdatePurchaseCategoryData extends CreatePurchaseCategoryData {
  id: string;
}

// Категории по умолчанию для колориста
export const DEFAULT_PURCHASE_CATEGORIES: Omit<PurchaseCategory, 'id' | 'createdAt'>[] = [
  {
    name: 'Краски и химия',
    nameRu: 'Краски и химия',
    nameLv: 'Krāsas un ķīmija',
    description: 'Краски, осветлители, оксиды, тонеры',
    order: 1,
  },
  {
    name: 'Инструменты для окрашивания',
    nameRu: 'Инструменты для окрашивания',
    nameLv: 'Krāsošanas instrumenti',
    description: 'Кисти, миски, расчёски, мерные стаканы',
    order: 2,
  },
  {
    name: 'Защитные и расходные материалы',
    nameRu: 'Защитные и расходные материалы',
    nameLv: 'Aizsargmateriāli un izlietojamie materiāli',
    description: 'Перчатки, фольга, пеньюары, салфетки',
    order: 3,
  },
  {
    name: 'Уход и восстановление',
    nameRu: 'Уход и восстановление',
    nameLv: 'Kopšana un atjaunošana',
    description: 'Маски, бальзамы, уход после окрашивания',
    order: 4,
  },
  {
    name: 'Оборудование и организация',
    nameRu: 'Оборудование и организация',
    nameLv: 'Aprīkojums un organizācija',
    description: 'Органайзеры, таймеры, оборудование',
    order: 5,
  },
];
