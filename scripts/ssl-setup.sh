#!/bin/bash

# SSL/TLS Setup Script with Let's Encrypt
# This script automates SSL certificate provisioning and renewal

set -e

# Configuration
DOMAIN=${DOMAIN:-"yourdomain.com"}
EMAIL=${EMAIL:-"admin@yourdomain.com"}
STAGING=${STAGING:-false}
NGINX_CONTAINER=${NGINX_CONTAINER:-"frontend"}
WEBROOT_PATH=${WEBROOT_PATH:-"/var/www/certbot"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Update package list
    apt-get update
    
    # Install required packages
    apt-get install -y \
        curl \
        wget \
        openssl \
        cron \
        logrotate
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        log "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        log "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
}

# Generate DH parameters for perfect forward secrecy
generate_dhparam() {
    log "Generating DH parameters (this may take a while)..."
    
    if [[ ! -f /etc/ssl/certs/dhparam.pem ]]; then
        openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
        log "DH parameters generated successfully"
    else
        log "DH parameters already exist, skipping..."
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p /etc/letsencrypt
    mkdir -p /var/www/certbot
    mkdir -p /var/log/letsencrypt
    mkdir -p /etc/nginx/ssl
    
    # Set proper permissions
    chmod 755 /var/www/certbot
    chmod 700 /etc/letsencrypt
}

# Create initial SSL certificate (self-signed for testing)
create_initial_cert() {
    log "Creating initial self-signed certificate..."
    
    local cert_dir="/etc/letsencrypt/live/${DOMAIN}"
    mkdir -p "$cert_dir"
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
        -keyout "$cert_dir/privkey.pem" \
        -out "$cert_dir/fullchain.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN}"
    
    # Create chain file
    cp "$cert_dir/fullchain.pem" "$cert_dir/chain.pem"
    
    log "Initial certificate created"
}

# Start nginx with SSL configuration
start_nginx() {
    log "Starting nginx with SSL configuration..."
    
    # Copy SSL configuration files
    cp docker/nginx-ssl.conf /etc/nginx/nginx.conf
    cp docker/default-ssl.conf /etc/nginx/conf.d/default.conf
    cp docker/ssl-config.conf /etc/nginx/ssl-config.conf
    
    # Update domain in configuration
    sed -i "s/yourdomain.com/${DOMAIN}/g" /etc/nginx/ssl-config.conf
    
    # Test nginx configuration
    nginx -t || error "Nginx configuration test failed"
    
    # Start or reload nginx
    if pgrep nginx > /dev/null; then
        nginx -s reload
    else
        nginx
    fi
    
    log "Nginx started with SSL configuration"
}

# Obtain Let's Encrypt certificate
obtain_certificate() {
    log "Obtaining Let's Encrypt certificate for ${DOMAIN}..."
    
    local staging_flag=""
    if [[ "$STAGING" == "true" ]]; then
        staging_flag="--staging"
        warn "Using Let's Encrypt staging environment"
    fi
    
    # Run certbot
    docker run --rm \
        -v /etc/letsencrypt:/etc/letsencrypt \
        -v /var/www/certbot:/var/www/certbot \
        -v /var/log/letsencrypt:/var/log/letsencrypt \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        $staging_flag \
        -d "$DOMAIN" \
        -d "www.${DOMAIN}"
    
    if [[ $? -eq 0 ]]; then
        log "Certificate obtained successfully"
        
        # Reload nginx to use new certificate
        nginx -s reload
        log "Nginx reloaded with new certificate"
    else
        error "Failed to obtain certificate"
    fi
}

# Setup automatic renewal
setup_renewal() {
    log "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash

# Certificate renewal script
DOMAIN=${DOMAIN:-"yourdomain.com"}
LOG_FILE="/var/log/letsencrypt/renewal.log"

echo "$(date): Starting certificate renewal check" >> "$LOG_FILE"

# Attempt renewal
docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/www/certbot:/var/www/certbot \
    -v /var/log/letsencrypt:/var/log/letsencrypt \
    certbot/certbot renew \
    --webroot \
    --webroot-path=/var/www/certbot \
    --quiet

# Check if renewal was successful
if [[ $? -eq 0 ]]; then
    echo "$(date): Certificate renewal successful" >> "$LOG_FILE"
    
    # Reload nginx
    nginx -s reload
    echo "$(date): Nginx reloaded" >> "$LOG_FILE"
else
    echo "$(date): Certificate renewal failed" >> "$LOG_FILE"
fi

echo "$(date): Certificate renewal check completed" >> "$LOG_FILE"
EOF

    chmod +x /usr/local/bin/renew-ssl.sh
    
    # Add cron job for automatic renewal (runs twice daily)
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/local/bin/renew-ssl.sh") | crontab -
    (crontab -l 2>/dev/null; echo "0 0 * * * /usr/local/bin/renew-ssl.sh") | crontab -
    
    log "Automatic renewal configured"
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    cat > /etc/logrotate.d/letsencrypt << 'EOF'
/var/log/letsencrypt/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

    cat > /etc/logrotate.d/nginx-ssl << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF

    log "Log rotation configured"
}

# Verify SSL configuration
verify_ssl() {
    log "Verifying SSL configuration..."
    
    # Test SSL certificate
    echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates
    
    # Test SSL configuration
    curl -I "https://$DOMAIN" || warn "SSL verification failed - check configuration"
    
    log "SSL verification completed"
}

# Main execution
main() {
    log "Starting SSL/TLS setup for domain: $DOMAIN"
    
    check_root
    install_dependencies
    create_directories
    generate_dhparam
    create_initial_cert
    start_nginx
    
    # Wait a moment for nginx to start
    sleep 5
    
    obtain_certificate
    setup_renewal
    setup_log_rotation
    verify_ssl
    
    log "SSL/TLS setup completed successfully!"
    log "Your site should now be accessible at https://$DOMAIN"
    log "Certificate will be automatically renewed twice daily"
}

# Handle script arguments
case "${1:-}" in
    "renew")
        log "Running certificate renewal..."
        /usr/local/bin/renew-ssl.sh
        ;;
    "verify")
        verify_ssl
        ;;
    *)
        main
        ;;
esac