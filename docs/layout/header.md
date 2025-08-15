
# Layout: Header

The Header is a persistent component at the top of the screen that provides context, secondary navigation, and global actions.

## Key Components

1.  **Logo & Module Title**:
    -   Displays an animated, glowing icon representing the application.
    -   Shows the title of the currently active Level-1 (L1) module, providing clear context to the user.

2.  **Level-2 (L2) Navigation**:
    -   For modules with multiple sections, the Header dynamically displays a tab-based navigation bar.
    -   This allows users to navigate between the main sections of the active module (e.g., in "System Settings," it shows tabs for "General," "Users," "Security," etc.).
    -   The active L2 tab is highlighted to maintain navigational clarity.

3.  **Global Actions (Right-Aligned)**:
    -   **Expanding Search Bar**: A compact, icon-only search bar that expands into a full input field upon focus.
    -   **Notifications**: A bell icon indicates system notifications, with a pulsing dot to signal new, unread alerts.
    -   **User Profile**: An avatar that serves as an entry point for user profile settings and logout options.

## Design

-   The entire header is contained within a single `GlassCard`, stretching the full width of the main content area.
-   It is designed to be visually distinct but unobtrusive, providing essential functions without cluttering the view.
