FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git unzip curl libzip-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring bcmath xml zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader

ENV CUSTOMER_EMAIL_ENABLED=false \
    PRODUCT_IMAGES_IN_DATABASE=true \
    APP_URL=https://xdweb-laravel.onrender.com \
    FRONTEND_URL=https://anden124.github.io/XDWeb/ \
    FRONTEND_HASH_ROUTING=true

CMD php artisan migrate --force && exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
