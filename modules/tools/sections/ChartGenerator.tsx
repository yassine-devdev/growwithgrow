
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import AIChartCard from '../../../components/AIChartCard';

const ChartGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Sales per quarter: Q1 $80k, Q2 $120k, Q3 $95k, Q4 $150k');
  const [submittedPrompt, setSubmittedPrompt] = useState<string>('Sales per quarter: Q1 $80k, Q2 $120k, Q3 $95k, Q4 $150k');
  
  const handleGenerate = () => {
    if (prompt.trim()) {
      setSubmittedPrompt(prompt);
    }
  };

  return (
    <div className="h-full flex flex-col gap-2">
      <GlassCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Interactive Chart Generator</h2>
        <p className="text-gray-400 mb-6">Describe the data you want to visualize. The AI will generate an appropriate chart based on your description.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Show population of major cities..."
            className="flex-grow bg-black/30 border border-cyber-border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-purple transition-all duration-300"
          />
          <button
            onClick={handleGenerate}
            className="px-8 py-3 bg-cyber-purple text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:shadow-glow-purple disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Generate Chart
          </button>
        </div>
      </GlassCard>
      
      <AIChartCard 
        title="Generated Chart"
        prompt={submittedPrompt}
        className="flex-1"
      />
    </div>
  );
};

export default ChartGenerator;
