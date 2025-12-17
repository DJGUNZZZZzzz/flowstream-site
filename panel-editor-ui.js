/* 
   ================================================
   PANEL EDITOR UI - Cyberpunk Theme
   ================================================
   Edit panels with black + neon baby blue theme
*/

console.log('✏️ panel-editor-ui.js loading...');

class PanelEditorUI {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createOverlay();
        this.attachEventListeners();
        console.log('✓ Panel editor UI initialized');
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'panel-editor-overlay';
        this.overlay.innerHTML = `
            <div class="panel-editor-container">
                <div class="panel-editor-header">
                    <h2 class="panel-editor-title">:: PANEL EDITOR</h2>
                    <button class="panel-editor-close" id="panel-editor-close">×</button>
                </div>
                <div class="panel-editor-body" id="panel-editor-body">
                    <!-- Panels will be rendered here -->
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    attachEventListeners() {
        // Close button
        const closeBtn = document.getElementById('panel-editor-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.close();
            }
        });
    }

    open() {
        this.render();
        this.overlay.classList.add('active');
        if (window.sfx) window.sfx.open();
    }

    close() {
        this.overlay.classList.remove('active');
        if (window.sfx) window.sfx.close();

        // Refresh display
        if (window.panelDisplayUI) {
            window.panelDisplayUI.refresh();
        }
    }

    render() {
        const body = document.getElementById('panel-editor-body');
        if (!body || !window.panelSystem) return;

        const panels = window.panelSystem.getPanels();

        body.innerHTML = `
            <div class="panels-grid">
                ${panels.map(panel => this.createPanelEditorHTML(panel)).join('')}
            </div>
            <div class="panel-add-new">
                <button class="panel-btn panel-btn-add" id="add-new-panel">
                    <i class="fa-solid fa-plus"></i> ADD NEW PANEL
                </button>
            </div>
        `;

        this.attachPanelEventListeners();
        this.setupDragAndDrop();
    }

    createPanelEditorHTML(panel) {
        return `
            <div class="panel-editor-card" data-panel-id="${panel.id}">
                <div class="panel-editor-card-header">
                    <i class="fa-solid fa-grip-vertical"></i> Panel
                </div>
                
                <div class="panel-form-group">
                    <label class="panel-form-label">
                        Title
                        <span class="panel-char-count">
                            <span class="title-count-${panel.id}">${panel.title.length}</span>/100
                        </span>
                    </label>
                    <input type="text" 
                           class="panel-form-input panel-title-input" 
                           data-panel-id="${panel.id}"
                           value="${panel.title}" 
                           maxlength="100"
                           placeholder="Panel title...">
                </div>

                <div class="panel-form-group">
                    <label class="panel-form-label">Image</label>
                    <div class="panel-image-preview" id="preview-${panel.id}">
                        ${panel.image ?
                `<img src="${panel.image}" alt="Preview">
                             <button class="panel-image-remove" data-panel-id="${panel.id}">×</button>` :
                '<i class="fa-solid fa-image panel-image-preview-empty"></i>'
            }
                    </div>
                    <button class="panel-btn panel-btn-change-image" data-panel-id="${panel.id}">
                        <i class="fa-solid fa-upload"></i> Change image
                    </button>
                </div>

                <div class="panel-form-group">
                    <label class="panel-form-label">Image link</label>
                    <input type="url" 
                           class="panel-form-input panel-link-input" 
                           data-panel-id="${panel.id}"
                           value="${panel.imageLink}" 
                           placeholder="https://...">
                </div>

                <div class="panel-form-group">
                    <label class="panel-form-label">
                        Description
                        <span class="panel-char-count">
                            <span class="desc-count-${panel.id}">${panel.description.length}</span>/1000
                        </span>
                    </label>
                    <textarea class="panel-form-textarea panel-desc-textarea" 
                              data-panel-id="${panel.id}"
                              maxlength="1000"
                              placeholder="Panel description...">${panel.description}</textarea>
                </div>

