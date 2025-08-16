#!/usr/bin/env node

/**
 * Security Configuration Test Suite
 * Tests SSL/TLS, DDoS protection, and security middleware
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

class SecurityTester {
  constructor(domain = 'localhost', port = 443) {
    this.domain = domain;
    this.port = port;
    this.results = {
      ssl: {},
      headers: {},
      rateLimit: {},
      ddos: {},
      overall: { passed: 0, failed: 0, warnings: 0 }
    };
  }

  // Test SSL/TLS configuration
  async testSSL() {
    console.log('🔒 Testing SSL/TLS Configuration...');
    
    return new Promise((resolve) => {
      const options = {
        hostname: this.domain,
        port: this.port,
        method: 'GET',
        path: '/health',
        timeout: 5000,
        rejectUnauthorized: false // For testing purposes
      };

      const req = https.request(options, (res) => {
        const cert = res.connection.getPeerCertificate();
        const protocol = res.connection.getProtocol();
        const cipher = res.connection.getCipher();

        this.results.ssl = {
          protocol,
          cipher: cipher?.name,
          valid: cert.valid_from && cert.valid_to,
          issuer: cert.issuer?.CN,
          subject: cert.subject?.CN,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysUntilExpiry: cert.valid_to ? 
            Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24)) : null
        };

        // Check SSL strength
        if (protocol && (protocol.includes('TLSv1.2') || protocol.includes('TLSv1.3'))) {
          console.log('✅ SSL Protocol: Strong (' + protocol + ')');
          this.results.overall.passed++;
        } else {
          console.log('❌ SSL Protocol: Weak or unknown (' + protocol + ')');
          this.results.overall.failed++;
        }

        if (cipher && cipher.name && !cipher.name.includes('RC4') && !cipher.name.includes('DES')) {
          console.log('✅ SSL Cipher: Strong (' + cipher.name + ')');
          this.results.overall.passed++;
        } else {
          console.log('⚠️  SSL Cipher: Check required (' + (cipher?.name || 'unknown') + ')');
          this.results.overall.warnings++;
        }

        resolve();
      });

      req.on('error', (error) => {
        console.log('❌ SSL Connection Failed:', error.message);
        this.results.ssl.error = error.message;
        this.results.overall.failed++;
        resolve();
      });

      req.on('timeout', () => {
        console.log('❌ SSL Connection Timeout');
        this.results.ssl.error = 'Connection timeout';
        this.results.overall.failed++;
        req.destroy();
        resolve();
      });

      req.end();
    });
  }

  // Test security headers
  async testSecurityHeaders() {
    console.log('\n🛡️  Testing Security Headers...');
    
    const requiredHeaders = [
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'referrer-policy',
      'content-security-policy'
    ];

    return new Promise((resolve) => {
      const options = {
        hostname: this.domain,
        port: this.port,
        method: 'GET',
        path: '/',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        this.results.headers.received = {};
        
        // Check each required header
        requiredHeaders.forEach(header => {
          const value = res.headers[header];
          this.results.headers.received[header] = value;
          
          if (value) {
            console.log(`✅ ${header}: Present`);
            this.results.overall.passed++;
          } else {
            console.log(`❌ ${header}: Missing`);
            this.results.overall.failed++;
          }
        });

        // Check HSTS specifically
        const hsts = res.headers['strict-transport-security'];
        if (hsts && hsts.includes('max-age=') && hsts.includes('includeSubDomains')) {
          console.log('✅ HSTS: Properly configured');
          this.results.overall.passed++;
        } else {
          console.log('⚠️  HSTS: Configuration needs review');
          this.results.overall.warnings++;
        }

        resolve();
      });

      req.on('error', (error) => {
        console.log('❌ Headers Test Failed:', error.message);
        this.results.headers.error = error.message;
        this.results.overall.failed++;
        resolve();
      });

      req.end();
    });
  }

  // Test rate limiting
  async testRateLimit() {
    console.log('\n⏱️  Testing Rate Limiting...');
    
    const requests = [];
    const startTime = performance.now();
    
    // Send multiple requests quickly
    for (let i = 0; i < 15; i++) {
      requests.push(this.makeRequest('/api/health'));
    }

    try {
      const responses = await Promise.all(requests);
      const endTime = performance.now();
      
      const statusCodes = responses.map(r => r.statusCode);
      const rateLimited = statusCodes.filter(code => code === 429).length;
      const successful = statusCodes.filter(code => code === 200).length;
      
      this.results.rateLimit = {
        totalRequests: requests.length,
        successful,
        rateLimited,
        duration: endTime - startTime,
        statusCodes
      };

      if (rateLimited > 0) {
        console.log(`✅ Rate Limiting: Active (${rateLimited}/${requests.length} requests limited)`);
        this.results.overall.passed++;
      } else {
        console.log(`⚠️  Rate Limiting: May be too lenient (0/${requests.length} requests limited)`);
        this.results.overall.warnings++;
      }

    } catch (error) {
      console.log('❌ Rate Limit Test Failed:', error.message);
      this.results.rateLimit.error = error.message;
      this.results.overall.failed++;
    }
  }

  // Test DDoS protection patterns
  async testDDoSProtection() {
    console.log('\n🚫 Testing DDoS Protection...');
    
    const suspiciousRequests = [
      '/api/test?id=1\' OR 1=1--',  // SQL injection
      '/api/test?search=<script>alert(1)</script>',  // XSS
      '/api/../../../etc/passwd',  // Path traversal
      '/api/test',  // Normal request for comparison
    ];

    const results = [];
    
    for (const path of suspiciousRequests) {
      try {
        const response = await this.makeRequest(path);
        results.push({
          path,
          statusCode: response.statusCode,
          blocked: response.statusCode === 403 || response.statusCode === 429
        });
      } catch (error) {
        results.push({
          path,
          error: error.message,
          blocked: true
        });
      }
    }

    this.results.ddos = { tests: results };
    
    const blockedSuspicious = results.slice(0, 3).filter(r => r.blocked).length;
    const normalAllowed = results[3] && !results[3].blocked;

    if (blockedSuspicious >= 2 && normalAllowed) {
      console.log(`✅ DDoS Protection: Active (${blockedSuspicious}/3 suspicious requests blocked)`);
      this.results.overall.passed++;
    } else if (blockedSuspicious >= 1) {
      console.log(`⚠️  DDoS Protection: Partial (${blockedSuspicious}/3 suspicious requests blocked)`);
      this.results.overall.warnings++;
    } else {
      console.log(`❌ DDoS Protection: Inactive (${blockedSuspicious}/3 suspicious requests blocked)`);
      this.results.overall.failed++;
    }
  }

  // Helper method to make HTTP requests
  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.domain,
        port: this.port,
        method: 'GET',
        path,
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  // Run all tests
  async runAllTests() {
    console.log(`🔍 Starting Security Tests for ${this.domain}:${this.port}\n`);
    
    await this.testSSL();
    await this.testSecurityHeaders();
    await this.testRateLimit();
    await this.testDDoSProtection();
    
    this.printSummary();
    return this.results;
  }

  // Print test summary
  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`✅ Passed: ${this.results.overall.passed}`);
    console.log(`⚠️  Warnings: ${this.results.overall.warnings}`);
    console.log(`❌ Failed: ${this.results.overall.failed}`);
    
    const total = this.results.overall.passed + this.results.overall.warnings + this.results.overall.failed;
    const score = total > 0 ? Math.round((this.results.overall.passed / total) * 100) : 0;
    
    console.log(`\n🎯 Security Score: ${score}%`);
    
    if (score >= 90) {
      console.log('🏆 Excellent security configuration!');
    } else if (score >= 75) {
      console.log('👍 Good security configuration with room for improvement');
    } else if (score >= 50) {
      console.log('⚠️  Security configuration needs attention');
    } else {
      console.log('🚨 Security configuration requires immediate attention');
    }

    // Detailed results
    console.log('\n📋 Detailed Results:');
    console.log(JSON.stringify(this.results, null, 2));
  }
}

// Main execution
async function main() {
  const domain = process.argv[2] || 'localhost';
  const port = parseInt(process.argv[3]) || 443;
  
  const tester = new SecurityTester(domain, port);
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SecurityTester;