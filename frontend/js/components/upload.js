/**
 * Upload modal component.
 * Handles file selection (drag & drop + browse), metadata form, and upload submission.
 */
const Upload = (() => {
    let selectedFile = null;

    function init() {
        const modal = document.getElementById('upload-modal');
        const dropzone = document.getElementById('upload-dropzone');
        const fileInput = document.getElementById('file-input');
        const form = document.getElementById('upload-form');

        // Open modal buttons
        document.getElementById('upload-btn').addEventListener('click', openModal);
        const emptyBtn = document.getElementById('upload-btn-empty');
        if (emptyBtn) emptyBtn.addEventListener('click', openModal);

        // Close modal
        document.getElementById('modal-close').addEventListener('click', closeModal);
        document.getElementById('upload-cancel').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Dropzone interactions
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) setFile(files[0]);
        });

        // File input change
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) setFile(fileInput.files[0]);
        });

        // Remove file
        document.getElementById('file-remove').addEventListener('click', clearFile);

        // Form submit
        form.addEventListener('submit', handleSubmit);
    }

    function openModal() {
        clearFile();
        document.getElementById('upload-form').reset();
        document.getElementById('upload-modal').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('upload-modal').style.display = 'none';
        clearFile();
    }

    function setFile(file) {
        const allowed = ['.pdf', '.md', '.txt'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowed.includes(ext)) {
            Toast.error(`File type "${ext}" not supported. Use PDF, Markdown, or Text.`);
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            Toast.error('File size exceeds 50MB limit.');
            return;
        }

        selectedFile = file;

        // Show preview
        document.getElementById('upload-dropzone').style.display = 'none';
        document.getElementById('file-preview').style.display = 'flex';
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = formatSize(file.size);
        document.getElementById('upload-submit').disabled = false;
    }

    function clearFile() {
        selectedFile = null;
        document.getElementById('file-input').value = '';
        document.getElementById('upload-dropzone').style.display = 'block';
        document.getElementById('file-preview').style.display = 'none';
        document.getElementById('upload-submit').disabled = true;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedFile) return;

        const submitBtn = document.getElementById('upload-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';

        try {
            const metadata = {
                title: document.getElementById('upload-title').value,
                subject: document.getElementById('upload-subject').value,
                semester: document.getElementById('upload-semester').value,
                doc_type: document.getElementById('upload-type').value,
                description: document.getElementById('upload-description').value,
            };

            await API.uploadDocument(selectedFile, metadata);

            Toast.success(`"${selectedFile.name}" uploaded and indexed successfully!`);
            closeModal();

            // Refresh library and sidebar
            Library.refresh();
            Sidebar.updateStats();
            Chat.refreshFilters();

        } catch (err) {
            Toast.error(err.message || 'Upload failed');
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    return { init, openModal };
})();
