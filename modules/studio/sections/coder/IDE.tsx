
import React, { useState, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import RightSidebar from './components/LivePreview'; // Repurposed as RightSidebar
import Terminal from './components/Terminal';
import * as Icons from './components/Icons';
import MenuBar from './components/MenuBar';

const sampleFiles = {
    'layout.pug': { language: 'pug', code: `// Pug file content...`},
    'package.json': { language: 'json', code: `{
  "name": "project",
  "version": "1.0.0"
}`},
    'index.test.ts': {
        language: 'typescript',
        code: `import { IndexController } from '../controllers/index';
import { Request, Response } from '../types';

describe('IndexController', () => {
    let controller: IndexController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        controller = new IndexController();
        mockRequest = {};
        mockResponse = {
            render: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('getIndex', () => {
        it('should render index page with blog posts', () => {
            controller.getIndex(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.render).toHaveBeenCalledWith('index', {
                title: 'Travel Blog',
                posts: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        title: expect.any(String),
                        content: expect.any(String),
                        location: expect.any(String),
                    })
                ])
            });
        });
    });
});
`,
    },
    'error.pi': { language: 'text', code: '// Some error file content'},
};

const ActivityBar: React.FC<{ activeView: string; setActiveView: (view: string) => void }> = ({ activeView, setActiveView }) => {
    const views = [
        { id: 'explorer', icon: Icons.FileIconVSC, label: 'Explorer' },
        { id: 'search', icon: Icons.SearchIconVSC, label: 'Search' },
        { id: 'git', icon: Icons.GitIconVSC, label: 'Source Control' },
        { id: 'debug', icon: Icons.DebugIconVSC, label: 'Run and Debug' },
        { id: 'extensions', icon: Icons.ExtensionsIconVSC, label: 'Extensions' },
    ];
    return (
        <div className="w-12 bg-vsc-activity flex flex-col items-center justify-between py-2 flex-shrink-0">
            <div className="flex flex-col items-center">
                {views.map(view => (
                    <button 
                        key={view.id}
                        title={view.label}
                        onClick={() => setActiveView(view.id)}
                        className={`relative w-12 h-12 flex items-center justify-center transition-colors duration-150 ${activeView === view.id ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <view.icon className="w-6 h-6" />
                        {activeView === view.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white"></div>}
                    </button>
                ))}
            </div>
            <div className="flex flex-col items-center">
                 <button title="Accounts" className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white"><Icons.UserIconVSC className="w-6 h-6" /></button>
                 <button title="Manage" className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white"><Icons.SettingsGearIcon className="w-6 h-6" /></button>
            </div>
        </div>
    );
};

const StatusBar: React.FC = () => (
    <div className="h-6 bg-vsc-status text-white flex items-center justify-between px-3 text-xs flex-shrink-0">
        <div className="flex items-center gap-2">
            <Icons.GitBranchIcon className="w-4 h-4" />
            <span>main</span>
            <Icons.SyncIcon className="w-4 h-4" />
            <div className="flex items-center gap-1">
                <Icons.ErrorIcon className="w-4 h-4"/> 0
            </div>
            <div className="flex items-center gap-1">
                <Icons.WarningIcon className="w-4 h-4"/> 0
            </div>
        </div>
        <div className="flex items-center gap-4">
            <span>Ln 17, Col 5</span>
            <span>Spaces: 4</span>
            <span>UTF-8</span>
            <span>CRLF</span>
            <span>&#123;TS&#125; TypeScript</span>
            <Icons.BellIconVSC className="w-4 h-4" />
        </div>
    </div>
);


const IDE: React.FC = () => {
    const [files, setFiles] = useState(sampleFiles);
    const [activeFile, setActiveFile] = useState('index.test.ts');
    const [activeView, setActiveView] = useState('explorer');

    const handleCodeChange = (path: string, newCode: string) => {
        setFiles(prev => ({
            ...prev,
            [path]: { ...prev[path], code: newCode },
        }));
    };
    
    return (
        <div className="h-full w-full bg-vsc-bg font-mono flex flex-col text-xs text-vsc-text">
            <div className="flex flex-1 overflow-hidden">
                <ActivityBar activeView={activeView} setActiveView={setActiveView} />
                <div className="flex-1 flex flex-col min-w-0">
                     <MenuBar />
                     <CodeEditor
                        files={files}
                        activeFile={activeFile}
                        setActiveFile={setActiveFile}
                        onCodeChange={handleCodeChange}
                        isExplorerVisible={activeView === 'explorer'}
                    />
                    <Terminal />
                </div>
                <RightSidebar />
            </div>
            <StatusBar />
        </div>
    );
};

export default IDE;
