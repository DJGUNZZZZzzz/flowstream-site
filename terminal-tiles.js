/*
   ================================================
   TERMINAL TILE MANAGEMENT SYSTEM
   ================================================
   Drag & drop, pop-out, and toggle functionality
*/

class TerminalTileManager {
    constructor() {
        this.tiles = [];
        this.draggedTile = null;
        this.tileStates = this.loadTileStates();
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.collectTiles();
        this.addTileControls();
        this.addSidebarToggles();
        this.makeTilesDraggable();
        this.restoreTileStates();
        console.log('✓ Terminal Tile Manager Initialized');
    }

    collectTiles() {
        // Get all terminal tiles
        const tileElements = document.querySelectorAll('.terminal-tile');
        this.tiles = Array.from(tileElements).map((el, index) => {
            const titleEl = el.querySelector('.tile-header span');
            const title = titleEl ? titleEl.textContent : `Tile ${index + 1}`;
            const id = `tile-${index}`;
            el.setAttribute('data-tile-id', id);

            return {
                id: id,
                title: title,
                element: el,
                visible: true,
                order: index
            };
        });
    }

    addTileControls() {
        // Add pop-out and drag handle to each tile header
        this.tiles.forEach(tile => {
            const header = tile.element.querySelector('.tile-header');
            if (!header) return;

            // Create controls container
            const controls = document.createElement('div');
            controls.className = 'tile-window-controls';
            controls.style.cssText = 'display: flex; gap: 5px; margin-left: auto;';

            // Drag handle
            const dragHandle = document.createElement('button');
            dragHandle.className = 'tile-btn drag-handle';
            dragHandle.innerHTML = '<i class="fa-solid fa-grip-vertical"></i>';
            dragHandle.title = 'Drag to reorder';
            dragHandle.style.cursor = 'grab';

            // Pop-out button
            const popoutBtn = document.createElement('button');
            popoutBtn.className = 'tile-btn popout-btn';
            popoutBtn.innerHTML = '<i class="fa-solid fa-up-right-from-square"></i>';
            popoutBtn.title = 'Pop out to new window';
            popoutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.popOutTile(tile);
            });

            controls.appendChild(dragHandle);
            controls.appendChild(popoutBtn);

            // Insert before existing tile-controls or at end
            const existingControls = header.querySelector('.tile-controls');
            if (existingControls) {
                header.insertBefore(controls, existingControls);
            } else {
                header.appendChild(controls);
            }
        });
    }

    addSidebarToggles() {
        const sidebar = document.querySelector('.cyber-sidebar');
        if (!sidebar) return;

        // Create tile toggles section
        const toggleSection = document.createElement('div');
        toggleSection.className = 'tile-toggles-section';
        toggleSection.style.cssText = `
            margin-top: auto;
            padding: 10px 0;
            border-top: 1px solid rgba(0, 255, 255, 0.2);
        `;

        // Add title
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 10px;
            color: #0ff;
            text-align: center;
            margin-bottom: 10px;
            letter-spacing: 1px;
        `;
        title.textContent = 'TILES';
        toggleSection.appendChild(title);

        // Add toggle button for each tile
        this.tiles.forEach(tile => {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'cyber-nav-btn tile-toggle-btn';
            toggleBtn.setAttribute('data-tile-id', tile.id);
            toggleBtn.title = tile.title;
            toggleBtn.style.cssText = 'opacity: 1;';

            // Create icon based on tile type
            const icon = this.getTileIcon(tile.title);
            toggleBtn.innerHTML = `<i class="${icon}"></i>`;

            toggleBtn.addEventListener('click', () => {
                this.toggleTileVisibility(tile.id);
                toggleBtn.style.opacity = tile.visible ? '1' : '0.3';
                if (window.sfx) sfx.click();
            });

            toggleSection.appendChild(toggleBtn);
        });

        // Insert before settings button
        const settingsBtn = sidebar.querySelector('#terminal-settings-btn');
        if (settingsBtn && settingsBtn.parentNode) {
            settingsBtn.parentNode.insertBefore(toggleSection, settingsBtn);
        } else {
            sidebar.appendChild(toggleSection);
        }
    }

    getTileIcon(title) {
        const iconMap = {
            'STREAM_CONFIG': 'fa-solid fa-clapperboard',
            'ACTIVITY_FEED': 'fa-solid fa-bolt',
            'MOD_LOG': 'fa-solid fa-shield-halved',
            'QUICK STATS': 'fa-solid fa-chart-line',
            'CODE_TERMINAL': 'fa-solid fa-terminal'
        };

        for (const [key, icon] of Object.entries(iconMap)) {
            if (title.includes(key)) return icon;
        }
        return 'fa-solid fa-window-maximize';
    }

    makeTilesDraggable() {
        this.tiles.forEach(tile => {
            const dragHandle = tile.element.querySelector('.drag-handle');
            if (!dragHandle) return;

            dragHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.startDrag(tile, e);
            });
        });

        // Add drop zones
        const grid = document.querySelector('.terminal-grid');
        if (grid) {
            grid.addEventListener('dragover', (e) => this.handleDragOver(e));
            grid.addEventListener('drop', (e) => this.handleDrop(e));
        }
    }

    startDrag(tile, e) {
        this.draggedTile = tile;
        tile.element.style.opacity = '0.5';
        tile.element.setAttribute('draggable', 'true');

        const dragHandle = tile.element.querySelector('.drag-handle');
        if (dragHandle) dragHandle.style.cursor = 'grabbing';

        // Set up drag events
        tile.element.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', tile.element.innerHTML);
        });

        tile.element.addEventListener('dragend', () => {
            tile.element.style.opacity = '1';
            tile.element.setAttribute('draggable', 'false');
            if (dragHandle) dragHandle.style.cursor = 'grab';
            this.draggedTile = null;
        });

        // Trigger drag
        tile.element.dispatchEvent(new DragEvent('dragstart', {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer()
        }));
    }

    handleDragOver(e) {
        if (!this.draggedTile) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Find the tile we're hovering over
        const afterElement = this.getDragAfterElement(e.clientY);
        const grid = document.querySelector('.terminal-grid');

        if (afterElement == null) {
            grid.appendChild(this.draggedTile.element);
        } else {
            grid.insertBefore(this.draggedTile.element, afterElement);
        }
    }

    getDragAfterElement(y) {
        const draggableElements = [...document.querySelectorAll('.terminal-tile:not([style*="opacity: 0.5"])')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    handleDrop(e) {
        e.preventDefault();
        if (this.draggedTile) {
            this.saveTileOrder();
            if (window.sfx) sfx.success();
        }
    }

    toggleTileVisibility(tileId) {
        const tile = this.tiles.find(t => t.id === tileId);
        if (!tile) return;

        tile.visible = !tile.visible;
        tile.element.style.display = tile.visible ? '' : 'none';

        this.saveTileStates();
    }

    popOutTile(tile) {
        // Clone the tile content
        const tileClone = tile.element.cloneNode(true);

        // Create new window
        const popoutWindow = window.open('', tile.title, 'width=600,height=800,menubar=no,toolbar=no,location=no,status=no');

        if (!popoutWindow) {
            alert('Pop-up blocked! Please allow pop-ups for this site.');
            return;
        }

        // Write HTML to new window
        popoutWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${tile.title}</title>
                <link rel="stylesheet" href="style.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        background: #0a0e14;
                        font-family: 'Rajdhani', sans-serif;
                    }
                    .terminal-tile {
                        width: 100%;
                        height: calc(100vh - 40px);
                        max-width: none;
                    }
                    .tile-window-controls {
                        display: none !important;
                    }
                </style>
            </head>
            <body>
                ${tileClone.outerHTML}
                <script src="script.js"></script>
                <script src="terminal-chat.js"></script>
            </body>
            </html>
        `);
        popoutWindow.document.close();

        if (window.sfx) sfx.success();
    }

    saveTileOrder() {
        const tiles = document.querySelectorAll('.terminal-tile');
        const order = Array.from(tiles).map((el, index) => ({
            id: el.getAttribute('data-tile-id'),
            order: index
        }));
        localStorage.setItem('terminal_tile_order', JSON.stringify(order));
    }

    saveTileStates() {
        const states = this.tiles.map(tile => ({
            id: tile.id,
            visible: tile.visible
        }));
        localStorage.setItem('terminal_tile_states', JSON.stringify(states));
    }

    loadTileStates() {
        const saved = localStorage.getItem('terminal_tile_states');
        return saved ? JSON.parse(saved) : [];
    }

    restoreTileStates() {
        // Restore visibility states
        this.tileStates.forEach(savedState => {
            const tile = this.tiles.find(t => t.id === savedState.id);
            if (tile && savedState.visible === false) {
                tile.visible = false;
                tile.element.style.display = 'none';

                // Update toggle button
                const toggleBtn = document.querySelector(`[data-tile-id="${tile.id}"]`);
                if (toggleBtn) toggleBtn.style.opacity = '0.3';
            }
        });

        // Restore order
        const savedOrder = localStorage.getItem('terminal_tile_order');
        if (savedOrder) {
            const order = JSON.parse(savedOrder);
            const grid = document.querySelector('.terminal-grid');
            if (!grid) return;

            order.forEach(item => {
                const tile = this.tiles.find(t => t.id === item.id);
                if (tile) {
                    grid.appendChild(tile.element);
                }
            });
        }
    }
}

// Initialize on terminal page only
if (window.location.href.includes('terminal.html')) {
    const tileManager = new TerminalTileManager();
    window.tileManager = tileManager; // Make globally accessible
}
