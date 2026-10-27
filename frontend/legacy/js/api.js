/**
 * API client for the StudyMitra backend.
 * All backend communication goes through this module.
 */
const API = (() => {
    const BASE = '/api';

    async function request(path, options = {}) {
        const url = `${BASE}${path}`;
        try {
            const res = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.detail || `Request failed (${res.status})`);
            }

            return await res.json();
        } catch (err) {
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                throw new Error('Cannot connect to backend. Is the server running?');
            }
            throw err;
        }
    }

    // ── Health ──────────────────────────────────────────────

    async function healthCheck() {
        return request('/health');
    }

    // ── Documents ───────────────────────────────────────────

    async function listDocuments(filters = {}) {
        const params = new URLSearchParams();
        if (filters.subject) params.set('subject', filters.subject);
        if (filters.doc_type) params.set('doc_type', filters.doc_type);
        const qs = params.toString();
        return request(`/documents${qs ? '?' + qs : ''}`);
    }

    async function getDocument(id) {
        return request(`/documents/${id}`);
    }

    async function uploadDocument(file, metadata = {}) {
        const formData = new FormData();
        formData.append('file', file);
        for (const [key, value] of Object.entries(metadata)) {
            if (value) formData.append(key, value);
        }

        return request('/documents/upload', {
            method: 'POST',
            body: formData,
        });
    }

    async function deleteDocument(id) {
        return request(`/documents/${id}`, { method: 'DELETE' });
    }

    async function reindexDocument(id) {
        return request(`/documents/${id}/reindex`, { method: 'POST' });
    }

    async function getSubjects() {
        return request('/documents/subjects');
    }

    async function getStats() {
        return request('/documents/stats');
    }

    // ── Chat ────────────────────────────────────────────────

    async function chat(query, mode = 'explain', filters = {}, topK = 5) {
        return request('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                mode,
                filters,
                top_k: topK,
            }),
        });
    }

    async function chatStream(query, mode = 'explain', filters = {}, topK = 5, onToken, onSources, onDone, onError) {
        const url = `${BASE}/chat/stream`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    mode,
                    filters,
                    top_k: topK,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.detail || `Stream request failed (${res.status})`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // keep incomplete line

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'token' && onToken) {
                                onToken(data.content);
                            } else if (data.type === 'sources' && onSources) {
                                onSources(data.sources);
                            } else if (data.type === 'done' && onDone) {
                                onDone();
                            } else if (data.type === 'error' && onError) {
                                onError(data.content);
                            }
                        } catch (e) {
                            // Skip malformed events
                        }
                    }
                }
            }
        } catch (err) {
            if (onError) onError(err.message);
            else throw err;
        }
    }

    return {
        healthCheck,
        listDocuments,
        getDocument,
        uploadDocument,
        deleteDocument,
        reindexDocument,
        getSubjects,
        getStats,
        chat,
        chatStream,
    };
})();
