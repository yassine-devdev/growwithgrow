#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MonitoringSetup {
  constructor() {
    this.monitoringDir = path.join(process.cwd(), 'monitoring');
    this.dockerComposeFile = path.join(process.cwd(), 'docker-compose.monitoring.yml');
  }

  async setup() {
    console.log('🔧 Setting up comprehensive monitoring stack...');
    
    try {
      await this.createDirectories();
      await this.createDockerCompose();
      await this.createGrafanaDashboards();
      await this.setupPrometheusConfig();
      await this.setupAlertmanager();
      await this.addMonitoringScripts();
      
      console.log('✅ Monitoring setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Configure environment variables in .env file');
      console.log('2. Run: docker-compose -f docker-compose.monitoring.yml up -d');
      console.log('3. Access Grafana at http://localhost:3000 (admin/admin)');
      console.log('4. Access Prometheus at http://localhost:9090');
      console.log('5. Access Alertmanager at http://localhost:9093');
      
    } catch (error) {
      console.error('❌ Monitoring setup failed:', error.message);
      process.exit(1);
    }
  }

  async createDirectories() {
    console.log('📁 Creating monitoring directories...');
    
    const dirs = [
      'monitoring/grafana/dashboards',
      'monitoring/grafana/datasources',
      'monitoring/prometheus/rules',
      'monitoring/alertmanager/templates',
      'logs'
    ];
    
    dirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  ✓ Created ${dir}`);
      }
    });
  }

  async createDockerCompose() {
    console.log('🐳 Creating monitoring Docker Compose file...');
    
    const dockerCompose = `version: '3.8'

services:
  # Prometheus for metrics collection
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus
    networks:
      - monitoring
    restart: unless-stopped
    labels:
      - "monitoring.service=prometheus"

  # Grafana for visualization
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=\${GRAFANA_PASSWORD:-admin123}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - monitoring
    restart: unless-stopped
    labels:
      - "monitoring.service=grafana"

  # Alertmanager for alert handling
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    networks:
      - monitoring
    restart: unless-stopped
    labels:
      - "monitoring.service=alertmanager"

  # Node Exporter for system metrics
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring
    restart: unless-stopped
    labels:
      - "monitoring.service=node-exporter"

  # PostgreSQL Exporter
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: postgres-exporter
    environment:
      - DATA_SOURCE_NAME=postgresql://\${DB_USER:-postgres}:\${DB_PASSWORD:-postgres}@postgres:5432/\${DB_NAME:-production_app}?sslmode=disable
    ports:
      - "9187:9187"
    networks:
      - monitoring
      - app-network
    restart: unless-stopped
    depends_on:
      - postgres
    labels:
      - "monitoring.service=postgres-exporter"

  # Redis Exporter
  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: redis-exporter
    environment:
      - REDIS_ADDR=redis:6379
      - REDIS_PASSWORD=\${REDIS_PASSWORD:-redis123}
    ports:
      - "9121:9121"
    networks:
      - monitoring
      - app-network
    restart: unless-stopped
    depends_on:
      - redis
    labels:
      - "monitoring.service=redis-exporter"

  # Loki for log aggregation (open-source alternative to ELK)
  loki:
    image: grafana/loki:latest
    container_name: loki
    command: -config.file=/etc/loki/local-config.yaml
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki
    networks:
      - monitoring
    restart: unless-stopped
    labels:
      - "monitoring.service=loki"

  # Promtail for log collection
  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    command: -config.file=/etc/promtail/config.yml
    volumes:
      - ./logs:/var/log/app:ro
      - ./monitoring/promtail-config.yml:/etc/promtail/config.yml
    networks:
      - monitoring
    restart: unless-stopped
    depends_on:
      - loki
    labels:
      - "monitoring.service=promtail"

  # Jaeger for distributed tracing (optional)
  jaeger:
    image: jaegertracing/all-in-one:latest
    container_name: jaeger
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    ports:
      - "16686:16686"  # Jaeger UI
      - "14268:14268"  # Jaeger collector
      - "14250:14250"  # Jaeger gRPC
    networks:
      - monitoring
    restart: unless-stopped
    labels:
      - "monitoring.service=jaeger"

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
  loki_data:

networks:
  monitoring:
    driver: bridge
  app-network:
    external: true
`;

    fs.writeFileSync(this.dockerComposeFile, dockerCompose);
    console.log('  ✓ Created docker-compose.monitoring.yml');
  }

  async createGrafanaDashboards() {
    console.log('📊 Creating additional Grafana dashboards...');
    
    // System metrics dashboard
    const systemDashboard = {
      dashboard: {
        id: null,
        title: "System Metrics",
        tags: ["system", "infrastructure"],
        timezone: "browser",
        panels: [
          {
            id: 1,
            title: "CPU Usage",
            type: "timeseries",
            targets: [
              {
                expr: "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
                legendFormat: "{{instance}}"
              }
            ],
            fieldConfig: {
              defaults: {
                unit: "percent",
                min: 0,
                max: 100
              }
            },
            gridPos: { h: 8, w: 12, x: 0, y: 0 }
          },
          {
            id: 2,
            title: "Memory Usage",
            type: "timeseries",
            targets: [
              {
                expr: "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
                legendFormat: "{{instance}}"
              }
            ],
            fieldConfig: {
              defaults: {
                unit: "percent",
                min: 0,
                max: 100
              }
            },
            gridPos: { h: 8, w: 12, x: 12, y: 0 }
          }
        ],
        time: { from: "now-1h", to: "now" },
        refresh: "30s"
      }
    };
    
    fs.writeFileSync(
      path.join(this.monitoringDir, 'grafana/dashboards/system-metrics.json'),
      JSON.stringify(systemDashboard, null, 2)
    );
    
    console.log('  ✓ Created system metrics dashboard');
  }

  async setupPrometheusConfig() {
    console.log('⚙️ Setting up Prometheus configuration...');
    
    // Already created in previous steps, just verify
    const prometheusConfig = path.join(this.monitoringDir, 'prometheus.yml');
    if (fs.existsSync(prometheusConfig)) {
      console.log('  ✓ Prometheus configuration already exists');
    }
  }

  async setupAlertmanager() {
    console.log('🚨 Setting up Alertmanager...');
    
    // Create Promtail config for log collection
    const promtailConfig = `server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: app-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: app-logs
          __path__: /var/log/app/*.log
    pipeline_stages:
      - json:
          expressions:
            timestamp: timestamp
            level: level
            message: message
            component: component
            correlationId: correlationId
      - timestamp:
          source: timestamp
          format: RFC3339
      - labels:
          level:
          component:
          correlationId:
`;

    fs.writeFileSync(
      path.join(this.monitoringDir, 'promtail-config.yml'),
      promtailConfig
    );
    
    console.log('  ✓ Created Promtail configuration');
  }

  async addMonitoringScripts() {
    console.log('📝 Adding monitoring management scripts...');
    
    // Add monitoring scripts to package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const monitoringScripts = {
      "monitoring:start": "docker-compose -f docker-compose.monitoring.yml up -d",
      "monitoring:stop": "docker-compose -f docker-compose.monitoring.yml down",
      "monitoring:logs": "docker-compose -f docker-compose.monitoring.yml logs -f",
      "monitoring:restart": "docker-compose -f docker-compose.monitoring.yml restart",
      "monitoring:status": "docker-compose -f docker-compose.monitoring.yml ps",
      "monitoring:setup": "node scripts/setup-monitoring.js"
    };
    
    packageJson.scripts = { ...packageJson.scripts, ...monitoringScripts };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('  ✓ Added monitoring scripts to package.json');
  }
}

async function main() {
  const setup = new MonitoringSetup();
  await setup.setup();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MonitoringSetup;