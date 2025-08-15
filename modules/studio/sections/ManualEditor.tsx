
import React from 'react';
import Designer from './Designer';

const ManualEditor: React.FC = () => {
    // This component serves as a reusable, non-AI wrapper for the main Designer component.
    // This promotes code reuse and ensures a consistent, powerful editor experience.
    return <Designer key="manual-editor" isAiEnabled={false} />;
};

export default ManualEditor;
