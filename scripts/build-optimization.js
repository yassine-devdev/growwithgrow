#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class BuildOptimizer {
  constructor() {
    this.cacheDir = path.join(process.cwd(), '.build-cache');
    this.artifactsDir = path.join(process.cwd(), 'build-artifacts');
    this.buildManifest = path.join(this.cacheDir, 'build-manifest.json');
  }

  async initialize() {
    // Create cache and artifacts directories
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    if (!fs.existsSync(this.artifactsDir)) {
      fs.mkdirSync(this.artifactsDir, { recursive: true });
    }
  }

  generateFileHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  generateProjectHash() {
    const criticalFiles = [
      'package.json',
      'package-lock.json',
      'vite.config.ts',
      'vite.config.prod.ts',
      'tsconfig.json',
      'backend/package.json',
      'backend/tsconfig.json'
    ];

    const hashes = criticalFiles
      .map(file => this.generateFileHash(file))
      .filter(Boolean);

    return crypto.createHash('sha256').update(hashes.join('')).digest('hex');
  }

  loadBuildManifest() {
    if (!fs.existsSync(this.buildManifest)) {
      return { builds: {}, lastCleanup: null };
    }
    return JSON.parse(fs.readFileSync(this.buildManifest, 'utf8'));
  }

  saveBuildManifest(manifest) {
    fs.writeFileSync(this.buildManifest, JSON.stringify(manifest, null, 2));
  }

  async checkCacheValidity() {
    const currentHash = this.generateProjectHash();
    const manifest = this.loadBuildManifest();
    
    const lastBuild = manifest.builds[currentHash];
    if (lastBuild && fs.existsSync(lastBuild.distPath)) {
      console.log('✅ Build cache hit - using cached build artifacts');
      return { valid: true, distPath: lastBuild.distPath };
    }
    
    console.log('❌ Build cache miss - full build required');
    return { valid: false };
  }

  async runBuild(mode = 'production') {
    console.log(`🔨 Starting ${mode} build...`);
    
    const startTime = Date.now();
    
    try {
      // Run frontend build
      console.log('📦 Building frontend...');
      execSync(`npm run build:prod`, { stdio: 'inherit' });
      
      // Run backend build
      console.log('🔧 Building backend...');
      execSync(`npm run build:server`, { stdio: 'inherit' });
      
      const buildTime = Date.now() - startTime;
      console.log(`✅ Build completed in ${buildTime}ms`);
      
      return { success: true, buildTime, distPath: path.join(process.cwd(), 'dist') };
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async analyzeBundleSize() {
    console.log('📊 Analyzing bundle size...');
    
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      console.log('❌ No build artifacts found. Run build first.');
      return;
    }

    const getDirectorySize = (dirPath) => {
      let totalSize = 0;
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      });
      
      return totalSize;
    };

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const totalSize = getDirectorySize(distPath);
    console.log(`📦 Total bundle size: ${formatBytes(totalSize)}`);

    // Analyze individual chunks
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      const jsFiles = fs.readdirSync(assetsPath)
        .filter(file => file.endsWith('.js'))
        .map(file => {
          const filePath = path.join(assetsPath, file);
          const size = fs.statSync(filePath).size;
          return { file, size: formatBytes(size), rawSize: size };
        })
        .sort((a, b) => b.rawSize - a.rawSize);

      console.log('\n📋 JavaScript chunks:');
      jsFiles.forEach(({ file, size }) => {
        console.log(`  ${file}: ${size}`);
      });
    }

    // Check for bundle size warnings
    const warningThreshold = 500 * 1024; // 500KB
    if (totalSize > warningThreshold) {
      console.log(`⚠️  Bundle size exceeds ${formatBytes(warningThreshold)} threshold`);
    }
  }

  async createBuildArtifacts() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const artifactName = `build-${timestamp}`;
    const artifactPath = path.join(this.artifactsDir, artifactName);
    
    console.log(`📦 Creating build artifact: ${artifactName}`);
    
    // Copy dist folder to artifacts
    execSync(`cp -r dist ${artifactPath}`, { stdio: 'inherit' });
    
    // Create build metadata
    const metadata = {
      timestamp,
      hash: this.generateProjectHash(),
      nodeVersion: process.version,
      buildCommand: 'npm run build:prod',
      size: this.getDirectorySize(artifactPath)
    };
    
    fs.writeFileSync(
      path.join(artifactPath, 'build-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`✅ Build artifact created: ${artifactPath}`);
    return artifactPath;
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  }

  async cleanupOldArtifacts(keepCount = 5) {
    console.log(`🧹 Cleaning up old build artifacts (keeping ${keepCount} most recent)...`);
    
    const artifacts = fs.readdirSync(this.artifactsDir)
      .filter(name => name.startsWith('build-'))
      .map(name => ({
        name,
        path: path.join(this.artifactsDir, name),
        mtime: fs.statSync(path.join(this.artifactsDir, name)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (artifacts.length > keepCount) {
      const toDelete = artifacts.slice(keepCount);
      toDelete.forEach(artifact => {
        console.log(`🗑️  Removing old artifact: ${artifact.name}`);
        execSync(`rm -rf "${artifact.path}"`, { stdio: 'inherit' });
      });
    }
  }
}

async function main() {
  const optimizer = new BuildOptimizer();
  await optimizer.initialize();
  
  const command = process.argv[2] || 'build';
  
  switch (command) {
    case 'build':
      const cacheCheck = await optimizer.checkCacheValidity();
      if (!cacheCheck.valid) {
        const result = await optimizer.runBuild();
        if (result.success) {
          await optimizer.analyzeBundleSize();
          await optimizer.createBuildArtifacts();
          await optimizer.cleanupOldArtifacts();
        }
      }
      break;
      
    case 'analyze':
      await optimizer.analyzeBundleSize();
      break;
      
    case 'clean':
      await optimizer.cleanupOldArtifacts(0);
      break;
      
    case 'force':
      const result = await optimizer.runBuild();
      if (result.success) {
        await optimizer.analyzeBundleSize();
        await optimizer.createBuildArtifacts();
      }
      break;
      
    default:
      console.log('Usage: node build-optimization.js [build|analyze|clean|force]');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BuildOptimizer;