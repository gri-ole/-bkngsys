import nodemailer from 'nodemailer';
import { getVacationForDate } from './workingHours';

interface NewBookingEmailData {
  name: string;
  phone: string;
  socialMedia?: string;
  service: string;
  date: string;
  time?: string;
  comment?: string;
  source: string;
  createdAt: string;
  duringVacation?: boolean;
}

/**
 * Создает транспорт для отправки email через Gmail SMTP
 */
function createTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error('EMAIL_USER или EMAIL_PASS не настроены в .env.local');
    throw new Error('Email credentials are not configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

/**
 * Форматирует дату и время для отображения в email
 */
function formatDateTime(date: string, time?: string): string {
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  const formattedDate = `${day}.${month}.${year}`;
  
  if (time) {
    return `${formattedDate} • ${time}`;
  }
  
  return formattedDate;
}

/**
 * Генерирует HTML-содержимое email в стиле админ-панели
 */
function generateEmailHTML(data: NewBookingEmailData): string {
  const dateTime = formatDateTime(data.date, data.time);
  const createdAtFormatted = new Date(data.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const sourceLabel = data.source === 'client' ? 'Клиент' : data.source === 'admin' ? 'Админ' : 'Сайт';
  
  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Новая запись</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f3f4f6;
          padding: 30px 15px;
          line-height: 1.5;
        }
        .email-wrapper {
          max-width: 650px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        /* Header */
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 32px 24px;
          text-align: center;
        }
        .header-title {
          font-size: 26px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .header-icon {
          font-size: 36px;
          margin-bottom: 12px;
          display: inline-block;
        }
        
        /* Content */
        .content {
          padding: 28px 24px;
          background: #ffffff;
        }
        
        /* Info Grid */
        table.info-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        table.info-grid td {
          vertical-align: top;
          padding: 0 8px 0 0;
        }
        table.info-grid td:last-child {
          padding-right: 0;
        }
        
        /* Info Blocks */
        .info-block {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .info-block-title {
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 0 0 16px 0;
        }
        
        /* Contact Block (Blue accent) */
        .contact-block {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
        }
        .contact-block .info-block-title {
          color: #1e40af;
        }
        
        /* Details Block (Purple accent) */
        .details-block {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          border: 1px solid #ddd6fe;
        }
        .details-block .info-block-title {
          color: #6d28d9;
        }
        
        /* Field */
        .field {
          margin-bottom: 14px;
        }
        .field:last-child {
          margin-bottom: 0;
        }
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .field-value {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
        }
        .field-value-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }
        .field-value-link:hover {
          text-decoration: underline;
        }
        .field-value-secondary {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
        }
        
        /* Status Badge */
        .status-badge {
          display: inline-block;
          padding: 6px 14px;
          background: #fef3c7;
          border: 1px solid #fde047;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #92400e;
        }
        
        /* Warning */
        .warning {
          display: block;
          margin-top: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #ea580c;
        }
        
        /* Comment Block */
        .comment-block {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 1px solid #fde047;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .comment-block-title {
          font-size: 12px;
          font-weight: 700;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 0 0 12px 0;
        }
        .comment-text {
          font-size: 14px;
          font-weight: 500;
          color: #78350f;
          line-height: 1.6;
          margin: 0;
        }
        
        /* Footer */
        .footer {
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 28px 24px;
          text-align: center;
        }
        .footer-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }
        .footer-text {
          font-size: 13px;
          color: #6b7280;
          margin: 4px 0;
        }
        .cta-button {
          display: inline-block;
          margin-top: 16px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        .cta-button:hover {
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        }
        
        /* Mobile */
        @media only screen and (max-width: 600px) {
          body {
            padding: 15px 10px;
          }
          .header {
            padding: 24px 20px;
          }
          .header-title {
            font-size: 22px;
          }
          .content {
            padding: 20px 16px;
          }
          .info-block {
            padding: 16px;
          }
          table.info-grid td {
            display: block;
            width: 100%;
            padding: 0 0 16px 0;
          }
          table.info-grid td:last-child {
            padding-bottom: 0;
          }
          .footer {
            padding: 24px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <div class="header-icon">🔔</div>
          <h1 class="header-title">Новая запись!</h1>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Info Grid -->
          <table class="info-grid" cellpadding="0" cellspacing="0">
            <tr>
              <!-- Contact Block -->
              <td width="50%">
                <div class="info-block contact-block">
                  <h4 class="info-block-title">👤 Контактная информация</h4>
                  
                  <div class="field">
                    <span class="field-label">Имя клиента</span>
                    <span class="field-value">${data.name}</span>
                  </div>
                  
                  <div class="field">
                    <span class="field-label">Телефон</span>
                    <span class="field-value">${data.phone}</span>
                  </div>
                  
                  ${data.socialMedia ? `
                    <div class="field">
                      <span class="field-label">Соц. сеть</span>
                      <a href="${data.socialMedia.startsWith('http') ? data.socialMedia : `https://${data.socialMedia}`}" class="field-value field-value-link" target="_blank">${data.socialMedia}</a>
                    </div>
                  ` : ''}
                </div>
              </td>
              
              <!-- Details Block -->
              <td width="50%">
                <div class="info-block details-block">
                  <h4 class="info-block-title">📋 Детали записи</h4>
                  
                  <div class="field">
                    <span class="field-label">Услуга</span>
                    <span class="field-value">${data.service}</span>
                  </div>
                  
                  <div class="field">
                    <span class="field-label">Дата и время</span>
                    <span class="field-value">${dateTime}</span>
                    ${getVacationForDate(data.date) ? '<span class="warning">⚠️ Запись на время отпуска</span>' : ''}
                  </div>
                  
                  <div class="field">
                    <span class="field-label">Статус</span>
                    <span class="status-badge">Новая</span>
                  </div>
                  
                  <div class="field">
                    <span class="field-label">Создана</span>
                    <span class="field-value-secondary">${createdAtFormatted}</span>
                    ${data.duringVacation ? '<span class="warning">⚠️ Записался во время отпуска</span>' : ''}
                  </div>
                  
                  <div class="field">
                    <span class="field-label">Источник</span>
                    <span class="field-value-secondary">${sourceLabel}</span>
                  </div>
                </div>
              </td>
            </tr>
          </table>
          
          <!-- Comment Block -->
          ${data.comment ? `
            <div class="comment-block">
              <h4 class="comment-block-title">💬 Комментарий</h4>
              <p class="comment-text">${data.comment}</p>
            </div>
          ` : ''}
          
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-title">Colorlab.lv Booking System</div>
          <p class="footer-text">Это автоматическое уведомление о новой записи</p>
          <p class="footer-text">Для управления записями используйте админ-панель</p>
          <a href="http://localhost:3000/admin" class="cta-button">🚀 Открыть админ-панель</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Генерирует текстовую версию письма (для клиентов без поддержки HTML)
 */
function generateEmailText(data: NewBookingEmailData): string {
  const dateTime = formatDateTime(data.date, data.time);
  const createdAtFormatted = new Date(data.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const sourceLabel = data.source === 'client' ? 'Клиент' : data.source === 'admin' ? 'Админ' : 'Сайт';
  
  let text = `
🔔 НОВАЯ ЗАПИСЬ!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 КОНТАКТНАЯ ИНФОРМАЦИЯ

ИМЯ КЛИЕНТА
${data.name}

📞 ТЕЛЕФОН
${data.phone}

${data.socialMedia ? `💬 СОЦ. СЕТЬ\n${data.socialMedia}\n\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ДЕТАЛИ ЗАПИСИ

🎯 УСЛУГА
${data.service}

📅 ЖЕЛАЕМЫЕ ДАТА И ВРЕМЯ
${dateTime}${getVacationForDate(data.date) ? '\n⚠️ Запись на время отпуска' : ''}

📌 СТАТУС
Новая

🕐 СОЗДАНА
${createdAtFormatted}${data.duringVacation ? '\n⚠️ Записался во время отпуска' : ''}

🔗 ИСТОЧНИК
${sourceLabel}

${data.comment ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n💬 КОММЕНТАРИЙ\n\n${data.comment}\n\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Для управления записями перейдите в админ-панель:
http://localhost:3000/admin

──────────────────────────────────────
Colorlab.lv Booking System
Автоматическое уведомление
  `;
  
  return text.trim();
}

/**
 * Отправляет email-уведомление о новой записи
 */
export async function sendNewBookingEmail(data: NewBookingEmailData): Promise<void> {
  try {
    const transporter = createTransporter();
    const recipientEmail = process.env.NOTIFICATION_EMAIL || 'colorlab.latvija@gmail.com';
    
    const mailOptions = {
      from: `"Colorlab.lv Booking" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🔔 Новая запись: ${data.name} - ${data.service}`,
      text: generateEmailText(data),
      html: generateEmailHTML(data),
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email отправлен:', info.messageId);
    console.log('📧 Получатель:', recipientEmail);
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
    // Не бросаем ошибку, чтобы не блокировать создание записи
    // Запись должна быть создана, даже если email не отправился
  }
}
