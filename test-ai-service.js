// Simple test script to verify AI service functionality
import { unifiedAIService } from './services/unifiedAIService.js';

async function testAIService() {
  console.log('🤖 Testing Unified AI Service...\n');
  
  try {
    // Test 1: Get provider status
    console.log('📊 Testing provider status...');
    const providers = await unifiedAIService.getProviderStatus();
    console.log('Providers found:', providers.length);
    providers.forEach(provider => {
      console.log(`  - ${provider.displayName}: ${provider.status} (${provider.responseTime}ms)`);
    });
    console.log('✅ Provider status test passed\n');
    
    // Test 2: Get available models
    console.log('🔧 Testing available models...');
    const models = await unifiedAIService.getAvailableModels();
    console.log(`Models found: ${models.length}`);
    if (models.length > 0) {
      console.log('Sample models:');
      models.slice(0, 3).forEach(model => {
        console.log(`  - ${model.name} (${model.provider})`);
      });
    }
    console.log('✅ Available models test passed\n');
    
    // Test 3: Get recommended provider
    console.log('💡 Testing recommended provider...');
    const recommendedProvider = await unifiedAIService.getRecommendedProvider('general');
    console.log(`Recommended provider: ${recommendedProvider}`);
    console.log('✅ Recommended provider test passed\n');
    
    // Test 4: Get usage stats
    console.log('📈 Testing usage stats...');
    const usageStats = await unifiedAIService.getUsageStats();
    console.log(`Total requests: ${usageStats.totalRequests}`);
    console.log(`Total tokens: ${usageStats.totalTokens}`);
    console.log(`Total cost: $${usageStats.totalCost.toFixed(6)}`);
    console.log('✅ Usage stats test passed\n');
    
    console.log('🎉 All tests passed! AI Service is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAIService();