/* 
   ================================================
   PROFILE SYNC - Auto-update level from Points System
   ================================================
   Syncs profile page with points system data
*/

console.log('📊 profile-sync.js loading...');

// Wait for DOM and points system to be ready
function initProfileSync() {
    console.log('📊 Initializing profile sync...');

    if (!window.pointsSystem) {
        console.warn('⚠️ Points system not found, retrying in 500ms...');
        setTimeout(initProfileSync, 500);
        return;
    }

    // Get stats from points system
    const stats = window.pointsSystem.getStats();
    console.log('📊 Got stats from points system:', stats);

    // Update level field
    const levelInput = document.getElementById('reg-level');
    if (levelInput) {
        levelInput.value = `Level ${stats.level}: ${stats.levelName}`;
        console.log(`✓ Level field updated: ${levelInput.value}`);
    }

    // Update achievement tracker
    updateAchievementTracker(stats);
}

function updateAchievementTracker(stats) {
    console.log('🏆 Updating achievement tracker...');

    const achievementContent = document.getElementById('achievement-content');
    if (!achievementContent) {
        console.warn('⚠️ Achievement content element not found');
        return;
    }

    // Get achievements
    const achievements = stats.achievements || [];
    console.log(`📊 Found ${achievements.length} achievements`);

    // Create achievement display
    if (achievements.length === 0) {
        achievementContent.innerHTML = `
            <div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.5);">
                <i class="fa-solid fa-trophy" style="font-size: 48px; margin-bottom: 10px; opacity: 0.3;"></i>
                <p>No achievements unlocked yet.</p>
                <p style="font-size: 12px;">Complete lessons to earn achievements!</p>
            </div>
        `;
    } else {
        achievementContent.innerHTML = achievements.map(ach => `
            <div style="
                padding: 15px;
                margin-bottom: 10px;
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 5px;
            ">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 32px;">${ach.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: #00ff88; margin-bottom: 5px;">
                            ${ach.name}
                        </div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7);">
                            ${ach.description}
                        </div>
                        <div style="font-size: 11px; color: rgba(0,255,136,0.8); margin-top: 5px;">
                            +${ach.points} points
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    console.log('✓ Achievement tracker updated');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileSync);
} else {
    initProfileSync();
}

console.log('✓ profile-sync.js loaded');
