/* 
   ================================================
   CHANNEL PROFILE DISPLAY
   ================================================
   Displays profile from profile.html on channel page
*/

console.log('👤 channel-profile-display.js loading...');

function initProfileDisplay() {
    const profileSection = document.getElementById('profile-display-section');
    if (!profileSection) {
        console.warn('⚠️ Profile display section not found');
        return;
    }

    // Mock data for SkateGamer_OG
    const profileData = {
        username: 'SkateGamer_OG',
        level: '47',
        bio: 'Professional gamer and content creator. Streaming competitive gameplay, tutorials, and chill sessions. Let\'s get this W! 🎮',
        avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop',
        color: '#00ff88',
        socials: {
            x: 'https://twitter.com/skategamer',
            insta: 'https://instagram.com/skategamer_og',
            tiktok: 'https://tiktok.com/@skategamer',
            yt: 'https://youtube.com/@skategamer',
            discord: 'https://discord.gg/skategamer'
        }
    };

    // Create compact profile card HTML matching profile.html design
    const profileCardHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Rajdhani', sans-serif;
            background: transparent;
            color: #fff;
            padding: 0;
            overflow: hidden;
        }
        .profile-card {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid ${profileData.color};
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 0 20px ${profileData.color}50;
            display: flex;
            gap: 20px;
            align-items: center;
        }
        .profile-left {
            display: flex;
            align-items: center;
            gap: 20px;
            flex: 1;
        }
        .profile-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid ${profileData.color};
            box-shadow: 0 0 15px ${profileData.color}70;
            flex-shrink: 0;
        }
        .profile-info {
            flex: 1;
        }
        .profile-info h1 {
            font-family: 'Orbitron', sans-serif;
            color: ${profileData.color};
            font-size: 22px;
            margin-bottom: 5px;
            text-shadow: 0 0 10px ${profileData.color}80;
        }
        .profile-level {
            color: #aaa;
            font-size: 12px;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        .profile-bio {
            color: #ccc;
            line-height: 1.6;
            font-size: 14px;
        }
        .profile-socials {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex-shrink: 0;
        }
        .social-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 15px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid ${profileData.color}50;
            border-radius: 20px;
            color: ${profileData.color};
            text-decoration: none;
            font-size: 13px;
            transition: all 0.3s ease;
            white-space: nowrap;
        }
        .social-link:hover {
            background: ${profileData.color}20;
            border-color: ${profileData.color};
            box-shadow: 0 0 10px ${profileData.color}50;
            transform: translateX(5px);
        }
        .social-link i {
            font-size: 16px;
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="profile-card">
        <div class="profile-left">
            <img src="${profileData.avatar}" alt="${profileData.username}" class="profile-avatar">
            <div class="profile-info">
                <h1>${profileData.username}</h1>
                <div class="profile-level">LEVEL ${profileData.level} • VERIFIED STREAMER</div>
                <div class="profile-bio">${profileData.bio}</div>
            </div>
        </div>
        <div class="profile-socials">
            <a href="${profileData.socials.x}" target="_blank" class="social-link">
                <i class="fa-brands fa-x-twitter"></i> Twitter
            </a>
            <a href="${profileData.socials.insta}" target="_blank" class="social-link">
                <i class="fa-brands fa-instagram"></i> Instagram
            </a>
            <a href="${profileData.socials.tiktok}" target="_blank" class="social-link">
                <i class="fa-brands fa-tiktok"></i> TikTok
            </a>
            <a href="${profileData.socials.yt}" target="_blank" class="social-link">
                <i class="fa-brands fa-youtube"></i> YouTube
            </a>
            <a href="${profileData.socials.discord}" target="_blank" class="social-link">
                <i class="fa-brands fa-discord"></i> Discord
            </a>
        </div>
    </div>
</body>
</html>
    `;

    // Create iframe to display profile card
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: 100%;
        height: 250px;
        border: 2px solid #0ff;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.8);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    `;
    iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox';

    profileSection.innerHTML = '';
    profileSection.appendChild(iframe);

    // Write profile card HTML to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(profileCardHTML);
    iframeDoc.close();

    console.log('✓ Profile card display initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileDisplay);
} else {
    initProfileDisplay();
}

// Setup panel edit button
function setupPanelEditButton() {
    const editBtn = document.getElementById('panels-edit-btn');
    if (editBtn && window.panelEditorUI) {
        editBtn.addEventListener('click', () => {
            window.panelEditorUI.open();
            if (window.sfx) window.sfx.click();
        });
    }
}

// Initialize panel edit button
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPanelEditButton);
} else {
    setTimeout(setupPanelEditButton, 500); // Wait for panel UI to load
}

console.log('✓ channel-profile-display.js loaded');
