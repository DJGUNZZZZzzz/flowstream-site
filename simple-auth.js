/* 
   ================================================
   SIMPLE AUTH - localStorage-based Authentication
   ================================================
   Manages sign-in state and UI visibility
*/

console.log('🔐 simple-auth.js loading...');

// Simple authentication manager
const simpleAuth = {
    // Check if user is signed in
    isSignedIn() {
        return localStorage.getItem('user_signed_in') === 'true';
    },

    // Get current username
    getUsername() {
        return localStorage.getItem('netrunner_username') || 'Guest';
    },

    // Sign in
    signIn(username) {
        localStorage.setItem('user_signed_in', 'true');
        localStorage.setItem('netrunner_username', username || 'Netrunner');
        console.log(`✓ User signed in: ${username}`);
        this.updateUI();
    },

    // Sign out
    signOut() {
        localStorage.removeItem('user_signed_in');
        console.log('✓ User signed out');
        this.updateUI();
    },

    // Update UI based on auth state
    updateUI() {
        const isSignedIn = this.isSignedIn();
        console.log(`🔄 Updating UI, signed in: ${isSignedIn}`);

        // Show/hide level display in navbar
        const levelDisplay = document.getElementById('level-points-display');
        if (levelDisplay) {
            levelDisplay.style.display = isSignedIn ? 'flex' : 'none';
            console.log(`  → Level display: ${isSignedIn ? 'visible' : 'hidden'}`);
        }

        // Update login/signup buttons
        const loginBtn = document.querySelector('.login-btn');
        const signupBtn = document.querySelector('.signup-btn');
        const userAvatar = document.querySelector('.user-avatar');

        if (isSignedIn) {
            // Show avatar, hide login/signup
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (userAvatar) userAvatar.style.display = 'block';
        } else {
            // Show login/signup, hide avatar
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            if (userAvatar) userAvatar.style.display = 'none';
        }
    }
};

// Make available globally
window.simpleAuth = simpleAuth;

// Initialize on page load
function initAuth() {
    console.log('🔐 Initializing auth system...');
    simpleAuth.updateUI();

    // Auto sign-in for testing (remove this in production)
    if (!simpleAuth.isSignedIn()) {
        console.log('📝 Auto-signing in for testing...');
        simpleAuth.signIn('TestUser');
    }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

console.log('✓ simple-auth.js loaded');
