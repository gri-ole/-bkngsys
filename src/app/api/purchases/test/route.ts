/**
 * Диагностический endpoint для проверки настройки Google Sheets для закупок
 */

import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: [],
    };

    // 1. Проверка переменных окружения
    diagnostics.checks.push({
      name: '1. Переменные окружения',
      status: 'checking',
    });

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId) {
      diagnostics.checks[0].status = 'error';
      diagnostics.checks[0].message = 'GOOGLE_SHEETS_SPREADSHEET_ID не найден';
      return NextResponse.json(diagnostics, { status: 500 });
    }

    if (!clientEmail || !privateKey) {
      diagnostics.checks[0].status = 'error';
      diagnostics.checks[0].message = 'CLIENT_EMAIL или PRIVATE_KEY не найдены';
      return NextResponse.json(diagnostics, { status: 500 });
    }

    diagnostics.checks[0].status = 'ok';
    diagnostics.checks[0].spreadsheetId = spreadsheetId;
    diagnostics.checks[0].clientEmail = clientEmail;

    // 2. Подключение к Google Sheets
    diagnostics.checks.push({
      name: '2. Подключение к Google Sheets API',
      status: 'checking',
    });

    let sheets;
    try {
      const auth = new google.auth.JWT(
        clientEmail,
        undefined,
        privateKey.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      sheets = google.sheets({ version: 'v4', auth });
      diagnostics.checks[1].status = 'ok';
    } catch (error: any) {
      diagnostics.checks[1].status = 'error';
      diagnostics.checks[1].message = error.message;
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // 3. Получение метаданных таблицы
    diagnostics.checks.push({
      name: '3. Доступ к таблице и список листов',
      status: 'checking',
    });

    let spreadsheet;
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'properties.title,sheets.properties',
      });
      spreadsheet = response.data;
      diagnostics.checks[2].status = 'ok';
      diagnostics.checks[2].spreadsheetTitle = spreadsheet.properties?.title;
      diagnostics.checks[2].spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      
      const sheetsList = spreadsheet.sheets?.map(s => ({
        name: s.properties?.title,
        id: s.properties?.sheetId,
        index: s.properties?.index,
      })) || [];
      
      diagnostics.checks[2].allSheets = sheetsList;
      diagnostics.checks[2].sheetsCount = sheetsList.length;
    } catch (error: any) {
      diagnostics.checks[2].status = 'error';
      diagnostics.checks[2].message = error.message;
      diagnostics.checks[2].hint = 'Проверьте права доступа для service account';
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // 4. Проверка наличия листа "Purchases"
    diagnostics.checks.push({
      name: '4. Поиск листа "Purchases"',
      status: 'checking',
    });

    const purchasesSheet = spreadsheet.sheets?.find(
      s => s.properties?.title === 'Purchases'
    );

    if (!purchasesSheet) {
      diagnostics.checks[3].status = 'error';
      diagnostics.checks[3].message = 'Лист "Purchases" не найден';
      diagnostics.checks[3].availableSheets = spreadsheet.sheets?.map(s => s.properties?.title);
      diagnostics.checks[3].hint = 'Создайте лист с ТОЧНЫМ названием "Purchases" (с большой буквы P)';
      return NextResponse.json(diagnostics, { status: 404 });
    }

    diagnostics.checks[3].status = 'ok';
    diagnostics.checks[3].sheetId = purchasesSheet.properties?.sheetId;
    diagnostics.checks[3].sheetIndex = purchasesSheet.properties?.index;

    // 5. Чтение заголовков
    diagnostics.checks.push({
      name: '5. Проверка заголовков (строка 1)',
      status: 'checking',
    });

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Purchases!A1:H1',
      });

      const headers = response.data.values?.[0] || [];
      diagnostics.checks[4].foundHeaders = headers;
      diagnostics.checks[4].headersCount = headers.length;

      const expectedHeaders = ['ID', 'CategoryID', 'Name', 'Amount', 'Date', 'Description', 'Supplier', 'CreatedAt'];
      diagnostics.checks[4].expectedHeaders = expectedHeaders;

      if (headers.length === 0) {
        diagnostics.checks[4].status = 'error';
        diagnostics.checks[4].message = 'Заголовки не найдены (строка 1 пустая)';
        diagnostics.checks[4].hint = 'Вставьте заголовки в ячейку A1';
        return NextResponse.json(diagnostics, { status: 400 });
      }

      const headersMatch = JSON.stringify(headers) === JSON.stringify(expectedHeaders);
      
      if (!headersMatch) {
        diagnostics.checks[4].status = 'warning';
        diagnostics.checks[4].message = 'Заголовки не совпадают с ожидаемыми';
        diagnostics.checks[4].differences = expectedHeaders.map((expected, i) => ({
          column: String.fromCharCode(65 + i),
          expected,
          found: headers[i] || '(пусто)',
          match: headers[i] === expected,
        }));
      } else {
        diagnostics.checks[4].status = 'ok';
      }
    } catch (error: any) {
      diagnostics.checks[4].status = 'error';
      diagnostics.checks[4].message = error.message;
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // 6. Чтение данных (если есть)
    diagnostics.checks.push({
      name: '6. Чтение данных закупок',
      status: 'checking',
    });

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Purchases!A2:H',
      });

      const rows = response.data.values || [];
      diagnostics.checks[5].status = 'ok';
      diagnostics.checks[5].rowsCount = rows.length;
      diagnostics.checks[5].message = rows.length === 0 
        ? 'Данных пока нет (это нормально для новой таблицы)'
        : `Найдено ${rows.length} записей`;
      
      if (rows.length > 0) {
        diagnostics.checks[5].firstRow = rows[0];
      }
    } catch (error: any) {
      diagnostics.checks[5].status = 'error';
      diagnostics.checks[5].message = error.message;
    }

    // Итоговый статус
    const allOk = diagnostics.checks.every((c: any) => c.status === 'ok');
    const hasWarnings = diagnostics.checks.some((c: any) => c.status === 'warning');
    const hasErrors = diagnostics.checks.some((c: any) => c.status === 'error');

    diagnostics.summary = {
      status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
      message: hasErrors 
        ? '❌ Обнаружены ошибки. Система не будет работать.'
        : hasWarnings
        ? '⚠️ Есть предупреждения. Система может работать некорректно.'
        : '✅ Все проверки пройдены! Система готова к работе.',
    };

    return NextResponse.json(diagnostics, { status: allOk ? 200 : (hasErrors ? 500 : 200) });
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({
      error: 'Критическая ошибка диагностики',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
