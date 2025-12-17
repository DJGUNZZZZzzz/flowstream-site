/* 
   ================================================
   MOCK DATA GENERATOR
   ================================================
   Generates realistic mock data for all entities
   Used until real backend is connected
*/

console.log('🎲 mock-data.js loading...');

class MockDataGenerator {
    constructor() {
        this.seed = 12345; // For consistent random data

        // Sample video URLs (copyright-free gaming videos)
        this.videoSources = [
            {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                poster: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
                title: 'Epic Gaming Montage',
                game: 'ARC RAIDERS'
            },
            {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                poster: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=2574&auto=format&fit=crop',
                title: 'Cyberpunk Gameplay',
                game: 'CYBERPUNK 2077'
            },
            {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                poster: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
                title: 'Competitive Match',
                game: 'VALORANT'
            },
            {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                poster: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=2070&auto=format&fit=crop',
                title: 'Speedrun Attempt',
                game: 'ELDEN RING'
            }
        ];

        this.usernames = [
            'CyberNinja', 'CodeMaster', 'ByteWarrior', 'DataPhantom',
            'NetGhost', 'PixelHunter', 'ScriptKid', 'BugSlayer',
            'AlgoWizard', 'SyntaxSamurai', 'LogicLord', 'MemoryLeaker',
            'NeonDemon', 'GlitchMob', 'CyberKate', 'QuantumHacker',
            'SkateGamer_OG', 'Neon_Valkyrie', 'DevGuru', 'ibbunniie',
            'TechnoMage', 'BinaryBeast', 'CodeNinja', 'DigitalDragon'
        ];

        this.games = [
            'ARC RAIDERS', 'CYBERPUNK 2077', 'VALORANT', 'ELDEN RING',
            'GTA V', 'MINECRAFT', 'LEAGUE OF LEGENDS', 'APEX LEGENDS',
            'FORTNITE', 'CALL OF DUTY', 'OVERWATCH 2', 'DOTA 2'
        ];

        this.chatMessages = [
            "Let's gooo!", "Is this the new update?", "POGGERS",
            "What sensitivity do you use?", "That aim is snappy!",
            "First time chat here.", "GG!", "Nice play!", "Clutch!",
            "How long have you been streaming?", "What's your setup?",
            "Can you play my song request?", "Subscribed!", "Love the vibes",
            "This game looks sick", "What rank are you?", "Tutorial when?",
            "You're cracked!", "Insane reaction time", "Teach me your ways"
        ];

        this.streamTitles = [
            "Ranked Competitive Matches | Drop Enabled [EN]",
            "Chill Vibes & Good Times | !discord",
            "Road to Radiant | Day 47",
            "24 Hour Stream Marathon | !donate",
            "Learning New Agent | First Time",
            "Viewer Games | Join Discord!",
            "Speedrun Practice | WR Attempts",
            "NoPixel Heist Planning | RP",
            "Tournament Prep | Scrims",
            "Casual Gameplay | AMA"
        ];

        this.avatarColors = [
            '0ff', 'ff0055', '00ff88', 'ffd700', '4a9eff',
            'ff00ff', '00ffff', 'ff6b6b', '4ecdc4', '95e1d3'
        ];
    }

    // Seeded random number generator for consistency
    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    randomItem(array) {
        return array[Math.floor(this.random() * array.length)];
    }

    // Generate a mock user
    generateUser(id = null) {
        const username = id ? this.usernames[id % this.usernames.length] : this.randomItem(this.usernames);
        const color = this.randomItem(this.avatarColors);

        return {
            id: id || this.randomInt(1000, 9999),
            username: username,
            displayName: username,
            avatar: `https://ui-avatars.com/api/?name=${username}&background=${color}&color=000&size=128`,
            bio: `Professional gamer and content creator. Streaming since ${2015 + this.randomInt(0, 8)}.`,
            followers: this.randomInt(100, 50000),
            following: this.randomInt(10, 500),
            isVerified: this.random() > 0.7,
            isPartner: this.random() > 0.8,
            createdAt: new Date(Date.now() - this.randomInt(1, 365 * 3) * 24 * 60 * 60 * 1000).toISOString()
        };
    }

