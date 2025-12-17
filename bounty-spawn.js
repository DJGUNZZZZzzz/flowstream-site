/* 
   ================================================
   BOUNTY SPAWN SYSTEM
   ================================================
   Generates random bounty notifications for stream watching
*/

console.log('bounty-spawn.js loaded!');

// List of streamers for bounties
const bountyStreamers = [
    'CyberNinja_77',
    'QuantumHacker',
    'NeonDreamer',
    'GlitchMaster',
    'DataPhantom',
    'CodeRunner_X',
    'ShadowByte',
    'CryptoVixen',
    'PixelWarrior',
    'NetGhost'
];

function spawnBounty() {
    // Don't spawn if already watching a bounty
    if (window.bountyWatchManager && bountyWatchManager.isWatching()) {
        return;
    }

    const streamer = bountyStreamers[Math.floor(Math.random() * bountyStreamers.length)];
    const tokenAmount = [100, 250, 500, 750, 1000][Math.floor(Math.random() * 5)];

    const bounty = document.createElement('div');
    bounty.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: -300px;
        width: 280px;
        background: rgba(10, 20, 30, 0.95);
        border: 1px solid #ff0055;
        padding: 15px;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 0 20px rgba(255, 0, 85, 0.4);
        transition: right 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-family: 'Rajdhani', sans-serif;
    `;

    bounty.innerHTML = `
        <div style="font-size: 16px; color: #ff0055; font-weight: bold; margin-bottom: 5px;">
            <i class="fa-solid fa-crosshairs"></i> LIVE BOUNTY
        </div>
        <div style="color: #ccc; font-size: 13px; margin-bottom: 10px;">
            Watch <strong>${streamer}</strong> for 5 mins to earn <span style="color:#0ff">${tokenAmount} FLOW TOKENS</span>.
        </div>
        <button class="bounty-btn" style="
            background: #ff0055;
            color: #fff;
            border: none;
            padding: 5px 10px;
            width: 100%;
            cursor: pointer;
            font-family: 'Orbitron';
            font-size: 11px;
        ">ACCEPT CONTRACT</button>
    `;

    document.body.appendChild(bounty);

    // Play sound
    if (window.sfx) sfx.playTone(600, 'square', 0.1);

    // Slide in
    setTimeout(() => bounty.style.right = '30px', 100);

    // Wire up accept button
    const btn = bounty.querySelector('.bounty-btn');
    btn.addEventListener('click', () => {
        console.log('=== BOUNTY BUTTON CLICKED (bounty-spawn.js) ===');
        console.log('Streamer:', streamer, 'Token Amount:', tokenAmount);
        console.log('window.bountyWatchManager exists?', !!window.bountyWatchManager);

        if (window.sfx) sfx.success();

        // Start watch tracking
        if (window.bountyWatchManager) {
            console.log('Calling bountyWatchManager.startWatch...');
            const result = bountyWatchManager.startWatch(streamer, tokenAmount);
            console.log('startWatch returned:', result);
        } else {
            // Fallback: redirect directly
            console.warn('BountyWatchManager not available, redirecting to channel.html');
            setTimeout(() => {
                window.location.href = 'channel.html';
            }, 100);
        }

        // Remove bounty notification
        bounty.style.right = '-300px';
        setTimeout(() => bounty.remove(), 500);
    });

    // Auto-dismiss after 10 seconds if not accepted
    setTimeout(() => {
        if (bounty.parentNode) {
            bounty.style.right = '-300px';
            setTimeout(() => bounty.remove(), 500);
        }
    }, 10000);
}

function startBountySystem() {
    console.log('startBountySystem() called - spawning first bounty in 10 seconds');
    // Spawn first bounty after 10 seconds
    setTimeout(() => {
        console.log('Spawning first bounty now!');
        spawnBounty();

        // Then spawn every 30 seconds for testing (was 2-5 minutes)
        setInterval(() => {
            console.log('Spawning recurring bounty');
            spawnBounty();
        }, 30000); // 30 seconds for testing
    }, 10000); // 10 seconds initial delay
}

// Auto-start bounty system on homepage
console.log('Checking if should auto-start bounty system...');
console.log('Current URL:', window.location.href);
console.log('Pathname:', window.location.pathname);

if (window.location.href.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    console.log('✓ Auto-starting bounty system on homepage');
    if (document.readyState === 'loading') {
        console.log('DOM still loading, waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, starting bounty system');
            startBountySystem();
        });
    } else {
        console.log('DOM already loaded, starting bounty system immediately');
        startBountySystem();
    }
} else {
    console.log('Not on homepage, skipping auto-start');
}
