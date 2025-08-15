export enum UiElementType {
    Logo = 'logo',
    Search = 'search',
    Button = 'button',
    NavItem = 'nav-item',
    Title = 'title',
    Paragraph = 'paragraph',
    Card = 'card',
}

export interface UiElement {
    type: UiElementType;
    label?: string;
}

export interface UiLayoutSection {
    elements: UiElement[];
}

export interface UiLayout {
    theme: 'dark' | 'light' | 'corporate';
    layout: {
        type: string; // e.g., 'header-sidebar-content'
        header?: UiLayoutSection;
        sidebar?: UiLayoutSection;
        content?: UiLayoutSection;
    };
}
