/**
 * API Route для работы с записями
 * GET - получить все записи
 * POST - создать новую запись
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchRecords, addRecord } from '@/services/GoogleSheetsService';
import { CreateRecordData } from '@/models/Record';
import { isAuthenticated } from '@/utils/auth';
import { checkRateLimit, getClientIp } from '@/utils/rateLimit';
import { sendNewBookingEmail } from '@/utils/emailService';

export async function GET() {
  // Публичный доступ для получения записей (можно ограничить при необходимости)
  try {
    const records = await fetchRecords();
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error in GET /api/records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: ограничение запросов с одного IP
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(clientIp, 5, 15 * 60 * 1000); // 5 запросов за 15 минут
    
    if (!rateLimitResult.allowed) {
      console.log(`[Anti-spam] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 900),
          }
        }
      );
    }

    // Публичный доступ для создания записей (клиенты могут создавать записи)
    const body: any = await request.json();
    
    // Анти-спам проверки на сервере
    if (body._antiSpam) {
      const { timeSpent, userActivity } = body._antiSpam;
      
      // Минимальное время заполнения (3 секунды)
      if (timeSpent < 3000) {
        console.log(`[Anti-spam] Form submitted too quickly: ${timeSpent}ms from IP: ${clientIp}`);
        return NextResponse.json(
          { error: 'Invalid request' },
          { status: 400 }
        );
      }
      
      // Проверка активности
      if (userActivity.clicks + userActivity.focuses < 2) {
        console.log(`[Anti-spam] Insufficient user activity from IP: ${clientIp}`, userActivity);
        return NextResponse.json(
          { error: 'Invalid request' },
          { status: 400 }
        );
      }
    }
    
    // Удаляем служебные данные перед сохранением
    delete body._antiSpam;
    
    // Валидация обязательных полей (время НЕ обязательно)
    if (!body.clientName || !body.phone || !body.service || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Валидация формата данных
    if (body.amount !== undefined && (isNaN(Number(body.amount)) || body.amount < 0)) {
      return NextResponse.json(
        { error: 'Invalid amount value' },
        { status: 400 }
      );
    }

    // Валидация даты
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Валидация времени (только если заполнено)
    if (body.time) {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(body.time)) {
        return NextResponse.json(
          { error: 'Invalid time format' },
          { status: 400 }
        );
      }
    }

    const newRecord = await addRecord(body);
    
    // Отправка email-уведомления о новой записи (асинхронно, без блокировки ответа)
    sendNewBookingEmail({
      name: body.clientName,
      phone: body.phone,
      socialMedia: body.socialMedia,
      service: body.service,
      date: body.date,
      time: body.time,
      comment: body.comment,
      source: body.source || 'website',
      createdAt: newRecord.createdAt || new Date().toISOString(),
      duringVacation: body.duringVacation || false,
    }).catch(error => {
      // Логируем ошибку, но не блокируем создание записи
      console.error('Failed to send email notification:', error);
    });
    
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/records:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create record';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
