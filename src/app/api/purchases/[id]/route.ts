/**
 * API для работы с конкретной закупкой
 * PUT - обновить закупку
 * DELETE - удалить закупку
 */

import { NextRequest, NextResponse } from 'next/server';
import { updatePurchase, deletePurchase } from '@/services/PurchaseService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const id = params.id;

    // Валидация
    if (!body.categoryId || !body.name || !body.amount || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedPurchase = await updatePurchase({
      id,
      categoryId: body.categoryId,
      name: body.name,
      amount: parseFloat(body.amount),
      date: body.date,
      description: body.description || '',
      supplier: body.supplier || '',
    });

    return NextResponse.json(updatedPurchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await deletePurchase(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json(
      { error: 'Failed to delete purchase' },
      { status: 500 }
    );
  }
}
