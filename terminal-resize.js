/*
   ================================================
   TERMINAL TILE RESIZE FUNCTIONALITY
   ================================================
   Adds resize handles to tiles for height adjustment
   FIXED: Isolated resize to individual tiles only
*/

(function () {
    'use strict';

    // Wait for tile manager to initialize first
    setTimeout(initTileResize, 1000);

    function initTileResize() {
        const tiles = document.querySelectorAll('.terminal-tile');

        tiles.forEach(tile => {
            addResizeHandle(tile);
        });

        console.log('✓ Tile Resize Functionality Initialized');
    }

    function addResizeHandle(tile) {
        // Create resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'tile-resize-handle';
        resizeHandle.innerHTML = '<i class="fa-solid fa-arrows-up-down"></i>';
        resizeHandle.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 20px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 10px 10px 0 0;
            cursor: ns-resize;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0ff;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s, background 0.3s;
            z-index: 10;
            pointer-events: auto;
        `;

        // Make tile position relative if not already
        if (getComputedStyle(tile).position === 'static') {
            tile.style.position = 'relative';
        }

        tile.appendChild(resizeHandle);

        // Show handle ONLY on this specific tile hover
        tile.addEventListener('mouseenter', function () {
            resizeHandle.style.opacity = '1';
        });

        tile.addEventListener('mouseleave', function () {
            if (!resizeHandle.classList.contains('resizing')) {
                resizeHandle.style.opacity = '0';
            }
        });

        // Resize functionality - ISOLATED to this tile only
        let startY, startHeight, isResizing = false;

        resizeHandle.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Prevent drag-and-drop from interfering
            tile.setAttribute('draggable', 'false');

            isResizing = true;
            resizeHandle.classList.add('resizing');
            resizeHandle.style.background = 'rgba(0, 255, 255, 0.3)';
            resizeHandle.style.opacity = '1';

            startY = e.clientY;
            startHeight = tile.offsetHeight;

            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);

            if (window.sfx) sfx.click();
        });

        function handleResize(e) {
            if (!isResizing) return;

            const deltaY = e.clientY - startY;
            const newHeight = Math.max(200, startHeight + deltaY); // Minimum 200px

            // Apply height ONLY to this specific tile
            tile.style.height = newHeight + 'px';
            tile.style.minHeight = newHeight + 'px';
        }

        function stopResize() {
            isResizing = false;
            resizeHandle.classList.remove('resizing');
            resizeHandle.style.background = 'rgba(0, 255, 255, 0.1)';
            resizeHandle.style.opacity = '0';

            // Re-enable dragging
            tile.setAttribute('draggable', 'false'); // Keep false until drag handle is clicked

            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);

            if (window.sfx) sfx.success();
        }
    }

    // Enhance drag-and-drop with visual feedback
    enhanceDragFeedback();

    function enhanceDragFeedback() {
        const grid = document.querySelector('.terminal-grid');
        if (!grid) return;

        // Add drop zone indicators
        grid.addEventListener('dragover', (e) => {
            e.preventDefault();

            // Find closest tile
            const afterElement = getDragAfterElement(grid, e.clientY);
            const draggable = document.querySelector('.terminal-tile[draggable="true"]');

            if (afterElement == null) {
                // Highlight bottom of grid
                grid.style.borderBottom = '3px solid #0ff';
            } else {
                // Highlight position before element
                grid.style.borderBottom = 'none';
                const allTiles = [...grid.querySelectorAll('.terminal-tile')];
                allTiles.forEach(tile => {
                    tile.style.borderTop = 'none';
                });
                afterElement.style.borderTop = '3px solid #0ff';
            }
        });

        grid.addEventListener('dragleave', () => {
            grid.style.borderBottom = 'none';
            const allTiles = [...grid.querySelectorAll('.terminal-tile')];
            allTiles.forEach(tile => {
                tile.style.borderTop = 'none';
            });
        });

        grid.addEventListener('drop', () => {
            grid.style.borderBottom = 'none';
            const allTiles = [...grid.querySelectorAll('.terminal-tile')];
            allTiles.forEach(tile => {
                tile.style.borderTop = 'none';
            });
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.terminal-tile:not([style*="opacity: 0.5"])')];

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
})();
