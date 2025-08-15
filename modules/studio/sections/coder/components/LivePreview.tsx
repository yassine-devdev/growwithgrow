import React from 'react';
import AIAssistant from './AIAssistant';
import * as Icons from './Icons';

const SourceControlPanel: React.FC = () => {
    const filesChanged = [
        { name: 'jest.config.js', lang: 'JS', path: 'tests_'},
        { name: 'package.json', lang: 'JSON'},
        { name: 'style.css', lang: 'CSS', path: 'public\\css'},
        { name: 'index.test.ts', lang: 'TS', path: 'src\\_tests_\\controllers', active: true},
        { name: 'index.ts', lang: 'TS', path: 'src\\controllers'},
        { name: 'index.ts', lang: 'TS', path: 'src\\routes'},
    ];
    return (
        <div className="flex flex-col text-vsc-text text-sm bg-vsc-sidebar">
             <div className="p-2 border-b border-vsc-border">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">11 files changed</span>
                    <div className="flex items-center gap-2">
                         <button className="px-2 py-0.5 text-xs bg-gray-500/50 hover:bg-gray-500/80 rounded">Keep</button>
                         <button className="px-2 py-0.5 text-xs bg-gray-500/50 hover:bg-gray-500/80 rounded">Undo</button>
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-2">
                {filesChanged.map((file, index) => (
                    <div key={index} className="flex items-center">
                        {file.lang === 'JS' && <Icons.JSIcon className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0"/>}
                        {file.lang === 'JSON' && <Icons.JsonIcon className="w-4 h-4 text-yellow-300 mr-2 flex-shrink-0"/>}
                        {file.lang === 'CSS' && <Icons.CSSIcon className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0"/>}
                        {file.lang === 'TS' && <Icons.TSIcon className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0"/>}
                        <span className={`mr-1 ${file.active ? 'text-white' : ''}`}>{file.name}</span>
                        <span className="text-gray-500 truncate">{file.path}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const RightSidebar: React.FC = () => {
    return (
        <div className="w-[350px] bg-vsc-sidebar flex flex-col flex-shrink-0 border-l border-vsc-border">
            <AIAssistant />
            <SourceControlPanel />
        </div>
    );
};

export default RightSidebar;
