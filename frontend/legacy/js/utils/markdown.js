/**
 * Simple Markdown to HTML renderer.
 * Handles headings, bold, italic, code, lists, blockquotes, 
 * and [Source N] citation references.
 */
const Markdown = (() => {

    function render(text) {
        if (!text) return '';

        let html = escapeHtml(text);

        // Code blocks (``` ... ```)
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
            return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Headings
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Bold and italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Blockquotes
        html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr>');

        // Unordered lists
        html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        // Wrap consecutive <li> in <ol> if they were from numbered lists
        // (simplified — the above regex already handles basic cases)

        // Source references [Source N]
        html = html.replace(/\[Source (\d+)\]/g, 
            '<span class="source-ref" data-source="$1" title="Click to view source">Source $1</span>'
        );

        // Line breaks → paragraphs
        html = html.replace(/\n\n+/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        // Wrap in paragraph tags if not already wrapped
        if (!html.startsWith('<h') && !html.startsWith('<pre') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
            html = '<p>' + html + '</p>';
        }

        // Clean up empty paragraphs
        html = html.replace(/<p>\s*<\/p>/g, '');

        return html;
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    return { render };
})();
