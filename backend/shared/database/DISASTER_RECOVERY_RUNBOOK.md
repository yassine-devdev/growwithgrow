# Disaster Recovery Runbook

## Overview

This runbook provides step-by-step procedures for disaster recovery scenarios in the AI-powered SaaS application. It covers backup restoration, point-in-time recovery, and business continuity procedures.

## Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)

- **RTO Target**: 30 minutes (maximum downtime)
- **RPO Target**: 60 minutes (maximum data loss)
- **Backup Frequency**: Daily at 2:00 AM UTC
- **Backup Retention**: 30 days

## Emergency Contacts

| Role | Contact | Phone | Email |
|------|---------|-------|-------|
| Primary DBA | [Name] | [Phone] | [Email] |
| Backup DBA | [Name] | [Phone] | [Email] |
| DevOps Lead | [Name] | [Phone] | [Email] |
| System Administrator | [Name] | [Phone] | [Email] |

## Disaster Scenarios and Procedures

### Scenario 1: Complete Database Loss

**Symptoms:**
- Database server is unresponsive
- Connection errors across all services
- Data corruption detected

**Recovery Steps:**

1. **Immediate Response (0-5 minutes)**
   ```bash
   # Check database status
   systemctl status postgresql
   
   # Check disk space
   df -h
   
   # Check system logs
   journalctl -u postgresql -f
   ```

2. **Assess Damage (5-10 minutes)**
   ```bash
   # Try to connect to database
   psql -h localhost -U postgres -d production
   
   # Check for corruption
   pg_dump --schema-only production > /dev/null
   ```

3. **Initiate Recovery (10-30 minutes)**
   ```bash
   # Stop application services
   systemctl stop app-backend
   systemctl stop app-frontend
   
   # Prepare for restore
   systemctl stop postgresql
   mv /var/lib/postgresql/data /var/lib/postgresql/data.corrupted
   mkdir /var/lib/postgresql/data
   chown postgres:postgres /var/lib/postgresql/data
   
   # Start PostgreSQL
   systemctl start postgresql
   
   # Restore from latest backup
   node -e "
   const { BackupService } = require('./backend/shared/database/backup-service');
   const service = new BackupService(config, databases);
   service.restoreLatestBackup().then(() => console.log('Restore complete'));
   "
   ```

4. **Verification (25-30 minutes)**
   ```bash
   # Verify database integrity
   psql -c "SELECT COUNT(*) FROM users;"
   psql -c "SELECT COUNT(*) FROM ai_usage;"
   
   # Start application services
   systemctl start app-backend
   systemctl start app-frontend
   
   # Run health checks
   curl http://localhost:3001/health
   ```

### Scenario 2: Point-in-Time Recovery

**Use Case:** Data corruption or accidental deletion detected

**Recovery Steps:**

1. **Identify Target Time**
   ```bash
   # Review application logs to identify when corruption occurred
   grep -r "ERROR" /var/log/app/ | tail -100
   
   # Check audit logs
   psql -c "SELECT * FROM audit_logs WHERE created_at > '2024-01-01 10:00:00' ORDER BY created_at DESC LIMIT 50;"
   ```

2. **Create Point-in-Time Backup**
   ```javascript
   // Using the BackupService
   const targetTime = new Date('2024-01-01T09:30:00Z');
   const pitBackup = await backupService.createPointInTimeRecovery(targetTime);
   console.log(`Point-in-time backup created: ${pitBackup.id}`);
   ```

3. **Restore to Point-in-Time**
   ```bash
   # Stop services
   systemctl stop app-backend
   
   # Create backup of current state
   pg_dump production > /backups/pre-restore-$(date +%Y%m%d_%H%M%S).sql
   
   # Restore from point-in-time backup
   dropdb production
   createdb production
   psql production < /backups/point-in-time-backup.sql
   
   # Restart services
   systemctl start app-backend
   ```

### Scenario 3: Partial Data Loss

**Use Case:** Specific table or data corruption

**Recovery Steps:**

1. **Identify Affected Data**
   ```sql
   -- Check table integrity
   SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del 
   FROM pg_stat_user_tables 
   WHERE schemaname = 'public';
   
   -- Verify specific tables
   SELECT COUNT(*) FROM users WHERE created_at > '2024-01-01';
   ```

2. **Selective Restore**
   ```bash
   # Extract specific table from backup
   pg_restore -t users /backups/latest-backup.sql > users_restore.sql
   
   # Create temporary table
   psql -c "CREATE TABLE users_backup AS SELECT * FROM users;"
   
   # Restore specific table
   psql -c "TRUNCATE users;"
   psql < users_restore.sql
   
   # Verify restoration
   psql -c "SELECT COUNT(*) FROM users;"
   ```

### Scenario 4: Application Server Failure

**Use Case:** Server hardware failure or OS corruption

**Recovery Steps:**

1. **Immediate Failover**
   ```bash
   # Update DNS to point to backup server
   # This would typically be done through your DNS provider
   
   # Or update load balancer configuration
   # Update nginx/haproxy configuration to remove failed server
   ```

2. **Restore Application on New Server**
   ```bash
   # Clone application repository
   git clone https://github.com/your-org/your-app.git
   cd your-app
   
   # Install dependencies
   npm install
   
   # Restore environment configuration
   cp /backups/env-backup/.env .env
   cp /backups/env-backup/.env.production .env.production
   
   # Start services
   npm run build:prod
   npm run start:prod
   ```

3. **Database Connection Verification**
   ```bash
   # Test database connectivity
   node -e "
   const db = require('./backend/shared/database');
   db.query('SELECT 1').then(() => console.log('DB OK')).catch(console.error);
   "
   ```

## Backup Verification Procedures

### Daily Verification

