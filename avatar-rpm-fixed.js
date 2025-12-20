/**
 * Ready Player Me Avatar Integration - WITH WORKAROUNDS
 * Implements all documented fixes from forums
 */

// Configuration
const subdomain = 'demo';

/**
 * Build RPM URL with proper parameters
 */
function buildRPMUrl() {
    // Let RPM handle loading the previous avatar with clearCache=false
    // This is more reliable than trying to pass the ID
    let url = `https://${subdomain}.readyplayer.me?frameApi`;
    url += '&quickStart=true';           // Show avatar selection
    url += '&selectBodyType=true';       // Allow body type selection
    url += '&bodyType=fullbody';         // Default body type
    url += '&clearCache=false';          // Load previous avatar automatically

    return url;
}

const frame = document.getElementById('rpm-frame');

/**
 * Parse message event data
 */
function parse(event) {
    try {
        return typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch (error) {
        return null;
    }
}

/**
 * Save avatar
 */
function saveAvatar(avatarUrl) {
    console.log('💾 Saving avatar:', avatarUrl);

    // Use centralized AvatarManager if available
    if (window.avatarManager) {
        avatarManager.setAvatar(avatarUrl, 'rpm');
    } else {
        // Fallback for safety
        localStorage.setItem('userAvatar', avatarUrl);
    }

    closeAvatarEditor();
    alert('✅ Avatar saved successfully!');
}

/**
 * WORKAROUND: Robust event handling
 * Checks multiple patterns based on forum findings
 */
window.addEventListener('message', (event) => {
    if (!event.data) return;

    // WORKAROUND #1: Check if data is directly a URL string
    // Forum: "Checking for URL instead of eventName worked!"
    if (typeof event.data === 'string' &&
        event.data.startsWith('https://models.readyplayer.me')) {
        console.log('✅ Avatar URL detected (direct string):', event.data);
        saveAvatar(event.data);
        return;
    }

    // Parse JSON
    const json = parse(event);
    if (!json) return;

    // Check source
    if (json.source !== 'readyplayerme') return;

    // Log ALL events for debugging
    console.log('📨 RPM Event:', json.eventName, json);

    // WORKAROUND #2: Check multiple event patterns
    // Extract avatar URL from various formats
    let avatarUrl = null;

    if (json.eventName === 'v1.avatar.exported') {
        avatarUrl = json.data?.url || json.data;
    } else if (json.eventName === 'v2.avatar.exported') {
        avatarUrl = json.data?.url || json.data;
    } else if (json.eventName === 'v1.user.set') {
        avatarUrl = json.data?.url || json.data;
    }

    // WORKAROUND #3: Direct data check
    // Sometimes data is directly the URL
    if (!avatarUrl && typeof json.data === 'string' &&
        json.data.startsWith('https://')) {
        avatarUrl = json.data;
    }

    // Save if we found a valid avatar URL
    if (avatarUrl && avatarUrl.includes('models.readyplayer.me')) {
        console.log('✅ Avatar URL found:', avatarUrl);
        saveAvatar(avatarUrl);
    }
});

/**
 * Update avatar display
 */
function updateAvatarDisplay(thumbnailUrl) {
    // NOTE: We do NOT show profileAvatar here because avatar-viverse.js manages the 3D avatar.
    // The static image should remain hidden when 3D is active.
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.src = thumbnailUrl;
        // Do NOT set display:block - let avatar-viverse.js control visibility
        console.log('✅ Profile avatar src updated (visibility managed by 3D system)');
    }

    const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
    if (sidebarAvatar) {
        sidebarAvatar.src = thumbnailUrl;
        console.log('✅ Sidebar avatar updated');
    }
}

/**
 * Open avatar editor
 */
function openAvatarEditor() {
    const rpmUrl = buildRPMUrl();
    frame.src = rpmUrl;
    frame.style.display = 'block';

    const closeBtn = document.getElementById('rpm-close-btn');
    if (closeBtn) closeBtn.style.display = 'block';

    console.log('🎨 Opening RPM with URL:', rpmUrl);
}

/**
 * Close avatar editor
 */
function closeAvatarEditor() {
    frame.style.display = 'none';
    frame.src = '';

    const closeBtn = document.getElementById('rpm-close-btn');
    if (closeBtn) closeBtn.style.display = 'none';
}

/**
 * Clear avatar
 */
function clearAvatar() {
    if (confirm('Clear your avatar?')) {
        localStorage.removeItem('userAvatar');

        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            profileAvatar.style.display = 'none';
        }

        const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
        if (sidebarAvatar) {
            sidebarAvatar.style.display = 'none';
        }

        console.log('🗑️ Avatar cleared');
    }
}

// Load saved avatar on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        const thumbnail = savedAvatar.replace('.glb', '.png');
        updateAvatarDisplay(thumbnail);
        console.log('📦 Loaded saved avatar');
    }
});

console.log('✓ RPM Avatar Integration Loaded (WITH WORKAROUNDS)');
