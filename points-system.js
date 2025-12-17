/* 
   ================================================
   POINTS SYSTEM - Levels, Achievements & Progress
   ================================================
   Tracks user progression through learning challenges
*/

class PointsSystem {
    constructor() {
        this.storageKey = 'netrunner_points_data';
        this.levels = [
            { level: 1, name: 'Newbie', minPoints: 0, maxPoints: 500, color: '#888' },
            { level: 2, name: 'Cadet', minPoints: 500, maxPoints: 1500, color: '#4a9eff' },
            { level: 3, name: 'Hacker', minPoints: 1500, maxPoints: 3000, color: '#00ff88' },
            { level: 4, name: 'Elite', minPoints: 3000, maxPoints: 5000, color: '#ff00ff' },
            { level: 5, name: 'Netrunner', minPoints: 5000, maxPoints: Infinity, color: '#ffd700' }
        ];

        this.achievements = {
            first_steps: {
                id: 'first_steps',
                name: 'First Steps',
                description: 'Complete your first lesson',
                icon: '🎯',
                points: 50
            },
            on_fire: {
                id: 'on_fire',
                name: 'On Fire',
                description: 'Maintain a 3-day login streak',
                icon: '🔥',
                points: 100
            },
            perfect_score: {
                id: 'perfect_score',
                name: 'Perfect Score',
                description: 'Complete a challenge without using hints',
                icon: '💯',
                points: 150
            },
            champion: {
                id: 'champion',
                name: 'Champion',
                description: 'Complete all available challenges',
                icon: '🏆',
                points: 500
            },
            speed_demon: {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete a test in under 30 seconds',
                icon: '⚡',
                points: 200
            },
            scholar: {
                id: 'scholar',
                name: 'Scholar',
                description: 'Read 10 lessons',
                icon: '📚',
                points: 100
            },
            week_warrior: {
                id: 'week_warrior',
                name: 'Week Warrior',
                description: 'Complete 7 challenges in one week',
                icon: '⚔️',
                points: 300
            }
        };

        this.init();
    }

