
import React, { useState } from 'react';
import GlassCard from '../../../components/GlassCard';
import { ClipboardIcon, CheckIcon } from '../../../components/icons/InterfaceIcons';

const apiEndpoints = {
    'User Management': [
        { id: 'get-users', method: 'GET', path: '/api/v1/users', description: 'Retrieve a list of all users.', response: `{ "users": [...] }` },
        { id: 'get-user-by-id', method: 'GET', path: '/api/v1/users/{id}', description: 'Retrieve a single user by their ID.', response: `{ "id": "...", "name": "..." }` },
        { id: 'create-user', method: 'POST', path: '/api/v1/users', description: 'Create a new user.', response: `{ "id": "...", "status": "created" }` },
    ],
    'Data Processing': [
        { id: 'submit-job', method: 'POST', path: '/api/v1/jobs', description: 'Submit a new data processing job.', response: `{ "jobId": "...", "status": "queued" }` },
        { id: 'get-job-status', method: 'GET', path: '/api/v1/jobs/{jobId}', description: 'Get the status of a specific job.', response: `{ "jobId": "...", "status": "running" }` },
    ],
};

const CodeBlock: React.FC<{ language: string, code: string }> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-black/50 rounded-lg my-4 relative">
            <div className="text-xs text-cyber-purple font-bold px-4 py-2 border-b border-cyber-border">{language}</div>
            <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto">
                <code>{code}</code>
            </pre>
            <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white">
                {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
        </div>
    );
}

const ApiDocs: React.FC = () => {
    const [selectedEndpointId, setSelectedEndpointId] = useState('get-users');
    const selectedEndpoint = Object.values(apiEndpoints).flat().find(e => e.id === selectedEndpointId);

    return (
        <div className="h-full flex gap-4 text-white">
            {/* Left Sidebar: Navigation */}
            <GlassCard className="w-1/4 p-4 flex flex-col overflow-y-auto">
                <h3 className="text-lg font-bold text-cyber-cyan mb-4">API Endpoints</h3>
                {Object.entries(apiEndpoints).map(([category, endpoints]) => (
                    <div key={category} className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{category}</h4>
                        <ul className="space-y-1">
                            {endpoints.map(endpoint => (
                                <li key={endpoint.id}>
                                    <button onClick={() => setSelectedEndpointId(endpoint.id)} className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${selectedEndpointId === endpoint.id ? 'bg-cyber-purple/20 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
                                        <span className={`font-bold mr-2 ${endpoint.method === 'GET' ? 'text-green-400' : 'text-orange-400'}`}>{endpoint.method}</span>
                                        <span className="font-mono">{endpoint.path}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </GlassCard>

            {/* Center: Endpoint Details */}
            <GlassCard className="w-1/2 p-6 flex flex-col overflow-y-auto">
                {selectedEndpoint && (
                    <>
                        <div className="flex items-center gap-4 mb-2">
                             <span className={`px-2 py-0.5 text-sm font-bold rounded ${selectedEndpoint.method === 'GET' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>{selectedEndpoint.method}</span>
                             <h2 className="text-2xl font-bold font-mono text-white">{selectedEndpoint.path}</h2>
                        </div>
                        <p className="text-gray-400 mb-6">{selectedEndpoint.description}</p>
                        
                        <h3 className="text-xl font-semibold text-cyber-cyan border-b border-cyber-border pb-2 mb-4">Response Example</h3>
                        <p className="text-sm text-gray-500 mb-2">A successful request will return a 200 OK with the following body:</p>
                        <CodeBlock language="JSON" code={JSON.stringify(JSON.parse(selectedEndpoint.response), null, 2)} />
                    </>
                )}
            </GlassCard>

            {/* Right: Code Examples */}
            <GlassCard className="w-1/4 p-6 flex flex-col overflow-y-auto">
                <h3 className="text-xl font-semibold text-cyber-cyan mb-4">Code Examples</h3>
                 {selectedEndpoint && (
                     <>
                        <CodeBlock language="cURL" code={`curl -X ${selectedEndpoint.method} "https://api.system.com${selectedEndpoint.path}" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`} />
                        <CodeBlock language="JavaScript (fetch)" code={`fetch('https://api.system.com${selectedEndpoint.path}', {\n  method: '${selectedEndpoint.method}',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY'\n  }\n})\n.then(res => res.json())\n.then(console.log);`} />
                     </>
                 )}
            </GlassCard>
        </div>
    );
};

export default ApiDocs;
