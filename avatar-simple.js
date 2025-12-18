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

    console.log('RPM Event:', json.eventName);

    if (json.eventName === 'v1.avatar.exported') {
        const avatarUrl = json.data.url;
        console.log('✅ Avatar exported:', avatarUrl);

        // Save avatar
        localStorage.setItem('userAvatar', avatarUrl);

        // Update display
        const thumbnail = avatarUrl.replace('.glb', '.png');
        updateAvatarDisplay(thumbnail);

        // Close frame
        closeAvatarEditor();

        alert('✅ Avatar created successfully!');
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
    frame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi=true&bodyType=fullbody&clearCache=true&selectBodyType=true`;
    frame.style.display = 'block';
}

function closeAvatarEditor() {
    frame.style.display = 'none';
    frame.src = '';
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
