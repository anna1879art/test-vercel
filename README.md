# Candle Card Test — public-repo / Vercel-env version

Минимальный Next.js тестовый сайт-визитка для проверки GitHub → Vercel.

## Что изменилось

Репозиторий теперь можно держать **public**: логин и пароль `/admin` больше не захардкожены в frontend-коде.

- `/` — публичная одностраничная витрина.
- `/admin` — тестовая админка.
- `/api/admin/login` — маленький server-side endpoint Vercel, который проверяет Environment Variables.
- пароль не отправляется в JS bundle и не хранится в GitHub.
- после успешного входа ставится `HttpOnly` cookie.
- содержимое витрины пока по-прежнему сохраняется только в `localStorage` браузера.

## 1. Локальный запуск

Создай `.env.local`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

Затем:

```bash
npm install
npm run dev
```

Открыть:

- http://localhost:3000/
- http://localhost:3000/admin
- http://localhost:3000/admin/ (also accepted)

## 2. Vercel

В Vercel открой:

`Project → Settings → Environment Variables`

Добавь:

```text
ADMIN_USERNAME = admin
ADMIN_PASSWORD = admin
```

Отметь нужные environments (для теста можно Production + Preview + Development), сохрани и сделай **Redeploy**.

После этого `/admin` использует значения именно из Vercel.

## 3. Public GitHub repository

В repository нет реального пароля — только `.env.example` с примером. `.env.local` игнорируется Git.

Не называй переменные `NEXT_PUBLIC_ADMIN_PASSWORD`: всё с префиксом `NEXT_PUBLIC_` попадает в браузер и перестаёт быть секретом.

## 4. Важное отличие от первой версии

Первая версия была `output: 'export'` и могла целиком уехать на обычный Namecheap static hosting.

Эта версия использует server-side login endpoint, поэтому весь проект уже нельзя просто экспортировать в `out/` как полностью статический сайт.

Это сознательно: **секретный Vercel ENV и полностью статический `/admin` несовместимы**. Если секрет проверяет браузер, секрет можно извлечь из браузера.

Когда захочешь повторить исходную архитектуру `Vercel admin → GitHub → Namecheap public site`, следующий шаг — оставить `/admin` на Vercel, а для Namecheap собирать отдельно только публичную часть сайта.

## Текущая архитектура

```text
Public GitHub repo
      ↓
    Vercel
      ├── /              public site
      ├── /admin         admin UI
      └── /api/admin/*   server-side auth
               ↓
      ADMIN_USERNAME / ADMIN_PASSWORD
      (Vercel Environment Variables)
```


## Если локально ERR_TOO_MANY_REDIRECTS на /admin/

В этой версии включён `skipTrailingSlashRedirect: true`, поэтому Next.js не должен гонять `/admin` и `/admin/` друг в друга.

Также убедись, что локально существует `.env.local`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

После изменения `.env.local` или `next.config.mjs` полностью перезапусти `npm run dev`.
