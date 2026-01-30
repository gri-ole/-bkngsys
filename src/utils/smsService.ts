/**
 * SMS-уведомления через Twilio
 * Используется: при подтверждении записи админом и напоминание накануне
 */

/**
 * Нормализация номера телефона в E.164 (для Латвии +371)
 * Допускает: 21234567, +37121234567, 37121234567
 */
export function normalizePhoneForSms(phone: string): string | null {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null;
  // Уже с кодом страны
  if (phone.trim().startsWith('+')) {
    return phone.replace(/\s/g, '').replace(/^00/, '+');
  }
  // Латвия: 8 цифр -> +371
  if (digits.length === 8 && (digits.startsWith('2') || digits.startsWith('6'))) {
    return `+371${digits}`;
  }
  if (digits.startsWith('371') && digits.length >= 11) {
    return `+${digits}`;
  }
  if (digits.startsWith('7') && digits.length === 11) {
    return `+${digits}`;
  }
  // По умолчанию — считаем латышский номер
  if (digits.length >= 8) {
    const rest = digits.slice(-8);
    return `+371${rest}`;
  }
  return null;
}

/**
 * Отправить SMS (если Twilio настроен)
 * Возвращает true при успехе, false если SMS не отправлен (нет конфига или ошибка)
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[SMS] Twilio not configured (TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER)');
    return false;
  }

  const to = normalizePhoneForSms(phone);
  if (!to) {
    console.warn('[SMS] Invalid or empty phone:', phone);
    return false;
  }

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: message,
      from: fromNumber,
      to,
    });
    return true;
  } catch (err) {
    console.error('[SMS] Send failed:', err);
    return false;
  }
}

/** Текст SMS при подтверждении записи админом */
export function getConfirmationSmsText(options: {
  language: 'lv' | 'ru';
  date: string;
  time?: string;
  service?: string;
}): string {
  const { language, date, time, service } = options;
  const dateFormatted = formatDateForSms(date);
  const timePart = time ? ` ${time}` : '';
  const servicePart = service ? ` (${service})` : '';
  if (language === 'ru') {
    return `Colorlab.lv: Ваша запись подтверждена на ${dateFormatted}${timePart}${servicePart}. До встречи!`;
  }
  return `Colorlab.lv: Jūsu pieraksts apstiprināts ${dateFormatted}${timePart}${servicePart}. Līdz tikšanai!`;
}

/** Текст SMS-напоминания накануне */
export function getReminderSmsText(options: {
  language: 'lv' | 'ru';
  date: string;
  time?: string;
  service?: string;
}): string {
  const { language, date, time, service } = options;
  const dateFormatted = formatDateForSms(date);
  const timePart = time ? ` ${time}` : '';
  const servicePart = service ? ` (${service})` : '';
  if (language === 'ru') {
    return `Colorlab.lv: Напоминание: завтра у вас запись на ${dateFormatted}${timePart}${servicePart}. Ждём вас!`;
  }
  return `Colorlab.lv: Atgādinājums: rīt jums ir pieraksts ${dateFormatted}${timePart}${servicePart}. Gaidīsim!`;
}

function formatDateForSms(isoDate: string): string {
  try {
    const [y, m, d] = isoDate.split('-');
    if (!d || !m) return isoDate;
    return `${d}.${m}.${y}`;
  } catch {
    return isoDate;
  }
}
