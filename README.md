# Solar System

Интерактивная 3D-модель Солнечной системы на Three.js с симуляцией реального времени.

**Демо:** https://duck27.github.io/solar-system/

## Локальный запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build          # локальная (относительные пути)
npm run build:pages    # как на GitHub Pages
npm run preview
```

## Деплой на GitHub Pages

1. В настройках репозитория: **Settings -> Pages -> Build and deployment -> Source: GitHub Actions**
2. Запушьте изменения в ветку `main` — workflow `.github/workflows/deploy.yml` соберёт и опубликует сайт автоматически.