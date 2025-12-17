/*
   ================================================
   TERMINAL CHAT FUNCTIONALITY
   ================================================
   Handles chat input, sending, and syncing to pop-out windows
*/

(function () {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTerminalChat);
    } else {
        initTerminalChat();
    }

    function initTerminalChat() {
        const chatInput = document.getElementById('terminal-chat-input');
        const chatSend = document.getElementById('terminal-chat-send');
        const chatFeed = document.getElementById('terminal-chat-feed');

        if (!chatInput || !chatSend || !chatFeed) return;

        // Random user colors for demo
        const userColors = ['#0ff', '#ff0055', '#00ff88', '#ffaa00', '#ff00ff', '#00ffff'];
        const userName = 'You'; // Could be dynamic based on logged-in user

        // Send message function
        function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;

            // Create message element
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';

            const userSpan = document.createElement('span');
            userSpan.className = 'user';
            userSpan.style.color = userColors[Math.floor(Math.random() * userColors.length)];
            userSpan.textContent = userName + ':';

            const textSpan = document.createElement('span');
            textSpan.className = 'text';
            textSpan.textContent = ' ' + message;

            messageDiv.appendChild(userSpan);
            messageDiv.appendChild(textSpan);

            // Add to main chat feed
            chatFeed.appendChild(messageDiv);
            chatFeed.scrollTop = chatFeed.scrollHeight;

            // Sync to all pop-out windows
            syncToPopoutWindows(messageDiv.outerHTML);

            // Clear input
            chatInput.value = '';

            // Play sound effect if available
            if (window.sfx) sfx.click();
        }

        // Sync message to pop-out windows
        function syncToPopoutWindows(messageHTML) {
            // Store message in localStorage for pop-out windows to pick up
            const messages = JSON.parse(localStorage.getItem('terminal_chat_messages') || '[]');
            messages.push({
                html: messageHTML,
                timestamp: Date.now()
            });

            // Keep only last 100 messages
            if (messages.length > 100) {
                messages.shift();
            }

            localStorage.setItem('terminal_chat_messages', JSON.stringify(messages));

            // Trigger storage event for pop-out windows
            window.dispatchEvent(new Event('storage'));
        }

        // Listen for Enter key
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });

        // Listen for Send button click
        chatSend.addEventListener('click', sendMessage);

        // Listen for messages from other windows (for pop-outs)
        window.addEventListener('storage', function (e) {
            if (e.key === 'terminal_chat_messages') {
                const messages = JSON.parse(e.newValue || '[]');
                if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];

                    // Check if this message is already in our feed
                    const existingMessages = chatFeed.querySelectorAll('.message');
                    const lastExisting = existingMessages[existingMessages.length - 1];

                    if (!lastExisting || lastExisting.outerHTML !== lastMessage.html) {
                        chatFeed.insertAdjacentHTML('beforeend', lastMessage.html);
                        chatFeed.scrollTop = chatFeed.scrollHeight;
                    }
                }
            }
        });

        // Hover effect on send button
        chatSend.addEventListener('mouseenter', function () {
            this.style.background = '#ff1166';
            this.style.transform = 'scale(1.05)';
        });

        chatSend.addEventListener('mouseleave', function () {
            this.style.background = '#ff0055';
            this.style.transform = 'scale(1)';
        });

        console.log('✓ Terminal Chat Functionality Initialized');
    }
})();
