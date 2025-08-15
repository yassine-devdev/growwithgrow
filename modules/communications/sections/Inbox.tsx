

import React from 'react';
import GlassCard from '../../../components/GlassCard';

const Inbox: React.FC = () => {
  return (
    <div className="h-full flex gap-2">
      <GlassCard className="w-1/3 p-4 flex flex-col">
        <h2 className="text-xl font-bold text-cyber-cyan mb-4">Inbox</h2>
        <ul className="space-y-2 overflow-y-auto">
          {[...Array(10)].map((_, i) => (
            <li key={i} className={`p-3 cursor-pointer rounded-md ${i === 0 ? 'bg-cyber-cyan/20' : ''} hover:bg-white/10`}>
              <h3 className="font-semibold text-white truncate">Project Update {10-i}</h3>
              <p className="text-sm text-gray-400 truncate">From: System Admin</p>
              <p className="text-xs text-gray-500 text-right">10:{50-i} AM</p>
            </li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard className="w-2/3 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-white border-b border-cyber-border pb-3 mb-4">Project Update 10</h2>
        <div className="flex-1 overflow-y-auto text-gray-300 space-y-4">
          <p>This is a placeholder for the email content. The full communications module would include functionality for reading, composing, and managing messages within the system.</p>
          <p>The layout demonstrates a common pattern in email clients, with a message list on the side and the content of the selected message in the main view.</p>
          <div className="p-4 border border-cyber-border rounded-lg mt-6 bg-black/20">
            <h4 className="font-bold text-cyber-purple">Attachments</h4>
            <ul className="list-disc list-inside mt-2 font-mono">
                <li>system_report_q3.pdf</li>
                <li>architecture_diagram_v2.png</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Inbox;
