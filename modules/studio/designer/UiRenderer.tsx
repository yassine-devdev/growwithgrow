
import React from 'react';
import { UiLayout, UiElement, UiElementType } from './types';
import { ButtonIcon, CardIcon, ParagraphIcon, TitleIcon, PromptIcon as DefaultIcon } from '../components/ToolIcons';
import { SearchIcon } from '../../../components/icons/InterfaceIcons';

const ElementIcon: React.FC<{ type: UiElementType, className?: string }> = ({ type, className = "w-6 h-6" }) => {
    switch(type) {
        case UiElementType.Logo: return <div className={`${className} rounded-full bg-blue-500`}></div>;
        case UiElementType.Search: return <SearchIcon className={className} />;
        case UiElementType.Button: return <ButtonIcon className={className} />;
        case UiElementType.NavItem: return <div className={`${className} h-1 w-8 bg-gray-400 rounded-full`}></div>;
        case UiElementType.Title: return <TitleIcon className={className} />;
        case UiElementType.Paragraph: return <ParagraphIcon className={className} />;
        case UiElementType.Card: return <CardIcon className={className} />;
        default: return <DefaultIcon className={className} />;
    }
};

const UiRenderer: React.FC<{ ui: UiLayout }> = ({ ui }) => {
    const themeClasses = {
        dark: {
            bg: 'bg-[#2d2f34]', text: 'text-gray-200', card: 'bg-[#374151]', border: 'border-[#4b5563]', primary: 'bg-blue-500 text-white'
        },
        light: {
            bg: 'bg-gray-100', text: 'text-gray-800', card: 'bg-white', border: 'border-gray-200', primary: 'bg-blue-600 text-white'
        },
        corporate: {
            bg: 'bg-white', text: 'text-gray-900', card: 'bg-gray-50', border: 'border-gray-300', primary: 'bg-indigo-700 text-white'
        },
    };
    const currentTheme = themeClasses[ui.theme] || themeClasses.dark;

    const renderElement = (el: UiElement, key: string) => {
        switch(el.type) {
            case UiElementType.Logo:
                return <div key={key} className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-sm">Logo</div>;
            case UiElementType.Search:
                return <div key={key} className={`flex items-center gap-2 p-2 rounded-full ${currentTheme.card} border ${currentTheme.border}`}><SearchIcon className="w-5 h-5 text-gray-400"/><span>{el.label || 'Search'}</span></div>;
            case UiElementType.Button:
                return <button key={key} className={`px-4 py-2 rounded-md font-semibold ${currentTheme.primary}`}>{el.label || 'Button'}</button>;
            case UiElementType.NavItem:
                return <span key={key} className={`px-3 py-1 cursor-pointer hover:bg-white/10 rounded-md`}>{el.label || 'Nav Item'}</span>;
            case UiElementType.Title:
                return <h2 key={key} className="text-3xl font-bold w-full col-span-full">{el.label || 'Main Title'}</h2>;
            case UiElementType.Paragraph:
                return <p key={key} className="text-base w-full col-span-full">{el.label || 'This is a sample paragraph of text content.'}</p>;
            case UiElementType.Card:
                return <div key={key} className={`p-4 rounded-lg shadow-lg ${currentTheme.card} border ${currentTheme.border} min-h-[150px] flex items-center justify-center`}>Card</div>;
            default:
                return <div key={key} className="p-2 border border-dashed border-gray-500">{el.type}</div>;
        }
    };
    
    return (
        <div className={`w-full h-full p-4 rounded-lg overflow-hidden ${currentTheme.bg} ${currentTheme.text}`}>
            {/* Header */}
            {ui.layout.header && (
                <header className={`flex items-center gap-4 p-4 mb-4 rounded-lg ${currentTheme.card} border ${currentTheme.border}`}>
                    {ui.layout.header.elements.map((el, i) => renderElement(el, `header-${i}`))}
                </header>
            )}
            <div className="flex gap-4 h-[calc(100%-80px)]">
                {/* Sidebar */}
                {ui.layout.sidebar && (
                    <aside className={`flex flex-col gap-4 p-4 w-56 rounded-lg ${currentTheme.card} border ${currentTheme.border}`}>
                         {ui.layout.sidebar.elements.map((el, i) => renderElement(el, `sidebar-${i}`))}
                    </aside>
                )}
                {/* Content */}
                {ui.layout.content && (
                    <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                        {ui.layout.content.elements.map((el, i) => renderElement(el, `content-${i}`))}
                    </main>
                )}
            </div>
        </div>
    );
};

export default UiRenderer;
