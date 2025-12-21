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
    camera.position.set(0, 0.5, 3.5); // Lowered camera for better full-body framing

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
 * Display avatar - 2D thumbnail (reliable)
 */
function loadGLBAvatar(glbUrl) {
    console.log('🎭 Loading avatar thumbnail...');
    console.log('📦 GLB URL:', glbUrl);

    // Show 2D thumbnail (RPM's PNG export)
    const thumbnailUrl = glbUrl.replace('.glb', '.png');

    let avatarDisplay = document.getElementById('avatar-display-image');
    if (!avatarDisplay) {
        const container = document.getElementById('avatar-model-viewer').parentElement;
        avatarDisplay = document.createElement('img');
        avatarDisplay.id = 'avatar-display-image';
        avatarDisplay.style.cssText = 'width: 100%; height: 650px; margin-top: 20px; border: 2px solid #00ffff; border-radius: 10px; background: #0a0a0a; object-fit: contain; display: none;';
        container.appendChild(avatarDisplay);
    }

    // Show only on successful load
    avatarDisplay.onload = () => {
        avatarDisplay.style.display = 'block';
        console.log('✅ Avatar thumbnail displayed:', thumbnailUrl);
    };
    avatarDisplay.onerror = () => {
        avatarDisplay.style.display = 'none';
        console.error('❌ Failed to load avatar thumbnail');
    };

    avatarDisplay.src = thumbnailUrl;
}

/**
 * Fallback: Load GLB using Three.js (kept for compatibility)
 */
