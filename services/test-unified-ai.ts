// Test file for the unified AI service
import { unifiedAIService } from './unifiedAIService';

async function testUnifiedAIService() {
  console.log('Testing Unified AI Service...');
  
  try {
    // Test provider status
    console.log('Getting provider status...');
    const providers = await unifiedAIService.getProviderStatus();
    console.log('Providers:', providers);
    
    // Test available models
    console.log('Getting available models...');
    const models = await unifiedAIService.getAvailableModels();
    console.log('Models:', models.slice(0, 3)); // Show first 3 models
    
    // Test recommended provider
    console.log('Getting recommended provider...');
    const recommendedProvider = await unifiedAIService.getRecommendedProvider('general');
    console.log('Recommended provider:', recommendedProvider);
    
    // Test provider capabilities
    console.log('Getting provider capabilities...');
    const capabilities = unifiedAIService.getProviderCapabilities();
    console.log('Capabilities:', capabilities);
    
    // Test usage stats
    console.log('Getting usage stats...');
    const usageStats = await unifiedAIService.getUsageStats();
    console.log('Usage stats:', usageStats);
    
    console.log('All tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for testing
export { testUnifiedAIService };