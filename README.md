# 🎯 Chario - Децентрализованная Платформа Благотворительности

> **🚀 Живая Демонстрация:** [https://chario-frontend-singularity.vercel.app](#развертывание)

Современная децентрализованная платформа благотворительности, построенная на Ethereum, которая обеспечивает прозрачные, безопасные и эффективные благотворительные пожертвования с использованием технологии блокчейн. Создавайте благотворительные кампании, принимайте пожертвования в ETH и отслеживайте все транзакции в блокчейне с обновлениями в реальном времени.

## ✨ Возможности

- 🔗 **Web3 Интеграция**: Подключение с MetaMask и другими Web3 кошельками через RainbowKit
- 💰 **ETH Пожертвования**: Прием пожертвований напрямую в Ethereum с автоматической конвертацией в USD
- 📊 **Аналитика в Реальном Времени**: Отслеживание пожертвований в реальном времени с графиками и статистикой
- 🔐 **Безопасная Аутентификация**: Email/пароль и Google OAuth через Better Auth
- 📱 **Адаптивный Дизайн**: Современный UI, построенный на Next.js 15, Tailwind CSS и Shadcn/ui
- 🗄️ **Интеграция с Базой Данных**: PostgreSQL с Prisma ORM для хранения данных
- 📁 **Хранение Файлов**: Интеграция IPFS через Filebase для децентрализованного хранения изображений
- ⚡ **Обновления в Реальном Времени**: Живые ленты пожертвований с использованием Server-Sent Events
- 🔍 **Мониторинг Блокчейна**: Автоматическое прослушивание событий смарт-контрактов
- 📧 **Email Уведомления**: Автоматические письма через Resend для верификации и обновлений

## 🏗️ Архитектура

Этот проект состоит из трех основных компонентов:

### 1. **Фронтенд (chario/)** - Next.js 15 Приложение
- Современное React приложение с App Router
- Web3 интеграция с Wagmi и RainbowKit
- Обновления UI в реальном времени и адаптивный дизайн

### 2. **Смарт-Контракты (contracts/)** - Среда Разработки Hardhat
- Смарт-контракты Solidity для управления благотворительностью
- Hardhat для тестирования, развертывания и локального блокчейна
- Контракты OpenZeppelin для безопасности

### 3. **Слушатель Блокчейна (listener/)** - Сервис Мониторинга Событий
- Сервер Hono.js для мониторинга событий блокчейна
- Отслеживание пожертвований в реальном времени и обновления базы данных
- RESTful API для интеграции с фронтендом

## 🚀 Быстрый Старт

### Предварительные Требования

- **Node.js** 18+ и npm/yarn/pnpm
- **PostgreSQL** база данных
- **Git** для контроля версий
- **MetaMask** или совместимый Web3 кошелек

### 1. Клонирование Репозитория

```bash
git clone https://github.com/AlAdNi0806/chario
cd chario-platform
```

### 2. Установка Зависимостей

```bash
# Установка зависимостей для всех пакетов
cd chario && npm install
cd ../contracts && npm install
cd ../listener && npm install
```

### 3. Настройка Окружения

Создайте следующие файлы окружения:

#### **chario/.env.local**
```env
# База данных
DATABASE_URL="postgresql://username:password@localhost:5432/chario_db"

# Аутентификация
BETTER_AUTH_SECRET="ваш-супер-секретный-ключ"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (Опционально)
GOOGLE_CLIENT_ID="ваш-google-client-id"
GOOGLE_CLIENT_SECRET="ваш-google-client-secret"

# Email Сервис (Resend)
RESEND_API_KEY="ваш-resend-api-ключ"

# Хранение Файлов (Filebase/IPFS)
AWS_ACCESS_KEY_ID="ваш-filebase-access-key"
AWS_SECRET_ACCESS_KEY="ваш-filebase-secret-key"
S3_ENDPOINT="https://s3.filebase.com"
S3_BUCKET_NAME="имя-вашего-bucket"
NEXT_PUBLIC_IPFS_GATEWAY="https://influential-violet-muskox.myfilebase.com/ipfs"

# Блокчейн
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..." # Установить после развертывания контракта
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545" # Локальная нода Hardhat
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID="ваш-walletconnect-project-id"
```

#### **contracts/.env**
```env
# Alchemy API для тестовой сети Sepolia (опционально)
ALCHEMY_API_KEY="ваш-alchemy-api-ключ"

# Приватный ключ для развертывания (только тестовая сеть!)
SEPOLIA_PRIVATE_KEY="ваш-sepolia-приватный-ключ"

# Etherscan API для верификации контракта
ETHERSCAN_API_KEY="ваш-etherscan-api-ключ"
```

#### **listener/.env**
```env
# База данных (такая же как у фронтенда)
DATABASE_URL="postgresql://username:password@localhost:5432/chario_db"

# Блокчейн
CONTRACT_ADDRESS="0x..." # Установить после развертывания контракта
RPC_URL="http://127.0.0.1:8545" # Локальная нода Hardhat
```

### 4. Настройка Базы Данных

```bash
# Перейти в директорию chario
cd chario

# Сгенерировать Prisma клиент
npx prisma generate

# Запустить миграции базы данных
npx prisma db push

# (Опционально) Заполнить базу данных тестовыми данными
npx prisma db seed
```

### 5. Развертывание Смарт-Контрактов

```bash
# Перейти в директорию contracts
cd contracts

# Запустить локальную ноду Hardhat (оставить работающей)
npm run start

# В новом терминале развернуть контракты
npm run deploy

# Скопировать адрес развернутого контракта в ваши .env файлы
```

### 6. Запуск Серверов Разработки

Откройте **три отдельных терминала**:

**Терминал 1 - Фронтенд:**
```bash
cd chario
npm run dev
```

**Терминал 2 - Слушатель Блокчейна:**
```bash
cd listener
npm run dev
```

**Терминал 3 - Локальный Блокчейн (если еще не запущен):**
```bash
cd contracts
npm run start
```

### 7. Доступ к Приложению

- **Фронтенд**: http://localhost:3000
- **API Слушателя Блокчейна**: http://localhost:3001
- **RPC Локального Блокчейна**: http://localhost:8545

## 📋 Справочник Переменных Окружения

### Обязательные Переменные

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | Строка подключения PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `BETTER_AUTH_SECRET` | Секретный ключ для аутентификации | `ваш-секретный-ключ` |
| `BETTER_AUTH_URL` | Базовый URL для auth колбэков | `http://localhost:3000` |

### Опциональные Переменные

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - |
| `RESEND_API_KEY` | API ключ email сервиса Resend | - |
| `AWS_ACCESS_KEY_ID` | Ключ доступа Filebase | - |
| `AWS_SECRET_ACCESS_KEY` | Секретный ключ Filebase | - |
| `NEXT_PUBLIC_RPC_URL` | Эндпоинт блокчейн RPC | `http://127.0.0.1:8545` |

## 🧪 Тестирование

### Тесты Смарт-Контрактов
```bash
cd contracts
npm test
```

### Тесты Фронтенда
```bash
cd chario
npm test
```

## 📦 Развертывание

### Развертывание Фронтенда (Vercel)

1. Подключите ваш репозиторий к Vercel
2. Установите переменные окружения в панели Vercel
3. Автоматическое развертывание при пуше в main ветку

### Развертывание Смарт-Контрактов (Тестовая Сеть Sepolia)

```bash
cd contracts
npm run deploy:sepolia
npm run verify:sepolia <адрес-контракта>
```

### Развертывание Слушателя Блокчейна

Разверните на любом Node.js хостинге (Railway, Render и т.д.) с настроенными переменными окружения.

## 🛠️ Технологический Стек

### Фронтенд
- **Next.js 15** - React фреймворк с App Router
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Shadcn/ui** - Современная библиотека компонентов
- **Wagmi** - React хуки для Ethereum
- **RainbowKit** - UI для подключения кошельков
- **Prisma** - ORM для базы данных
- **Better Auth** - Решение для аутентификации

### Бэкенд
- **Hono.js** - Быстрый веб-фреймворк
- **Ethers.js** - Библиотека для Ethereum
- **Prisma** - ORM для базы данных
- **PostgreSQL** - База данных

### Блокчейн
- **Solidity** - Язык смарт-контрактов
- **Hardhat** - Среда разработки
- **OpenZeppelin** - Контракты безопасности

## 🤝 Участие в Разработке

1. Сделайте форк репозитория
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте ваши изменения (`git commit -m 'Добавить потрясающую функцию'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под лицензией MIT - см. файл [LICENSE](LICENSE) для подробностей.

## 🆘 Поддержка

Если вы столкнулись с проблемами:

1. Просмотрите настройку переменных окружения
2. Убедитесь, что все сервисы запущены
3. Проверьте логи консоли на наличие ошибок

## 🙏 Благодарности

- Построено с [Next.js](https://nextjs.org/)
- UI компоненты от [Shadcn/ui](https://ui.shadcn.com/)
- Web3 интеграция через [Wagmi](https://wagmi.sh/) и [RainbowKit](https://www.rainbowkit.com/)
- Разработка смарт-контрактов с [Hardhat](https://hardhat.org/)
