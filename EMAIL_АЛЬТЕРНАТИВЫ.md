# 📧 Альтернативные способы настройки Email

## Проблема: "The setting that you are looking for is not available for your account"

Это ограничение Gmail для некоторых типов аккаунтов (корпоративные, G Suite с ограничениями, или старые аккаунты).

---

## ✅ **РЕШЕНИЕ 1: Создайте новый Gmail аккаунт** (РЕКОМЕНДУЮ)

### Преимущества:
- ✅ Бесплатно
- ✅ Надежно
- ✅ Безопасно
- ✅ Работает гарантированно

### Шаги:

#### 1. Создайте новый Gmail
- Перейдите: https://accounts.google.com/signup
- Создайте аккаунт: `colorlab.notifications@gmail.com` (или любое другое имя)
- Завершите регистрацию

#### 2. Включите двухфакторную аутентификацию
- Войдите в новый аккаунт
- https://myaccount.google.com/security
- Включите "2-Step Verification"

#### 3. Создайте App Password
- https://myaccount.google.com/apppasswords
- Выберите: Mail → Other → "Color Lab"
- Скопируйте пароль

#### 4. Обновите `.env.local`
```env
EMAIL_USER=colorlab.notifications@gmail.com
EMAIL_PASS=ваш-app-password-здесь
NOTIFICATION_EMAIL=colorlab.latvija@gmail.com
```

**Готово!** Письма будут отправляться **от** `colorlab.notifications@gmail.com` **на** `colorlab.latvija@gmail.com`.

---

## ✅ **РЕШЕНИЕ 2: Используйте другой SMTP-сервис**

### Вариант A: Mail.ru (Бесплатно для РФ/СНГ)

1. **Создайте аккаунт Mail.ru**: https://mail.ru
2. **Включите SMTP**:
   - Настройки → Почта → POP/IMAP/SMTP
   - Включите "Сбор почты по протоколу POP3"

3. **Обновите код** в `src/utils/emailService.ts`:

```typescript
return nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // ваш@mail.ru
    pass: process.env.EMAIL_PASS, // обычный пароль
  },
});
```

4. **`.env.local`**:
```env
EMAIL_USER=colorlab@mail.ru
EMAIL_PASS=ваш-обычный-пароль
NOTIFICATION_EMAIL=colorlab.latvija@gmail.com
```

---

### Вариант B: Yandex Mail (Бесплатно)

1. **Создайте Yandex почту**: https://mail.yandex.com
2. **Обновите код** в `src/utils/emailService.ts`:

```typescript
return nodemailer.createTransport({
  host: 'smtp.yandex.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

3. **`.env.local`**:
```env
EMAIL_USER=colorlab@yandex.com
EMAIL_PASS=ваш-пароль
NOTIFICATION_EMAIL=colorlab.latvija@gmail.com
```

---

### Вариант C: SendGrid (Профессионально, 100 писем/день бесплатно)

1. **Регистрация**: https://signup.sendgrid.com/
2. **Создайте API Key**: Settings → API Keys → Create API Key
3. **Установите пакет**:
```bash
npm install @sendgrid/mail
```

4. **Создайте новый файл** `src/utils/emailServiceSendGrid.ts`:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function sendNewBookingEmail(data: any) {
  const msg = {
    to: 'colorlab.latvija@gmail.com',
    from: 'notifications@yourdomain.com', // Нужен верифицированный домен
    subject: `🔔 Новая запись: ${data.name} - ${data.service}`,
    text: 'Текстовая версия...',
    html: '<strong>HTML версия...</strong>',
  };
  
  await sgMail.send(msg);
}
```

5. **`.env.local`**:
```env
SENDGRID_API_KEY=ваш-api-key
NOTIFICATION_EMAIL=colorlab.latvija@gmail.com
```

---

### Вариант D: Mailgun (1000 писем/месяц бесплатно)

1. **Регистрация**: https://www.mailgun.com/
2. **Получите SMTP credentials** в Dashboard
3. **Обновите код** в `src/utils/emailService.ts`:

```typescript
return nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER, // postmaster@...
    pass: process.env.MAILGUN_PASS,
  },
});
```

4. **`.env.local`**:
```env
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=ваш-mailgun-password
NOTIFICATION_EMAIL=colorlab.latvija@gmail.com
```

---

## ✅ **РЕШЕНИЕ 3: Временное решение (НЕ для продакшена)**

### Gmail с "Less secure app access" (УСТАРЕВШИЙ, НЕ РЕКОМЕНДУЮ)

⚠️ **Внимание**: Google отключил эту функцию в мае 2022. Не работает.

---

## 🎯 **МОЯ РЕКОМЕНДАЦИЯ:**

### **Для быстрого старта:**
→ **Создайте новый Gmail аккаунт** (Решение 1)
- Займет 5 минут
- Бесплатно
- Работает надежно
- Не нужно менять код

### **Для профессионального использования:**
→ **SendGrid или Mailgun**
- Более надежная доставка
- Статистика отправок
- Не попадает в спам
- Масштабируемость

---

## 📝 **ЧТО ДЕЛАТЬ ПРЯМО СЕЙЧАС:**

1. **Быстрое решение (5 минут)**:
   ```
   1. Создать gmail: colorlab.notifications@gmail.com
   2. Включить 2FA
   3. Создать App Password
   4. Обновить .env.local
   5. Перезапустить сервер
   ```

2. **Или использовать Mail.ru / Yandex** (если есть аккаунт):
   - Требует небольшого изменения кода
   - Смотрите инструкции выше

---

## 💡 **ЕСЛИ НУЖНА ПОМОЩЬ:**

Скажите, какой вариант выбрали, и я помогу настроить!

**Варианты:**
- A) Создать новый Gmail
- B) Mail.ru
- C) Yandex
- D) SendGrid
- E) Mailgun

Какой вариант предпочитаете? 🤔
