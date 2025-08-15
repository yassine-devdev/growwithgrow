
import React from 'react';
import ManualEditor from './ManualEditor';

// This component has been refactored to use the ManualEditor component, 
// which is a wrapper around the enhanced Designer component with AI disabled.
// This reduces code duplication and ensures a consistent, powerful editor experience.
const ImageEditor: React.FC = () => {
    return <ManualEditor />;
};

export default ImageEditor;
