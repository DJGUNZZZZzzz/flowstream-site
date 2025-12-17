/* 
   ================================================
   LEADERBOARD UI - Global & Weekly Rankings
   ================================================
   Displays top users by points with cyberpunk styling
*/

class LeaderboardUI {
    constructor() {
        this.storageKey = 'netrunner_leaderboard';
        this.init();
    }

    init() {
        // Don't create modal immediately - wait for DOM
        console.log('📋 LeaderboardUI init() called, document.body exists:', !!document.body);
    }

    createModal() {
        console.log('📋 Creating leaderboard modal...');
        const modal = document.createElement('div');
        modal.id = 'leaderboard-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content leaderboard-content">
                <div class="modal-header">
                    <h2>🏆 LEADERBOARD</h2>
                    <button class="close-btn" onclick="window.leaderboardUI.close()">&times;</button>
                </div>
                <div class="leaderboard-tabs">
                    <button class="tab-btn active" data-tab="global">GLOBAL</button>
                    <button class="tab-btn" data-tab="weekly">WEEKLY</button>
                </div>
                <div id="leaderboard-content" class="leaderboard-list"></div>
            </div>
        `;
        document.body.appendChild(modal);
        console.log('✓ Leaderboard modal created and appended to body');

        // Add tab click handlers
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.showTab(e.target.dataset.tab);
            });
        });
    }

    open() {
        console.log('🏆 open() called');
        let modal = document.getElementById('leaderboard-modal');
        console.log('  → Modal element:', modal);

        // Create modal if it doesn't exist
        if (!modal) {
            console.log('  → Modal not found, creating it now...');
            this.createModal();
            modal = document.getElementById('leaderboard-modal');
            console.log('  → Modal after creation:', modal);
        }

        if (modal) {
            console.log('  → Adding active class to modal');
            modal.classList.add('active');

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            this.showTab('global');
            if (window.sfx) window.sfx.click();
        } else {
            console.error('❌ Failed to create or find leaderboard modal!');
        }
    }

    close() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) {
            modal.classList.remove('active');

            // Restore body scroll
            document.body.style.overflow = '';

            if (window.sfx) window.sfx.click();
        }
    }

    showTab(tab) {
        const rankings = tab === 'global' ? this.getGlobalRankings() : this.getWeeklyRankings();
        this.displayRankings(rankings);
    }

    getGlobalRankings() {
        // Get all users from localStorage (for now, just current user)
        const currentUser = this.getCurrentUserData();

        // In a real app, this would fetch from a backend
        // For now, we'll create mock data + current user
        const mockUsers = this.generateMockUsers(9);
        const allUsers = [currentUser, ...mockUsers];

        // Sort by points descending
        return allUsers.sort((a, b) => b.points - a.points).slice(0, 10);
    }

    getWeeklyRankings() {
        // Similar to global but filtered by week
        // For now, same as global (would track weekly points in real app)
        return this.getGlobalRankings();
    }

    getCurrentUserData() {
        const stats = window.pointsSystem ? window.pointsSystem.getStats() : {
            points: 0,
            level: 1,
            levelName: 'Newbie'
        };

        // Get username from localStorage or use default
        const username = localStorage.getItem('netrunner_username') || 'You';

        return {
            username: username,
            points: stats.points,
            level: stats.level,
            levelName: stats.levelName,
            isCurrentUser: true
        };
    }

    generateMockUsers(count) {
        const names = [
            'CyberNinja', 'CodeMaster', 'ByteWarrior', 'DataPhantom',
            'NetGhost', 'PixelHunter', 'ScriptKid', 'BugSlayer',
            'AlgoWizard', 'SyntaxSamurai', 'LogicLord', 'MemoryLeaker'
        ];

        const levels = ['Newbie', 'Cadet', 'Hacker', 'Elite', 'Netrunner'];

        return Array.from({ length: count }, (_, i) => ({
            username: names[i] || `User${i + 1}`,
            points: Math.floor(Math.random() * 5000) + 500,
            level: Math.floor(Math.random() * 5) + 1,
            levelName: levels[Math.floor(Math.random() * 5)],
            isCurrentUser: false
        }));
    }

    displayRankings(rankings) {
        const container = document.getElementById('leaderboard-content');
        if (!container) return;

        container.innerHTML = rankings.map((user, index) => `
            <div class="leaderboard-entry ${user.isCurrentUser ? 'current-user' : ''}">
                <div class="rank">#${index + 1}</div>
                <div class="user-info">
                    <div class="username">${user.username}${user.isCurrentUser ? ' (You)' : ''}</div>
                    <div class="user-level">Level ${user.level}: ${user.levelName}</div>
                </div>
                <div class="user-points">${user.points.toLocaleString()} pts</div>
            </div>
        `).join('');
    }

    updateRankings() {
        // Called when user earns points
        if (document.getElementById('leaderboard-modal')?.classList.contains('active')) {
            const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'global';
            this.showTab(activeTab);
        }
    }
}

// Create global instance
console.log('🏆 Creating LeaderboardUI instance...');
const leaderboardUI = new LeaderboardUI();
window.leaderboardUI = leaderboardUI;
console.log('✓ leaderboardUI created and assigned to window');

// Add click handler for leaderboard button
function attachLeaderboardHandler() {
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            console.log('🏆 Leaderboard button clicked');
            leaderboardUI.open();
        });
        console.log('✓ Leaderboard button click handler attached');
    } else {
        console.warn('⚠️ Leaderboard button not found in DOM');
    }
}

// Try to attach immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachLeaderboardHandler);
} else {
    // DOM already loaded
    attachLeaderboardHandler();
}

// Add CSS for leaderboard
const leaderboardStyle = document.createElement('style');
leaderboardStyle.textContent = `
    /* Base Modal Styles */
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
    }

