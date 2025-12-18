/**
 * Ready Player Me - Simple Integration
 * Minimal, clean implementation using official approach
 */

const subdomain = 'flow-streaming';
const frame = document.getElementById('rpm-frame');

// Listen for avatar export
window.addEventListener('message', (event) => {
    const json = parse(event);

    if (json?.source !== 'readyplayerme') return;

    // Log EVERY event with full data
    console.log('🎯 RPM Event Received:', json.eventName);
    console.log('📦 Full Event Data:', json);

    // Try to save on ANY event that has avatar data
    if (json.eventName === 'v1.avatar.exported' ||
        json.eventName === 'v2.avatar.exported' ||
        json.eventName === 'v1.user.set' ||
        json.eventName === 'v1.user.authorized') {

        console.log('💾 Attempting to save avatar from event:', json.eventName);

        let avatarUrl = null;

        // Try to extract avatar URL from different event structures
        if (json.data?.url) {
            avatarUrl = json.data.url;
        } else if (json.data?.id) {
            avatarUrl = `https://models.readyplayer.me/${json.data.id}.glb`;
        } else if (json.data?.avatarId) {
            avatarUrl = `https://models.readyplayer.me/${json.data.avatarId}.glb`;
        }

        if (avatarUrl) {
            console.log('✅ Avatar URL found:', avatarUrl);

            // Save avatar
            localStorage.setItem('userAvatar', avatarUrl);
            console.log('💾 Saved to localStorage');

            // Update display
            const thumbnail = avatarUrl.replace('.glb', '.png');
            updateAvatarDisplay(thumbnail);
            console.log('🖼️ Updated display with thumbnail:', thumbnail);

            // Close frame
            closeAvatarEditor();

            alert('✅ Avatar saved successfully!');
        } else {
            console.warn('⚠️ Event received but no avatar URL found');
        }
    }
});

function parse(event) {
    try {
        return JSON.parse(event.data);
    } catch (error) {
        return null;
    }
}

function openAvatarEditor() {
    // Use the simple URL that was working - just frameApi parameter
    frame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
    frame.style.display = 'block';

    // Show close button
    const closeBtn = document.getElementById('rpm-close-btn');
    if (closeBtn) closeBtn.style.display = 'block';
}

function closeAvatarEditor() {
    frame.style.display = 'none';
    frame.src = '';

    // Hide close button
    const closeBtn = document.getElementById('rpm-close-btn');
    if (closeBtn) closeBtn.style.display = 'none';
}

function updateAvatarDisplay(thumbnailUrl) {
    // Update profile avatar
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.src = thumbnailUrl;
    }

    // Update sidebar avatar
    const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
    if (sidebarAvatar) {
        sidebarAvatar.src = thumbnailUrl;
    }
}

// Load saved avatar on page load
document.addEventListener('DOMContentLoaded', function () {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        const thumbnail = savedAvatar.replace('.glb', '.png');
        updateAvatarDisplay(thumbnail);
    }
});

console.log('✓ Ready Player Me Simple Integration Loaded');