    init() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = {
                points: 0,
                level: 1,
                achievements: [],
                streak: 0,
                lastLogin: null,
                completedLessons: [],
                completedPractices: [],
                completedTests: [],
                lessonsRead: 0,
                challengesThisWeek: 0,
                weekStartDate: this.getWeekStart(),
                leaderboardName: 'Anonymous',
                totalChallengesCompleted: 0,
                perfectScores: 0
            };
        }

        this.checkDailyStreak();
        this.checkWeeklyReset();
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    getWeekStart() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        const weekStart = new Date(now.setDate(diff));
        return weekStart.toDateString();
    }

    checkDailyStreak() {
        const today = new Date().toDateString();

        if (this.data.lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (this.data.lastLogin === yesterdayStr) {
                // Consecutive day - increase streak
                this.data.streak++;
            } else if (this.data.lastLogin !== null) {
                // Broke streak
                this.data.streak = 1;
            } else {
                // First login
                this.data.streak = 1;
            }

            this.data.lastLogin = today;

            // Award daily login points
            this.addPoints(25, 'Daily Login Streak');

            // Check for streak achievement
            if (this.data.streak >= 3) {
                this.unlockAchievement('on_fire');
            }

            this.save();
        }
    }

    checkWeeklyReset() {
        const thisWeek = this.getWeekStart();
        if (this.data.weekStartDate !== thisWeek) {
            this.data.weekStartDate = thisWeek;
            this.data.challengesThisWeek = 0;
            this.save();
        }
    }

    addPoints(amount, reason) {
        console.log(`💎 +${amount} points: ${reason}`);
        this.data.points += amount;

        // Check for level up
        const newLevel = this.calculateLevel();
        if (newLevel > this.data.level) {
            this.levelUp(newLevel);
        }

        this.save();
        this.updateUI();
    }

    calculateLevel() {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (this.data.points >= this.levels[i].minPoints) {
                return this.levels[i].level;
            }
        }
        return 1;
    }

    getCurrentLevel() {
        return this.levels.find(l => l.level === this.data.level);
    }

    getProgressToNextLevel() {
        const currentLevel = this.getCurrentLevel();
        if (currentLevel.level === 5) {
            return 100; // Max level
        }

        const pointsInLevel = this.data.points - currentLevel.minPoints;
        const levelRange = currentLevel.maxPoints - currentLevel.minPoints;
        return (pointsInLevel / levelRange) * 100;
    }

    levelUp(newLevel) {
        const levelInfo = this.levels.find(l => l.level === newLevel);
        console.log(`🎉 LEVEL UP! You are now a ${levelInfo.name}!`);
        this.data.level = newLevel;

        // Show notification
        this.showNotification(`🎉 LEVEL UP! You are now a ${levelInfo.name}!`, 'success');

        if (window.sfx) {
            window.sfx.success();
        }
    }

    unlockAchievement(achievementId) {
        if (this.data.achievements.includes(achievementId)) {
            return; // Already unlocked
        }

        const achievement = this.achievements[achievementId];
        if (!achievement) return;

        this.data.achievements.push(achievementId);
        this.addPoints(achievement.points, `Achievement: ${achievement.name}`);

        console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
        this.showNotification(
            `${achievement.icon} Achievement Unlocked: ${achievement.name}`,
            'achievement'
        );

        this.save();
    }

    // Track lesson completion
    lessonCompleted(challengeId) {
        if (!this.data.completedLessons.includes(challengeId)) {
            this.data.completedLessons.push(challengeId);
            this.data.lessonsRead++;
            this.addPoints(50, 'Lesson Completed');

            // Check achievements
            if (this.data.completedLessons.length === 1) {
                this.unlockAchievement('first_steps');
            }
            if (this.data.lessonsRead >= 10) {
                this.unlockAchievement('scholar');
            }
        }
    }

    // Track practice completion
    practiceCompleted(challengeId, usedHints) {
        const key = `${challengeId}_practice`;
        if (!this.data.completedPractices.includes(key)) {
            this.data.completedPractices.push(key);
            const points = usedHints ? 50 : 100;
            this.addPoints(points, usedHints ? 'Practice Completed (with hints)' : 'Practice Completed');
        }
    }

    // Track test completion
    testCompleted(challengeId, usedHints, timeSeconds) {
        const key = `${challengeId}_test`;
        if (!this.data.completedTests.includes(key)) {
            this.data.completedTests.push(key);
            this.data.totalChallengesCompleted++;
            this.data.challengesThisWeek++;

            const points = usedHints ? 100 : 200;
            this.addPoints(points, usedHints ? 'Test Completed (with hints)' : 'Test Completed');

            // Check achievements
            if (!usedHints) {
                this.data.perfectScores++;
                this.unlockAchievement('perfect_score');
            }

            if (timeSeconds < 30) {
                this.unlockAchievement('speed_demon');
            }

            if (this.data.challengesThisWeek >= 7) {
                this.unlockAchievement('week_warrior');
            }

            // Check if all challenges completed
            if (window.netrunnerUniversity) {
                const totalChallenges = window.netrunnerUniversity.challenges.length;
                if (this.data.totalChallengesCompleted >= totalChallenges) {
                    this.unlockAchievement('champion');
                }
            }
        }
    }

    getStats() {
        return {
            points: this.data.points,
            level: this.data.level,
            levelName: this.getCurrentLevel().name,
            levelColor: this.getCurrentLevel().color,
            progress: this.getProgressToNextLevel(),
            achievements: this.data.achievements.length,
            totalAchievements: Object.keys(this.achievements).length,
            streak: this.data.streak,
            completedChallenges: this.data.totalChallengesCompleted
        };
    }

    getAchievementsList() {
        return Object.values(this.achievements).map(a => ({
            ...a,
            unlocked: this.data.achievements.includes(a.id)
        }));
    }

    updateUI() {
        // Update points display if element exists
        const pointsEl = document.getElementById('user-points');
        if (pointsEl) {
            pointsEl.textContent = this.data.points;
        }

        // Update level display
        const levelEl = document.getElementById('user-level');
        if (levelEl) {
            const levelInfo = this.getCurrentLevel();
            levelEl.textContent = `Level ${levelInfo.level}: ${levelInfo.name}`;
            levelEl.style.color = levelInfo.color;
        }

        // Update progress bar
        const progressEl = document.getElementById('level-progress-bar');
        if (progressEl) {
            progressEl.style.width = `${this.getProgressToNextLevel()}%`;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `points-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            font-weight: bold;
        `;

        if (type === 'achievement') {
            notification.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        } else if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        }

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }


    // Update UI elements
    updateUI() {
        const stats = this.getStats();

        // Update level badge
        const levelBadge = document.getElementById('level-badge');
        if (levelBadge) {
            levelBadge.textContent = `LEVEL ${stats.level}: ${stats.levelName.toUpperCase()}`;
            levelBadge.style.background = `linear-gradient(135deg, ${stats.levelColor} 0%, ${this.adjustColor(stats.levelColor, -20)} 100%)`;
        }

        // Update points display
        const userPoints = document.getElementById('user-points');
        if (userPoints) {
            userPoints.textContent = stats.points;
        }

        // Update progress bar
        const progressBar = document.getElementById('level-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${stats.progress}%`;
        }
    }

    // Helper to adjust color brightness
    adjustColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    reset() {
        localStorage.removeItem(this.storageKey);
        this.init();
    }
}

// Create global instance
console.log('💎 Creating PointsSystem instance...');
const pointsSystem = new PointsSystem();
window.pointsSystem = pointsSystem;
console.log('✓ pointsSystem created and assigned to window');
console.log('→ Current Level:', pointsSystem.getStats().levelName);
console.log('→ Total Points:', pointsSystem.getStats().points);

// Update UI on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        pointsSystem.updateUI();
    });
} else {
    pointsSystem.updateUI();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
