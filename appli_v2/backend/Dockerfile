FROM php:8.1-apache

# Install PHP extensions needed by Laravel
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite for Laravel pretty URLs
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy app files
COPY . .

# Install PHP dependencies (production only)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions for Laravel storage and cache
RUN chown -R www-data:www-data storage bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# Point Apache to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Allow .htaccess overrides
RUN echo '<Directory /var/www/html/public>\n    AllowOverride All\n    Require all granted\n</Directory>' >> /etc/apache2/apache2.conf

# Use PORT env variable from Render
RUN sed -i 's/80/${PORT}/g' /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf

EXPOSE ${PORT}

CMD ["apache2-foreground"]
