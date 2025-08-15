
# Layout: Main Content Area

The Main Content Area is the primary workspace of the application. It is the largest region of the UI and is dedicated to displaying the content of the currently selected module and section.

## Dynamic Content

The content within this area is completely dynamic and changes based on user navigation:
-   Selecting a module in the **Right Sidebar** (L1) loads the module's main component into this area.
-   Selecting a section in the **Header** (L2) or an **L2/L3 Sidebar** updates the content within this area to show that specific section.

## Layout Principles

-   **Focus**: It is designed to be the user's main area of focus. Other navigation elements (sidebars, header, dock) are positioned around its perimeter.
-   **Flexibility**: The internal layout of the main content area is determined by the active module. It can range from a simple placeholder, to a complex grid of charts, to a multi-panel editor interface.
-   **Scrolling**: When content exceeds the available viewport height, the main content area becomes scrollable, while the surrounding navigation elements remain fixed. This ensures a stable and predictable user experience.