function loadGLBAvatarThreeJS(glbUrl) {
    console.log('🎭 [FALLBACK] Loading GLB avatar with Three.js...');

    if (!window.GLTFLoader) {
        console.error('❌ Loader not ready yet, retrying...');
        setTimeout(() => loadGLBAvatarThreeJS(glbUrl), 100);
        return;
    }

    const loader = window.configuredGLTFLoader || new window.GLTFLoader();
    console.log('📦 Using loader:', window.configuredGLTFLoader ? 'Pre-configured with DRACO' : 'Basic GLTFLoader');

    loader.load(
        glbUrl,
        (gltf) => {
            if (currentVRM) {
                scene.remove(currentVRM.scene);
            }
            currentVRM = { scene: gltf.scene };
            scene.add(currentVRM.scene);
            currentVRM.scene.position.set(0, -1.0, 0);
            currentVRM.scene.scale.set(1, 1, 1);
            console.log('✅ GLB avatar loaded successfully');
            updateAvatarThumbnail();
        },
        (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`Loading: ${percent}%`);
        },
        (error) => {
            console.error('❌ GLB load error:', error);
            alert('Failed to load GLB avatar. Please try a different file.');
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
 * Update avatar thumbnail in profile and sidebar
 */
function updateAvatarThumbnail() {
    // Capture the 3D scene as an image
    if (renderer && currentVRM) {
        // Wait a moment for the scene to fully render
        setTimeout(() => {
            // Save current camera position
            const originalCamPos = camera.position.clone();
            const originalLookAt = new THREE.Vector3(0, 0, 0);

            // Render full body for profile
            renderer.render(scene, camera);
            const fullBodyUrl = renderer.domElement.toDataURL('image/png');

            // Hide the static profile avatar - user wants spinning 3D avatar only
            const profileAvatar = document.getElementById('profileAvatar');
            if (profileAvatar) {
                profileAvatar.style.display = 'none'; // Keep it hidden
                console.log('✅ Profile avatar hidden - showing spinning 3D avatar');
            }

            // Zoom in for face closeup for sidebar
            camera.position.set(0, 0.8, 1.2); // Closer for face, adjusted for lower avatar
            camera.lookAt(0, 0.6, 0); // Look at face height (0.6)
            renderer.render(scene, camera);
            const faceCloseupUrl = renderer.domElement.toDataURL('image/png');

            // Restore camera position
            camera.position.copy(originalCamPos);
            camera.lookAt(originalLookAt);

            // Update sidebar avatar (face closeup)
            const sidebarAvatar = document.getElementById('sidebar-avatar');
            if (sidebarAvatar) {
                sidebarAvatar.src = faceCloseupUrl;
                sidebarAvatar.style.display = 'block';
                console.log('✅ Sidebar avatar updated with face closeup');
                console.log('Sidebar avatar src length:', faceCloseupUrl.length);
            } else {
                console.error('❌ sidebar-avatar element not found');
            }
        }, 500); // Wait 500ms for scene to render
    }
}

/**
 * Load saved VRM/GLB from IndexedDB
 */
async function loadSavedVRM() {
    // DISABLED: Don't auto-load avatar - user must click "Load Avatar" button
    console.log('ℹ️ Auto-load disabled');
    return;

    try {
        const data = await loadVRMFromDB();

        if (data && data.blob) {
            console.log('📦 Loading saved avatar:', data.filename);
            const url = URL.createObjectURL(data.blob);

            // Check if it's a GLB file (Ready Player Me) or VRM file
            if (data.filename && data.filename.includes('.glb')) {
                console.log('Loading as GLB (Ready Player Me)');
                loadGLBAvatar(url);
            } else {
                console.log('Loading as VRM');
                loadVRMAvatar(url);
            }
        }
    } catch (error) {
        console.log('No saved avatar found');
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
    // Open Ready Player Me Demo (publicly accessible avatars)
    const rpmWindow = window.open('https://demo.readyplayer.me', '_blank', 'width=1200,height=800');

    // Show instructions
    setTimeout(() => {
        alert('📋 Instructions:\n\n1. Create your avatar on Ready Player Me\n2. Look at the URL - find "id=" parameter\n3. Copy the ID after "id="\n4. Come back and paste it below\n5. Click "Load PlayerZero Avatar"\n\nExample URL:\ndemo.readyplayer.me/avatar?id=ABC123\nCopy: ABC123');
    }, 500);

    console.log('🎮 Opened Ready Player Me creator');
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

    // Try vanilla GLB URL - no quality parameters
    // Previous params (quality=low&morphTargets=none) may have caused bufferView errors
    // by stripping data that accessors still reference
    const urls = [
        `https://models.readyplayer.me/${avatarId}.glb`,
        `https://avatars.readyplayer.me/${avatarId}.glb`
    ];

    // Try first URL
    tryLoadAvatar(urls, 0, avatarId);
}

function tryLoadAvatar(urls, index, avatarId) {
    if (index >= urls.length) {
        console.error('❌ All URL attempts failed');
        alert('❌ Could not load avatar.\n\nPossible issues:\n1. Avatar might be private (not public)\n2. ID might be incorrect\n3. Avatar might not be finalized yet\n\nTry:\n- Make sure you saved/finalized the avatar on PlayerZero\n- Check the ID is copied correctly\n- Try creating the avatar on demo.readyplayer.me instead');
        return;
    }

    const glbUrl = urls[index];
    console.log(`📡 Trying URL ${index + 1}/${urls.length}:`, glbUrl);

    // Try to fetch
    fetch(glbUrl, { method: 'HEAD' })
        .then(res => {
            if (res.ok) {
                // URL works! Load the avatar
                console.log('✅ Found avatar at:', glbUrl);
                loadGLBAvatar(glbUrl); // Use GLB loader for Ready Player Me

                // ============================================
                // BRIDGE TO AVATAR MANAGER (for cross-page sync)
                // ============================================
                const pngUrl = glbUrl.replace('.glb', '.png');
                localStorage.setItem('userAvatar', glbUrl); // Legacy key

                // Use AvatarManager if available (script.js)
                if (window.avatarManager) {
                    window.avatarManager.setAvatar(pngUrl, 'rpm');
                    console.log('🔗 Synced to AvatarManager');
                }
                // ============================================

                // Save to IndexedDB
                return fetch(glbUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        saveVRMToDB(blob, `readyplayerme_${avatarId}.glb`)
                            .then(() => {
                                console.log('💾 Ready Player Me avatar saved');
                                alert('✅ Ready Player Me avatar loaded successfully!');
                            });
                    });
            } else {
                // Try next URL
                console.log(`❌ URL ${index + 1} failed (${res.status}), trying next...`);
                tryLoadAvatar(urls, index + 1, avatarId);
            }
        })
        .catch(err => {
            console.log(`❌ URL ${index + 1} error:`, err);
            tryLoadAvatar(urls, index + 1, avatarId);
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

// Restore saved RPM ID after page fully loads
window.addEventListener('load', () => {
    setTimeout(() => {
        const savedRpmId = localStorage.getItem('flow_rpm_avatar_id');
        const rpmIdInput = document.getElementById('playerzero-id');
        if (savedRpmId && rpmIdInput) {
            rpmIdInput.value = savedRpmId;
            console.log('✅ Restored RPM ID from localStorage:', savedRpmId);
        } else if (!rpmIdInput) {
            console.log('⚠️ RPM ID input field not found');
        }
    }, 500);
});
