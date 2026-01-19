# Инструкция по деплою фронтенда

## Проблемы и решения

### 1. 404 при обновлении страницы

Это происходит потому, что сервер не знает про React Router маршруты. Нужно настроить fallback на `index.html`.

**Решение зависит от платформы:**

#### Cloudflare Pages / Netlify
Используй файл `public/_redirects` (уже создан):
```
/*    /index.html   200
```

#### Vercel
Используй файл `vercel.json` (уже создан)

#### Nginx
Используй конфигурацию из `nginx.conf`:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Apache (.htaccess)
Создай файл `public/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 2. Платформа не грузится с разных устройств

#### Проверь переменные окружения

Убедись, что в production установлена переменная:
```
VITE_API_URL=https://твой-бэкенд.рф/api/v1
```

**Важно:** URL должен быть с `https://` (не `http://`) для production!

#### Проверь CORS на бэкенде

CORS уже настроен на `*`, но если проблемы остаются, проверь:
- Бэкенд доступен по HTTPS
- Правильный домен в CORS (если ограничиваешь)

### 3. Сборка для production

```bash
cd frontend
npm run build
# или
yarn build
```

Собранные файлы будут в `dist/`

## Чеклист перед деплоем

- [ ] Установлена переменная `VITE_API_URL` в production
- [ ] Настроен fallback на `index.html` (выбери подходящий файл выше)
- [ ] Бэкенд доступен по HTTPS
- [ ] CORS настроен правильно
- [ ] Протестировано обновление страницы на `/forum`, `/profile` и т.д.
