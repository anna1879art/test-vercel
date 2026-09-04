# Candle Card Test

Минимальный Next.js тестовый сайт-визитка для проверки инфраструктуры.

## Что внутри

- `/` — публичная одностраничная витрина со всеми 4 приложенными изображениями.
- `/admin/` — тестовая frontend-only админка.
- Login: `admin`
- Password: `admin`
- `output: 'export'` — `npm run build` создаёт папку `out/` с полностью статическими файлами.
- `deployment-examples/namecheap-ftp.yml` — пример GitHub Actions для FTP upload на Namecheap.

> ВАЖНО: `admin/admin` — только демонстрация. Это не настоящая безопасность.

## 1. Запустить локально

```bash
npm install
npm run dev
```

Открыть:

- http://localhost:3000/
- http://localhost:3000/admin/

## 2. Проверить статическую сборку

```bash
npm run build
```

После этого папка `out/` содержит обычные HTML/CSS/JS/images, которые можно залить на обычный shared hosting.

## 3. GitHub → Vercel

1. Создай пустой GitHub repository.
2. Распакуй этот ZIP и push всё содержимое в `main`.
3. В Vercel: **Add New → Project → Import Git Repository**.
4. Framework Vercel определит как Next.js автоматически.
5. Нажми Deploy.
6. Получишь URL вида `https://<project>.vercel.app/` и `/admin/`.

При каждом push в GitHub Vercel будет делать новый deployment.

## 4. GitHub → Namecheap

Сначала локально `npm run build`: результат будет в `out/`.

Для автоматического deployment:

1. Создай FTP account в cPanel/Namecheap.
2. В GitHub repository добавь secrets:
   - `FTP_SERVER`
   - `FTP_USERNAME`
   - `FTP_PASSWORD`
3. Скопируй `deployment-examples/namecheap-ftp.yml` в:
   `.github/workflows/deploy-namecheap.yml`
4. Commit + push.

После push GitHub Actions выполнит:

`GitHub → npm build → out/ → FTP → Namecheap public_html/`

## 5. Что делает тестовая /admin

Админка сохраняет изменения только в `localStorage` браузера.

То есть она позволяет проверить:

`/admin → login → edit → Save → открыть / и увидеть изменение`

если обе страницы открыты на одном origin.

Она НЕ делает:

`Vercel /admin → GitHub commit → GitHub Actions → Namecheap`.

Для этого уже нужна server-side функция/API (например Vercel Function), потому что GitHub token нельзя безопасно держать в браузере.

## Архитектура этого теста

```text
GitHub
  ├── Vercel auto-deploy → сайт + /admin
  └── GitHub Actions → static build → FTP → Namecheap

/admin в этом ZIP — только frontend demo, без backend.
```
