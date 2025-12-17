/* 
   ================================================
   SUBSCRIPTIONS UI - Display & Manage Lists
   ================================================
   Handles UI for feeds, feeders, subscriptions, subscribers
*/

console.log('📡 subscriptions-ui.js loading...');

// Wait for subscriptions manager to be ready
function initSubscriptionsUI() {
    if (!window.subscriptionsManager) {
        console.warn('⚠️ Subscriptions manager not found, retrying...');
        setTimeout(initSubscriptionsUI, 500);
        return;
    }

    console.log('📡 Initializing subscriptions UI...');

    // Update stats
    updateStats();

    // Setup tabs
    setupTabs();

    // Load initial data
    loadFeeds();
    loadFeeders();
    loadSubscriptions();
    loadSubscribers();

    console.log('✓ Subscriptions UI initialized');
}

function updateStats() {
    const stats = window.subscriptionsManager.getStats();

    document.getElementById('feeds-count').textContent = stats.feedsCount;
    document.getElementById('feeders-count').textContent = stats.feedersCount;
    document.getElementById('subs-count').textContent = stats.subscriptionsCount;
    document.getElementById('subscribers-count').textContent = stats.subscribersCount;
}

function setupTabs() {
    const tabs = document.querySelectorAll('.sub-tab');
    const panels = document.querySelectorAll('.sub-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active to clicked
            tab.classList.add('active');
            const panelId = tab.dataset.tab + '-panel';
            document.getElementById(panelId).classList.add('active');

            if (window.sfx) window.sfx.click();
        });
    });
}

function loadFeeds() {
    const feeds = window.subscriptionsManager.getFeeds();
    const container = document.getElementById('feeds-list');

    if (feeds.length === 0) {
        container.innerHTML = getEmptyState('No feeds yet', 'Follow channels to see them here');
        return;
    }

    container.innerHTML = feeds.map(username => createUserCard(username, 'feed')).join('');
    attachUnfollowHandlers();
}

function loadFeeders() {
    const feeders = window.subscriptionsManager.getFeeders();
    const container = document.getElementById('feeders-list');

    if (feeders.length === 0) {
        container.innerHTML = getEmptyState('No feeders yet', 'Users who follow you will appear here');
        return;
    }

    container.innerHTML = feeders.map(username => createUserCard(username, 'feeder')).join('');
}

function loadSubscriptions() {
    const subscriptions = window.subscriptionsManager.getSubscriptions();
    const container = document.getElementById('subscriptions-list');

    if (subscriptions.length === 0) {
        container.innerHTML = getEmptyState('No subscriptions yet', 'Subscribe to channels to support them');
        return;
    }

    container.innerHTML = subscriptions.map(username => createUserCard(username, 'subscription')).join('');
    attachUnsubscribeHandlers();
}

function loadSubscribers() {
    const subscribers = window.subscriptionsManager.getSubscribers();
    const container = document.getElementById('subscribers-list');

    if (subscribers.length === 0) {
        container.innerHTML = getEmptyState('No subscribers yet', 'Users who subscribe to you will appear here');
        return;
    }

    container.innerHTML = subscribers.map(username => createUserCard(username, 'subscriber')).join('');
}

function createUserCard(username, type) {
    const showUnfollow = type === 'feed';
    const showUnsub = type === 'subscription';

    return `
        <div class="user-card">
            <img src="https://via.placeholder.com/60" alt="${username}" class="user-avatar">
            <div class="user-info">
                <div class="user-name">${username}</div>
                <div class="user-status">
                    ${type === 'feed' ? '<i class="fa-solid fa-rss"></i> Following' : ''}
                    ${type === 'feeder' ? '<i class="fa-solid fa-user"></i> Follows you' : ''}
                    ${type === 'subscription' ? '<i class="fa-solid fa-star"></i> Subscribed' : ''}
                    ${type === 'subscriber' ? '<i class="fa-solid fa-crown"></i> Subscriber' : ''}
                </div>
            </div>
            <div class="user-actions">
                ${showUnfollow ? `<button class="action-btn unfollow-btn" data-username="${username}">
                    <i class="fa-solid fa-user-minus"></i> UNFOLLOW
                </button>` : ''}
                ${showUnsub ? `<button class="action-btn unsub-btn" data-username="${username}">
                    <i class="fa-solid fa-star-half-stroke"></i> UNSUBSCRIBE
                </button>` : ''}
                <a href="channel.html" class="action-btn view-btn">
                    <i class="fa-solid fa-eye"></i> VIEW
                </a>
            </div>
        </div>
    `;
}

function getEmptyState(title, description) {
    return `
        <div class="empty-state">
            <i class="fa-solid fa-inbox"></i>
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
    `;
}

function attachUnfollowHandlers() {
    document.querySelectorAll('.unfollow-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const username = btn.dataset.username;
            window.subscriptionsManager.removeFeed(username);
            loadFeeds();
            updateStats();
            if (window.sfx) window.sfx.success();
        });
    });
}

function attachUnsubscribeHandlers() {
    document.querySelectorAll('.unsub-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const username = btn.dataset.username;
            window.subscriptionsManager.removeSubscription(username);
            loadSubscriptions();
            updateStats();
            if (window.sfx) window.sfx.success();
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubscriptionsUI);
} else {
    initSubscriptionsUI();
}

console.log('✓ subscriptions-ui.js loaded');
