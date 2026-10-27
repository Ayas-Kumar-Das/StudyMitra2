/**
 * Document Library component.
 * Displays document grid with stats, filters, and CRUD actions.
 */
const Library = (() => {
    let documents = [];

    async function load() {
        try {
            const subjectFilter = document.getElementById('lib-filter-subject').value;
            const typeFilter = document.getElementById('lib-filter-type').value;
            const data = await API.listDocuments({
                subject: subjectFilter || undefined,
                doc_type: typeFilter || undefined,
            });

            documents = data.documents || [];
            renderStats(data.stats || {});
            renderGrid(documents);
            updateSubjectFilters(data.stats?.subjects || []);
        } catch (err) {
            Toast.error('Failed to load documents: ' + err.message);
        }
    }

    function renderStats(stats) {
        document.getElementById('lib-stat-docs').textContent = stats.total_documents || 0;
        document.getElementById('lib-stat-subjects').textContent = stats.total_subjects || 0;
        document.getElementById('lib-stat-chunks').textContent = stats.total_chunks || 0;
        document.getElementById('lib-stat-size').textContent = formatSize(stats.total_size_bytes || 0);
    }

    function renderGrid(docs) {
        const grid = document.getElementById('document-grid');
        const empty = document.getElementById('library-empty');

        if (!docs || docs.length === 0) {
            grid.innerHTML = '';
            grid.appendChild(empty);
            empty.style.display = 'flex';
            return;
        }

        empty.style.display = 'none';
        grid.innerHTML = docs.map(renderDocCard).join('');

        // Bind action buttons
        grid.querySelectorAll('.doc-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const name = btn.dataset.name;
                if (confirm(`Delete "${name}"? This removes the document and all its indexed data.`)) {
                    try {
                        await API.deleteDocument(id);
                        Toast.success(`"${name}" deleted`);
                        refresh();
                        Sidebar.updateStats();
                    } catch (err) {
                        Toast.error('Delete failed: ' + err.message);
                    }
                }
            });
        });

        grid.querySelectorAll('.doc-action-btn.reindex').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                try {
                    btn.innerHTML = '<span class="spinner"></span>';
                    await API.reindexDocument(id);
                    Toast.success('Document re-indexed');
                    refresh();
                    Sidebar.updateStats();
                } catch (err) {
                    Toast.error('Re-index failed: ' + err.message);
                }
            });
        });
    }

    function renderDocCard(doc) {
        const ext = doc.file_type || 'txt';
        const title = doc.title || doc.original_filename;
        const statusClass = `status-${doc.status}`;

        const metaTags = [];
        if (doc.subject) metaTags.push(`<span class="doc-tag subject">${esc(doc.subject)}</span>`);
        if (doc.doc_type) metaTags.push(`<span class="doc-tag type">${esc(doc.doc_type)}</span>`);
        if (doc.semester) metaTags.push(`<span class="doc-tag semester">Sem ${esc(doc.semester)}</span>`);
        metaTags.push(`<span class="doc-tag ${statusClass}">${esc(doc.status)}</span>`);

        return `
            <div class="doc-card" data-id="${doc.id}">
                <div class="doc-card-header">
                    <div class="doc-card-icon ${ext}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </div>
                    <div class="doc-card-actions">
                        <button class="doc-action-btn reindex" data-id="${doc.id}" title="Re-index">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                        </button>
                        <button class="doc-action-btn delete" data-id="${doc.id}" data-name="${esc(title)}" title="Delete">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="doc-card-title">${esc(title)}</div>
                <div class="doc-card-meta">${metaTags.join('')}</div>
                <div class="doc-card-stats">
                    <span>${doc.total_chunks || 0} chunks</span>
                    ${doc.total_pages ? `<span>${doc.total_pages} pages</span>` : ''}
                    <span>${formatSize(doc.file_size || 0)}</span>
                </div>
            </div>
        `;
    }

    function updateSubjectFilters(subjects) {
        const selects = [
            document.getElementById('lib-filter-subject'),
            document.getElementById('filter-subject'),
        ];
        for (const select of selects) {
            if (!select) continue;
            const current = select.value;
            // Keep first option
            while (select.options.length > 1) select.remove(1);
            for (const s of subjects) {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                select.appendChild(opt);
            }
            select.value = current;
        }
    }

    function refresh() {
        load();
    }

    function init() {
        // Filter changes
        document.getElementById('lib-filter-subject').addEventListener('change', load);
        document.getElementById('lib-filter-type').addEventListener('change', load);
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function esc(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    return { init, load, refresh };
})();
