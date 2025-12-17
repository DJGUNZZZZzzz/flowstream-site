/* 
   ================================================
   PANEL DISPLAY UI - Renders panels on channel page
   ================================================
   Shows panels below profile section
*/

console.log('🎨 panel-display-ui.js loading...');

class PanelDisplayUI {
    constructor() {
        this.container = null;
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
        // Find or create container
        this.container = document.getElementById('panels-display');

        if (!this.container) {
            console.warn('⚠️ Panels display container not found');
            return;
        }

        this.render();
        console.log('✓ Panel display UI initialized');
    }

    render() {
        if (!this.container || !window.panelSystem) return;

        const panels = window.panelSystem.getPanels();

        if (panels.length === 0) {
            this.container.innerHTML = '<p class="no-panels">No panels configured</p>';
            return;
        }

        this.container.innerHTML = panels.map(panel => this.createPanelHTML(panel)).join('');
    }

    createPanelHTML(panel) {
        const hasLink = panel.imageLink && panel.imageLink.trim() !== '';
        const imageHTML = hasLink ?
            `<a href="${panel.imageLink}" target="_blank" rel="noopener noreferrer">
                <img src="${panel.image}" alt="${panel.title}">
            </a>` :
            `<img src="${panel.image}" alt="${panel.title}">`;

        return `
            <div class="panel-item" data-panel-id="${panel.id}">
                <h3 class="panel-title">${panel.title}</h3>
                <div class="panel-image">
                    ${imageHTML}
                </div>
                ${panel.description ? `<p class="panel-description">${panel.description}</p>` : ''}
            </div>
        `;
    }

    refresh() {
        this.render();
    }
}

// Create global instance
let panelDisplayUI;

function initPanelDisplay() {
    if (!window.panelSystem) {
        console.warn('⚠️ Panel system not loaded, retrying...');
        setTimeout(initPanelDisplay, 100);
        return;
    }

    panelDisplayUI = new PanelDisplayUI();
    window.panelDisplayUI = panelDisplayUI;
}

initPanelDisplay();

console.log('✓ panel-display-ui.js loaded');
