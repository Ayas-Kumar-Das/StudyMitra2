/**
 * StudyMitra — Main application entry point.
 * Initializes all components and the router.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    Sidebar.init();
    Sources.init();
    Upload.init();
    Library.init();
    Chat.init();

    // Register routes
    Router.register('chat', () => {
        Chat.refreshFilters();
    });

    Router.register('library', () => {
        Library.load();
    });

    // Start router
    Router.init();

    // Preload library data
    Library.load();

    console.log('%c📚 StudyMitra loaded', 'color: #3de8d4; font-weight: bold; font-size: 14px;');
});
