/**
 * Sidebar component — stats and connection status.
 */
const Sidebar = (() => {
    async function updateStats() {
        try {
            const data = await API.getStats();
            document.getElementById('stat-docs').textContent = data.total_documents || 0;
            document.getElementById('stat-chunks').textContent = data.total_chunks || 0;
        } catch (e) {
            // silent
        }
    }

    async function checkConnection() {
        const dot = document.querySelector('.status-dot');
        const text = document.querySelector('.status-text');
        try {
            const health = await API.healthCheck();
            dot.className = 'status-dot connected';
            text.textContent = `Connected • Qdrant ${health.qdrant}`;
        } catch (e) {
            dot.className = 'status-dot error';
            text.textContent = 'Disconnected';
        }
    }

    function init() {
        checkConnection();
        updateStats();
        // Refresh every 30s
        setInterval(checkConnection, 30000);
    }

    return { init, updateStats };
})();