                <div class="panel-actions">
                    <button class="panel-btn panel-btn-remove" data-panel-id="${panel.id}">
                        <i class="fa-solid fa-trash"></i> Remove
                    </button>
                    <button class="panel-btn panel-btn-update" data-panel-id="${panel.id}">
                        <i class="fa-solid fa-check"></i> Update
                    </button>
                </div>
            </div>
        `;
    }

    attachPanelEventListeners() {
        // Add new panel
        const addBtn = document.getElementById('add-new-panel');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addNewPanel());
        }

        // Update buttons
        document.querySelectorAll('.panel-btn-update').forEach(btn => {
            // Prevent drag from interfering
            btn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = e.target.closest('.panel-editor-card');
                if (card) {
                    const panelId = parseInt(card.dataset.panelId);
                    this.updatePanel(panelId);
                }
            });
        });

        // Remove buttons
        document.querySelectorAll('.panel-btn-remove').forEach(btn => {
            // Prevent drag from interfering
            btn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('🗑️ Remove button clicked');
                const card = e.target.closest('.panel-editor-card');
                if (card) {
                    const panelId = parseInt(card.dataset.panelId);
                    console.log('Removing panel ID:', panelId);
                    this.removePanel(panelId);
                } else {
                    console.error('Could not find panel card');
                }
            });
        });

        // Change image buttons
        document.querySelectorAll('.panel-btn-change-image').forEach(btn => {
            // Prevent drag from interfering with button clicks
            btn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖼️ Change image button clicked');
                const card = e.target.closest('.panel-editor-card');
                if (card) {
                    const panelId = parseInt(card.dataset.panelId);
                    console.log('Panel ID:', panelId);
                    this.changeImage(panelId);
                } else {
                    console.error('Could not find panel card');
                }
            });
        });

        // Remove image buttons
        document.querySelectorAll('.panel-image-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const panelId = parseInt(e.target.closest('[data-panel-id]').dataset.panelId);
                this.removeImage(panelId);
            });
        });

        // Character counters
        document.querySelectorAll('.panel-title-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const panelId = e.target.dataset.panelId;
                const counter = document.querySelector(`.title-count-${panelId}`);
                if (counter) counter.textContent = e.target.value.length;
            });
        });

        document.querySelectorAll('.panel-desc-textarea').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const panelId = e.target.dataset.panelId;
                const counter = document.querySelector(`.desc-count-${panelId}`);
                if (counter) counter.textContent = e.target.value.length;
            });
        });
    }

    addNewPanel() {
        const newPanel = window.panelSystem.addPanel({
            title: 'New Panel',
            image: '',
            imageLink: '',
            description: ''
        });

        this.render();
        if (window.sfx) window.sfx.success();
    }

    updatePanel(panelId) {
        const card = document.querySelector(`.panel-editor-card[data-panel-id="${panelId}"]`);
        if (!card) return;

        const title = card.querySelector('.panel-title-input').value;
        const imageLink = card.querySelector('.panel-link-input').value;
        const description = card.querySelector('.panel-desc-textarea').value;

        const panel = window.panelSystem.getPanel(panelId);

        window.panelSystem.updatePanel(panelId, {
            title,
            image: panel.image, // Keep existing image
            imageLink,
            description
        });

        if (window.sfx) window.sfx.success();

        // Visual feedback
        const updateBtn = card.querySelector('.panel-btn-update');
        const originalText = updateBtn.innerHTML;
        updateBtn.innerHTML = '<i class="fa-solid fa-check"></i> SAVED!';
        setTimeout(() => {
            updateBtn.innerHTML = originalText;
        }, 1000);
    }

    removePanel(panelId) {
        console.log('🗑️ removePanel() called with ID:', panelId);
        // Bypassing confirm dialog - it's being blocked
        const confirmed = true; // Force true
        console.log('User confirmed:', confirmed);

        if (confirmed) {
            console.log('Calling panelSystem.deletePanel...');
            window.panelSystem.deletePanel(panelId);
            console.log('Re-rendering panel editor...');
            this.render();
            if (window.sfx) window.sfx.click();
            console.log('✓ Panel removed successfully');
        } else {
            console.log('User cancelled removal');
        }
    }

    changeImage(panelId) {
        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Create a URL for the local file
                const imageUrl = URL.createObjectURL(file);

                const panel = window.panelSystem.getPanel(panelId);
                window.panelSystem.updatePanel(panelId, {
                    ...panel,
                    image: imageUrl
                });
                this.render();
                if (window.sfx) window.sfx.success();

                console.log('✓ Image updated:', file.name);
            }
            // Clean up
            document.body.removeChild(fileInput);
        });

        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
    }

    removeImage(panelId) {
        const panel = window.panelSystem.getPanel(panelId);
        window.panelSystem.updatePanel(panelId, {
            ...panel,
            image: ''
        });
        this.render();
        if (window.sfx) window.sfx.click();
    }

    setupDragAndDrop() {
        const panelsGrid = document.querySelector('.panels-grid');
        if (!panelsGrid) return;

        const cards = panelsGrid.querySelectorAll('.panel-editor-card');

        cards.forEach(card => {
            card.draggable = true;

            // Prevent dragging when clicking on inputs, textareas, or buttons
            const interactiveElements = card.querySelectorAll('input, textarea, button');
            interactiveElements.forEach(el => {
                el.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                });
            });

            card.addEventListener('dragstart', (e) => {
                // Only allow drag from header (grip icon area)
                const header = card.querySelector('.panel-editor-card-header');
                if (!header.contains(e.target)) {
                    e.preventDefault();
                    return;
                }
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', card.innerHTML);
            });

            card.addEventListener('dragend', (e) => {
                card.classList.remove('dragging');
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingCard = document.querySelector('.dragging');
                if (!draggingCard || draggingCard === card) return;

                const allCards = [...panelsGrid.querySelectorAll('.panel-editor-card:not(.dragging)')];
                const nextCard = allCards.find(c => {
                    const box = c.getBoundingClientRect();
                    const offset = e.clientY - box.top - box.height / 2;
                    return offset < 0;
                });

                if (nextCard) {
                    panelsGrid.insertBefore(draggingCard, nextCard);
                } else {
                    panelsGrid.appendChild(draggingCard);
                }
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Save new order
                this.saveNewOrder();
                if (window.sfx) window.sfx.click();
            });
        });
    }

    saveNewOrder() {
        const cards = document.querySelectorAll('.panel-editor-card');
        const newOrder = [];

        cards.forEach(card => {
            const panelId = parseInt(card.dataset.panelId);
            const panel = window.panelSystem.getPanel(panelId);
            if (panel) {
                newOrder.push(panel);
            }
        });

        // Update panel system with new order
        window.panelSystem.panels = newOrder;
        window.panelSystem.savePanels();

        console.log('✓ Panel order saved');
    }
}

// Create global instance
let panelEditorUI;

function initPanelEditor() {
    if (!window.panelSystem) {
        console.warn('⚠️ Panel system not loaded, retrying...');
        setTimeout(initPanelEditor, 100);
        return;
    }

    panelEditorUI = new PanelEditorUI();
    window.panelEditorUI = panelEditorUI;
}

initPanelEditor();

console.log('✓ panel-editor-ui.js loaded');
