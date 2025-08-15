import React, { useState, useEffect } from 'react';
import { useAI } from '../hooks/useAI';

const AIServiceTest: React.FC = () => {
  const {
    isLoading,
    error,
    response,
    providers,
    models,
    generateText,
    refreshProviders,
    refreshModels,
    getRecommendedProvider,
    testProvider,
    clearError,
    clearResponse
  } = useAI();

  const [testPrompt, setTestPrompt] = useState('Hello, this is a test message.');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Load providers and models on component mount
    refreshProviders();
    refreshModels();
  }, [refreshProviders, refreshModels]);

  const handleTestGeneration = async () => {
    try {
      clearError();
      clearResponse();
      
      const config = selectedProvider ? { provider: selectedProvider as any } : {};
      const result = await generateText(testPrompt, undefined, config);
      
      setTestResults(prev => [
        ...prev,
        `✅ Success with ${result.provider}: ${result.response.substring(0, 100)}...`
      ]);
    } catch (err) {
      setTestResults(prev => [
        ...prev,
        `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      ]);
    }
  };

  const handleTestProvider = async (provider: string) => {
    try {
      const isWorking = await testProvider(provider as any);
      
      if (isWorking) {
        setTestResults(prev => [
          ...prev,
          `✅ Provider ${provider} test: Working perfectly!`
        ]);
      } else {
        // Provide helpful context for common issues
        let helpText = '';
        if (provider === 'ollama') {
          helpText = ' (Tip: Install Ollama locally and pull models like "ollama pull llama3.2")';
        } else if (provider === 'openrouter') {
          helpText = ' (Tip: Check your OpenRouter API key in environment variables)';
        } else if (provider === 'gemini') {
          helpText = ' (Tip: Check your Google Gemini API key in environment variables)';
        }
        
        setTestResults(prev => [
          ...prev,
          `⚠️ Provider ${provider} test: Not available${helpText}`
        ]);
      }
    } catch (err) {
      // Provide more helpful error messages
      let errorMessage = err instanceof Error ? err.message : 'Unknown error';
      let helpText = '';
      
      if (errorMessage.includes('not installed')) {
        helpText = ' 💡 Install missing models with: ollama pull <model-name>';
      } else if (errorMessage.includes('API key')) {
        helpText = ' 💡 Check your API key configuration in .env file';
      } else if (errorMessage.includes('not running')) {
        helpText = ' 💡 Start Ollama service: ollama serve';
      }
      
      setTestResults(prev => [
        ...prev,
        `❌ Provider ${provider} error: ${errorMessage}${helpText}`
      ]);
    }
  };

  const handleGetRecommendedProvider = async () => {
    try {
      const recommended = await getRecommendedProvider('general');
      setTestResults(prev => [
        ...prev,
        `💡 Recommended provider for 'general' use case: ${recommended}`
      ]);
    } catch (err) {
      setTestResults(prev => [
        ...prev,
        `❌ Error getting recommended provider: ${err instanceof Error ? err.message : 'Unknown error'}`
      ]);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-green-400 font-mono rounded-lg border border-green-500">
      <h2 className="text-xl font-bold mb-4 text-green-300">🤖 AI Service Test Panel</h2>
      
      {/* Quick Setup Guide */}
      {providers.filter(p => p.status === 'online').length === 0 && (
        <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded">
          <h3 className="text-yellow-300 font-semibold mb-2">🚀 Quick Setup Guide:</h3>
          <div className="text-sm text-yellow-200 space-y-1">
            <div>• <strong>OpenRouter</strong>: Get API key from <a href="https://openrouter.ai" target="_blank" className="text-blue-400 hover:underline">openrouter.ai</a> → Set VITE_OPENROUTER_API_KEY</div>
            <div>• <strong>Gemini</strong>: Get API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-400 hover:underline">Google AI Studio</a> → Set VITE_GOOGLE_GEMINI_API_KEY</div>
            <div>• <strong>Ollama</strong>: Install from <a href="https://ollama.ai" target="_blank" className="text-blue-400 hover:underline">ollama.ai</a> → Run: ollama pull llama3.2</div>
          </div>
        </div>
      )}
      
      {/* Provider Status */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Provider Status:</h3>
          {providers.filter(p => p.status === 'online').length > 0 && (
            <span className="text-green-400 text-sm">
              ✅ {providers.filter(p => p.status === 'online').length} provider(s) ready
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {providers.map(provider => (
            <div key={provider.name} className="p-2 bg-gray-800 rounded border">
              <div className="flex justify-between items-center">
                <span className="font-medium">{provider.displayName}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  provider.status === 'online' ? 'bg-green-600' : 
                  provider.status === 'offline' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {provider.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Models: {provider.modelCount} | Response: {provider.responseTime}ms
                {provider.name === 'ollama' && provider.status === 'offline' && (
                  <div className="text-yellow-400 mt-1">💡 Install: ollama.ai</div>
                )}
                {provider.name === 'openrouter' && provider.status === 'offline' && (
                  <div className="text-yellow-400 mt-1">💡 Need API key</div>
                )}
                {provider.name === 'gemini' && provider.status === 'offline' && (
                  <div className="text-yellow-400 mt-1">💡 Need API key</div>
                )}
              </div>
              <button
                onClick={() => handleTestProvider(provider.name)}
                className="mt-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                disabled={provider.status === 'offline'}
              >
                {provider.status === 'offline' ? 'Unavailable' : 'Test'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test Generation */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Test Text Generation:</h3>
        <div className="space-y-2">
          <textarea
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-green-400"
            rows={3}
            placeholder="Enter test prompt..."
          />
          <div className="flex gap-2">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="p-2 bg-gray-800 border border-gray-600 rounded text-green-400"
            >
              <option value="">Auto-select provider</option>
              {providers.map(provider => (
                <option key={provider.name} value={provider.name}>
                  {provider.displayName}
                </option>
              ))}
            </select>
            <button
              onClick={handleTestGeneration}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded"
            >
              {isLoading ? 'Generating...' : 'Generate Text'}
            </button>
            <button
              onClick={handleGetRecommendedProvider}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Get Recommended
            </button>
          </div>
        </div>
      </div>

      {/* Current Response */}
      {response && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Latest Response:</h3>
          <div className="p-3 bg-gray-800 rounded border">
            <div className="text-xs text-gray-400 mb-2">
              Provider: {response.provider} | Model: {response.model} | 
              Tokens: {response.tokensUsed} | Cost: ${response.cost.toFixed(6)} | 
              Time: {response.responseTime}ms
            </div>
            <div className="text-green-300">{response.response}</div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4">
          <div className="p-3 bg-red-900 border border-red-600 rounded">
            <h3 className="text-lg font-semibold mb-2 text-red-300">Error:</h3>
            <div className="text-red-200">{error}</div>
          </div>
        </div>
      )}

      {/* Test Results Log */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          <button
            onClick={() => setTestResults([])}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            Clear Log
          </button>
        </div>
        <div className="p-3 bg-gray-800 rounded border max-h-40 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-500 italic">No test results yet...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Models Info */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Available Models ({models.length}):</h3>
        <div className="p-3 bg-gray-800 rounded border max-h-32 overflow-y-auto">
          {models.length === 0 ? (
            <div className="text-gray-500 italic">Loading models...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {models.slice(0, 12).map(model => (
                <div key={`${model.provider}-${model.id}`} className="p-1 bg-gray-700 rounded">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-gray-400">{model.provider}</div>
                </div>
              ))}
              {models.length > 12 && (
                <div className="p-1 bg-gray-700 rounded text-center text-gray-400">
                  +{models.length - 12} more...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIServiceTest;