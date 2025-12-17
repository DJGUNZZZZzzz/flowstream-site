/* 
   ================================================
   SUBSCRIPTIONS MANAGER - Track Feeds & Subscriptions
   ================================================
   Manages following/followers and subscriptions
*/

console.log('📡 subscriptions-manager.js loading...');

class SubscriptionsManager {
    constructor() {
        this.storageKey = 'netrunner_subscriptions';
        this.init();
    }

    init() {
        // Initialize with mock data for testing
        const existing = this.getData();
        if (!existing.feeds || existing.feeds.length === 0) {
            this.initializeMockData();
        }
        console.log('✓ Subscriptions manager initialized');
    }

    initializeMockData() {
        const mockData = {
            feeds: ['SkateGamer_OG', 'TheVicMendoza', 'CopperCarnie'],
            feeders: ['CyberNinja', 'CodeMaster', 'ByteWarrior', 'DataPhantom'],
            subscriptions: ['DJSwayforth', 'TheQueenHoneyBee'],
            subscribers: ['NetGhost', 'PixelHunter']
        };
        localStorage.setItem(this.storageKey, JSON.stringify(mockData));
        console.log('✓ Mock subscription data initialized');
    }

    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {
            feeds: [],
            feeders: [],
            subscriptions: [],
            subscribers: []
        };
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // FEEDS (Following)
    addFeed(username) {
        const data = this.getData();
        if (!data.feeds.includes(username)) {
            data.feeds.push(username);
            this.saveData(data);
            console.log(`✓ Added to feeds: ${username}`);
            return true;
        }
        return false;
    }

    removeFeed(username) {
        const data = this.getData();
        data.feeds = data.feeds.filter(u => u !== username);
        this.saveData(data);
        console.log(`✓ Removed from feeds: ${username}`);
    }

    isFeeding(username) {
        const data = this.getData();
        return data.feeds.includes(username);
    }

    getFeeds() {
        return this.getData().feeds;
    }

    getFeeders() {
        return this.getData().feeders;
    }

    // SUBSCRIPTIONS
    addSubscription(username) {
        const data = this.getData();
        if (!data.subscriptions.includes(username)) {
            data.subscriptions.push(username);
            this.saveData(data);
            console.log(`✓ Added to subscriptions: ${username}`);
            return true;
        }
        return false;
    }

    removeSubscription(username) {
        const data = this.getData();
        data.subscriptions = data.subscriptions.filter(u => u !== username);
        this.saveData(data);
        console.log(`✓ Removed from subscriptions: ${username}`);
    }

    isSubscribed(username) {
        const data = this.getData();
        return data.subscriptions.includes(username);
    }

    getSubscriptions() {
        return this.getData().subscriptions;
    }

    getSubscribers() {
        return this.getData().subscribers;
    }

    // STATS
    getStats() {
        const data = this.getData();
        return {
            feedsCount: data.feeds.length,
            feedersCount: data.feeders.length,
            subscriptionsCount: data.subscriptions.length,
            subscribersCount: data.subscribers.length
        };
    }
}

// Create global instance
console.log('📡 Creating SubscriptionsManager instance...');
const subscriptionsManager = new SubscriptionsManager();
window.subscriptionsManager = subscriptionsManager;
console.log('✓ subscriptionsManager created and assigned to window');
console.log('  → Stats:', subscriptionsManager.getStats());
