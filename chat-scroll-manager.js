/* 
   ================================================
   CHAT AUTO-SCROLL MANAGER
   ================================================
   Handles smart auto-scrolling with pause/resume
*/

class ChatScrollManager {
    constructor() {
        this.chatFeed = null;
        this.chatRoom = null;
        this.isScrollPaused = false;
        this.pauseButton = null;
        this.scrollThreshold = 100; // pixels from bottom to consider "at bottom"
        this.ignoreScrollEvents = false; // Flag to ignore scroll events temporarily
    }

    init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.chatFeed = document.getElementById('chat-feed');
        this.chatRoom = document.querySelector('.chat-room');

        if (!this.chatFeed || !this.chatRoom) {
            console.warn('⚠️ Chat elements not found');
            return;
        }

        // Create pause button
        this.createPauseButton();

        // Listen for manual scrolling
        this.chatFeed.addEventListener('scroll', () => this.handleScroll());

        console.log('✓ Chat scroll manager initialized');
    }

    createPauseButton() {
        // Create button element
        this.pauseButton = document.createElement('button');
        this.pauseButton.id = 'chat-scroll-pause-btn';
        this.pauseButton.className = 'chat-scroll-pause-btn hidden';
        this.pauseButton.innerHTML = `
            <i class="fa-solid fa-arrow-down"></i>
            <span>Resume Scroll</span>
        `;

        // Add click handler
        this.pauseButton.addEventListener('click', () => this.resumeScroll());

        // Insert before quick emote bar
        const quickBar = document.getElementById('quick-bar');
        if (quickBar) {
            quickBar.parentNode.insertBefore(this.pauseButton, quickBar);
        }
    }

    handleScroll() {
        if (!this.chatFeed || this.ignoreScrollEvents) return;

        const isAtBottom = this.isScrolledToBottom();

        if (!isAtBottom && !this.isScrollPaused) {
            // User scrolled up, pause auto-scroll
            this.pauseAutoScroll();
        } else if (isAtBottom && this.isScrollPaused) {
            // User scrolled back to bottom, resume auto-scroll
            this.resumeAutoScroll();
        }
    }

    // Temporarily ignore scroll events (e.g., when emote directory toggles)
    ignoreScrollEventsTemporarily(duration = 500) {
        this.ignoreScrollEvents = true;
        setTimeout(() => {
            this.ignoreScrollEvents = false;
        }, duration);
    }

    isScrolledToBottom() {
        if (!this.chatFeed) return true;

        const scrollTop = this.chatFeed.scrollTop;
        const scrollHeight = this.chatFeed.scrollHeight;
        const clientHeight = this.chatFeed.clientHeight;

        return (scrollHeight - scrollTop - clientHeight) < this.scrollThreshold;
    }

    pauseAutoScroll() {
        this.isScrollPaused = true;
        this.pauseButton.classList.remove('hidden');
        console.log('⏸️ Auto-scroll paused');
    }

    resumeAutoScroll() {
        this.isScrollPaused = false;
        this.pauseButton.classList.add('hidden');
        console.log('▶️ Auto-scroll resumed');
    }

    resumeScroll() {
        // Ultra-smooth scroll to bottom with custom easing
        if (this.chatFeed) {
            this.smoothScrollTo(this.chatFeed, this.chatFeed.scrollHeight, 800);
        }
        this.resumeAutoScroll();
    }

    // Called by chat simulator when adding new messages
    scrollToBottomIfNotPaused() {
        if (!this.isScrollPaused && this.chatFeed) {
            // Ultra-smooth scroll to bottom with custom easing
            this.smoothScrollTo(this.chatFeed, this.chatFeed.scrollHeight, 600);
        }
    }

    // Custom smooth scroll with easing for buttery smooth animation
    smoothScrollTo(element, target, duration) {
        const start = element.scrollTop;
        const change = target - start;
        const startTime = performance.now();

        // Easing function - ease-in-out cubic (iPhone-like)
        const easeInOutCubic = (t) => {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);

            element.scrollTop = start + (change * eased);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }
}

// Create global instance
const chatScrollManager = new ChatScrollManager();
window.chatScrollManager = chatScrollManager;

// Initialize
chatScrollManager.init();

console.log('✓ chat-scroll-manager.js loaded');
