/**
 * Сервис для работы с Google Sheets API
 * Инкапсулирует всю логику взаимодействия с Google Sheets
 */

import { google } from 'googleapis';
import { Record, CreateRecordData, UpdateRecordData } from '@/models/Record';

// Конфигурация из environment variables
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const RANGE = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A2:M';

/**
 * Инициализация Google Sheets API клиента
 */
function getSheetsClient() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google Service Account credentials not configured');
  }

  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Преобразование строки из Google Sheet в объект Record
 * Формат строки: [id, clientName, phone, socialMedia, service, date, time, comment, status, source, amount, paymentMethod, createdAt]
 */
function rowToRecord(row: any[], rowIndex: number): Record {
  // Защита от пустых строк и некорректных данных
  const safeRow = Array.isArray(row) ? row : [];
  
  // Google Sheets API может не возвращать пустые колонки в конце строки
  // Поэтому расширяем массив до нужной длины (13 колонок: A-M)
  // Индексы: 0=A, 1=B, 2=C, 3=D, 4=E, 5=F, 6=G, 7=H, 8=I, 9=J, 10=K, 11=L, 12=M
  const extendedRow: any[] = [...safeRow];
  while (extendedRow.length < 13) {
    extendedRow.push('');
  }
  
  // Проверяем, является ли строка пустой (все поля пустые или только пробелы)
  const isEmpty = extendedRow.every((cell, idx) => {
    // Пропускаем проверку для индексов, которые могут быть пустыми (socialMedia, comment, amount, paymentMethod, createdAt)
    if (idx === 3 || idx === 7 || idx === 10 || idx === 11 || idx === 12) return true;
    const value = String(cell || '').trim();
    return value === '';
  });
  
  // Если строка пустая, возвращаем запись с пустыми полями (будет отфильтрована позже)
  if (isEmpty) {
    return {
      id: `row-${rowIndex + 2}`,
      clientName: '',
      phone: '',
      socialMedia: '',
      service: '',
      date: '',
      time: '',
      comment: '',
      status: 'new',
      source: 'client',
      amount: undefined,
      paymentMethod: '',
      createdAt: undefined,
    };
  }
  
  // Валидация статуса (колонка I, индекс 8)
  const validStatuses: Record['status'][] = ['new', 'confirmed', 'cancelled'];
  const statusValue = extendedRow[8] ? String(extendedRow[8]).trim().toLowerCase() : 'new';
  const status = validStatuses.includes(statusValue as Record['status'])
    ? (statusValue as Record['status'])
    : 'new';
  
  // Валидация источника (колонка J, индекс 9)
  const validSources: Record['source'][] = ['client', 'master'];
  const sourceValue = extendedRow[9] ? String(extendedRow[9]).trim().toLowerCase() : 'client';
  const source = validSources.includes(sourceValue as Record['source'])
    ? (sourceValue as Record['source'])
    : 'client';
  
  // Валидация способа оплаты (колонка L, индекс 11)
  const validPaymentMethods: Record['paymentMethod'][] = ['cash', 'card', ''];
  const paymentMethodCell = extendedRow[11];
  const paymentMethodValue = paymentMethodCell !== undefined && paymentMethodCell !== null && paymentMethodCell !== ''
    ? String(paymentMethodCell).trim().toLowerCase()
    : '';
  const paymentMethod = validPaymentMethods.includes(paymentMethodValue as Record['paymentMethod'])
    ? (paymentMethodValue as Record['paymentMethod'])
    : '';

  // Обработка createdAt (колонка M, индекс 12)
  const createdAtCell = extendedRow[12];
  const createdAt = createdAtCell && String(createdAtCell).trim() !== '' 
    ? String(createdAtCell).trim() 
    : undefined;
  
  // Обработка суммы (колонка K, индекс 10)
  let amount: number | undefined = undefined;
  const amountCell = extendedRow[10];
  if (amountCell !== undefined && amountCell !== null && amountCell !== '') {
    const amountStr = String(amountCell).trim();
    if (amountStr !== '') {
      const parsed = parseFloat(amountStr);
      if (!isNaN(parsed) && parsed >= 0) {
        amount = parsed;
      }
    }
  }

  const record = {
    id: String(extendedRow[0] || `row-${rowIndex + 2}`).trim(),
    clientName: String(extendedRow[1] || '').trim(),
    phone: String(extendedRow[2] || '').trim(),
    socialMedia: String(extendedRow[3] || '').trim(),
    service: String(extendedRow[4] || '').trim(),
    date: String(extendedRow[5] || '').trim(),
    time: String(extendedRow[6] || '').trim(),
    comment: String(extendedRow[7] || '').trim(),
    status,
    source,
    amount,
    paymentMethod,
    createdAt,
  };

  return record;
}

/**
 * Преобразование объекта Record в массив для записи в Google Sheet
 */
function recordToRow(record: Record | CreateRecordData): any[] {
  const status = 'status' in record ? record.status : 'new';
  const source = 'source' in record ? record.source : 'client';
  const id = 'id' in record ? record.id : '';

  // Обработка amount: сохраняем как число или пустую строку
  let amountValue = '';
  if (record.amount !== undefined && record.amount !== null) {
    const numAmount = Number(record.amount);
    if (!isNaN(numAmount) && numAmount >= 0) {
      amountValue = String(numAmount);
    }
  }

  // Обработка paymentMethod: сохраняем как строку или пустую строку
  const paymentMethodValue = record.paymentMethod || '';
  
  // Обработка createdAt: сохраняем ISO timestamp или пустую строку
  const createdAtValue = 'createdAt' in record && record.createdAt ? record.createdAt : '';

  const row = [
    id,
    record.clientName || '',
    record.phone || '',
    record.socialMedia || '',
    record.service || '',
    record.date || '',
    record.time || '',
    record.comment || '',
    status,
    source,
    amountValue,
    paymentMethodValue,
    createdAtValue,
  ];

  return row;
}

