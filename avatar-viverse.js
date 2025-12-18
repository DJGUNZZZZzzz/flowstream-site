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
function loadVRMAvatar(vrmDataUrl) {
    console.log('🎭 Loading VRM avatar...');

    // Convert data URL to blob
    fetch(vrmDataUrl)
        .then(res => res.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);

            // Load VRM
            const loader = new THREE.GLTFLoader();
            loader.register((parser) => new VRMLoaderPlugin(parser));

            loader.load(
                url,
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
                    updateAvatarThumbnail(vrmDataUrl);
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
        })
        .catch(error => {
            console.error('❌ Blob conversion error:', error);
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

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
        const vrmData = e.target.result;

        // Save to localStorage
        localStorage.setItem('userVRM', vrmData);
        localStorage.setItem('userVRMName', file.name);

        console.log('💾 VRM saved to localStorage');

        // Load and display
        loadVRMAvatar(vrmData);
    };

    reader.readAsDataURL(file);
}

/**
 * Update avatar thumbnail in profile
 */
function updateAvatarThumbnail(vrmDataUrl) {
    // For now, show a placeholder
    // In future, could generate thumbnail from 3D scene
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        // Use a default avatar icon
        profileAvatar.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%2300ffff" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23000" font-size="60">3D</text></svg>';
        profileAvatar.style.display = 'block';
    }
}

/**
 * Load saved VRM from localStorage
 */
function loadSavedVRM() {
    const savedVRM = localStorage.getItem('userVRM');
    const savedName = localStorage.getItem('userVRMName');

    if (savedVRM) {
        console.log('📦 Loading saved VRM:', savedName);
        loadVRMAvatar(savedVRM);
    }
}

/**
 * Clear avatar
 */
function clearAvatar() {
    if (confirm('Clear your avatar?')) {
        localStorage.removeItem('userVRM');
        localStorage.removeItem('userVRMName');

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
 * Open VIVERSE Avatar Creator
 */
function openVIVERSECreator() {
    window.open('https://avatar.viverse.com/avatar', '_blank', 'width=1200,height=800');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 VRM Avatar System Loaded');

    // Initialize 3D scene
    init3DScene();

    // Load saved avatar
    loadSavedVRM();

    // Set up file input
    const fileInput = document.getElementById('vrm-upload');
    if (fileInput) {
        fileInput.addEventListener('change', handleVRMUpload);
    }
});

console.log('✓ VRM Avatar System Ready');
