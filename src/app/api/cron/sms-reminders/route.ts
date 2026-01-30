/**
 * Cron: отправка SMS-напоминаний накануне записи
 * Вызывается Vercel Cron по расписанию (например ежедневно в 18:00)
 * Защита: заголовок Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchRecords } from '@/services/GoogleSheetsService';
import { sendSMS, getReminderSmsText } from '@/utils/smsService';

function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const records = await fetchRecords();
    const tomorrow = getTomorrowDateString();
    const language = (process.env.SMS_LANGUAGE as 'lv' | 'ru') || 'ru';

    const toRemind = records.filter(
      (r) => r.date === tomorrow && r.status === 'confirmed' && r.phone
    );

    let sent = 0;
    for (const record of toRemind) {
      const text = getReminderSmsText({
        language,
        date: record.date,
        time: record.time,
        service: record.service,
      });
      const ok = await sendSMS(record.phone, text);
      if (ok) sent++;
    }

    return NextResponse.json({
      ok: true,
      tomorrow,
      total: toRemind.length,
      sent,
    });
  } catch (error) {
    console.error('[cron/sms-reminders] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron failed' },
      { status: 500 }
    );
  }
}
