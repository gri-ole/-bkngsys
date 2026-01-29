/**
 * API для работы с закупками
 * GET - получить все закупки
 * POST - создать новую закупку
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchPurchases, addPurchase } from '@/services/PurchaseService';

export async function GET() {
  try {
    const purchases = await fetchPurchases();
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация
    if (!body.categoryId || !body.name || !body.amount || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: categoryId, name, amount, date' },
        { status: 400 }
      );
    }

    const newPurchase = await addPurchase({
      categoryId: body.categoryId,
      name: body.name,
      amount: parseFloat(body.amount),
      date: body.date,
      description: body.description || '',
      supplier: body.supplier || '',
    });

    return NextResponse.json(newPurchase, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    );
  }
}
