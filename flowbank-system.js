/* 
   ================================================
   FLOWBANK SYSTEM - Flow Token Management
   ================================================
   Manages Flow Tokens, transactions, and persistence
*/

class FlowBankManager {
    constructor() {
        this.storageKey = 'flowbank_data';
        this.init();
    }

    init() {
        // Initialize or load existing data
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = {
                balance: 0,
                transactions: [],
                stats: {
                    dailyEarned: 0,
                    weeklyEarned: 0,
                    lastDailyReset: new Date().toDateString(),
                    lastWeeklyReset: this.getWeekStart()
                },
                unreadTransactions: 0
            };
            this.save();
        }

        // Check if we need to reset daily/weekly stats
        this.checkResets();
    }

    getWeekStart() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        const weekStart = new Date(now.setDate(diff));
        return weekStart.toDateString();
    }

    checkResets() {
        const today = new Date().toDateString();
        const thisWeek = this.getWeekStart();
        let needsSave = false;

        // Reset daily stats if it's a new day
        if (this.data.stats.lastDailyReset !== today) {
            this.data.stats.dailyEarned = 0;
            this.data.stats.lastDailyReset = today;
            needsSave = true;
        }

        // Reset weekly stats if it's a new week
        if (this.data.stats.lastWeeklyReset !== thisWeek) {
            this.data.stats.weeklyEarned = 0;
            this.data.stats.lastWeeklyReset = thisWeek;
            needsSave = true;
        }

        if (needsSave) this.save();
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    addTokens(amount, description, type = 'earned') {
        if (amount <= 0) return false;

        this.data.balance += amount;

        const transaction = {
            id: Date.now() + Math.random(),
            type: type,
            amount: amount,
            description: description,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString()
        };

        this.data.transactions.unshift(transaction); // Add to beginning

        // Update stats for earned tokens
        if (type === 'earned' || type === 'bounty' || type === 'challenge') {
            this.data.stats.dailyEarned += amount;
            this.data.stats.weeklyEarned += amount;
        }

        this.data.unreadTransactions++;
        this.save();
        this.updateBadges();
        return true;
    }

    removeTokens(amount, description, type = 'spent') {
        if (amount <= 0 || this.data.balance < amount) return false;

        this.data.balance -= amount;

        const transaction = {
            id: Date.now() + Math.random(),
            type: type,
            amount: -amount,
            description: description,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString()
        };

        this.data.transactions.unshift(transaction);
        this.data.unreadTransactions++;
        this.save();
        this.updateBadges();
        return true;
    }

    getBalance() {
        return this.data.balance;
    }

    getTransactions(limit = 50) {
        return this.data.transactions.slice(0, limit);
    }

    getStats() {
        this.checkResets(); // Ensure stats are current
        return {
            balance: this.data.balance,
            dailyEarned: this.data.stats.dailyEarned,
            weeklyEarned: this.data.stats.weeklyEarned,
            totalTransactions: this.data.transactions.length
        };
    }

    markTransactionsRead() {
        this.data.unreadTransactions = 0;
        this.save();
        this.updateBadges();
    }

    getUnreadCount() {
        return this.data.unreadTransactions;
    }

    updateBadges() {
        // Update all FLOW CARD badges on the page
        const badges = document.querySelectorAll('.flowcard-badge');
        const count = this.getUnreadCount();

        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 9 ? '9+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    // Clear all data (for testing/reset)
    reset() {
        localStorage.removeItem(this.storageKey);
        this.init();
    }
}

// Create global instance
console.log('💰 Creating FlowBankManager instance...');
const flowBank = new FlowBankManager();
window.flowBank = flowBank; // Explicitly assign to window
console.log('✓ flowBank created and assigned to window:', window.flowBank);
console.log('  → Balance:', flowBank.getBalance());
