/**
 * Ready Player Me Integration for FlowStream - FIXED VERSION
 * App ID: 6943171cdaf19bea757825bc
 * Subdomain: flow-streaming
 * 
 * This version properly handles the avatar export event
 */

const RPMIntegration = {
    // Configuration - NEW APPLICATION for fresh start
    config: {
        subdomain: 'flowstream-v2',
        appId: '69437c98daf19bea75789938'
    },

    // Track if listener is added
    listenerAdded: false,

    // Build Ready Player Me URL with proper parameters
    getEditorUrl: function () {
        // Using only OFFICIAL documented Ready Player Me parameters
        const baseUrl = `https://${this.config.subdomain}.readyplayer.me/avatar`;
        const params = new URLSearchParams({
            frameApi: 'true',      // Enable postMessage events (documented)
            bodyType: 'fullbody',  // Set body type (documented)
            clearCache: 'true',    // FORCE face selection every time - no session memory
            language: 'en'         // Set language (documented)
        });

        return `${baseUrl}?${params.toString()}`;
    },

    // Open avatar editor
    openEditor: function () {
        console.log('🎯 RPMIntegration.openEditor() started');

        const container = document.getElementById('rpm-container');
        const iframe = document.getElementById('rpm-iframe');
        const loading = document.getElementById('rpm-loading');

        console.log('Elements found:', {
            container: container !== null,
            iframe: iframe !== null,
            loading: loading !== null
        });

        if (!container || !iframe) {
            console.error('❌ Avatar editor elements not found');
            return;
        }

        // Show container
        container.classList.add('active');
        console.log('✅ Container activated');

        // Load iframe
        const editorUrl = this.getEditorUrl();
        console.log('📍 Editor URL:', editorUrl);

        iframe.src = editorUrl;
        console.log('✅ Iframe src set to:', iframe.src);

        // Hide loading when iframe loads
        iframe.onload = function () {
            console.log('✅ Iframe loaded');
            if (loading) loading.style.display = 'none';
            iframe.style.display = 'block';
        };

        // Setup message listener (only once)
        if (!this.listenerAdded) {
            this.setupMessageListener();
            this.listenerAdded = true;
            console.log('✅ Message listener setup');
        }

        console.log('🎯 RPMIntegration.openEditor() completed');
    },

    // Close avatar editor
    closeEditor: function () {
        const container = document.getElementById('rpm-container');
        const iframe = document.getElementById('rpm-iframe');

        if (container) container.classList.remove('active');
        if (iframe) iframe.src = '';
    },

    // Listen for avatar creation
    setupMessageListener: function () {
        window.addEventListener('message', (event) => {
            const json = this.parseMessage(event);


            if (json?.source !== 'readyplayerme') {
                return;
            }

            console.log('🎯 Ready Player Me Event:', json.eventName, json);

            // Handle different events
            switch (json.eventName) {
                case 'v1.avatar.exported':
                    console.log('✅ Avatar exported:', json.data.url);
                    this.handleAvatarExported(json.data.url);
                    break;

                case 'v1.avatar.created':
                    // This fires BEFORE account signup prompt
                    console.log('🎨 Avatar created (before signup):', json.data);
                    if (json.data.id) {
                        const avatarUrl = `https://models.readyplayer.me/${json.data.id}.glb`;
                        console.log('💾 Saving avatar from created event:', avatarUrl);
                        this.handleAvatarExported(avatarUrl);
                    }
                    break;

                case 'v1.user.set':
                    console.log('👤 User set with ID:', json.data.id);
                    // When user selects existing avatar, fetch it
                    if (json.data.id) {
                        this.fetchUserAvatar(json.data.id);
                    }
                    break;

                case 'v1.frame.ready':
                    console.log('✅ Ready Player Me frame ready');
                    break;

                default:
                    // Log all other events for debugging
                    console.log('📋 Unhandled RPM event:', json.eventName, json.data);
                    break;
            }
        });
    },

    // Fetch user's selected avatar
    fetchUserAvatar: function (userId) {
        console.log('🔍 Fetching avatar for user:', userId);
        // The avatar URL format for Ready Player Me
        const avatarUrl = `https://models.readyplayer.me/${userId}.glb`;
        console.log('📥 Avatar URL:', avatarUrl);

        // Save and display the avatar
        setTimeout(() => {
            this.handleAvatarExported(avatarUrl);
        }, 500); // Small delay to ensure avatar is ready
    },

    // Parse postMessage
    parseMessage: function (event) {
        try {
            return JSON.parse(event.data);
        } catch (error) {
            return null;
        }
    },

    // Handle avatar creation complete
    handleAvatarExported: function (avatarUrl) {
        console.log('💾 Saving avatar:', avatarUrl);

        // Save avatar to FlowStream
        this.saveAvatar(avatarUrl);

        // Close editor
        this.closeEditor();

        // Show success message
        this.showSuccessMessage();
    },

    // Save avatar to FlowStream system
    saveAvatar: function (avatarUrl) {
        const userId = this.getCurrentUserId();

        // Save to localStorage
        localStorage.setItem(`avatar_${userId}`, avatarUrl);
        console.log('✅ Avatar saved to localStorage');

        // Update all avatar displays
        this.updateAvatarDisplays(avatarUrl);
    },

    // Update avatar everywhere on page
    updateAvatarDisplays: function (avatarUrl) {
        const thumbnail = this.getAvatarThumbnail(avatarUrl);

        // Update profile avatar
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            profileAvatar.src = thumbnail;
            console.log('✅ Profile avatar updated');
        }

        // Update sidebar avatar
        const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
        if (sidebarAvatar) {
            sidebarAvatar.src = thumbnail;
            console.log('✅ Sidebar avatar updated');
        }

        // Update chat avatars (if on channel page)
        this.updateChatAvatars(thumbnail);
    },

    // Get avatar thumbnail (2D image from 3D model)
    getAvatarThumbnail: function (avatarUrl) {
        // Ready Player Me provides .png renders
        // Replace .glb with .png for 2D thumbnail
        return avatarUrl.replace('.glb', '.png');
    },

    // Get current user ID
    getCurrentUserId: function () {
        // Use your existing user system
        return localStorage.getItem('currentUser') || 'guest';
    },

    // Show success message
    showSuccessMessage: function () {
        alert('✅ Avatar created successfully!');
    },

    // Update chat avatars
    updateChatAvatars: function (thumbnailUrl) {
        const chatAvatars = document.querySelectorAll('.chat-user-avatar');

        chatAvatars.forEach(avatar => {
            avatar.src = thumbnailUrl;
        });
    },

    // Load user's existing avatar
    loadAvatar: function (userId) {
        const avatarUrl = localStorage.getItem(`avatar_${userId}`);

        if (avatarUrl) {
            this.updateAvatarDisplays(avatarUrl);
            console.log('✅ Loaded existing avatar');
            return avatarUrl;
        }

        return null;
    }
};