    .modal.active {
        display: flex !important;
    }

    .modal-content {
        background: rgba(10, 20, 30, 0.95);
        border: 2px solid #00ff88;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 0 50px rgba(0, 255, 136, 0.5);
        animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid rgba(0, 255, 136, 0.3);
        padding-bottom: 15px;
    }

    .modal-header h2 {
        margin: 0;
        color: #00ff88;
        font-family: 'Orbitron', sans-serif;
        font-size: 24px;
    }

    .close-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 32px;
        cursor: pointer;
        transition: all 0.3s;
        line-height: 1;
        padding: 0;
        width: 32px;
        height: 32px;
    }

    .close-btn:hover {
        color: #ff0055;
        transform: rotate(90deg);
    }

    /* Leaderboard Specific Styles */
    .leaderboard-content {
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .leaderboard-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        border-bottom: 2px solid rgba(0, 255, 136, 0.3);
    }

    .tab-btn {
        flex: 1;
        padding: 12px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        font-family: 'Courier New', monospace;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        border-bottom: 3px solid transparent;
    }

    .tab-btn:hover {
        color: #00ff88;
    }

    .tab-btn.active {
        color: #00ff88;
        border-bottom-color: #00ff88;
    }

    .leaderboard-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .leaderboard-entry {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: rgba(0, 255, 136, 0.05);
        border: 1px solid rgba(0, 255, 136, 0.2);
        border-radius: 8px;
        transition: all 0.3s;
    }

    .leaderboard-entry:hover {
        background: rgba(0, 255, 136, 0.1);
        border-color: rgba(0, 255, 136, 0.4);
        transform: translateX(5px);
    }

    .leaderboard-entry.current-user {
        background: rgba(0, 255, 136, 0.15);
        border: 2px solid #00ff88;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    }

    .rank {
        font-size: 24px;
        font-weight: bold;
        color: #00ff88;
        min-width: 50px;
        text-align: center;
    }

    .user-info {
        flex: 1;
    }

    .username {
        font-size: 16px;
        font-weight: bold;
        color: #fff;
        margin-bottom: 4px;
    }

    .user-level {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
    }

    .user-points {
        font-size: 18px;
        font-weight: bold;
        color: #00ff88;
        text-align: right;
        min-width: 120px;
    }
`;
document.head.appendChild(leaderboardStyle);
