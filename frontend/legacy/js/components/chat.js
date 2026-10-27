/**
 * Chat interface component.
 * Handles message rendering, query submission (SSE streaming),
 * mode selection, filters, and conversation history.
 */
const Chat = (() => {
    let currentMode = 'explain';
    let isStreaming = false;
    let conversationHistory = [];

    function init() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send');

        // Enable/disable send button based on input
        input.addEventListener('input', () => {
            sendBtn.disabled = !input.value.trim() || isStreaming;
            autoResize(input);
        });

        // Enter to send (Shift+Enter for newline)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.value.trim() && !isStreaming) {
                    handleSend();
                }
            }
        });

        sendBtn.addEventListener('click', handleSend);

        // Mode selector
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
            });
        });

        // Example queries
        document.querySelectorAll('.example-query').forEach(btn => {
            btn.addEventListener('click', () => {
                input.value = btn.dataset.query;
                sendBtn.disabled = false;
                autoResize(input);
                handleSend();
            });
        });

        // Source ref clicks (delegated)
        document.getElementById('chat-messages').addEventListener('click', (e) => {
            const ref = e.target.closest('.source-ref');
            if (ref) {
                const sourceIndex = parseInt(ref.dataset.source) - 1;
                Sources.scrollToSource(sourceIndex);
            }
        });

        // Load conversation from localStorage
        loadHistory();
    }

    async function handleSend() {
        const input = document.getElementById('chat-input');
        const query = input.value.trim();
        if (!query || isStreaming) return;

        // Clear input
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('chat-send').disabled = true;

        // Hide empty state
        const empty = document.getElementById('chat-empty');
        if (empty) empty.style.display = 'none';

        // Build filters
        const filters = {};
        const subjectFilter = document.getElementById('filter-subject').value;
        const semesterFilter = document.getElementById('filter-semester').value;
        const docTypeFilter = document.getElementById('filter-doctype').value;
        if (subjectFilter) filters.subject = subjectFilter;
        if (semesterFilter) filters.semester = semesterFilter;
        if (docTypeFilter) filters.doc_type = docTypeFilter;

        // Add user message
        addMessage('user', query);

        // Add assistant loading
        const assistantEl = addMessage('assistant', '', true);
        const textEl = assistantEl.querySelector('.message-text');

        isStreaming = true;
        let fullAnswer = '';
        let sources = [];

        try {
            await API.chatStream(
                query,
                currentMode,
                filters,
                5,
                // onToken
                (token) => {
                    fullAnswer += token;
                    textEl.innerHTML = Markdown.render(fullAnswer);
                    scrollToBottom();
                },
                // onSources
                (srcList) => {
                    sources = srcList || [];
                    Sources.show(sources);
                },
                // onDone
                () => {
                    // Add meta bar with sources button
                    finishMessage(assistantEl, sources, currentMode);
                    saveToHistory(query, fullAnswer, sources, currentMode);
                },
                // onError
                (errMsg) => {
                    if (!fullAnswer) {
                        textEl.innerHTML = `<p style="color: var(--error);">Error: ${escapeHtml(errMsg)}</p>`;
                    }
                    Toast.error(errMsg || 'Query failed');
                }
            );
        } catch (err) {
            textEl.innerHTML = `<p style="color: var(--error);">Error: ${escapeHtml(err.message)}</p>`;
            Toast.error(err.message);
        } finally {
            isStreaming = false;
            // Remove loading dots
            const loader = assistantEl.querySelector('.message-loading');
            if (loader) loader.remove();
        }
    }

    function addMessage(role, content, isLoading = false) {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = `message message-${role}`;

        if (role === 'user') {
            div.innerHTML = `
                <div class="message-avatar">Y</div>
                <div class="message-content">${escapeHtml(content)}</div>
            `;
        } else {
            div.innerHTML = `
                <div class="message-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                </div>
                <div class="message-content">
                    <div class="message-text">${content ? Markdown.render(content) : ''}</div>
                    ${isLoading ? '<div class="message-loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>' : ''}
                </div>
            `;
        }

        container.appendChild(div);
        scrollToBottom();
        return div;
    }

    function finishMessage(el, sources, mode) {
        const content = el.querySelector('.message-content');
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';

        const modeLabels = {
            explain: 'Explain',
            exam_answer: 'Exam Answer',
            summarize: 'Summary',
            compare: 'Compare',
            find_pyqs: 'Find PYQs',
            quiz: 'Quiz',
        };

        metaDiv.innerHTML = `
            <span class="message-mode-badge">${modeLabels[mode] || mode}</span>
            ${sources.length > 0 ? `
                <button class="message-sources-btn" data-sources='${JSON.stringify(sources).replace(/'/g, "&#39;")}'>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    ${sources.length} source${sources.length !== 1 ? 's' : ''}
                </button>
            ` : ''}
        `;

        content.appendChild(metaDiv);

        // Bind sources button
        const srcBtn = metaDiv.querySelector('.message-sources-btn');
        if (srcBtn) {
            srcBtn.addEventListener('click', () => {
                try {
                    const s = JSON.parse(srcBtn.dataset.sources);
                    Sources.show(s);
                } catch (e) {
                    // fallback
                }
            });
        }
    }

    function scrollToBottom() {
        const container = document.getElementById('chat-messages');
        container.scrollTop = container.scrollHeight;
    }

    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // ── Conversation History ────────────────────────────────

    function saveToHistory(query, answer, sources, mode) {
        conversationHistory.push({ query, answer, sources, mode, timestamp: Date.now() });
        // Keep last 50 exchanges
        if (conversationHistory.length > 50) conversationHistory = conversationHistory.slice(-50);
        try {
            localStorage.setItem('studymitra_history', JSON.stringify(conversationHistory));
        } catch (e) { /* quota exceeded */ }
    }

    function loadHistory() {
        try {
            const saved = localStorage.getItem('studymitra_history');
            if (saved) {
                conversationHistory = JSON.parse(saved);
                if (conversationHistory.length > 0) {
                    renderHistory();
                }
            }
        } catch (e) {
            conversationHistory = [];
        }
    }

    function renderHistory() {
        const empty = document.getElementById('chat-empty');
        if (conversationHistory.length > 0 && empty) {
            empty.style.display = 'none';
        }
        for (const entry of conversationHistory) {
            addMessage('user', entry.query);
            const assistantEl = addMessage('assistant', entry.answer);
            finishMessage(assistantEl, entry.sources || [], entry.mode);
        }
    }

    async function refreshFilters() {
        try {
            const data = await API.getSubjects();
            const select = document.getElementById('filter-subject');
            const current = select.value;
            while (select.options.length > 1) select.remove(1);
            for (const s of (data.subjects || [])) {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                select.appendChild(opt);
            }
            select.value = current;
        } catch (e) {
            // silent
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { init, refreshFilters };
})();
