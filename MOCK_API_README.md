# Mock API Layer - Documentation

## Overview

The Mock API Layer simulates all backend functionality for the Flow Streaming Site, allowing full frontend development and testing without requiring a real server or database.

## Files Created

### Core Files

1. **`mock-data.js`** - Data generator
   - Generates realistic users, streams, chat messages, transactions
   - Includes curated video URLs for HTML5 playback
   - Seeded random generation for consistent data

2. **`mock-api.js`** - API service layer
   - Simulates network delays (100-500ms)
   - Implements all API endpoints
   - Includes 2% random failure rate for realistic testing
   - Easy to swap with real API later

3. **`video-player.js`** - Video playback controller
   - Replaces static images with HTML5 `<video>` elements
   - Play/pause, volume, quality selection, fullscreen
   - Keyboard shortcuts (Space, F, M)
   - Simulated live viewer count updates
   - Fallback to images if videos fail

4. **`mock-api-integration.js`** - Integration examples
   - Demonstrates how to use the mock API
   - Auto-loads chat history, streams, subscriptions
   - Provides example functions for testing

5. **`video-player-styles.css`** - Video player CSS
   - Smooth transitions and loading states
   - Fullscreen support
   - Responsive design
   - Loading spinners and error states

## API Endpoints

### Authentication
- `login(username, password)` - User login
- `signup(username, email, password)` - User registration
- `logout()` - Sign out
- `getCurrentUser()` - Get current user data

### User Profile
- `getProfile(userId)` - Get user profile
- `updateProfile(userId, profileData)` - Update profile
- `uploadAvatar(userId, imageFile)` - Upload avatar

### Streaming
- `getLiveStreams(limit, offset)` - Get live streams
- `getStream(streamId)` - Get specific stream
- `followChannel(channelId)` - Follow a channel
- `unfollowChannel(channelId)` - Unfollow
- `subscribeToChannel(channelId, tier)` - Subscribe

### Chat
- `getChatHistory(channelId, limit)` - Get chat messages
- `sendChatMessage(channelId, message)` - Send message

### Token Economy
- `getTokenBalance()` - Get Flow Token balance
- `getTransactionHistory(limit)` - Get transactions
- `earnTokens(amount, reason)` - Award tokens
- `spendTokens(amount, reason)` - Spend tokens

### Leaderboard
- `getLeaderboard(type, limit)` - Get rankings
- `getUserRank(userId)` - Get user's rank

### Netrunner University
- `getChallenges(level)` - Get challenges
- `submitChallengeAnswer(challengeId, answer)` - Submit answer
- `getUserProgress()` - Get progress stats

### Subscriptions
- `getFollowedChannels()` - Get followed channels
- `getSubscriptions()` - Get subscriptions

## Usage Examples

### Basic API Call
```javascript
// Get live streams
const response = await window.mockAPI.getLiveStreams(20, 0);
if (response.success) {
    console.log('Streams:', response.data.streams);
}
```

### Send Chat Message
```javascript
const response = await window.mockAPI.sendChatMessage('channel_123', 'Hello!');
if (response.success) {
    // Add message to UI
    console.log('Message sent:', response.data);
}
```

### Earn Tokens
```javascript
await window.mockAPI.earnTokens(100, 'Completed Challenge');
```

### Testing in Console
```javascript
// Available test functions
mockAPIExamples.earnTokens();
mockAPIExamples.getLeaderboard();
```

## Video Player Features

### Keyboard Shortcuts
- **Space** - Play/Pause
- **F** - Toggle Fullscreen
- **M** - Toggle Mute

### Automatic Features
- Auto-replaces `<img class="video-feed">` with `<video>` elements
- Simulates live viewer count changes every 5-15 seconds
- Fallback to poster images if video fails to load
- Smooth transitions and loading states

### Video Sources
Currently using sample videos from Google's test bucket:
- BigBuckBunny.mp4
- ElephantsDream.mp4
- ForBiggerBlazes.mp4
- ForBiggerEscapes.mp4

**Note:** Replace these with your own gaming videos or YouTube embeds when ready.

## Integration

### Pages Updated
- ✅ `channel.html` - Full video player + chat integration
- ✅ `index.html` - Mock API for streams and data

### Pages Ready for Integration
- `browse.html` - Add mock API scripts
- `terminal.html` - Add mock API scripts
- `profile.html` - Add mock API scripts
- `subscriptions.html` - Add mock API scripts

### How to Add to Other Pages
Add these scripts before your main `script.js`:
```html
<!-- Mock API Layer (load first) -->
<script src="mock-data.js"></script>
<script src="mock-api.js"></script>
<script src="mock-api-integration.js"></script>
```

For pages with video players, also add:
```html
<script src="video-player.js"></script>
<link rel="stylesheet" href="video-player-styles.css">
```

## Switching to Real API

When your backend is ready, you only need to update `mock-api.js`:

1. Replace mock functions with real `fetch()` calls
2. Update endpoints to point to your server
3. Remove simulated delays
4. Keep the same function signatures

Example:
```javascript
// Before (Mock)
async login(username, password) {
    await this.delay();
    return { success: true, data: mockUser };
}

// After (Real)
async login(username, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return await response.json();
}
```

## Testing

### Console Testing
Open browser console and try:
```javascript
// Test data generation
mockData.generateUser()
mockData.generateStream()
mockData.generateChatMessage()

// Test API calls
await mockAPI.getLiveStreams(5, 0)
await mockAPI.sendChatMessage('test', 'Hello!')
await mockAPI.earnTokens(100, 'Test')
```

### Video Player Testing
1. Open `channel.html`
2. Videos should autoplay (muted)
3. Test controls: play/pause, volume, quality, fullscreen
4. Watch viewer count update every 5-15 seconds
5. Try keyboard shortcuts

## Next Steps

1. **Add to Remaining Pages** - Integrate mock API into browse, terminal, profile, subscriptions
2. **Custom Videos** - Replace sample videos with gaming content
3. **Enhanced Chat** - Add WebSocket simulation for real-time chat
4. **Demo Mode** - Create a "demo" button to showcase all features
5. **Backend Development** - Start building real API endpoints

## Support

All mock API functions log to console for debugging. Check browser console for:
- 🎲 Mock data generation
- 🌐 API calls and responses
- 📹 Video player events
- 💬 Chat integration

## Performance

- Network delays: 100-500ms (configurable)
- Failure rate: 2% (configurable)
- Video autoplay: Muted by default (browser requirement)
- Viewer updates: Every 5-15 seconds
