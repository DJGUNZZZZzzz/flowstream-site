/**
 * VIVERSE Avatar Integration - Hybrid CDN Approach
 * Professional 3D avatar system for FlowStream
 */

// VIVERSE Configuration
const VIVERSE_CONFIG = {
    clientId: 'YOUR_CLIENT_ID', // Get from https://developer.viverse.com
    domain: 'account.htcvive.com',
    cookieDomain: '.viverse.com',
    baseURL: 'https://sdk-api.viverse.com/'
};

// Global instances
let viverseClient = null;
let avatarClient = null;
let currentAvatar = null;

/**
 * Initialize VIVERSE SDK
 */
async function initVIVERSE() {
    try {
        console.log('🎮 Initializing VIVERSE Avatar SDK...');

        // Initialize VIVERSE client
        viverseClient = new viverse.client({
            clientId: VIVERSE_CONFIG.clientId,
            domain: VIVERSE_CONFIG.domain,
            cookieDomain: VIVERSE_CONFIG.cookieDomain
        });

        console.log('✅ VIVERSE client initialized');

        // Check if user is already authenticated
        const isAuthenticated = await viverseClient.checkAuth();

        if (isAuthenticated) {
            console.log('✅ User already authenticated');
            await initAvatarClient();
        } else {
            console.log('⚠️ User not authenticated - login required');
            showLoginButton();
        }

    } catch (error) {
        console.error('❌ VIVERSE initialization error:', error);
        showError('Failed to initialize VIVERSE Avatar system');
    }
}

/**
 * Trigger VIVERSE login
 */
async function loginVIVERSE() {
    try {
        console.log('🔐 Starting VIVERSE login...');

        await viverseClient.loginWithWorlds();

        console.log('✅ Login successful');
        await initAvatarClient();

    } catch (error) {
        console.error('❌ Login error:', error);
        showError('Failed to login to VIVERSE');
    }
}

/**
 * Initialize Avatar Client
 */
async function initAvatarClient() {
    try {
        // Get access token
        const token = await viverseClient.getToken();
        console.log('✅ Access token obtained');

        // Initialize avatar client
        avatarClient = new viverse.avatar({
            baseURL: VIVERSE_CONFIG.baseURL,
            token: token
        });

        console.log('✅ Avatar client initialized');

        // Load user's avatars
        await loadUserAvatars();

    } catch (error) {
        console.error('❌ Avatar client error:', error);
        showError('Failed to initialize avatar client');
    }
}

/**
 * Load user's avatars
 */
async function loadUserAvatars() {
    try {
        console.log('📥 Loading user avatars...');

        // Get active avatar
        const activeAvatar = await avatarClient.getActiveAvatar();
        console.log('✅ Active avatar:', activeAvatar);

        if (activeAvatar) {
            currentAvatar = activeAvatar;
            displayAvatar(activeAvatar);
            saveAvatarToStorage(activeAvatar);
        }

        // Get all user avatars
        const avatarList = await avatarClient.getAvatarList();
        console.log('✅ Avatar list:', avatarList);

        displayAvatarList(avatarList);

    } catch (error) {
        console.error('❌ Load avatars error:', error);
        showError('Failed to load avatars');
    }
}

/**
 * Display avatar in profile
 */
function displayAvatar(avatar) {
    console.log('🎨 Displaying avatar:', avatar.id);

    // Update profile avatar with thumbnail
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar && avatar.headIconUrl) {
        profileAvatar.src = avatar.headIconUrl;
        profileAvatar.style.display = 'block';
    }

    // Display 3D avatar (optional)
    if (avatar.vrmUrl) {
        display3DAvatar(avatar.vrmUrl);
    }
}

/**
 * Display 3D avatar using Three.js
 */
function display3DAvatar(vrmUrl) {
    console.log('🎭 Loading 3D avatar:', vrmUrl);

    // Create Three.js scene
    const container = document.getElementById('avatar-3d-container');
    if (!container) {
        console.warn('⚠️ 3D container not found');
        return;
    }

    // Set up scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Load VRM
    const loader = new THREE.GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
        vrmUrl,
        (gltf) => {
            const vrm = gltf.userData.vrm;
            scene.add(vrm.scene);

            // Position camera
            camera.position.z = 2;

            // Render loop
            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }
            animate();

            console.log('✅ 3D avatar loaded');
        },
        (progress) => {
            console.log('Loading:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
        },
        (error) => {
            console.error('❌ VRM load error:', error);
        }
    );
}

/**
 * Display avatar list for selection
 */
function displayAvatarList(avatars) {
    console.log('📋 Displaying avatar list:', avatars.length);

    const listContainer = document.getElementById('avatar-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    avatars.forEach(avatar => {
        const avatarCard = document.createElement('div');
        avatarCard.className = 'avatar-card';
        avatarCard.innerHTML = `
            <img src="${avatar.headIconUrl}" alt="Avatar">
            <button onclick="selectAvatar('${avatar.id}')">Select</button>
        `;
        listContainer.appendChild(avatarCard);
    });
}

/**
 * Select an avatar
 */
async function selectAvatar(avatarId) {
    try {
        console.log('🎯 Selecting avatar:', avatarId);

        const avatarList = await avatarClient.getAvatarList();
        const selectedAvatar = avatarList.find(a => a.id === avatarId);

        if (selectedAvatar) {
            currentAvatar = selectedAvatar;
            displayAvatar(selectedAvatar);
            saveAvatarToStorage(selectedAvatar);
        }

    } catch (error) {
        console.error('❌ Select avatar error:', error);
    }
}

/**
 * Save avatar to localStorage
 */
function saveAvatarToStorage(avatar) {
    localStorage.setItem('viverseAvatar', JSON.stringify({
        id: avatar.id,
        vrmUrl: avatar.vrmUrl,
        headIconUrl: avatar.headIconUrl,
        timestamp: Date.now()
    }));
    console.log('💾 Avatar saved to storage');
}

/**
 * Load avatar from localStorage
 */
function loadAvatarFromStorage() {
    const stored = localStorage.getItem('viverseAvatar');
    if (stored) {
        const avatar = JSON.parse(stored);
        console.log('📦 Loaded avatar from storage:', avatar.id);
        displayAvatar(avatar);
        return avatar;
    }
    return null;
}

/**
 * Show login button
 */
function showLoginButton() {
    const button = document.createElement('button');
    button.className = 'avatar-customize-btn';
    button.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login to VIVERSE';
    button.onclick = loginVIVERSE;

    const container = document.querySelector('.avatar-section');
    if (container) {
        container.appendChild(button);
    }
}

/**
 * Show error message
 */
function showError(message) {
    console.error('❌', message);
    alert(message);
}

/**
 * Open VIVERSE Avatar Creator (fallback)
 */
function openVIVERSECreator() {
    window.open('https://avatar.viverse.com/avatar', '_blank', 'width=1200,height=800');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 VIVERSE Avatar Integration loaded');

    // Try to load from storage first
    const storedAvatar = loadAvatarFromStorage();

    // Initialize VIVERSE SDK
    if (typeof viverse !== 'undefined') {
        initVIVERSE();
    } else {
        console.error('❌ VIVERSE SDK not loaded');
        showError('VIVERSE SDK failed to load. Please refresh the page.');
    }
});

console.log('✓ VIVERSE Avatar Integration Script Loaded');
