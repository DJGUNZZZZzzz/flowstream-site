/* 
   ================================================
   BOUNTY WATCH-TIME TRACKING SYSTEM
   ================================================
   Manages stream watching bounties with 5-minute countdown
*/

class BountyWatchManager {
    constructor() {
        this.storageKey = 'active_bounty_watch';
        this.activeBounty = null;
        this.startTime = null;
        this.requiredDuration = 10 * 1000; // 10 seconds for quick activation
        this.timer = null;
        this.visibilityCheckInterval = null;
        this.wasVisible = true;
        this.init();
    }

    init() {
        // Check if there's an active bounty from previous session
        console.log('BountyWatchManager.init() called');
        const stored = localStorage.getItem(this.storageKey);
        console.log('localStorage data:', stored);

        if (stored) {
            const data = JSON.parse(stored);
            console.log('Parsed bounty data:', data);

            // Only restore if it's still valid (not expired)
            const elapsed = Date.now() - data.startTime;
            console.log('Time elapsed since bounty started:', elapsed, 'ms');
            console.log('Required duration:', this.requiredDuration, 'ms');
            console.log('Is expired?', elapsed >= this.requiredDuration);

            if (elapsed < this.requiredDuration) {
                console.log('✓ Bounty is still valid, restoring...');
                this.activeBounty = data;
                this.startTime = data.startTime;
                this.resumeWatch();
            } else {
                // Expired, clear it
                console.log('✗ Bounty expired, clearing...');
                localStorage.removeItem(this.storageKey);
            }
        } else {
            console.log('No stored bounty data found in localStorage');

            // Check URL parameters (for file:// protocol where localStorage doesn't persist)
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('bounty') === 'true') {
                console.log('Found bounty data in URL parameters');
                const streamerName = urlParams.get('streamer');
                const tokenAmount = parseInt(urlParams.get('tokens'));
                const startTime = parseInt(urlParams.get('start'));

                console.log('URL bounty data:', { streamerName, tokenAmount, startTime });

                // Check if still valid
                const elapsed = Date.now() - startTime;
                if (elapsed < this.requiredDuration) {
                    console.log('✓ URL bounty is still valid, restoring...');
                    this.activeBounty = {
                        streamerName: streamerName,
                        tokenAmount: tokenAmount,
                        channelUrl: 'channel.html',
                        startTime: startTime
                    };
                    this.startTime = startTime;

                    // Save to localStorage for this page
                    localStorage.setItem(this.storageKey, JSON.stringify(this.activeBounty));

                    this.resumeWatch();
                } else {
                    console.log('✗ URL bounty expired');
                }
            }
        }
    }

    startWatch(streamerName, tokenAmount, channelUrl = 'channel.html') {
        // If already watching, don't start a new one
        if (this.activeBounty) {
            console.log('Already watching a bounty');
            return false;
        }

        console.log('BountyWatchManager.startWatch called:', streamerName, tokenAmount);

        this.activeBounty = {
            streamerName: streamerName,
            tokenAmount: tokenAmount,
            channelUrl: channelUrl,
            startTime: Date.now()
        };

        this.startTime = this.activeBounty.startTime;

        // Save to localStorage
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.activeBounty));
            console.log('Saved to localStorage:', this.storageKey, this.activeBounty);

            // Verify save worked
            const saved = localStorage.getItem(this.storageKey);
            console.log('Verification - read back from localStorage:', saved);

            if (!saved) {
                console.error('localStorage save FAILED!');
                alert('Error: Could not save bounty data. Please check browser settings.');
                return false;
            }
        } catch (e) {
            console.error('localStorage error:', e);
            alert('Error: localStorage not available. Please check browser settings.');
            return false;
        }

        // Redirect to channel page if not already there
        if (!window.location.href.includes('channel.html')) {
            console.log('Redirecting to channel.html with bounty data in URL...');
            // Pass bounty data via URL parameters since localStorage doesn't work with file:// protocol
            const url = `channel.html?bounty=true&streamer=${encodeURIComponent(streamerName)}&tokens=${tokenAmount}&start=${this.startTime}`;
            console.log('Redirect URL:', url);
            window.location.href = url;
        } else {
            console.log('Already on channel.html, showing overlay...');
            this.showWatchOverlay();
            this.startTimer();
        }

        return true;
    }

    resumeWatch() {
        if (!this.activeBounty) {
            console.log('resumeWatch called but no activeBounty');
            return;
        }

        console.log('Resuming watch for:', this.activeBounty);
        this.showWatchOverlay();
        this.startTimer();
    }

    showWatchOverlay() {
        // Remove existing overlay if any
        const existing = document.getElementById('bounty-watch-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'bounty-watch-overlay active';
        overlay.id = 'bounty-watch-overlay';

        overlay.innerHTML = `
            <div class="watch-header">ACTIVE BOUNTY</div>
            <div class="watch-streamer">${this.activeBounty.streamerName}</div>
            <div class="watch-countdown" id="watch-countdown">0:10</div>
            <div class="watch-progress-bar">
                <div class="watch-progress-fill" id="watch-progress-fill"></div>
            </div>
            <div class="watch-message">Stay on this channel to earn <strong>${this.activeBounty.tokenAmount} tokens</strong></div>
        `;

        document.body.appendChild(overlay);
    }

    startTimer() {
        // Clear any existing timer
        if (this.timer) clearInterval(this.timer);
        if (this.visibilityCheckInterval) clearInterval(this.visibilityCheckInterval);

        // Update display every second
        this.timer = setInterval(() => {
            this.updateDisplay();
        }, 1000);

        // Check page visibility (pause if user switches tabs)
        this.setupVisibilityTracking();

        // Initial update
        this.updateDisplay();
    }

    setupVisibilityTracking() {
        // Track if user switches tabs/windows
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // User switched away - pause timer
                this.wasVisible = false;
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            } else {
                // User came back - resume timer
                if (!this.wasVisible && this.activeBounty) {
                    this.wasVisible = true;
                    this.startTimer();
                }
            }
        });
    }

    updateDisplay() {
        if (!this.activeBounty) return;

        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.requiredDuration - elapsed);
        const progress = Math.min(100, (elapsed / this.requiredDuration) * 100);

        // Update countdown
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        const countdownEl = document.getElementById('watch-countdown');
        if (countdownEl) {
            countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // Update progress bar
        const progressEl = document.getElementById('watch-progress-fill');
        if (progressEl) {
            progressEl.style.width = progress + '%';
        }

        // Check if complete
        if (remaining <= 0) {
            this.completeWatch();
        }
    }

    completeWatch() {
        console.log('=== BOUNTY COMPLETE ===');
        console.log('Active bounty:', this.activeBounty);

        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Award tokens
        console.log('Checking flowBank...', 'window.flowBank exists?', !!window.flowBank);
        console.log('  → typeof window.flowBank:', typeof window.flowBank);
        console.log('  → window.flowBank:', window.flowBank);

        if (window.flowBank && this.activeBounty) {
            console.log('Calling flowBank.addTokens...');
            console.log('Amount:', this.activeBounty.tokenAmount);
            console.log('Description:', `Bounty Payment - ${this.activeBounty.streamerName}`);

            const result = flowBank.addTokens(
                this.activeBounty.tokenAmount,
                `Bounty Payment - ${this.activeBounty.streamerName}`,
                'bounty'
            );
            console.log('addTokens returned:', result);
            console.log('New balance:', flowBank.getBalance());
        } else {
            console.error('❌ Cannot award tokens!');
            console.error('  → flowBank exists?', !!window.flowBank);
            console.error('  → activeBounty exists?', !!this.activeBounty);
            console.error('  → All loaded scripts:', Object.keys(window).filter(k => k.includes('Bank') || k.includes('flowbank')));
        }

        // Show completion notification
        this.showCompletionNotification();

        // Clear active bounty
        localStorage.removeItem(this.storageKey);
        this.activeBounty = null;
        this.startTime = null;

        // Remove overlay after a delay
        setTimeout(() => {
            const overlay = document.getElementById('bounty-watch-overlay');
            if (overlay) overlay.remove();
        }, 3000);
    }

    showCompletionNotification() {
        const notification = document.createElement('div');
        notification.className = 'watch-complete-notification active';
        notification.innerHTML = `
            <div class="complete-content">
                <div class="complete-icon">✓</div>
                <div class="complete-title">BOUNTY COMPLETE!</div>
                <div class="complete-tokens">+${this.activeBounty.tokenAmount} FLOW TOKENS</div>
            </div>
        `;

        document.body.appendChild(notification);

        // Play success sound
        if (window.sfx) {
            sfx.success();
            setTimeout(() => sfx.playTone(1200, 'sine', 0.3), 200);
        }

        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    cancelWatch() {
        // User navigated away before completion
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Remove overlay
        const overlay = document.getElementById('bounty-watch-overlay');
        if (overlay) overlay.remove();

        // Clear storage
        localStorage.removeItem(this.storageKey);
        this.activeBounty = null;
        this.startTime = null;
    }

    isWatching() {
        return this.activeBounty !== null;
    }
}

// Create global instance
console.log('Creating bountyWatchManager...');
const bountyWatchManager = new BountyWatchManager();
console.log('bountyWatchManager created:', bountyWatchManager);
window.bountyWatchManager = bountyWatchManager; // Explicitly add to window object
console.log('Added to window.bountyWatchManager');

// Cancel watch if user navigates away from channel page
window.addEventListener('beforeunload', function () {
    if (bountyWatchManager.isWatching() && !window.location.href.includes('channel.html')) {
        bountyWatchManager.cancelWatch();
    }
});

// Auto-resume if on channel page with active bounty
if (window.location.href.includes('channel.html')) {
    console.log('On channel.html, checking for active bounty...');
    console.log('bountyWatchManager.isWatching():', bountyWatchManager.isWatching());

    if (bountyWatchManager.isWatching()) {
        console.log('Active bounty found, resuming watch...');
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM loaded, calling resumeWatch()');
                bountyWatchManager.resumeWatch();
            });
        } else {
            console.log('DOM already loaded, calling resumeWatch()');
            bountyWatchManager.resumeWatch();
        }
    } else {
        console.log('No active bounty found');
    }
}