// Global functions for HTML onclick
function openAvatarEditor() {
    console.log('🚀 openAvatarEditor() called');
    console.log('RPMIntegration exists:', typeof RPMIntegration !== 'undefined');
    RPMIntegration.openEditor();
    console.log('✅ RPMIntegration.openEditor() executed');
}

function closeAvatarEditor() {
    RPMIntegration.closeEditor();
}

function clearAvatar() {
    if (confirm('Are you sure you want to remove your avatar from FlowStream?\n\nNote: This only removes it from FlowStream. Your avatar will still exist in Ready Player Me.')) {
        const userId = RPMIntegration.getCurrentUserId();
        localStorage.removeItem(`avatar_${userId}`);

        // Reset to default image
        const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23000' width='200' height='200'/%3E%3Cpath fill='%2300ffff' d='M100 50c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 120c-33.1 0-60-26.9-60-60h120c0 33.1-26.9 60-60 60z'/%3E%3Ctext x='100' y='190' text-anchor='middle' fill='%2300ffff' font-family='Orbitron' font-size='12'%3ENo Avatar%3C/text%3E%3C/svg%3E";

        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) profileAvatar.src = defaultAvatar;

        const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
        if (sidebarAvatar) sidebarAvatar.src = defaultAvatar;

        alert('✅ Avatar cleared from FlowStream!');
    }
}

function toggleAvatarHelp() {
    const helpBox = document.getElementById('avatarHelpBox');
    if (helpBox) {
        helpBox.style.display = helpBox.style.display === 'none' ? 'block' : 'none';
    }
}

// Load avatar on page load
document.addEventListener('DOMContentLoaded', function () {
    const userId = RPMIntegration.getCurrentUserId();
    RPMIntegration.loadAvatar(userId);
});

console.log('✓ Ready Player Me Integration Loaded (FlowStream - Fixed Version)');
