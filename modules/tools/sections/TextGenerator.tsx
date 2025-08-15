
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { generateText } from '../../../services/geminiService';

const TextGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setResult('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setResult('');
    const response = await generateText(prompt);
    setResult(response);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col gap-2">
      <GlassCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">AI Text Generator</h2>
        <p className="text-gray-400 mb-2">Enter a prompt below and let the AI generate a response for you. This tool uses a fast model optimized for quick utility tasks.</p>
        <p className="text-sm font-mono text-gray-500 mb-6">Powered by OpenRouter</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Write a javascript function to sort an array"
            className="flex-grow bg-black/30 border border-cyber-border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-purple transition-all duration-300"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-8 py-3 bg-cyber-purple text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-glow-purple disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Generate'}
          </button>
        </div>
      </GlassCard>

      {(result || isLoading) && (
        <GlassCard className="p-6 flex-1">
          <h3 className="text-xl font-semibold text-white mb-4">Generated Output</h3>
          <div className="bg-black/40 rounded-lg p-4 h-full min-h-[200px] overflow-y-auto font-mono text-gray-300 whitespace-pre-wrap">
            {isLoading ? <span className="animate-pulse">Generating...</span> : result}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default TextGenerator;
