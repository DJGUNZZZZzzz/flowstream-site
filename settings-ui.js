/* 
   ================================================
   SETTINGS UI - Save & Load Preferences
   ================================================
*/

console.log('⚙️ settings-ui.js loading...');

const settingsManager = {
    storageKey: 'netrunner_settings',

    getDefaults() {
        return {
            email: '',
            emailNotif: true,
            soundEffects: true,
            badgeNotif: true,
            profilePublic: true,
            showOnline: true,
            allowMessages: true,
            autoSave: true,
            showHints: true,
            difficulty: 'medium'
        };
    },

    load() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : this.getDefaults();
    },

    save(settings) {
        localStorage.setItem(this.storageKey, JSON.stringify(settings));
        console.log('✓ Settings saved');
    },

    reset() {
        const defaults = this.getDefaults();
        this.save(defaults);
        return defaults;
    }
};

function initSettings() {
    console.log('⚙️ Initializing settings UI...');

    // Load saved settings
    const settings = settingsManager.load();
    populateForm(settings);

    // Save button
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);

    // Reset button
    document.getElementById('reset-settings-btn').addEventListener('click', resetSettings);

    console.log('✓ Settings UI initialized');
}

function populateForm(settings) {
    document.getElementById('setting-email').value = settings.email || '';
    document.getElementById('setting-email-notif').checked = settings.emailNotif;
    document.getElementById('setting-sound-effects').checked = settings.soundEffects;
    document.getElementById('setting-badge-notif').checked = settings.badgeNotif;
    document.getElementById('setting-profile-public').checked = settings.profilePublic;
    document.getElementById('setting-show-online').checked = settings.showOnline;
    document.getElementById('setting-allow-messages').checked = settings.allowMessages;
    document.getElementById('setting-auto-save').checked = settings.autoSave;
    document.getElementById('setting-show-hints').checked = settings.showHints;
    document.getElementById('setting-difficulty').value = settings.difficulty;
}

function saveSettings() {
    const settings = {
        email: document.getElementById('setting-email').value,
        emailNotif: document.getElementById('setting-email-notif').checked,
        soundEffects: document.getElementById('setting-sound-effects').checked,
        badgeNotif: document.getElementById('setting-badge-notif').checked,
        profilePublic: document.getElementById('setting-profile-public').checked,
        showOnline: document.getElementById('setting-show-online').checked,
        allowMessages: document.getElementById('setting-allow-messages').checked,
        autoSave: document.getElementById('setting-auto-save').checked,
        showHints: document.getElementById('setting-show-hints').checked,
        difficulty: document.getElementById('setting-difficulty').value
    };

    settingsManager.save(settings);
    showConfirmation();

    if (window.sfx) window.sfx.success();
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        const defaults = settingsManager.reset();
        populateForm(defaults);
        showConfirmation();

        if (window.sfx) window.sfx.click();
    }
}

function showConfirmation() {
    const confirmation = document.getElementById('save-confirmation');
    confirmation.style.display = 'flex';

    setTimeout(() => {
        confirmation.style.display = 'none';
    }, 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings);
} else {
    initSettings();
}

console.log('✓ settings-ui.js loaded');
