/**
 * API Route для работы с конкретной записью
 * PUT - обновить запись
 * DELETE - удалить запись
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateRecord, deleteRecord } from '@/services/GoogleSheetsService';
import { UpdateRecordData } from '@/models/Record';
import { isAuthenticated } from '@/utils/auth';

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

    body.id = id;
    const updatedRecord = await updateRecord(body);
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