/**
 * Генерация уникального ID для новой записи
 */
function generateId(): string {
  return `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Получить все записи из Google Sheet
 */
export async function fetchRecords(): Promise<Record[]> {
  try {
    const sheets = getSheetsClient();

    if (!SPREADSHEET_ID) {
      throw new Error('Google Sheets Spreadsheet ID not configured');
    }

    // Используем majorDimension: 'ROWS' чтобы гарантировать получение всех колонок
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueRenderOption: 'UNFORMATTED_VALUE', // Получаем значения без форматирования
      majorDimension: 'ROWS',
    });

    const rows = response.data.values || [];

    // Преобразуем строки в записи и фильтруем пустые
    const allRecords = rows.map((row, index) => {
      const record = rowToRecord(row, index);
      return { record, rowIndex: index + 2, originalRow: row };
    });

    // Фильтруем записи, у которых нет обязательных полей
    // Считаем запись валидной, если есть хотя бы одно из основных полей
    const records = allRecords
      .filter(({ record, rowIndex, originalRow }) => {
        const hasClientName = record.clientName.trim() !== '';
        const hasPhone = record.phone.trim() !== '';
        const hasService = record.service.trim() !== '';
        const hasDate = record.date.trim() !== '';
        
        // Запись считается валидной, если есть хотя бы одно из основных полей
        const hasData = hasClientName || hasPhone || hasService || hasDate;
        
        return hasData;
      })
      .map(({ record }) => record);

    return records;
  } catch (error) {
    console.error('Error fetching records:', error);
    throw new Error('Failed to fetch records from Google Sheets');
  }
}

/**
 * Добавить новую запись в Google Sheet
 */
export async function addRecord(data: CreateRecordData): Promise<Record> {
  try {
    const sheets = getSheetsClient();

    if (!SPREADSHEET_ID) {
      throw new Error('Google Sheets Spreadsheet ID not configured');
    }

    const newRecord: Record = {
      ...data,
      id: generateId(),
      status: data.status || 'new',
      createdAt: new Date().toISOString(),
    };

    const row = recordToRow(newRecord);

    // Добавляем строку в конец таблицы
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    return newRecord;
  } catch (error) {
    console.error('Error adding record:', error);
    throw new Error('Failed to add record to Google Sheets');
  }
}

/**
 * Обновить существующую запись в Google Sheet
 */
export async function updateRecord(data: UpdateRecordData): Promise<Record> {
  try {
    const sheets = getSheetsClient();

    if (!SPREADSHEET_ID) {
      throw new Error('Google Sheets Spreadsheet ID not configured');
    }

    // Сначала получаем все записи, чтобы найти нужную
    const records = await fetchRecords();
    const recordIndex = records.findIndex((r) => r.id === data.id);

    if (recordIndex === -1) {
      throw new Error(`Record with id ${data.id} not found`);
    }

    const existingRecord = records[recordIndex];
    
    // Важно: явно сохраняем все поля, включая финансовые данные
    // Если поле не передано в data, используем значение из existingRecord
    const updatedRecord: Record = {
      ...existingRecord,
      ...data,
      // Явно сохраняем amount и paymentMethod, даже если они undefined
      amount: data.amount !== undefined ? data.amount : existingRecord.amount,
      paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod : existingRecord.paymentMethod,
    };

    const row = recordToRow(updatedRecord);
    // rowIndex + 2 потому что начинаем с A2 (A1 - заголовки)
    const rowNumber = recordIndex + 2;

    // Обновляем строку (A-M = 13 колонок)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${rowNumber}:M${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    return updatedRecord;
  } catch (error) {
    console.error('Error updating record:', error);
    throw new Error('Failed to update record in Google Sheets');
  }
}

/**
 * Удалить запись из Google Sheet
 */
export async function deleteRecord(recordId: string): Promise<void> {
  try {
    const sheets = getSheetsClient();

    if (!SPREADSHEET_ID) {
      throw new Error('Google Sheets Spreadsheet ID not configured');
    }

    // Получаем метаданные таблицы для определения sheetId
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    // Получаем имя листа из RANGE (например, "Sheet1" из "Sheet1!A2:K")
    const sheetName = RANGE.split('!')[0] || 'Sheet1';
    
    // Находим sheetId по имени листа
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );

    if (!sheet || !sheet.properties?.sheetId) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    const sheetId = sheet.properties.sheetId;

    // Получаем все записи, чтобы найти нужную
    const records = await fetchRecords();
    const recordIndex = records.findIndex((r) => r.id === recordId);

    if (recordIndex === -1) {
      throw new Error(`Record with id ${recordId} not found`);
    }

    // rowIndex + 2 потому что начинаем с A2 (A1 - заголовки)
    // В Google Sheets API индексы начинаются с 0, но строки начинаются с 1
    // Если recordIndex = 0, то это строка 2 в таблице (индекс 1 в API)
    const rowNumber = recordIndex + 2;
    const rowIndex = rowNumber - 1; // Конвертируем номер строки в индекс (1-based -> 0-based)

    // Удаляем строку
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1, // Удаляем одну строку
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    // Более детальное сообщение об ошибке
    if (error instanceof Error) {
      throw new Error(`Failed to delete record from Google Sheets: ${error.message}`);
    }
    throw new Error('Failed to delete record from Google Sheets');
  }
}
