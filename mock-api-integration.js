/* 
   ================================================
   MOCK API INTEGRATION - Demo & Testing
   ================================================
   Demonstrates how to use the mock API layer
   Shows example API calls and integration patterns
*/

console.log('🔗 mock-api-integration.js loading...');

// Wait for all dependencies to load
function initMockAPIIntegration() {
    if (!window.mockAPI || !window.mockData) {
        console.warn('⚠️ Mock API not ready, retrying...');
        setTimeout(initMockAPIIntegration, 100);
        return;
    }

    console.log('🔗 Initializing Mock API Integration...');

    // ==========================================
    // DEMO: Fetch live streams on browse page
    // ==========================================
    if (window.location.pathname.includes('browse.html') || window.location.pathname.includes('index.html')) {
        loadLiveStreams();
    }

    // ==========================================
    // DEMO: Load chat history on channel page
    // ==========================================
    if (window.location.pathname.includes('channel.html')) {
        loadChatHistory();
        setupChatSending();
    }

    // ==========================================
    // DEMO: Load user profile data
    // ==========================================
    if (window.location.pathname.includes('profile.html')) {
        loadUserProfile();
    }

    // ==========================================
    // DEMO: Load subscriptions
    // ==========================================
    if (window.location.pathname.includes('subscriptions.html')) {
        loadSubscriptions();
    }

    console.log('✓ Mock API Integration initialized');
}

// Load live streams example
async function loadLiveStreams() {
    try {
        console.log('📺 Loading live streams...');
        const response = await window.mockAPI.getLiveStreams(20, 0);

        if (response.success) {
            console.log(`✓ Loaded ${response.data.streams.length} streams`);
            // You can now use response.data.streams to populate the UI
            // Example: updateStreamGrid(response.data.streams);
        }
    } catch (error) {
        console.error('❌ Failed to load streams:', error);
    }
}

// Load chat history example
async function loadChatHistory() {
    try {
        console.log('💬 Loading chat history...');
        const response = await window.mockAPI.getChatHistory('channel_123', 30);

        if (response.success) {
            console.log(`✓ Loaded ${response.data.length} chat messages`);

            // Add messages to chat feed
            const chatFeed = document.getElementById('chat-feed');
            if (chatFeed) {
                // Keep existing messages and add new ones
                response.data.slice(0, 10).forEach(msg => {
                    const messageEl = document.createElement('div');
                    messageEl.className = 'message';
                    messageEl.innerHTML = `
                        <span class="user" style="color:${msg.userColor}">${msg.username}:</span> 
                        <span class="text">${msg.message}</span>
                    `;
                    chatFeed.appendChild(messageEl);
                });

                // Auto-scroll to bottom
                chatFeed.scrollTop = chatFeed.scrollHeight;
            }
        }
    } catch (error) {
        console.error('❌ Failed to load chat:', error);
    }
}

// Setup chat message sending
function setupChatSending() {
    const chatInput = document.getElementById('chat-input-field');
    const sendBtn = document.querySelector('.send-btn');

    if (!chatInput || !sendBtn) return;

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        try {
            console.log('📤 Sending message:', message);
            const response = await window.mockAPI.sendChatMessage('channel_123', message);

            if (response.success) {
                // Add message to chat feed
                const chatFeed = document.getElementById('chat-feed');
                if (chatFeed) {
                    const messageEl = document.createElement('div');
                    messageEl.className = 'message';
                    messageEl.innerHTML = `
                        <span class="user" style="color:${response.data.userColor}">${response.data.username}:</span> 
                        <span class="text">${response.data.message}</span>
                    `;
                    chatFeed.appendChild(messageEl);
                    chatFeed.scrollTop = chatFeed.scrollHeight;
                }

                // Clear input
                chatInput.value = '';

                console.log('✓ Message sent');
            }
        } catch (error) {
            console.error('❌ Failed to send message:', error);
        }
    };

    // Send on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Load user profile example
async function loadUserProfile() {
    try {
        console.log('👤 Loading user profile...');
        const response = await window.mockAPI.getCurrentUser();

        if (response.success) {
            console.log('✓ Profile loaded:', response.data.username);
            // You can now use response.data to populate profile UI
        }
    } catch (error) {
        console.error('❌ Failed to load profile:', error);
    }
}

// Load subscriptions example
async function loadSubscriptions() {
    try {
        console.log('⭐ Loading subscriptions...');
        const [followedResponse, subsResponse] = await Promise.all([
            window.mockAPI.getFollowedChannels(),
            window.mockAPI.getSubscriptions()
        ]);

        if (followedResponse.success) {
            console.log(`✓ Loaded ${followedResponse.data.length} followed channels`);
        }

        if (subsResponse.success) {
            console.log(`✓ Loaded ${subsResponse.data.length} subscriptions`);
        }
    } catch (error) {
        console.error('❌ Failed to load subscriptions:', error);
    }
}

// ==========================================
// EXAMPLE: Using Mock API for token operations
// ==========================================

// Example: Earn tokens
async function exampleEarnTokens() {
    try {
        const response = await window.mockAPI.earnTokens(100, 'Completed Challenge');
        if (response.success) {
            console.log('💎 Earned 100 tokens!');
        }
    } catch (error) {
        console.error('❌ Failed to earn tokens:', error);
    }
}

// Example: Get leaderboard
async function exampleGetLeaderboard() {
    try {
        const response = await window.mockAPI.getLeaderboard('global', 10);
        if (response.success) {
            console.log('🏆 Leaderboard:', response.data);
        }
    } catch (error) {
        console.error('❌ Failed to get leaderboard:', error);
    }
}

// Make examples available globally for testing
window.mockAPIExamples = {
    earnTokens: exampleEarnTokens,
    getLeaderboard: exampleGetLeaderboard
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMockAPIIntegration);
} else {
    initMockAPIIntegration();
}

console.log('✓ mock-api-integration.js loaded');
console.log('💡 Try these in console: mockAPIExamples.earnTokens(), mockAPIExamples.getLeaderboard()');
