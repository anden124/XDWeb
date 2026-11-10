FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git unzip curl libzip-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring bcmath xml zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader

CMD exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