```bash
#!/bin/bash
# Daily backup verification script

echo "Starting daily backup verification..."

# Check if backup exists
BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_FILE="/backups/backup_${BACKUP_DATE}*.sql"

if [ ! -f $BACKUP_FILE ]; then
    echo "ERROR: No backup found for $BACKUP_DATE"
    exit 1
fi

# Verify backup integrity
node -e "
const { BackupService } = require('./backend/shared/database/backup-service');
const service = new BackupService(config, databases);
service.verifyLatestBackup().then(result => {
    if (result.isValid) {
        console.log('✅ Backup verification passed');
        process.exit(0);
    } else {
        console.log('❌ Backup verification failed:', result.errors);
        process.exit(1);
    }
});
"
```

### Weekly Full Verification

```bash
#!/bin/bash
# Weekly comprehensive backup verification

echo "Starting weekly backup verification..."

# Test restore to temporary database
createdb backup_test_$(date +%Y%m%d)

# Restore latest backup
LATEST_BACKUP=$(ls -t /backups/backup_*.sql | head -1)
psql backup_test_$(date +%Y%m%d) < $LATEST_BACKUP

# Verify data integrity
psql backup_test_$(date +%Y%m%d) -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins + n_tup_upd + n_tup_del as total_operations
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY total_operations DESC;
"

# Cleanup test database
dropdb backup_test_$(date +%Y%m%d)

echo "Weekly verification completed"
```

## Monitoring and Alerting

### Backup Health Monitoring

```javascript
// Backup health check endpoint
app.get('/health/backup', async (req, res) => {
  try {
    const backupService = new BackupService(config, databases);
    const status = await backupService.getDisasterRecoveryStatus();
    
    if (status.isHealthy) {
      res.status(200).json({ status: 'healthy', ...status });
    } else {
      res.status(503).json({ status: 'unhealthy', ...status });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});
```

### Alert Conditions

1. **Critical Alerts (Immediate Response)**
   - No backup in last 25 hours
   - Backup verification failed
   - Database connection lost
   - Disk space < 10%

2. **Warning Alerts (Response within 4 hours)**
   - Backup size deviation > 50%
   - Backup duration > 2 hours
   - Verification not run in 7 days

3. **Info Alerts (Response within 24 hours)**
   - Backup cleanup completed
   - New backup created
   - Verification passed

## Testing Procedures

### Monthly Disaster Recovery Test

```bash
#!/bin/bash
# Monthly DR test script

echo "Starting monthly disaster recovery test..."

# 1. Create test backup
echo "Creating test backup..."
node -e "
const { BackupService } = require('./backend/shared/database/backup-service');
const service = new BackupService(config, databases);
service.createVerifiedBackup().then(() => console.log('Test backup created'));
"

# 2. Test restore to staging environment
echo "Testing restore to staging..."
# This would restore to a staging database
psql staging < /backups/test-backup.sql

# 3. Verify application functionality
echo "Testing application functionality..."
curl -f http://staging.example.com/health || exit 1
curl -f http://staging.example.com/api/dashboard/kpis || exit 1

# 4. Cleanup
echo "Cleaning up test environment..."
# Cleanup staging environment

echo "Monthly DR test completed successfully"
```

### Quarterly Full DR Simulation

1. **Preparation**
   - Schedule maintenance window
   - Notify stakeholders
   - Prepare secondary environment

2. **Execution**
   - Simulate primary system failure
   - Execute full recovery procedures
   - Measure recovery time
   - Verify all functionality

3. **Documentation**
   - Record actual RTO/RPO
   - Document any issues
   - Update procedures if needed

## Recovery Validation Checklist

After any recovery procedure, verify:

- [ ] Database connectivity restored
- [ ] All tables present and accessible
- [ ] Data integrity checks pass
- [ ] Application services running
- [ ] User authentication working
- [ ] AI services responding
- [ ] Dashboard loading correctly
- [ ] API endpoints responding
- [ ] Monitoring systems active
- [ ] Backup schedule resumed

## Post-Recovery Actions

1. **Immediate (0-1 hour)**
   - Verify system functionality
   - Monitor error logs
   - Check performance metrics
   - Notify stakeholders of recovery

2. **Short-term (1-24 hours)**
   - Conduct post-mortem analysis
   - Update documentation
   - Review and improve procedures
   - Schedule follow-up monitoring

3. **Long-term (1-7 days)**
   - Analyze root cause
   - Implement preventive measures
   - Update disaster recovery plan
   - Conduct team training if needed

## Maintenance and Updates

### Monthly Tasks
- Review and test backup procedures
- Update contact information
- Verify backup retention policies
- Check disk space and cleanup old backups

### Quarterly Tasks
- Full disaster recovery simulation
- Review and update RTO/RPO targets
- Update runbook procedures
- Train team members on procedures

### Annual Tasks
- Complete disaster recovery audit
- Review and update business continuity plan
- Evaluate backup and recovery tools
- Update emergency contact information

## Troubleshooting Common Issues

### Backup Fails to Start
```bash
# Check disk space
df -h /backups

# Check permissions
ls -la /backups

# Check database connectivity
psql -c "SELECT 1;"

# Check backup service logs
journalctl -u backup-service -f
```

### Restore Takes Too Long
```bash
# Check system resources
top
iostat -x 1

# Use parallel restore if available
pg_restore -j 4 backup.dump

# Monitor restore progress
tail -f /var/log/postgresql/postgresql.log
```

### Backup Verification Fails
```bash
# Check backup file integrity
file /backups/backup.sql
head -100 /backups/backup.sql

# Verify checksum
sha256sum /backups/backup.sql

# Test with smaller restore
pg_restore --schema-only backup.dump
```

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Next Review**: [Date + 3 months]  
**Owner**: Database Administration Team