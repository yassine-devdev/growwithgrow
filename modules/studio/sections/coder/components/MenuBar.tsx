import React, { useState, useRef, useEffect } from 'react';

const DropdownItem: React.FC<{ label: string, shortcut?: string }> = ({ label, shortcut }) => (
    <div className="flex justify-between items-center px-4 py-1.5 text-sm hover:bg-vsc-accent hover:text-white cursor-pointer">
        <span>{label}</span>
        {shortcut && <span className="text-gray-400 text-xs">{shortcut}</span>}
    </div>
);

const MenuItem: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const handleEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleLeave = () => {
        timeoutRef.current = window.setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <button className={`px-2.5 py-1 rounded-sm text-sm ${isOpen ? 'bg-vsc-accent/80' : 'hover:bg-vsc-accent/50'}`}>
                {label}
            </button>
            {isOpen && (
                <div 
                    className="absolute left-0 top-full mt-1 w-64 bg-vsc-sidebar border border-vsc-border rounded-md shadow-lg z-50 py-1"
                >
                    {children}
                </div>
            )}
        </div>
    );
};

const MenuBar: React.FC = () => {
    return (
        <div className="h-8 bg-vsc-activity flex items-center px-2 gap-1 flex-shrink-0 border-b border-vsc-border">
            <MenuItem label="File">
                <DropdownItem label="New File" shortcut="Ctrl+N" />
                <DropdownItem label="Open File..." shortcut="Ctrl+O" />
                <div className="h-px bg-vsc-border my-1"></div>
                <DropdownItem label="Save" shortcut="Ctrl+S" />
                <DropdownItem label="Save As..." shortcut="Ctrl+Shift+S" />
                <div className="h-px bg-vsc-border my-1"></div>
                <DropdownItem label="Close Editor" shortcut="Ctrl+W" />
            </MenuItem>
            <MenuItem label="View">
                <DropdownItem label="Command Palette..." shortcut="Ctrl+Shift+P" />
                <DropdownItem label="Appearance" />
                <DropdownItem label="Editor Layout" />
            </MenuItem>
            <MenuItem label="Go">
                <DropdownItem label="Go to File..." shortcut="Ctrl+P" />
                <DropdownItem label="Go to Symbol..." shortcut="Ctrl+Shift+O" />
            </MenuItem>
            <MenuItem label="Run">
                <DropdownItem label="Start Debugging" shortcut="F5" />
                <DropdownItem label="Run Without Debugging" shortcut="Ctrl+F5" />
            </MenuItem>
            <MenuItem label="Terminal">
                <DropdownItem label="New Terminal" shortcut="Ctrl+Shift+`" />
                <DropdownItem label="Split Terminal" />
            </MenuItem>
        </div>
    );
};

export default MenuBar;
