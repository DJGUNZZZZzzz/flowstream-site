/* 
   ================================================
   PANEL SYSTEM - Data Storage & Management
   ================================================
   Handles CRUD operations for streamer panels
*/

console.log('📋 panel-system.js loading...');

class PanelSystem {
    constructor() {
        this.storageKey = 'streamer_panels';
        this.panels = this.loadPanels();
    }

    // Load panels from localStorage
    loadPanels() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse panels:', e);
                return this.getDefaultPanels();
            }
        }
        return this.getDefaultPanels();
    }

    // Save panels to localStorage
    savePanels() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.panels));
        console.log('✓ Panels saved');
    }

    // Get default panels
    getDefaultPanels() {
        return [
            {
                id: Date.now() + 1,
                title: 'ABOUT ME',
                image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200',
                imageLink: '',
                description: 'Welcome to my channel! I stream gaming content and coding tutorials.'
            },
            {
                id: Date.now() + 2,
                title: 'SCHEDULE',
                image: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=200',
                imageLink: '',
                description: 'Mon-Fri: 7PM EST | Sat-Sun: 2PM EST'
            },
            {
                id: Date.now() + 3,
                title: 'SOCIALS',
                image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
                imageLink: '',
                description: 'Twitter: @streamer | Discord: discord.gg/example'
            }
        ];
    }

    // Get all panels
    getPanels() {
        return this.panels;
    }

    // Get panel by ID
    getPanel(id) {
        return this.panels.find(p => p.id === id);
    }

    // Add new panel
    addPanel(panelData) {
        const newPanel = {
            id: Date.now(),
            title: panelData.title || 'New Panel',
            image: panelData.image || '',
            imageLink: panelData.imageLink || '',
            description: panelData.description || ''
        };

        this.panels.push(newPanel);
        this.savePanels();

        console.log('✓ Panel added:', newPanel.title);
        return newPanel;
    }

    // Update panel
    updatePanel(id, panelData) {
        const index = this.panels.findIndex(p => p.id === id);
        if (index === -1) {
            console.error('Panel not found:', id);
            return false;
        }

        this.panels[index] = {
            ...this.panels[index],
            ...panelData,
            id: id // Preserve ID
        };

        this.savePanels();
        console.log('✓ Panel updated:', this.panels[index].title);
        return true;
    }

    // Delete panel
    deletePanel(id) {
        const index = this.panels.findIndex(p => p.id === id);
        if (index === -1) {
            console.error('Panel not found:', id);
            return false;
        }

        const deleted = this.panels.splice(index, 1)[0];
        this.savePanels();

        console.log('✓ Panel deleted:', deleted.title);
        return true;
    }

    // Reorder panels
    reorderPanels(newOrder) {
        this.panels = newOrder;
        this.savePanels();
        console.log('✓ Panels reordered');
    }

    // Reset to defaults
    resetToDefaults() {
        this.panels = this.getDefaultPanels();
        this.savePanels();
        console.log('✓ Panels reset to defaults');
    }
}

// Create global instance
const panelSystem = new PanelSystem();
window.panelSystem = panelSystem;

console.log('✓ panel-system.js loaded');
console.log('📋 Loaded', panelSystem.getPanels().length, 'panels');
