/**
 * API Route для работы с конкретной записью
 * PUT - обновить запись
 * DELETE - удалить запись
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateRecord, deleteRecord, fetchRecords } from '@/services/GoogleSheetsService';
import { UpdateRecordData } from '@/models/Record';
import { isAuthenticated } from '@/utils/auth';
import { sendSMS, getConfirmationSmsText } from '@/utils/smsService';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Только для авторизованных пользователей
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateRecordData = await request.json();
    
    // Валидация amount если указан
    if (body.amount !== undefined && (isNaN(Number(body.amount)) || body.amount < 0)) {
      return NextResponse.json(
        { error: 'Invalid amount value' },
        { status: 400 }
      );
    }

    // Текущая запись до обновления (для SMS при подтверждении)
    const records = await fetchRecords();
    const existingRecord = records.find((r) => r.id === id);

    body.id = id;
    const updatedRecord = await updateRecord(body);

    // SMS клиенту при подтверждении записи админом
    if (
      body.status === 'confirmed' &&
      existingRecord &&
      existingRecord.status !== 'confirmed' &&
      (updatedRecord.phone || existingRecord.phone)
    ) {
      const phone = updatedRecord.phone || existingRecord.phone;
      const language = (process.env.SMS_LANGUAGE as 'lv' | 'ru') || 'ru';
      const text = getConfirmationSmsText({
        language,
        date: updatedRecord.date || existingRecord.date,
        time: updatedRecord.time || existingRecord.time,
        service: updatedRecord.service || existingRecord.service,
      });
      await sendSMS(phone, text).catch((err) => console.error('[SMS] Confirm send error:', err));
    }

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error in PUT /api/records/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update record';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Только для авторизованных пользователей
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      );
    }

    await deleteRecord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/records/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete record';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