    // Generate a mock stream
    generateStream(id = null) {
        const streamer = this.generateUser(id);
        const game = this.randomItem(this.games);
        const title = this.randomItem(this.streamTitles);
        const viewers = this.randomInt(50, 50000);
        const videoSource = this.randomItem(this.videoSources);

        return {
            id: id || this.randomInt(1000, 9999),
            streamer: streamer,
            title: title,
            game: game,
            viewers: viewers,
            viewersFormatted: viewers >= 1000 ? `${(viewers / 1000).toFixed(1)}k` : viewers.toString(),
            isLive: true,
            startedAt: new Date(Date.now() - this.randomInt(10, 300) * 60 * 1000).toISOString(),
            thumbnail: videoSource.poster,
            videoUrl: videoSource.url,
            tags: ['English', 'Competitive', 'Interactive'],
            language: 'en',
            mature: false
        };
    }

    // Generate multiple streams
    generateStreams(count = 10) {
        const streams = [];
        for (let i = 0; i < count; i++) {
            streams.push(this.generateStream(i));
        }
        return streams;
    }

    // Generate a chat message
    generateChatMessage(username = null, userColor = null) {
        const user = username || this.randomItem(this.usernames);
        const color = userColor || this.randomItem(this.avatarColors);
        const message = this.randomItem(this.chatMessages);

        return {
            id: this.randomInt(10000, 99999),
            username: user,
            userColor: `#${color}`,
            message: message,
            timestamp: new Date().toISOString(),
            badges: this.random() > 0.8 ? ['subscriber'] : [],
            emotes: []
        };
    }

    // Generate chat history
    generateChatHistory(count = 20) {
        const messages = [];
        for (let i = 0; i < count; i++) {
            messages.push(this.generateChatMessage());
        }
        return messages;
    }

    // Generate transaction history for FlowBank
    generateTransactions(count = 10) {
        const types = [
            { type: 'earn', desc: 'Daily Login Bonus', amount: 25 },
            { type: 'earn', desc: 'Completed Challenge', amount: 100 },
            { type: 'earn', desc: 'Watch Time Reward', amount: 50 },
            { type: 'earn', desc: 'Achievement Unlocked', amount: 150 },
            { type: 'spend', desc: 'Custom Emote Purchase', amount: -200 },
            { type: 'spend', desc: 'Profile Theme', amount: -100 },
            { type: 'earn', desc: 'Referral Bonus', amount: 75 }
        ];

        const transactions = [];
        for (let i = 0; i < count; i++) {
            const transaction = this.randomItem(types);
            transactions.push({
                id: this.randomInt(10000, 99999),
                type: transaction.type,
                description: transaction.desc,
                amount: transaction.amount,
                timestamp: new Date(Date.now() - i * 3600000).toISOString(),
                balance: 1000 + (i * 50) // Simulated running balance
            });
        }
        return transactions.reverse(); // Oldest first
    }

    // Generate leaderboard data
    generateLeaderboard(count = 10, includeCurrentUser = true) {
        const users = [];

        // Add current user if requested
        if (includeCurrentUser && window.pointsSystem) {
            const stats = window.pointsSystem.getStats();
            const username = localStorage.getItem('netrunner_username') || 'You';
            users.push({
                username: username,
                points: stats.points,
                level: stats.level,
                levelName: stats.levelName,
                isCurrentUser: true
            });
        }

        // Add mock users
        for (let i = 0; i < count - 1; i++) {
            const user = this.generateUser(i);
            users.push({
                username: user.username,
                points: this.randomInt(500, 5000),
                level: this.randomInt(1, 5),
                levelName: ['Newbie', 'Cadet', 'Hacker', 'Elite', 'Netrunner'][this.randomInt(0, 4)],
                isCurrentUser: false
            });
        }

        // Sort by points
        return users.sort((a, b) => b.points - a.points);
    }

    // Get video source by index
    getVideoSource(index = 0) {
        return this.videoSources[index % this.videoSources.length];
    }

    // Get all video sources
    getAllVideoSources() {
        return [...this.videoSources];
    }
}

// Create global instance
const mockData = new MockDataGenerator();
window.mockData = mockData;

console.log('✓ mock-data.js loaded');
console.log('📊 Sample data generated:', {
    users: mockData.generateUser(),
    streams: mockData.generateStreams(3).length,
    messages: mockData.generateChatHistory(5).length,
    videos: mockData.getAllVideoSources().length
});
