import React, { useState, useRef, useEffect } from 'react';

interface Line {
    type: 'input' | 'output';
    text: string;
}

const Terminal: React.FC = () => {
    const [lines, setLines] = useState<Line[]>([]);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState('TERMINAL');

    useEffect(() => {
        containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
    }, [lines]);

    const handleCommand = () => {
        const command = input.trim().toLowerCase();
        const args = command.split(' ').slice(1);
        const newLines: Line[] = [...lines, { type: 'input', text: input }];
        let output = '';

        switch(command.split(' ')[0]) {
            case 'help':
                output = 'Available commands: help, ls, clear, date, whoami, pwd, echo [text]';
                break;
            case 'ls':
                output = 'index.html    style.css    script.js';
                break;
            case 'date':
                output = new Date().toString();
                break;
            case 'whoami':
                output = 'coder';
                break;
            case 'pwd':
                output = '/home/project';
                break;
            case 'echo':
                output = args.join(' ');
                break;
            case 'clear':
                setLines([]);
                setInput('');
                return;
            case '':
                setLines(newLines);
                setInput('');
                return;
            default:
                output = `command not found: ${command.split(' ')[0]}`;
        }
        
        setLines([...newLines, { type: 'output', text: output }]);
        setInput('');
    };

    const tabs = ['TERMINAL', 'PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE'];

    return (
        <div className="h-48 bg-vsc-tab-active flex flex-col flex-shrink-0 text-sm border-t border-vsc-border">
            <div className="flex-shrink-0 flex items-center border-b border-vsc-border">
                {tabs.map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 text-xs uppercase ${activeTab === tab ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div ref={containerRef} className="flex-1 p-2 overflow-y-auto" onClick={() => inputRef.current?.focus()}>
                {lines.map((line, index) => (
                    <div key={index} className="flex">
                        {line.type === 'input' && <><span className="text-vsc-type">user@ide</span><span className="text-vsc-text">:</span><span className="text-vsc-tag">~/project</span><span className="text-vsc-text">$ </span></>}
                        <p className={`whitespace-pre-wrap ml-2 ${line.type === 'output' ? 'text-gray-400' : 'text-white'}`}>{line.text}</p>
                    </div>
                ))}
                 <div className="flex items-center">
                    <span className="text-vsc-type">user@ide</span><span className="text-vsc-text">:</span><span className="text-vsc-tag">~/project</span><span className="text-vsc-text">$ </span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 text-white"
                        spellCheck="false"
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

export default Terminal;
