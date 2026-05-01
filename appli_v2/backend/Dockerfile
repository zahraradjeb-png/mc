FROM php:8.1-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first (for better Docker cache)
COPY composer.json composer.lock ./

# Create .env before install (needed for artisan package:discover)
RUN touch .env && echo "APP_KEY=" > .env

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy all app files
COPY . .

# Run post-install scripts now that all files are present
RUN composer dump-autoload --optimize

# Generate .env from example if available
RUN cp -n .env.example .env 2>/dev/null || true

# Create required storage directories and upload directories
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views
RUN mkdir -p public/uploads/products public/uploads/profiles

# Set permissions for Laravel storage, cache, and uploads
RUN chown -R www-data:www-data storage bootstrap/cache public/uploads
RUN chmod -R 775 storage bootstrap/cache public/uploads

# Increase PHP upload limits
RUN echo "upload_max_filesize = 20M\npost_max_size = 25M\nmax_execution_time = 120" > /usr/local/etc/php/conf.d/uploads.ini

# Point Apache to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Allow .htaccess overrides
RUN echo '<Directory /var/www/html/public>\n    AllowOverride All\n    Require all granted\n</Directory>' >> /etc/apache2/apache2.conf

# Use PORT env variable from Render (default 10000)
RUN sed -i 's/80/${PORT}/g' /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf

EXPOSE ${PORT}

CMD ["apache2-foreground"]
