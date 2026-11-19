# AURA SEA — aurasea.org

Сайт крюингового агентства AURA SEA. React + Vite + Tailwind, маршрутизация — wouter.

## Разработка

```bash
npm ci
npm run dev        # http://localhost:5174
npm run build:site # собрать статический сайт в dist/public
```

- Страницы: `client/src/pages`, общие компоненты: `client/src/components`
- Картинки, импортируемые из кода: `attached_assets` (алиас `@assets`)
- Файлы, копируемые как есть (видео, шрифты, иконки, `.htaccess`): `client/public`

## Публикация

1. Пуш в `main` → GitHub Actions (`.github/workflows/build-deploy.yml`) собирает сайт
   и коммитит готовые файлы в ветку `deploy`.
2. cPanel → Git Version Control → репозиторий на ветке `deploy` →
   **Update from Remote** → **Deploy HEAD Commit**. Файлы копируются в `public_html`
   по правилам `deploy/.cpanel.yml`.
