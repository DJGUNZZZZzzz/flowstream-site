/**
 * Simple VRM Avatar Upload - 3D Display
 * No registration, no API keys - works immediately!
 */

// Three.js scene setup
let scene, camera, renderer, currentVRM;

/**
 * Initialize Three.js scene for 3D avatar display
 */
function init3DScene() {
    const container = document.getElementById('avatar-3d-container');
    if (!container) {
        console.warn('⚠️ 3D container not found');
        return;
    }

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        30,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );
    camera.position.set(0, 1.4, 3);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Add lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate avatar slowly
        if (currentVRM) {
            currentVRM.scene.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }
    animate();

    console.log('✅ 3D scene initialized');
}

/**
 * Load and display VRM avatar
 */
function loadVRMAvatar(vrmUrl) {
    console.log('🎭 Loading VRM avatar...');

    // Wait for loaders to be ready
    if (!window.GLTFLoader || !window.VRMLoaderPlugin) {
        console.error('❌ Loaders not ready yet, retrying...');
        setTimeout(() => loadVRMAvatar(vrmUrl), 100);
        return;
    }

    // Load VRM
    const loader = new window.GLTFLoader();
    loader.register((parser) => new window.VRMLoaderPlugin(parser));

    loader.load(
        vrmUrl,
        (gltf) => {
            // Remove previous avatar
            if (currentVRM) {
                scene.remove(currentVRM.scene);
            }

            // Add new avatar
            currentVRM = gltf.userData.vrm;
            scene.add(currentVRM.scene);

            // Center avatar
            currentVRM.scene.position.set(0, 0, 0);

            console.log('✅ VRM avatar loaded successfully');

            // Update thumbnail
            updateAvatarThumbnail();
        },
        (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`Loading: ${percent}%`);
        },
        (error) => {
            console.error('❌ VRM load error:', error);
            alert('Failed to load VRM avatar. Please try a different file.');
        }
    );
}

/**
 * IndexedDB helper for storing large VRM files
 */
const DB_NAME = 'FlowStreamAvatars';
const DB_VERSION = 1;
const STORE_NAME = 'vrm';

let db = null;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

// Save VRM to IndexedDB
function saveVRMToDB(blob, filename) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const data = {
            blob: blob,
            filename: filename,
            timestamp: Date.now()
        };

        const request = store.put(data, 'userVRM');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Load VRM from IndexedDB
function loadVRMFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('userVRM');

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Handle VRM file upload
 */
function handleVRMUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.endsWith('.vrm')) {
        alert('Please upload a .vrm file');
        return;
    }

    console.log('📁 VRM file selected:', file.name);
    console.log('📏 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Save blob to IndexedDB
    saveVRMToDB(file, file.name)
        .then(() => {
            console.log('💾 VRM saved to IndexedDB');

            // Load and display
            const url = URL.createObjectURL(file);
            loadVRMAvatar(url);
        })
        .catch(error => {
            console.error('❌ Failed to save VRM:', error);
            alert('Failed to save avatar. Please try a smaller file.');
        });
}

/**
 * Update avatar thumbnail in profile
 */
function updateAvatarThumbnail() {
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        // Use a 3D avatar icon
        profileAvatar.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%2300ffff" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23000" font-size="60">3D</text></svg>';
        profileAvatar.style.display = 'block';
    }
}

/**
 * Load saved VRM from IndexedDB
 */
async function loadSavedVRM() {
    try {
        const data = await loadVRMFromDB();

        if (data && data.blob) {
            console.log('📦 Loading saved VRM:', data.filename);
            const url = URL.createObjectURL(data.blob);
            loadVRMAvatar(url);
        }
    } catch (error) {
        console.log('No saved VRM found');
    }
}

/**
 * Clear avatar
 */
function clearAvatar() {
    if (confirm('Clear your avatar?')) {
        // Clear from IndexedDB
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete('userVRM');

        if (currentVRM) {
            scene.remove(currentVRM.scene);
            currentVRM = null;
        }

        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            profileAvatar.style.display = 'none';
        }

        console.log('🗑️ Avatar cleared');
    }
}

/**
 * Open PlayerZero Creator (External)
 */
function openPlayerZeroCreator() {
    // Open PlayerZero in new window
    const playerZeroWindow = window.open('https://playerzero.me', '_blank', 'width=1200,height=800');

    // Show instructions
    setTimeout(() => {
        alert('📋 Instructions:\n\n1. Create your avatar on PlayerZero\n2. Look at the URL - find "id=" parameter\n3. Copy the ID after "id="\n4. Come back and paste it below\n5. Click "Load PlayerZero Avatar"\n\nExample URL:\nplayerzero.readyplayer.me/avatar?id=ABC123\nCopy: ABC123');
    }, 500);

    console.log('🎮 Opened PlayerZero creator');
}

/**
 * Open VIVERSE Avatar Creator
 */
function openVIVERSECreator() {
    window.open('https://avatar.viverse.com/avatar', '_blank', 'width=1200,height=800');
}

/**
 * Load PlayerZero avatar by ID
 */
function loadPlayerZeroAvatar() {
    const avatarId = document.getElementById('playerzero-id').value.trim();

    if (!avatarId) {
        alert('Please enter your PlayerZero Avatar ID');
        return;
    }

    console.log('🎮 Loading PlayerZero avatar:', avatarId);

    // PlayerZero/RPM API endpoint for GLB
    const glbUrl = `https://models.readyplayer.me/${avatarId}.glb`;

    console.log('📡 Fetching GLB from:', glbUrl);

    // Load the GLB avatar
    loadVRMAvatar(glbUrl);

    // Save to IndexedDB for persistence
    fetch(glbUrl)
        .then(res => {
            if (!res.ok) throw new Error('Avatar not found');
            return res.blob();
        })
        .then(blob => {
            saveVRMToDB(blob, `playerzero_${avatarId}.glb`)
                .then(() => {
                    console.log('💾 PlayerZero avatar saved');
                    alert('✅ PlayerZero avatar loaded successfully!');
                })
                .catch(err => {
                    console.error('❌ Failed to save:', err);
                });
        })
        .catch(err => {
            console.error('❌ Failed to fetch PlayerZero avatar:', err);
            alert('❌ Failed to load avatar. Please check the ID and try again.\n\nMake sure you copied the ID from the URL correctly.');
        });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 VRM Avatar System Loaded');

    // Initialize IndexedDB
    try {
        await initDB();
        console.log('✅ IndexedDB initialized');
    } catch (error) {
        console.error('❌ IndexedDB initialization failed:', error);
        alert('Failed to initialize storage. Avatar saving may not work.');
    }

    // Initialize 3D scene
    init3DScene();

    // Load saved avatar
    await loadSavedVRM();

    // Set up file input
    const fileInput = document.getElementById('vrm-upload');
    if (fileInput) {
        fileInput.addEventListener('change', handleVRMUpload);
    }
});

console.log('✓ VRM Avatar System Ready');
