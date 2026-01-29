# 🚀 Инструкция по деплою на colorlab.lv

## 📋 Оглавление

1. [Проверка типа хостинга](#1-проверка-типа-хостинга)
2. [Вариант A: Vercel (рекомендуется) + домен colorlab.lv](#вариант-a-vercel-рекомендуется)
3. [Вариант B: VPS на hostnet.lv](#вариант-b-vps-на-hostnetlv)
4. [Вариант C: Shared hosting с Node.js](#вариант-c-shared-hosting-с-nodejs)
5. [Настройка домена](#настройка-домена)
6. [Переменные окружения](#переменные-окружения)
7. [После деплоя](#после-деплоя)

---

## 1. Проверка типа хостинга

### Что у вас на hostnet.lv?

**Зайдите в панель управления hostnet.lv и проверьте:**

- ✅ **VPS/VDS** (Virtual Private Server) - есть доступ по SSH → [Вариант B](#вариант-b-vps-на-hostnetlv)
- ✅ **Shared hosting с Node.js** - в панели есть раздел "Node.js" → [Вариант C](#вариант-c-shared-hosting-с-nodejs)
- ❌ **Обычный Shared hosting** (только PHP/HTML) - **НЕ ПОДХОДИТ** → [Вариант A](#вариант-a-vercel-рекомендуется)

### Как проверить:

```bash
# Если есть SSH доступ:
ssh your_username@your_server_ip
node --version  # Если выводит версию - отлично!
```

---

## Вариант A: Vercel (рекомендуется)

**✅ САМЫЙ ПРОСТОЙ СПОСОБ для Next.js!**

Vercel - это платформа от создателей Next.js, оптимизирована специально для него.

### Преимущества:
- ✅ **Бесплатно** для личных проектов
- ✅ **Автоматический деплой** при каждом git push
- ✅ **CDN** по всему миру (быстрая загрузка)
- ✅ **HTTPS** автоматически
- ✅ **Простая настройка** домена colorlab.lv
- ✅ **Превью** для каждой ветки
- ✅ **Логи и аналитика**

---

### Шаг 1: Подготовка кода

```bash
# 1. Инициализируем Git (если еще не сделано)
cd /Users/g.olenkins/booking-app
git init

# 2. Создаем .gitignore (если его нет)
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel
EOF

# 3. Делаем первый коммит
git add .
git commit -m "Initial commit - ColorLab Booking System"
```

---

### Шаг 2: Создаем репозиторий на GitHub

**Вариант 2A: Через веб-интерфейс GitHub**

1. Зайдите на https://github.com
2. Нажмите **"+"** → **"New repository"**
3. Название: `colorlab-booking`
4. Выберите **Private** (если не хотите показывать код публично)
5. **НЕ** добавляйте README, .gitignore (у нас уже есть)
6. Нажмите **"Create repository"**

**Вариант 2B: Через GitHub CLI**

```bash
# Установите GitHub CLI: https://cli.github.com/
gh auth login
gh repo create colorlab-booking --private --source=. --remote=origin --push
```

**Или подключите вручную:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/colorlab-booking.git
git branch -M main
git push -u origin main
```

---

### Шаг 3: Деплой на Vercel

#### 3.1. Регистрация на Vercel

1. Зайдите на https://vercel.com
2. Нажмите **"Sign Up"**
3. Выберите **"Continue with GitHub"** (проще всего)
4. Авторизуйте доступ Vercel к вашим репозиториям

#### 3.2. Импорт проекта

1. На главной странице Vercel нажмите **"Add New..."** → **"Project"**
2. Найдите репозиторий **colorlab-booking**
3. Нажмите **"Import"**

#### 3.3. Настройка проекта

**Build Settings:**
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: (оставьте пустым, автоматически)
Install Command: npm install
```

**Environment Variables** (добавьте если нужны):
```
# Пока оставьте пустым - добавим позже если потребуется
```

4. Нажмите **"Deploy"**

#### 3.4. Ожидание деплоя

- ⏱️ **Первый деплой**: ~2-3 минуты
- ✅ Vercel соберет проект и развернет его
- 🎉 Получите ссылку вида: `https://colorlab-booking-xxx.vercel.app`

---

### Шаг 4: Подключение домена colorlab.lv

#### 4.1. В Vercel

1. Откройте ваш проект в Vercel
2. Перейдите в **Settings** → **Domains**
3. Нажмите **"Add"**
4. Введите: `colorlab.lv`
5. Также добавьте: `www.colorlab.lv`
6. Нажмите **"Add"**

Vercel покажет инструкции по настройке DNS.

#### 4.2. В панели hostnet.lv (DNS настройки)

Зайдите в панель управления hostnet.lv → **DNS Settings** для домена colorlab.lv

**Добавьте следующие записи:**

**Для основного домена (colorlab.lv):**
```
Type: A
Name: @ (или оставьте пустым)
Value: 76.76.21.21
TTL: 3600
```

**Для www (www.colorlab.lv):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Альтернативно (если A запись не работает):**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

#### 4.3. Проверка DNS

```bash
# Проверка DNS (через терминал)
dig colorlab.lv
dig www.colorlab.lv

# Или через браузер:
# https://dnschecker.org/
```

**⏱️ DNS обновление:** 5 минут - 24 часа (обычно ~1 час)

#### 4.4. SSL сертификат

- ✅ Vercel автоматически создаст **бесплатный SSL** сертификат (Let's Encrypt)
- ✅ Ваш сайт будет доступен по **https://colorlab.lv**
- ⏱️ Сертификат генерируется после DNS обновления (~5-10 минут)

---

### Шаг 5: Проверка

1. Откройте https://colorlab.lv
2. Проверьте все страницы:
   - ✅ https://colorlab.lv/booking (форма бронирования)
   - ✅ https://colorlab.lv/admin (админ-панель)

---

## Вариант B: VPS на hostnet.lv

**Если у вас VPS с SSH доступом**

### Требования:
- ✅ SSH доступ к серверу
- ✅ Ubuntu/Debian/CentOS
- ✅ Root или sudo доступ
- ✅ Минимум 1GB RAM

---

### Шаг 1: Подключение к серверу

```bash
ssh your_username@your_server_ip
# Введите пароль
```

---

### Шаг 2: Установка Node.js

```bash
# Обновляем систему
sudo apt update
sudo apt upgrade -y

# Устанавливаем Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверяем установку
node --version  # должно вывести v20.x.x
npm --version   # должно вывести 10.x.x
```

---

### Шаг 3: Установка PM2 (Process Manager)

```bash
# PM2 для управления процессом Next.js
sudo npm install -g pm2

# Проверка
pm2 --version
```

---

### Шаг 4: Клонирование проекта

**Вариант 4A: Через Git (рекомендуется)**

```bash
# 1. Устанавливаем Git (если нет)
sudo apt install -y git

# 2. Создаем директорию для проекта
cd /var/www
sudo mkdir -p colorlab
sudo chown $USER:$USER colorlab
cd colorlab

# 3. Клонируем репозиторий
git clone https://github.com/YOUR_USERNAME/colorlab-booking.git .

# Или если репозиторий приватный:
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/colorlab-booking.git .
```

**Вариант 4B: Через FTP/SFTP**

```bash
# Используйте FileZilla или WinSCP
# Загрузите все файлы в /var/www/colorlab/
```

---

### Шаг 5: Установка зависимостей и сборка

```bash
cd /var/www/colorlab

# Установка зависимостей
npm install

# Сборка для production
npm run build

# Проверка сборки
ls -la .next  # должна появиться папка .next
```

---

### Шаг 6: Запуск с PM2

```bash
# Создаем ecosystem файл для PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'colorlab-booking',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/colorlab',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Запускаем приложение
pm2 start ecosystem.config.js

# Проверяем статус
pm2 status
pm2 logs colorlab-booking

# Настраиваем автозапуск при перезагрузке сервера
pm2 startup
pm2 save
```

**Проверка:**
```bash
curl http://localhost:3000
# Должен вывести HTML страницы
```

---

### Шаг 7: Установка Nginx (Reverse Proxy)

```bash
# Установка Nginx
sudo apt install -y nginx

# Создаем конфигурацию для colorlab.lv
sudo nano /etc/nginx/sites-available/colorlab.lv
```

**Вставьте эту конфигурацию:**

```nginx
server {
    listen 80;
    server_name colorlab.lv www.colorlab.lv;

    # Redirect HTTP to HTTPS (после установки SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Увеличиваем таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Статические файлы Next.js
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Размер загружаемых файлов
    client_max_body_size 10M;
}
```

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Активируем конфигурацию:**

```bash
# Создаем символическую ссылку
sudo ln -s /etc/nginx/sites-available/colorlab.lv /etc/nginx/sites-enabled/

# Удаляем дефолтную конфигурацию (если есть)
sudo rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### Шаг 8: Настройка DNS (hostnet.lv)

Зайдите в панель управления hostnet.lv → **DNS Settings**

**Добавьте A-запись:**

```
Type: A
Name: @
Value: ВАШ_IP_АДРЕС_VPS
TTL: 3600

Type: A
Name: www
Value: ВАШ_IP_АДРЕС_VPS
TTL: 3600
```

**Узнать IP вашего VPS:**
```bash
curl ifconfig.me
# или
ip addr show
```

---

### Шаг 9: Установка SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d colorlab.lv -d www.colorlab.lv

# Следуйте инструкциям:
# 1. Введите email для уведомлений
# 2. Согласитесь с условиями (Y)
# 3. Выберите "2: Redirect" (перенаправление HTTP → HTTPS)

# Certbot автоматически:
# - Получит сертификат
# - Настроит Nginx
# - Настроит автообновление
```

**Проверка автообновления:**
```bash
sudo certbot renew --dry-run
```

**Сертификат обновляется автоматически каждые 90 дней!**

---

### Шаг 10: Настройка Firewall

```bash
# Установка UFW (если нет)
sudo apt install -y ufw

# Разрешаем SSH (ВАЖНО! Иначе потеряете доступ)
sudo ufw allow 22/tcp

# Разрешаем HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включаем firewall
sudo ufw enable

# Проверяем статус
sudo ufw status
```

---

### Шаг 11: Проверка деплоя

```bash
# Проверка статуса всех сервисов
sudo systemctl status nginx
pm2 status

# Проверка логов
pm2 logs colorlab-booking --lines 50
sudo tail -f /var/log/nginx/error.log
```

**Откройте в браузере:**
- ✅ https://colorlab.lv
- ✅ https://www.colorlab.lv

---

### Обновление кода (после изменений)

```bash
cd /var/www/colorlab

# Получаем новый код
git pull origin main

# Устанавливаем новые зависимости (если есть)
npm install

# Пересобираем
npm run build

# Перезапускаем приложение
pm2 restart colorlab-booking

# Проверяем
pm2 logs colorlab-booking --lines 20
```

---

## Вариант C: Shared Hosting с Node.js

**Если hostnet.lv предоставляет Node.js на shared hosting**

### Проверка поддержки

Зайдите в панель управления hostnet.lv и найдите:
- "Node.js"
- "Application Manager"
- "Setup Node.js App"

### Общие шаги:

1. **Создайте Node.js приложение** в панели управления
   - Node.js Version: **20.x** (выберите последнюю LTS)
   - Application Root: `/home/your_username/colorlab-booking`
   - Application URL: `colorlab.lv`
   - Application Startup File: `server.js`

2. **Загрузите файлы через FTP/SFTP**
   - Используйте FileZilla или встроенный File Manager
   - Загрузите все файлы проекта в `/home/your_username/colorlab-booking`

3. **Установите зависимости**
   - В панели управления найдите терминал для Node.js приложения
   - Выполните: `npm install`
   - Выполните: `npm run build`

4. **Запустите приложение**
   - В панели нажмите "Start" или "Restart"

**⚠️ Примечание:** Настройка зависит от конкретной панели управления hostnet.lv (cPanel, Plesk, ISPmanager и т.д.)

---

## Настройка домена

### Если домен уже на hostnet.lv

✅ Домен уже привязан к хостингу - настройте только DNS (см. выше)

### Если домен на другом регистраторе

1. Зайдите в панель управления доменом
2. Измените **Name Servers** на NS серверы hostnet.lv:
   ```
   ns1.hostnet.lv
   ns2.hostnet.lv
   ```
   (Уточните NS серверы в документации hostnet.lv)

3. Или настройте A-записи (см. DNS настройки выше)

---

## Переменные окружения

**Если потребуются переменные окружения (API ключи, секреты):**

### Для Vercel:

1. Зайдите в проект на Vercel
2. **Settings** → **Environment Variables**
3. Добавьте переменные:
   ```
   NEXT_PUBLIC_API_URL=https://api.colorlab.lv
   SECRET_KEY=your_secret_key
   ```

### Для VPS:

```bash
# Создайте .env файл
cd /var/www/colorlab
nano .env

# Добавьте переменные:
NEXT_PUBLIC_API_URL=https://api.colorlab.lv
SECRET_KEY=your_secret_key

# Сохраните: Ctrl+O, Enter, Ctrl+X

# Перезапустите приложение
pm2 restart colorlab-booking
```

---

## После деплоя

### ✅ Чек-лист проверки:

1. **Основные страницы работают:**
   - [ ] https://colorlab.lv/booking
   - [ ] https://colorlab.lv/admin
   - [ ] https://colorlab.lv/admin/settings

2. **Функционал:**
   - [ ] Создание записи через форму
   - [ ] Отправка email уведомлений
   - [ ] Вход в админ-панель
   - [ ] Просмотр/редактирование записей
   - [ ] Изменение настроек

3. **Производительность:**
   - [ ] Страницы загружаются быстро (<2 сек)
   - [ ] Нет ошибок в консоли браузера (F12)

4. **Mobile версия:**
   - [ ] Сайт корректно отображается на телефоне
   - [ ] Форма бронирования удобна на мобильном

5. **SSL сертификат:**
   - [ ] Зеленый замочек в браузере
   - [ ] Нет предупреждений о безопасности

---

## Полезные команды

### Vercel CLI (опционально)

```bash
# Установка Vercel CLI
npm install -g vercel

# Деплой из терминала
vercel --prod

# Просмотр логов
vercel logs
```

### PM2 (для VPS)

```bash
# Список процессов
pm2 list

# Логи
pm2 logs colorlab-booking
pm2 logs colorlab-booking --lines 100

# Перезапуск
pm2 restart colorlab-booking

# Остановка
pm2 stop colorlab-booking

# Удаление
pm2 delete colorlab-booking

# Информация о процессе
pm2 info colorlab-booking

# Мониторинг (в реальном времени)
pm2 monit
```

### Nginx (для VPS)

```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx

# Статус
sudo systemctl status nginx

# Логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting (Решение проблем)

### Проблема: Сайт не открывается

**Проверьте:**
```bash
# Для VPS:
pm2 status  # процесс должен быть "online"
sudo systemctl status nginx  # должен быть "active (running)"

# Для Vercel:
# Проверьте логи в Vercel Dashboard
```

### Проблема: DNS не обновился

- ⏱️ Подождите до 24 часов
- Проверьте на https://dnschecker.org/
- Очистите кеш DNS:
  ```bash
  # macOS
  sudo dscacheutil -flushcache
  
  # Windows
  ipconfig /flushdns
  ```

### Проблема: SSL сертификат не работает

**Для VPS:**
```bash
# Повторная попытка получения сертификата
sudo certbot --nginx -d colorlab.lv -d www.colorlab.lv --force-renewal
```

**Для Vercel:**
- Подождите 10-15 минут после настройки DNS
- Vercel автоматически получит сертификат

### Проблема: Страница 502 Bad Gateway

```bash
# Проверьте работает ли Next.js
pm2 status
pm2 logs colorlab-booking

# Проверьте конфигурацию Nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Поддержка

**hostnet.lv поддержка:**
- 🌐 https://www.hostnet.lv/support
- 📧 support@hostnet.lv
- 📞 Проверьте на их сайте

**Vercel документация:**
- 🌐 https://vercel.com/docs
- 💬 https://vercel.com/support

---

## 🎉 Готово!

После успешного деплоя ваш сайт будет доступен по адресу:
- **https://colorlab.lv**
- **https://www.colorlab.lv**

Теперь клиенты могут бронировать услуги онлайн! 💇‍♀️✨
