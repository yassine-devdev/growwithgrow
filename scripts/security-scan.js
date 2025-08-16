#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SecurityScanner {
  constructor() {
    this.reportDir = path.join(process.cwd(), 'security-reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  async initialize() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async runNpmAudit() {
    console.log('🔍 Running npm audit...');
    
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(auditResult);
      
      const reportPath = path.join(this.reportDir, `npm-audit-${this.timestamp}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(auditData, null, 2));
      
      console.log(`✅ npm audit completed. Report saved to: ${reportPath}`);
      
      // Check for high/critical vulnerabilities
      const vulnerabilities = auditData.vulnerabilities || {};
      const highCritical = Object.values(vulnerabilities).filter(
        vuln => vuln.severity === 'high' || vuln.severity === 'critical'
      );
      
      if (highCritical.length > 0) {
        console.log(`⚠️  Found ${highCritical.length} high/critical vulnerabilities`);
        return { success: false, highCritical: highCritical.length };
      }
      
      return { success: true, vulnerabilities: Object.keys(vulnerabilities).length };
    } catch (error) {
      console.error('❌ npm audit failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runSnykTest() {
    console.log('🔍 Running Snyk vulnerability scan...');
    
    try {
      const snykResult = execSync('snyk test --json', { encoding: 'utf8' });
      const snykData = JSON.parse(snykResult);
      
      const reportPath = path.join(this.reportDir, `snyk-test-${this.timestamp}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(snykData, null, 2));
      
      console.log(`✅ Snyk test completed. Report saved to: ${reportPath}`);
      
      const highCritical = snykData.vulnerabilities?.filter(
        vuln => vuln.severity === 'high' || vuln.severity === 'critical'
      ) || [];
      
      if (highCritical.length > 0) {
        console.log(`⚠️  Snyk found ${highCritical.length} high/critical vulnerabilities`);
        return { success: false, highCritical: highCritical.length };
      }
      
      return { success: true, vulnerabilities: snykData.vulnerabilities?.length || 0 };
    } catch (error) {
      // Snyk returns non-zero exit code when vulnerabilities are found
      if (error.stdout) {
        try {
          const snykData = JSON.parse(error.stdout);
          const reportPath = path.join(this.reportDir, `snyk-test-${this.timestamp}.json`);
          fs.writeFileSync(reportPath, JSON.stringify(snykData, null, 2));
          
          const highCritical = snykData.vulnerabilities?.filter(
            vuln => vuln.severity === 'high' || vuln.severity === 'critical'
          ) || [];
          
          console.log(`⚠️  Snyk found vulnerabilities. Report saved to: ${reportPath}`);
          return { success: false, highCritical: highCritical.length };
        } catch (parseError) {
          console.error('❌ Failed to parse Snyk output:', parseError.message);
        }
      }
      
      console.error('❌ Snyk test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async scanDependencyLicenses() {
    console.log('📄 Scanning dependency licenses...');
    
    try {
      // Check if license-checker is available
      try {
        execSync('npx license-checker --version', { stdio: 'ignore' });
      } catch {
        console.log('📦 Installing license-checker...');
        execSync('npm install -g license-checker', { stdio: 'inherit' });
      }
      
      const licenseResult = execSync('npx license-checker --json', { encoding: 'utf8' });
      const licenseData = JSON.parse(licenseResult);
      
      const reportPath = path.join(this.reportDir, `licenses-${this.timestamp}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(licenseData, null, 2));
      
      // Check for problematic licenses
      const problematicLicenses = ['GPL-2.0', 'GPL-3.0', 'AGPL-1.0', 'AGPL-3.0'];
      const issues = [];
      
      Object.entries(licenseData).forEach(([pkg, info]) => {
        if (problematicLicenses.some(license => info.licenses?.includes(license))) {
          issues.push({ package: pkg, license: info.licenses });
        }
      });
      
      if (issues.length > 0) {
        console.log(`⚠️  Found ${issues.length} packages with potentially problematic licenses`);
        issues.forEach(issue => {
          console.log(`  - ${issue.package}: ${issue.license}`);
        });
      }
      
      console.log(`✅ License scan completed. Report saved to: ${reportPath}`);
      return { success: true, issues: issues.length };
    } catch (error) {
      console.error('❌ License scan failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async generateSecurityReport() {
    console.log('📊 Generating security summary report...');
    
    const npmResult = await this.runNpmAudit();
    const snykResult = await this.runSnykTest();
    const licenseResult = await this.scanDependencyLicenses();
    
    const summary = {
      timestamp: new Date().toISOString(),
      npm_audit: npmResult,
      snyk_test: snykResult,
      license_scan: licenseResult,
      overall_status: npmResult.success && snykResult.success && licenseResult.success ? 'PASS' : 'FAIL'
    };
    
    const summaryPath = path.join(this.reportDir, `security-summary-${this.timestamp}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📋 Security summary report saved to: ${summaryPath}`);
    
    // Print summary
    console.log('\n📊 Security Scan Summary:');
    console.log(`  Overall Status: ${summary.overall_status}`);
    console.log(`  npm audit: ${npmResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Snyk test: ${snykResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  License scan: ${licenseResult.success ? '✅ PASS' : '❌ FAIL'}`);
    
    return summary;
  }

  async fixVulnerabilities() {
    console.log('🔧 Attempting to fix vulnerabilities...');
    
    try {
      console.log('📦 Running npm audit fix...');
      execSync('npm audit fix', { stdio: 'inherit' });
      
      console.log('🔍 Re-running security scan to verify fixes...');
      const postFixSummary = await this.generateSecurityReport();
      
      return postFixSummary;
    } catch (error) {
      console.error('❌ Failed to fix vulnerabilities:', error.message);
      return { success: false, error: error.message };
    }
  }
}

async function main() {
  const scanner = new SecurityScanner();
  await scanner.initialize();
  
  const command = process.argv[2] || 'scan';
  
  switch (command) {
    case 'scan':
      await scanner.generateSecurityReport();
      break;
      
    case 'npm':
      await scanner.runNpmAudit();
      break;
      
    case 'snyk':
      await scanner.runSnykTest();
      break;
      
    case 'licenses':
      await scanner.scanDependencyLicenses();
      break;
      
    case 'fix':
      await scanner.fixVulnerabilities();
      break;
      
    default:
      console.log('Usage: node security-scan.js [scan|npm|snyk|licenses|fix]');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SecurityScanner;