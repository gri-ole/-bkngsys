/**
 * Сервис для работы с закупками через Google Sheets API
 */

import { google } from 'googleapis';
import { Purchase, CreatePurchaseData, UpdatePurchaseData } from '@/models/Purchase';

const SHEET_NAME = 'Purchases';

// Получаем Google Sheets клиент
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// Преобразование строки в объект Purchase
function rowToPurchase(row: any[]): Purchase {
  return {
    id: row[0] || '',
    categoryId: row[1] || '',
    name: row[2] || '',
    amount: parseFloat(row[3]) || 0,
    date: row[4] || '',
    description: row[5] || '',
    supplier: row[6] || '',
    createdAt: row[7] || new Date().toISOString(),
  };
}

// Преобразование объекта в строку для Google Sheets
function purchaseToRow(purchase: Partial<Purchase>): any[] {
  return [
    purchase.id || '',
    purchase.categoryId || '',
    purchase.name || '',
    purchase.amount || 0,
    purchase.date || '',
    purchase.description || '',
    purchase.supplier || '',
    purchase.createdAt || new Date().toISOString(),
  ];
}

// Получить все закупки
export async function fetchPurchases(): Promise<Purchase[]> {
  try {
    const sheets = await getSheets();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:H`,
    });

    const rows = response.data.values || [];
    return rows.map(rowToPurchase).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching purchases:', error);
    throw new Error('Failed to fetch purchases from Google Sheets');
  }
}

// Добавить закупку
export async function addPurchase(data: CreatePurchaseData): Promise<Purchase> {
  try {
    const sheets = await getSheets();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const newPurchase: Purchase = {
      id: `pur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [purchaseToRow(newPurchase)],
      },
    });

    return newPurchase;
  } catch (error) {
    console.error('Error adding purchase:', error);
    throw new Error('Failed to add purchase to Google Sheets');
  }
}

// Обновить закупку
export async function updatePurchase(data: UpdatePurchaseData): Promise<Purchase> {
  try {
    const sheets = await getSheets();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // Найти строку с нужным ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:H`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === data.id);

    if (rowIndex === -1) {
      throw new Error('Purchase not found');
    }

    const existingPurchase = rowToPurchase(rows[rowIndex]);
    const updatedPurchase: Purchase = {
      ...existingPurchase,
      ...data,
    };

    // Обновить строку
    const sheetRow = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A${sheetRow}:H${sheetRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [purchaseToRow(updatedPurchase)],
      },
    });

    return updatedPurchase;
  } catch (error) {
    console.error('Error updating purchase:', error);
    throw new Error('Failed to update purchase in Google Sheets');
  }
}

// Удалить закупку
export async function deletePurchase(id: string): Promise<void> {
  try {
    const sheets = await getSheets();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // Найти строку
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:H`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      throw new Error('Purchase not found');
    }

    // Получить sheet ID
    const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = sheetMetadata.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
    const sheetId = sheet?.properties?.sheetId;

    if (sheetId === undefined) {
      throw new Error('Sheet not found');
    }

    // Удалить строку
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex + 1,
                endIndex: rowIndex + 2,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    throw new Error('Failed to delete purchase from Google Sheets');
  }
}

// Получить закупки по категории
export async function fetchPurchasesByCategory(categoryId: string): Promise<Purchase[]> {
  const allPurchases = await fetchPurchases();
  return allPurchases.filter(p => p.categoryId === categoryId);
}
