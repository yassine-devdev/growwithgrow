# Cyberpunk HUD Interface - Project Guide

This document provides a comprehensive overview of the design philosophy, features, file structure, layout system, and component architecture for the Cyberpunk HUD Interface application.

## 1. Design Philosophy & Styling

The application's aesthetic is a fusion of **Glass Morphism** and a futuristic **Cyberpunk** theme. This is achieved through a consistent set of visual rules defined in `index.html` within the `<script>` tag for `tailwind.config`.

-   **Colors**: A dark, deep blue background (`cyber-bg: #0a0a1a`) serves as the canvas. Key interactive elements are highlighted with vibrant neon colors: `cyber-cyan` (#00ffff), `cyber-purple` (#a855f7), and `cyber-orange` (#f97316).
-   **Fonts**:
    -   `font-sans`: `Inter`, used for general UI text for optimal readability.
    -   `font-mono`: `JetBrains Mono`, used for code blocks, data displays, and labels to enhance the technical aesthetic.
-   **Effects**:
    -   **Glass Morphism**: The core component, `GlassCard`, uses a semi-transparent background (`cyber-surface: rgba(20, 20, 40, 0.5)`), a `backdrop-blur-xl` (24px), and a subtle `cyber-border` (`rgba(0, 255, 255, 0.2)`) to create its frosted glass effect.
    -   **Glows**: Interactive elements and active states are emphasized with `box-shadow` glows (e.g., `glow-cyan`) to create a neon-lit feel.

## 2. Features

-   **Modular Architecture**: The application is divided into distinct modules like Dashboard, AI Tools, School Hub, and more.
-   **Overlay "Apps"**: Personal modules (Lifestyle, Hobbies, Studio) launch as full-screen overlays, managed by a taskbar-like Bottom Dock.
-   **Hierarchical Navigation**: A 4-level navigation system allows for deep, organized exploration of complex modules.
-   **AI-Powered Tools**: Includes generative tools for text, charts, images, and UI layouts, as well as a manual Canva-style editor.
-   **Responsive Design**: The layout adapts to various screen sizes.

## 3. Project Structure

The project is organized by feature modules to ensure code is scalable, maintainable, and self-contained.

```
/
├── index.html            # Main HTML entry point, Tailwind config
├── index.tsx             # Root of the React application
├── App.tsx               # Main component, global layout and state
├── types.ts              # Global TypeScript types and enums
├── constants.ts          # Global constants, module definitions
├── services/
│   └── geminiService.ts  # Handles all external AI API calls
├── components/           # Globally shared, reusable React components
│   ├── GlassCard.tsx
│   └── ...
├── modules/              # Main application features
│   ├── dashboard/
│   ├── tools/
│   └── ... (other modules)
└── docs/                 # Project documentation
    ├── conciergeai/
    ├── communications/
    ├── crm/
    ├── knowledgebase/
    ├── schoolhub/
    ├── systemsettings/
    └── tools/
```

## 4. Documentation

The `/docs` directory contains detailed information about the application's main modules, broken down by their primary sections.

-   **/docs/tools/**: Explains the features within the Tools module, such as the Marketing Hub, AI Generators, and financial utilities.
-   **/docs/communications/**: Covers the functionality of the Communications module, including the Email client, Calendar, and Announcements.
-   **/docs/crm/**: Details the Customer Relationship Management module, from the main dashboard to contacts, deals, and settings.
-   **/docs/systemsettings/**: Outlines the various panels in System Settings, covering General, Security, Integrations, and more.
-   **/docs/conciergeai/**: Details the multi-faceted AI assistant, including its chat, reporting, and automation capabilities.
-   **/docs/knowledgebase/**: Explains the features for managing educational content, from curriculum to assessments and a digital store.
-   **/docs/schoolhub/**: Provides a high-level overview of the comprehensive school management module.

## 5. Navigation Hierarchy

The application features up to four levels of navigation (L1-L4), allowing for deep, organized exploration of complex modules.

-   **L1: Global Module Selection**: The main Right Sidebar switches between core application modules. The Bottom Dock launches personal modules as overlays.
-   **L2: In-Module Section Navigation**: Primarily handled by the main `Header`, which displays tabs for the active module's main sections.
-   **L3 & L4: Deeply Nested Navigation**: Implemented within modules that require more depth. For example, the **Tools -> Marketing** section uses a horizontal L3 sub-navigation and a vertical L4 sidebar to organize its extensive toolkit.

## 6. State Management

-   **Global State**: Managed within `App.tsx` using `React.useState`. This includes the active module, active section, and the state of any open overlay "apps".
-   **Data Flow**: State and setters are passed down from `App.tsx` via props.
-   **Static Data**: Module definitions, navigation sections, and other static content are centralized in `constants.ts`.

## 7. Key Dependencies

-   **React**: Core UI library.
-   **Tailwind CSS**: For all styling.
-   **Recharts**: For data visualization and charts.
-   **@google/genai**: For interactions with the Google Gemini API (charts, images, etc.).
-   **react-rnd**: For draggable and resizable components in the editor.
-   **html-to-image**: For exporting canvas designs as images.
-   **nanoid**: For generating unique IDs for editor elements.

## 8. Getting Started

1.  **API Keys**:
    -   **Google Gemini**: Ensure you have a valid Google Gemini API key. It must be provided as an environment variable named `API_KEY`. The application reads this key via `process.env.API_KEY`.
    -   **OpenRouter**: The `geminiService.ts` also uses OpenRouter for some text generation tasks. The key is currently hardcoded but should be moved to an environment variable (`OPENROUTER_API_KEY`) in a production setup.
2.  **Dependencies**: The project uses an `importmap` in `index.html` to load dependencies from a CDN (`esm.sh`), so no `npm install` is necessary.
3.  **Run**: Open `index.html` in a web browser.