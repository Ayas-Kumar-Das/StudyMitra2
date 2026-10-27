/**
 * Simple hash-based SPA router.
 * Routes: #chat (default), #library
 */
const Router = (() => {
    const routes = {};
    let currentRoute = '';

    function register(route, callback) {
        routes[route] = callback;
    }

    function navigate(route) {
        window.location.hash = route;
    }

    function handleRouteChange() {
        const hash = window.location.hash.slice(1) || 'chat';
        if (hash === currentRoute) return;
        currentRoute = hash;

        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');

        // Update nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-route="${hash}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Show target view
        const view = document.getElementById(`view-${hash}`);
        if (view) {
            view.style.display = hash === 'chat' ? 'flex' : 'block';
        }

        // Execute route callback
        if (routes[hash]) {
            routes[hash]();
        }
    }

    function init() {
        window.addEventListener('hashchange', handleRouteChange);
        // Initial route
        handleRouteChange();
    }

    return { register, navigate, init, get current() { return currentRoute; } };
})();
