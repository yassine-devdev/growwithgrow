/**
 * Performance Monitor Module
 * Monitors and analyzes application performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.benchmarks = new Map();
    this.history = [];
  }

  async analyzePerformance() {
    this.log('📊 Analyzing performance metrics...', 'info');
    
    try {
      const performance = {
        bundleSize: await this.analyzeBundleSize(),
        loadTime: await this.analyzeLoadTime(),
        memoryUsage: await this.analyzeMemoryUsage(),
        renderPerformance: await this.analyzeRenderPerformance(),
        score: 0
      };

      // Calculate overall performance score
      performance.score = this.calculatePerformanceScore(performance);
      
      this.log(`📊 Performance Score: ${Math.round(performance.score * 100)}%`, 
               performance.score >= 0.8 ? 'success' : 'warning');

      return performance;
    } catch (error) {
      this.log(`❌ Performance analysis failed: ${error.message}`, 'error');
      return { bundleSize: 0, loadTime: 0, memoryUsage: 0, renderPerformance: 0, score: 0 };
    }
  }

  async analyzeBundleSize() {
    try {
      const distPath = 'dist';
      if (await fs.pathExists(distPath)) {
        const stats = await this.calculateDirectorySize(distPath);
        return stats.size;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  async analyzeLoadTime() {
    // Simulated load time analysis
    // In a real implementation, this would use Lighthouse or similar tools
    return Math.random() * 3000; // Random load time for demo
  }

  async analyzeMemoryUsage() {
    return process.memoryUsage().heapUsed / 1024 / 1024; // MB
  }

  async analyzeRenderPerformance() {
    // Simulated render performance analysis
    return Math.random(); // Random score for demo
  }

  calculatePerformanceScore(performance) {
    let score = 1.0;
    
    // Deduct for large bundle size
    if (performance.bundleSize > 1000000) score -= 0.3;
    else if (performance.bundleSize > 500000) score -= 0.1;
    
    // Deduct for slow load time
    if (performance.loadTime > 3000) score -= 0.3;
    else if (performance.loadTime > 1500) score -= 0.1;
    
    // Deduct for high memory usage
    if (performance.memoryUsage > 100) score -= 0.2;
    else if (performance.memoryUsage > 50) score -= 0.1;
    
    return Math.max(0, score);
  }

  async calculateDirectorySize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;

    const calculateSize = async (currentPath) => {
      const stats = await fs.stat(currentPath);
      
      if (stats.isDirectory()) {
        const files = await fs.readdir(currentPath);
        for (const file of files) {
          await calculateSize(path.join(currentPath, file));
        }
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    };

    await calculateSize(dirPath);
    return { size: totalSize, files: fileCount };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.cyan,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    
    const prefix = `[${timestamp}] 📊 PERFORMANCE:`;
    const coloredMessage = colors[type] ? colors[type](message) : message;
    
    console.log(`${prefix} ${coloredMessage}`);
  }
}

module.exports = PerformanceMonitor;
