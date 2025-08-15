
# Layout: Full-Screen Overlay

The Full-Screen Overlay is a specialized layout container used to launch "personal" modules like Media, Studio, and Hobbies. It functions like a maximized application window, appearing on top of the main interface.

## Functionality

-   **Activation**: Triggered by clicking a module icon in the **Bottom Dock**.
-   **Isolation**: Provides a focused, immersive environment for the specific module, separate from the core "work" sections of the application.
-   **Self-Contained Navigation**: Each overlay has its own internal navigation system (header tabs, sidebars) that is independent of the main application's navigation.

## Window Controls

Each overlay features a window-style header with controls:
-   **Module Icon & Title**: Clearly identifies the running application.
-   **Reduce/Minimize Button**: Hides the overlay and re-opens the Bottom Dock launcher bar. This allows the user to "minimize" the app without closing it completely.
-   **Close Button**: Completely closes the overlay and exits the module.

## Design

-   The overlay takes up the full screen viewport, with a semi-transparent, blurred background to maintain a sense of depth and context.
-   The main content of the overlay is housed within a `GlassCard` to ensure visual consistency with the rest of the application.
