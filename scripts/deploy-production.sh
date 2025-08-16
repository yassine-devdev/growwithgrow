#!/bin/bash

# Production deployment script with SSL/TLS and security configuration
# This script deploys the application with full security hardening

set -e

# Configuration
DOMAIN=${DOMAIN:-"yourdomain.com"}
EMAIL=${EMAIL:-"admin@yourdomain.com"}
ENVIRONMENT=${ENVIRONMENT:-"production"}
BACKUP_ENABLED=${BACKUP_ENABLED:-true}
MONITORING_ENABLED=${MONITORING_ENABLED:-true}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root for SSL setup"
    fi
}

# Validate environment variables
validate_environment() {
    log "Validating environment configuration..."
    
    local required_vars=(
        "DOMAIN"
        "EMAIL"
        "DB_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        error "Missing required environment variables: ${missing_vars[*]}"
    fi
    
    # Validate domain format
    if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
        error "Invalid domain format: $DOMAIN"
    fi
    
    # Validate email format
    if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        error "Invalid email format: $EMAIL"
    fi
    
    log "Environment validation passed"
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."
    
    # Install ufw if not present
    if ! command -v ufw &> /dev/null; then
        apt-get update
        apt-get install -y ufw
    fi
    
    # Reset firewall rules
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (be careful not to lock yourself out)
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow specific application ports if needed
    # ufw allow 3000/tcp  # If running development server
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall configured successfully"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p ssl/{certs,www,logs}
    mkdir -p logs/{nginx,app,security}
    mkdir -p backups/{database,files}
    mkdir -p monitoring/{prometheus,grafana}
    
    # Set proper permissions
    chmod 700 ssl/certs
    chmod 755 ssl/www
    chmod 755 logs
    chmod 700 backups
    
    log "Directories created successfully"
}

# Generate strong passwords if not provided
generate_passwords() {
    log "Generating secure passwords..."
    
    if [[ -z "$DB_PASSWORD" ]]; then
        export DB_PASSWORD=$(openssl rand -base64 32)
        echo "Generated DB_PASSWORD: $DB_PASSWORD"
    fi
    
    if [[ -z "$REDIS_PASSWORD" ]]; then
        export REDIS_PASSWORD=$(openssl rand -base64 32)
        echo "Generated REDIS_PASSWORD: $REDIS_PASSWORD"
    fi
    
    if [[ -z "$JWT_SECRET" ]]; then
        export JWT_SECRET=$(openssl rand -base64 64)
        echo "Generated JWT_SECRET: $JWT_SECRET"
    fi
    
    # Save passwords to secure file
    cat > .env.production << EOF
# Generated passwords - keep secure!
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
JWT_SECRET=$JWT_SECRET
DOMAIN=$DOMAIN
EMAIL=$EMAIL
EOF
    
    chmod 600 .env.production
    log "Passwords generated and saved to .env.production"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Run SSL setup script
    DOMAIN="$DOMAIN" EMAIL="$EMAIL" bash scripts/ssl-setup.sh
    
    log "SSL certificates configured"
}

# Build and deploy application
deploy_application() {
    log "Building and deploying application..."
    
    # Load environment variables
    set -a
    source .env.production
    set +a
    
    # Build images
    info "Building Docker images..."
    docker-compose -f docker-compose.production.yml build --no-cache
    
    # Stop existing containers
    info "Stopping existing containers..."
    docker-compose -f docker-compose.production.yml down || true
    
    # Start new containers
    info "Starting new containers..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be healthy
    info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f docker-compose.production.yml ps | grep -q "healthy"; then
            log "Services are healthy"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "Services failed to become healthy after $max_attempts attempts"
        fi
        
        info "Attempt $attempt/$max_attempts - waiting for services..."
        sleep 10
        ((attempt++))
    done
    
    log "Application deployed successfully"
}

# Setup monitoring
setup_monitoring() {
    if [[ "$MONITORING_ENABLED" != "true" ]]; then
        info "Monitoring disabled, skipping..."
        return
    fi
    
    log "Setting up monitoring..."
    
    # Create monitoring configuration
    mkdir -p monitoring/prometheus
    cat > monitoring/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'security-monitor'
    static_configs:
      - targets: ['security-monitor:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/nginx_status'
    scrape_interval: 30s
EOF

    # Create alert rules
    cat > monitoring/prometheus/alert_rules.yml << EOF
groups:
  - name: security_alerts
    rules:
      - alert: HighSecurityViolations
        expr: security_violations_total > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High number of security violations detected"
          description: "{{ \$value }} security violations in the last 5 minutes"

      - alert: DDoSAttackDetected
        expr: ddos_blocked_requests_total > 50
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Potential DDoS attack detected"
          description: "{{ \$value }} requests blocked in the last minute"

      - alert: SSLCertificateExpiring
        expr: ssl_certificate_expiry_days < 30
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "SSL certificate expiring soon"
          description: "SSL certificate expires in {{ \$value }} days"
EOF

    log "Monitoring configured"
}

# Setup backup system
setup_backup() {
    if [[ "$BACKUP_ENABLED" != "true" ]]; then
        info "Backup disabled, skipping..."
        return
    fi
    
    log "Setting up backup system..."
    
    # Create backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Backup script for production deployment
BACKUP_DIR="/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U postgres production_app > "$BACKUP_DIR/database/db_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/database/db_backup_$DATE.sql"

# Remove backups older than 7 days
find "$BACKUP_DIR/database" -name "*.gz" -mtime +7 -delete

# SSL certificates backup
tar -czf "$BACKUP_DIR/files/ssl_backup_$DATE.tar.gz" ssl/

echo "Backup completed: $DATE"
EOF

    chmod +x scripts/backup.sh
    
    # Add to crontab (daily backup at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /app/scripts/backup.sh") | crontab -
    
    log "Backup system configured"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check HTTPS
    info "Testing HTTPS connection..."
    if curl -f -s "https://$DOMAIN/health" > /dev/null; then
        log "HTTPS connection successful"
    else
        error "HTTPS connection failed"
    fi
    
    # Check security headers
    info "Testing security headers..."
    local headers=$(curl -I -s "https://$DOMAIN" | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options)")
    if [[ -n "$headers" ]]; then
        log "Security headers present"
    else
        warn "Some security headers may be missing"
    fi
    
    # Check API endpoint
    info "Testing API endpoint..."
    if curl -f -s "https://$DOMAIN/api/health" > /dev/null; then
        log "API endpoint accessible"
    else
        warn "API endpoint may not be accessible"
    fi
    
    # Check SSL certificate
    info "Verifying SSL certificate..."
    local cert_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates)
    if [[ -n "$cert_info" ]]; then
        log "SSL certificate valid"
        echo "$cert_info"
    else
        error "SSL certificate verification failed"
    fi
    
    log "Deployment verification completed"
}

# Display deployment summary
display_summary() {
    log "Deployment Summary"
    echo "=================="
    echo "Domain: $DOMAIN"
    echo "Environment: $ENVIRONMENT"
    echo "SSL: Enabled"
    echo "Security: Enhanced"
    echo "Monitoring: $MONITORING_ENABLED"
    echo "Backup: $BACKUP_ENABLED"
    echo ""
    echo "Services:"
    docker-compose -f docker-compose.production.yml ps
    echo ""
    echo "Your application is now available at: https://$DOMAIN"
    echo "Security monitoring dashboard: https://$DOMAIN/security-dashboard"
    echo ""
    echo "Important files:"
    echo "- SSL certificates: ./ssl/certs/"
    echo "- Environment config: ./.env.production"
    echo "- Logs: ./logs/"
    echo "- Backups: ./backups/"
    echo ""
    echo "Next steps:"
    echo "1. Test your application thoroughly"
    echo "2. Set up monitoring alerts"
    echo "3. Configure backup retention policies"
    echo "4. Review security logs regularly"
}

# Main execution
main() {
    log "Starting production deployment with SSL/TLS and security configuration"
    
    check_root
    validate_environment
    setup_firewall
    create_directories
    generate_passwords
    setup_ssl
    deploy_application
    setup_monitoring
    setup_backup
    verify_deployment
    display_summary
    
    log "Production deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "ssl-only")
        log "Setting up SSL only..."
        setup_ssl
        ;;
    "deploy-only")
        log "Deploying application only..."
        deploy_application
        ;;
    "verify")
        verify_deployment
        ;;
    *)
        main
        ;;
esac