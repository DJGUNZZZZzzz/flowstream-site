/* 
   ================================================
   CHAT SIMULATOR - Continuous Chat Bot
   ================================================
   Simulates realistic chat activity with random messages
*/

console.log('💬 chat-simulator.js loading...');

class ChatSimulator {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.messageDelay = 3000; // 3 seconds between messages
        this.chatFeed = null;

        // Expanded chat messages for variety
        this.messages = [
            "Let's gooo!", "Is this the new update?", "POGGERS",
            "What sensitivity do you use?", "That aim is snappy!",
            "First time chat here.", "GG!", "Nice play!", "Clutch!",
            "How long have you been streaming?", "What's your setup?",
            "Can you play my song request?", "Subscribed!", "Love the vibes",
            "This game looks sick", "What rank are you?", "Tutorial when?",
            "You're cracked!", "Insane reaction time", "Teach me your ways",
            "W streamer", "L play jk jk", "Ratio", "Based",
            "Touch grass", "No cap fr fr", "Sheesh", "Bussin",
            "That's crazy", "Yo chat", "Chat is this real?",
            "I'm dead 💀", "Not the...", "Bro what",
            "Actual legend", "Goated", "Built different",
            "Main character energy", "Plot armor", "Certified classic",
            "Peak content", "Cinema", "Kino",
            "Gigachad move", "Sigma grindset", "Real",
            "Facts", "No printer", "On god",
            "Caught in 4K", "Exposed", "Clipped and shipped",
            "Send it!", "Full send", "No shot",
            "Copium", "Hopium", "Malding",
            "Sadge", "Pog", "Kappa",
            "!discord", "!socials", "!commands",
            "First!", "Second!", "Third!",
            "Anyone else lagging?", "Stream froze", "Audio good?",
            "What's the song?", "Playlist?", "Song name?",
            "Where did you get that skin?", "How much did that cost?",
            "Can I join?", "Invite me!", "Let me play!",
            "Carry me pls", "1v1 me", "Bet you can't do that again",
            "Fake!", "Staged!", "Scripted!",
            "Best streamer", "Underrated", "Deserves more views",
            "Been here since day 1", "OG viewer", "Veteran",
            "New viewer here", "Just followed", "Subbed!",
            "Gifted sub hype!", "Thanks for the gift!", "Sub train!",
            "Raid incoming!", "Welcome raiders!", "PogChamp",
            "Emote only mode?", "Slow mode please", "Mods?",
            "Ban that guy", "Timeout", "Cringe",
            "Based take", "Hot take", "Controversial opinion",
            "I disagree", "True", "Real talk",
            "Skill issue", "Get good", "Ez",
            "Diff", "Gap", "Not even close",
            "Comeback arc", "Redemption arc", "Character development",
            "Lore drop", "Context?", "Backstory?",
            "Crossover episode", "Collab when?", "Duo?",
            "Speedrun strats", "World record pace", "New meta",
            "Patch notes?", "Nerf incoming", "Buff this",
            "Pay to win", "Skill based", "RNG",
            "Unlucky", "Lucky", "Calculated",
            "Outplayed", "Outsmarted", "Mindgames",
            "200 IQ play", "5Head", "Pepega",
            "Monka", "Peepo", "Widehardo"
        ];

        this.usernames = [
            'CyberNinja', 'CodeMaster', 'ByteWarrior', 'DataPhantom',
            'NetGhost', 'PixelHunter', 'ScriptKid', 'BugSlayer',
            'AlgoWizard', 'SyntaxSamurai', 'LogicLord', 'MemoryLeaker',
            'NeonDemon', 'GlitchMob', 'CyberKate', 'QuantumHacker',
            'TechnoMage', 'BinaryBeast', 'CodeNinja', 'DigitalDragon',
            'xXProGamerXx', 'NotABot', 'JustVibing', 'ChillGuy',
            'SpeedRunner', 'CasualPlayer', 'TryHard', 'NoobMaster',
            'EliteSniper', 'TankMain', 'SupportGod', 'MidLaner',
            'JungleKing', 'ADCCarry', 'TopLaner', 'FlexPick'
        ];

        this.colors = [
            '#0ff', '#ff0055', '#00ff88', '#ffd700', '#4a9eff',
            '#ff00ff', '#00ffff', '#ff6b6b', '#4ecdc4', '#95e1d3',
            '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b'
        ];
    }

    init() {
        console.log('💬 Initializing chat simulator...');

        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.chatFeed = document.getElementById('chat-feed');

        if (!this.chatFeed) {
            console.warn('⚠️ Chat feed not found, simulator disabled');
            return;
        }

        // Auto-start simulation
        this.start();

        console.log('✓ Chat simulator initialized');
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('▶️ Chat simulation started');

        // Send first message immediately
        this.sendRandomMessage();

        // Then continue at intervals
        this.interval = setInterval(() => {
            this.sendRandomMessage();
        }, this.messageDelay);
    }

    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        console.log('⏸️ Chat simulation stopped');
    }

    sendRandomMessage() {
        if (!this.chatFeed) return;

        const username = this.randomItem(this.usernames);
        const message = this.randomItem(this.messages);
        const color = this.randomItem(this.colors);

        this.addMessage(username, message, color);
    }

    addMessage(username, message, color = '#00ff88') {
        if (!this.chatFeed) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        messageEl.innerHTML = `
            <span class="user" style="color:${color}">${username}:</span> 
            <span class="text">${message}</span>
        `;

        // Add with fade-in animation
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(10px)';
        messageEl.style.transition = 'all 0.3s ease';

        this.chatFeed.appendChild(messageEl);

        // Trigger animation
        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        }, 10);

        // Auto-scroll to bottom (only if not paused)
        if (window.chatScrollManager) {
            window.chatScrollManager.scrollToBottomIfNotPaused();
        } else {
            // Fallback if manager not loaded
            this.chatFeed.scrollTop = this.chatFeed.scrollHeight;
        }

        // Limit chat history to last 50 messages
        const messages = this.chatFeed.querySelectorAll('.message');
        if (messages.length > 50) {
            messages[0].remove();
        }
    }

    randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Allow manual message sending
    sendMessage(username, message, color) {
        this.addMessage(username, message, color);
    }

    // Adjust speed
    setSpeed(delayMs) {
        this.messageDelay = delayMs;
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }
}

// Create global instance
const chatSimulator = new ChatSimulator();
window.chatSimulator = chatSimulator;

// Initialize
chatSimulator.init();

console.log('✓ chat-simulator.js loaded');
console.log('💡 Controls: chatSimulator.stop(), chatSimulator.start(), chatSimulator.setSpeed(2000)');
