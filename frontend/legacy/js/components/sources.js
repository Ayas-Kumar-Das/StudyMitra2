/**
 * Source citations panel component.
 * Displays expandable source cards for the last answer's retrieved chunks.
 */
const Sources = (() => {
    let currentSources = [];

    function show(sources) {
        currentSources = sources || [];
        const panel = document.getElementById('sources-panel');
        const content = document.getElementById('sources-content');

        if (!sources || sources.length === 0) {
            panel.style.display = 'none';
            return;
        }

        content.innerHTML = sources.map((s, i) => renderCard(s, i)).join('');
        panel.style.display = 'flex';

        // Bind expand toggles
        content.querySelectorAll('.source-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('expanded');
            });
        });
    }

    function hide() {
        document.getElementById('sources-panel').style.display = 'none';
    }

    function renderCard(source, index) {
        const meta = [];
        if (source.chapter) meta.push(`Ch: ${source.chapter}`);
        if (source.section && source.section !== source.chapter) meta.push(`§ ${source.section}`);
        if (source.page_number) meta.push(`Page ${source.page_number}`);
        if (source.subject) meta.push(source.subject);
        if (source.doc_type) meta.push(source.doc_type);

        const excerpt = source.chunk_text || '';
        const truncated = excerpt.length > 200 ? excerpt.slice(0, 200) + '...' : excerpt;
        const score = source.relevance_score ? source.relevance_score.toFixed(3) : '';

        return `
            <div class="source-card" data-index="${index}">
                <div class="source-card-header">
                    <span class="source-number">Source ${index + 1}</span>
                    ${score ? `<span class="source-score">${score}</span>` : ''}
                </div>
                <div class="source-doc-name">${escapeHtml(source.document_name || 'Unknown')}</div>
                <div class="source-meta">
                    ${meta.map(m => `<span class="source-tag">${escapeHtml(m)}</span>`).join('')}
                </div>
                <div class="source-excerpt">${escapeHtml(excerpt)}</div>
                <div class="source-expand-hint">Click to ${excerpt.length > 200 ? 'expand' : 'view'}</div>
            </div>
        `;
    }

    function scrollToSource(index) {
        const panel = document.getElementById('sources-panel');
        if (panel.style.display === 'none' && currentSources.length > 0) {
            show(currentSources);
        }
        const card = panel.querySelector(`.source-card[data-index="${index}"]`);
        if (card) {
            card.classList.add('expanded');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function init() {
        document.getElementById('sources-close').addEventListener('click', hide);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { init, show, hide, scrollToSource };
})();
