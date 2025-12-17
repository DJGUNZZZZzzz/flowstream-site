/* 
   ================================================
   MOCK API - Service Abstraction Layer
   ================================================
   Simulates backend API calls with realistic delays
   Easy to swap with real API endpoints later
*/

console.log('🌐 mock-api.js loading...');

class MockAPI {
    constructor() {
        this.baseDelay = 100; // Minimum delay in ms
        this.maxDelay = 500; // Maximum delay in ms
        this.failureRate = 0.02; // 2% chance of simulated failure
    }

    // Simulate network delay
    async delay(min = this.baseDelay, max = this.maxDelay) {
        const ms = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Simulate random API failure
    shouldFail() {
        return Math.random() < this.failureRate;
    }

    // Generic API response wrapper
    async apiCall(operation, data = null) {
        await this.delay();

        if (this.shouldFail()) {
            throw new Error('Network error: Request failed');
        }

        return {
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        };
    }

    // ==========================================
    // AUTHENTICATION API
    // ==========================================

    async login(username, password) {
        console.log('🔐 API: login', username);
        await this.delay();

        // Mock validation
        if (!username || !password) {
            return {
                success: false,
                error: 'Username and password required'
            };
        }

        // Simulate successful login
        const user = window.mockData.generateUser();
        user.username = username;

        return {
            success: true,
            data: {
                user: user,
                token: 'mock_jwt_token_' + Date.now(),
                expiresIn: 3600
            }
        };
    }

    async signup(username, email, password) {
        console.log('📝 API: signup', username, email);
        await this.delay();

        // Mock validation
        if (!username || !email || !password) {
            return {
                success: false,
                error: 'All fields required'
            };
        }

        // Simulate successful signup
        const user = window.mockData.generateUser();
        user.username = username;
        user.email = email;

        return {
            success: true,
            data: {
                user: user,
                token: 'mock_jwt_token_' + Date.now()
            }
        };
    }

    async logout() {
        console.log('👋 API: logout');
        await this.delay();
        return { success: true };
    }

    async getCurrentUser() {
        console.log('👤 API: getCurrentUser');
        await this.delay();

        const username = localStorage.getItem('netrunner_username') || 'Guest';
        const user = window.mockData.generateUser();
        user.username = username;

        return {
            success: true,
            data: user
        };
    }

    // ==========================================
    // USER PROFILE API
    // ==========================================

    async getProfile(userId) {
        console.log('📋 API: getProfile', userId);
        await this.delay();

        const user = window.mockData.generateUser(userId);
        return this.apiCall('getProfile', user);
    }

    async updateProfile(userId, profileData) {
        console.log('✏️ API: updateProfile', userId, profileData);
        await this.delay();

        return this.apiCall('updateProfile', { ...profileData, id: userId });
    }

    async uploadAvatar(userId, imageFile) {
        console.log('📸 API: uploadAvatar', userId);
        await this.delay(500, 1500); // Longer delay for upload

        return this.apiCall('uploadAvatar', {
            url: URL.createObjectURL(imageFile),
            userId: userId
        });
    }

    // ==========================================
    // STREAMING API
    // ==========================================

    async getLiveStreams(limit = 20, offset = 0) {
        console.log('📺 API: getLiveStreams', limit, offset);
        await this.delay();

        const streams = window.mockData.generateStreams(limit);
        return this.apiCall('getLiveStreams', {
            streams: streams,
            total: 1000,
            offset: offset,
            limit: limit
        });
    }

    async getStream(streamId) {
        console.log('🎥 API: getStream', streamId);
        await this.delay();

        const stream = window.mockData.generateStream(streamId);
        return this.apiCall('getStream', stream);
    }

    async followChannel(channelId) {
        console.log('❤️ API: followChannel', channelId);
        await this.delay();

        return this.apiCall('followChannel', { channelId, following: true });
    }

    async unfollowChannel(channelId) {
        console.log('💔 API: unfollowChannel', channelId);
        await this.delay();

        return this.apiCall('unfollowChannel', { channelId, following: false });
    }

    async subscribeToChannel(channelId, tier = 1) {
        console.log('⭐ API: subscribeToChannel', channelId, tier);
        await this.delay();

        return this.apiCall('subscribeToChannel', {
            channelId,
            tier,
            subscribed: true,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    // ==========================================
    // CHAT API
    // ==========================================

    async getChatHistory(channelId, limit = 50) {
        console.log('💬 API: getChatHistory', channelId, limit);
        await this.delay();

        const messages = window.mockData.generateChatHistory(limit);
        return this.apiCall('getChatHistory', messages);
    }

    async sendChatMessage(channelId, message) {
        console.log('📤 API: sendChatMessage', channelId, message);
        await this.delay(50, 200); // Faster for chat

        const chatMessage = {
            id: Date.now(),
            username: localStorage.getItem('netrunner_username') || 'Guest',
            userColor: '#00ff88',
            message: message,
            timestamp: new Date().toISOString(),
            badges: [],
            emotes: []
        };

        return this.apiCall('sendChatMessage', chatMessage);
    }

    // ==========================================
    // TOKEN/ECONOMY API
    // ==========================================

    async getTokenBalance() {
        console.log('💰 API: getTokenBalance');
        await this.delay();

        // Get from FlowBank if available
        const balance = window.flowBank ? window.flowBank.getBalance() : 1000;

        return this.apiCall('getTokenBalance', { balance });
    }

    async getTransactionHistory(limit = 20) {
        console.log('📊 API: getTransactionHistory', limit);
        await this.delay();

        const transactions = window.mockData.generateTransactions(limit);
        return this.apiCall('getTransactionHistory', transactions);
    }

    async earnTokens(amount, reason) {
        console.log('💎 API: earnTokens', amount, reason);
        await this.delay();

        if (window.flowBank) {
            window.flowBank.addTokens(amount, reason);
        }

        return this.apiCall('earnTokens', { amount, reason });
    }

    async spendTokens(amount, reason) {
        console.log('💸 API: spendTokens', amount, reason);
        await this.delay();

        if (window.flowBank) {
            const success = window.flowBank.spendTokens(amount, reason);
            if (!success) {
                return {
                    success: false,
                    error: 'Insufficient tokens'
                };
            }
        }

        return this.apiCall('spendTokens', { amount, reason });
    }

    // ==========================================
    // LEADERBOARD API
    // ==========================================

    async getLeaderboard(type = 'global', limit = 10) {
        console.log('🏆 API: getLeaderboard', type, limit);
        await this.delay();

        const leaderboard = window.mockData.generateLeaderboard(limit);
        return this.apiCall('getLeaderboard', leaderboard);
    }

    async getUserRank(userId) {
        console.log('📊 API: getUserRank', userId);
        await this.delay();

        const rank = Math.floor(Math.random() * 1000) + 1;
        return this.apiCall('getUserRank', { rank, userId });
    }

    // ==========================================
    // NETRUNNER UNIVERSITY API
    // ==========================================

    async getChallenges(level = null) {
        console.log('🎓 API: getChallenges', level);
        await this.delay();

        // Use existing NetrunnerUniversity data
        if (window.netrunnerUniversity) {
            const challenges = level ?
                window.netrunnerUniversity.getChallengesByLevel(level) :
                window.netrunnerUniversity.challenges;

            return this.apiCall('getChallenges', challenges);
        }

        return this.apiCall('getChallenges', []);
    }

    async submitChallengeAnswer(challengeId, answer) {
        console.log('✅ API: submitChallengeAnswer', challengeId);
        await this.delay();

        // Simulate validation
        const isCorrect = Math.random() > 0.3; // 70% success rate for demo

        return this.apiCall('submitChallengeAnswer', {
            challengeId,
            correct: isCorrect,
            tokensEarned: isCorrect ? 100 : 0
        });
    }

    async getUserProgress() {
        console.log('📈 API: getUserProgress');
        await this.delay();

        if (window.pointsSystem) {
            const stats = window.pointsSystem.getStats();
            return this.apiCall('getUserProgress', stats);
        }

        return this.apiCall('getUserProgress', {
            points: 0,
            level: 1,
            completedChallenges: 0
        });
    }

    // ==========================================
    // SUBSCRIPTION API
    // ==========================================

    async getFollowedChannels() {
        console.log('📺 API: getFollowedChannels');
        await this.delay();

        // Generate mock followed channels
        const channels = [];
        for (let i = 0; i < 5; i++) {
            channels.push(window.mockData.generateStream(i));
        }

        return this.apiCall('getFollowedChannels', channels);
    }

    async getSubscriptions() {
        console.log('⭐ API: getSubscriptions');
        await this.delay();

        // Generate mock subscriptions
        const subscriptions = [];
        for (let i = 0; i < 3; i++) {
            const stream = window.mockData.generateStream(i);
            subscriptions.push({
                ...stream,
                tier: Math.floor(Math.random() * 3) + 1,
                subscribedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        return this.apiCall('getSubscriptions', subscriptions);
    }
}

// Create global instance
const mockAPI = new MockAPI();
window.mockAPI = mockAPI;

console.log('✓ mock-api.js loaded');
console.log('🌐 Mock API ready with', Object.keys(mockAPI).filter(k => typeof mockAPI[k] === 'function').length, 'endpoints');
