import React, { useRef, useEffect } from 'react';
import * as Icons from './Icons';

interface CodeEditorProps {
    files: Record<string, { language: string, code: string }>;
    activeFile: string;
    setActiveFile: (path: string) => void;
    onCodeChange: (path: string, newCode: string) => void;
    isExplorerVisible: boolean;
}

const highlightCode = (code: string, language: string) => {
    let highlighted = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    if (language === 'typescript' || language === 'javascript') {
        highlighted = highlighted
            .replace(/\b(import|from|export|describe|let|const|new|beforeEach|it|return|as|expect)\b/g, '<span class="text-vsc-keyword">$&</span>')
            .replace(/\b(IndexController|Request|Response|Partial|String)\b/g, '<span class="text-vsc-type">$&</span>')
            .replace(/\b(controller|mockRequest|mockResponse|console|jest|fn|mockReturnThis|test|describe)\b/g, '<span class="text-vsc-variable">$&</span>')
            .replace(/\b(getIndex|render|status|toHaveBeenCalledWith|arrayContaining|objectContaining|any)\b/g, '<span class="text-vsc-function">$&</span>')
            .replace(/('.*?')/g, '<span class="text-vsc-string">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="text-vsc-comment">$1</span>');
    } else if (language === 'json') {
         highlighted = highlighted
            .replace(/(".*?")(?=:)/g, '<span class="text-vsc-variable">$1</span>')
            .replace(/: ("[^"]*")/g, ': <span class="text-vsc-string">$1</span>');
    }
    return highlighted;
};

const FileExplorer: React.FC<{files: CodeEditorProps['files'], activeFile: string, setActiveFile: (file: string) => void}> = ({files, activeFile, setActiveFile}) => (
    <div className="w-64 bg-vsc-sidebar p-2 flex flex-col">
        <h2 className="text-xs uppercase text-gray-400 font-bold px-2 mb-2">Explorer</h2>
        <div className="flex items-center gap-1 px-2 cursor-pointer">
            <Icons.ChevronDownIcon className="w-4 h-4" />
            <span className="font-bold text-sm">PROJECT</span>
        </div>
        <div className="pl-4 mt-1 space-y-0.5">
             {Object.keys(files).map(path => (
                <button key={path} onClick={() => setActiveFile(path)} className={`w-full text-left flex items-center gap-2 px-2 py-0.5 rounded ${activeFile === path ? 'bg-vsc-accent text-white' : 'hover:bg-vsc-tab-inactive'}`}>
                    {files[path].language === 'pug' && <Icons.PugIcon className="w-4 h-4 text-orange-300" />}
                    {files[path].language === 'json' && <Icons.JsonIcon className="w-4 h-4 text-yellow-300" />}
                    {files[path].language === 'typescript' && <Icons.TSIcon className="w-4 h-4 text-blue-400" />}
                    {files[path].language === 'text' && <Icons.FileIconVSC className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm">{path}</span>
                </button>
            ))}
        </div>
    </div>
);

const EditorTabs: React.FC<Omit<CodeEditorProps, 'onCodeChange' | 'isExplorerVisible'>> = ({ files, activeFile, setActiveFile }) => (
    <div className="flex-shrink-0 bg-vsc-tab-inactive flex">
        {Object.keys(files).map(path => (
            <button
                key={path}
                onClick={() => setActiveFile(path)}
                className={`flex items-center gap-2 pl-3 pr-2 py-2 text-sm border-r border-vsc-border ${activeFile === path ? 'bg-vsc-tab-active text-white border-t-2 border-t-orange-400' : 'text-gray-400'}`}
            >
                {files[path].language === 'pug' && <Icons.PugIcon className="w-4 h-4 text-orange-300" />}
                {files[path].language === 'json' && <Icons.JsonIcon className="w-4 h-4 text-yellow-300" />}
                {files[path].language === 'typescript' && <Icons.TSIcon className="w-4 h-4 text-blue-400" />}
                {files[path].language === 'text' && <Icons.FileIconVSC className="w-4 h-4 text-gray-400" />}
                <span>{path}</span>
                <Icons.CloseIconVSC className="w-4 h-4 ml-2 hover:bg-gray-600 rounded-sm p-0.5" />
            </button>
        ))}
    </div>
);

const Breadcrumbs: React.FC<{ activeFile: string }> = ({ activeFile }) => (
    <div className="flex-shrink-0 h-8 px-4 flex items-center gap-2 text-sm text-gray-400 border-b border-vsc-border">
        <span>src</span> &gt; <span>_tests_</span> &gt; <span>controllers</span> &gt; 
        <span className="flex items-center gap-1 text-white">
            <Icons.TSIcon className="w-4 h-4 text-blue-400"/>
            {activeFile}
        </span>
    </div>
);

const LineNumbers: React.FC<{ lines: number }> = ({ lines }) => (
    <div className="w-12 text-right pr-4 text-gray-500 flex-shrink-0">
        {Array.from({ length: lines }, (_, i) => (
            <div key={i}>{i + 1}</div>
        ))}
    </div>
);

const CodeEditor: React.FC<CodeEditorProps> = ({ files, activeFile, setActiveFile, onCodeChange, isExplorerVisible }) => {
    const codeAreaRef = useRef<HTMLTextAreaElement>(null);
    const highlightAreaRef = useRef<HTMLPreElement>(null);
    const lineNumbers = files[activeFile].code.split('\n').length;
    
    const syncScroll = () => {
        if (highlightAreaRef.current && codeAreaRef.current) {
            highlightAreaRef.current.scrollTop = codeAreaRef.current.scrollTop;
            highlightAreaRef.current.scrollLeft = codeAreaRef.current.scrollLeft;
        }
    };
    
    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onCodeChange(activeFile, e.target.value);
    };

    const highlightedCode = highlightCode(files[activeFile].code, files[activeFile].language);

    return (
        <div className="flex flex-1 min-w-0 min-h-0">
            {isExplorerVisible && <FileExplorer files={files} activeFile={activeFile} setActiveFile={setActiveFile} />}
            <div className="flex-1 flex flex-col min-w-0">
                <EditorTabs files={files} activeFile={activeFile} setActiveFile={setActiveFile} />
                <Breadcrumbs activeFile={activeFile} />
                <div className="flex-1 relative overflow-hidden text-sm leading-6">
                    <div className="absolute inset-0 flex p-2 overflow-auto" onScroll={syncScroll}>
                        <LineNumbers lines={lineNumbers} />
                        <div className="relative flex-1">
                            <pre ref={highlightAreaRef} className="absolute inset-0 p-0 m-0 w-full h-full pointer-events-none" dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }} />
                            <textarea
                                ref={codeAreaRef}
                                value={files[activeFile].code}
                                onChange={handleCodeChange}
                                className="absolute inset-0 p-0 m-0 w-full h-full bg-transparent resize-none border-0 outline-none text-transparent caret-white leading-6"
                                spellCheck="false"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
