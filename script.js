/* 
   ================================================
   1. SHARED LOGIC (All Pages)
   ================================================
*/

/* --- SOUND ENGINE (Web Audio API) --- */
class SoundFX {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = false;
        this.typingEnabled = true; // Separate toggle for typing ASMR
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);

        // Pre-generate a buffer of white noise for the mechanical clicks
        this.noiseBuffer = this.createWhiteNoise();
    }

    createWhiteNoise() {
        // Create 2 seconds of noise buffer
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled && this.ctx.state === 'suspended') this.ctx.resume();
        return this.enabled;
    }

    toggleTyping() {
        this.typingEnabled = !this.typingEnabled;
        return this.typingEnabled;
    }

    playTone(freq, type, duration, delay = 0) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.value = freq;
        osc.type = type;
        osc.connect(gain);
        gain.connect(this.masterGain);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    // UI Sounds
    hover() { this.playTone(400, 'sine', 0.05); }
    click() { this.playTone(800, 'square', 0.1); }
    error() { this.playTone(150, 'sawtooth', 0.3); }
    success() {
        this.playTone(600, 'sine', 0.1);
        this.playTone(1200, 'sine', 0.2, 0.1);
    }

    // "Laptop Tap" ASMR Sound
    type() {
        if (!this.enabled || !this.typingEnabled) return;
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800 + (Math.random() * 400);
        const envelope = this.ctx.createGain();
        src.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.masterGain);
        const now = this.ctx.currentTime;
        envelope.gain.setValueAtTime(0.8, now);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        src.start(now);
        src.stop(now + 0.05);
    }
}

const sfx = new SoundFX();

/* --- AVATAR MANAGER (Centralized Logic) --- */
class AvatarManager {
    constructor() {
        this.storageKey = 'flow_avatar_manager';
        this.defaultAvatar = 'https://ui-avatars.com/api/?name=Operative+01&background=0ff&color=000&size=150';

        // Initialize state from local storage or defaults
        const saved = JSON.parse(localStorage.getItem(this.storageKey)) || {};
        this.state = {
            currentUrl: saved.currentUrl || this.defaultAvatar,
            source: saved.source || 'default', // 'default', 'upload', 'rpm'
            uploadedUrl: saved.uploadedUrl || null,
            rpmUrl: saved.rpmUrl || null
        };

        // Migrating legacy keys if this is a fresh install of the manager
        this.migrateLegacyData();
    }

    migrateLegacyData() {
        // Check for legacy RPM key
        const legacyRpm = localStorage.getItem('userAvatar');
        if (legacyRpm && !this.state.rpmUrl) {
            this.state.rpmUrl = legacyRpm;
            // If we are currently default, upgrade to RPM immediately
            if (this.state.source === 'default') {
                this.setAvatar(legacyRpm, 'rpm');
            }
        }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.syncToProfileDossier();
        this.updateDomElements();
    }

    /**
     * Main method to set the avatar.
     * @param {string} url - The image URL
     * @param {string} source - 'upload' or 'rpm'
     */
    setAvatar(url, source) {
        if (source === 'upload') {
            this.state.uploadedUrl = url;
            this.state.source = 'upload';
            this.state.currentUrl = url;
        } else if (source === 'rpm') {
            this.state.rpmUrl = url;
            // Only switch to RPM if we are NOT currently using a manual upload
            // OR if the user explicitly just created this RPM avatar (implied by calling this function)
            // For now, we assume calling setAvatar means "User wants to use this NOW"
            this.state.source = 'rpm';
            this.state.currentUrl = url;
        }

        // If source is null/reset
        if (!url) {
            if (source === 'upload') {
                this.state.uploadedUrl = null;
                // Fallback to RPM if exists
                if (this.state.rpmUrl) {
                    this.state.currentUrl = this.state.rpmUrl;
                    this.state.source = 'rpm';
                } else {
                    this.state.currentUrl = this.defaultAvatar;
                    this.state.source = 'default';
                }
            }
        }

        this.save();
        console.log(`👤 Avatar updated: [${this.state.source}] ${this.state.currentUrl.substring(0, 30)}...`);
    }

    getAvatar() {
        return this.state.currentUrl;
    }

    /**
     * Syncs the current avatar URL to the separate profile data structure 
     * used by the dossier editor (profile.html)
     */
    syncToProfileDossier() {
        const profileKey = 'flow_profile_data_v2';
        const profileData = JSON.parse(localStorage.getItem(profileKey)) || {};

        if (profileData.avatar !== this.state.currentUrl) {
            profileData.avatar = this.state.currentUrl;
            localStorage.setItem(profileKey, JSON.stringify(profileData));
            // Also update the DOM input if it exists on the current page
            const regAvatar = document.getElementById('reg-avatar');
            if (regAvatar) regAvatar.value = this.state.currentUrl;
        }
    }

    /**
     * Updates all avatar images present in the DOM
     */
    updateDomElements() {
        const url = this.state.currentUrl;

        // 1. Sidebar Avatar
        const sidebarAvatars = document.querySelectorAll('.sidebar-user-avatar');
        sidebarAvatars.forEach(img => img.src = url);

        // 2. Top Nav / User Avatar
        const userAvatars = document.querySelectorAll('.user-avatar img');
        userAvatars.forEach(img => img.src = url);

        // 3. Profile Page Main Avatar (if exists)
        const profileAvatar = document.querySelector('.p-avatar'); // Inside iframe usually, but check main doc too
        if (profileAvatar) profileAvatar.src = url;

        // 4. Dossier Preview Image (profile.html specific)
        const previewAvatar = document.getElementById('profileAvatar');
        if (previewAvatar) {
            previewAvatar.src = url;
            previewAvatar.style.display = 'block';
        }

        // 5. Card Avatars (in feed) - Optional, maybe we want to update "You" in comments?
        // Leaving out for now to avoid overwriting other streamers.
    }

    init() {
        // FORCE CHECK: If we are on default, but have an RPM url in storage (from legacy or current), USE IT.
        // This fixes the issue where users define an RPM avatar but it doesn't auto-select.
        if (this.state.source === 'default' && this.state.rpmUrl) {
            console.log('🔄 Init: Found dormant RPM avatar, auto-activating...');
            this.setAvatar(this.state.rpmUrl, 'rpm');
        }

        this.updateDomElements();

        // Listen for storage changes (cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                const newState = JSON.parse(e.newValue);
                this.state = newState;
                this.updateDomElements();
            }
        });

        // If on profile page, hook into the file upload specifically
        this.attachProfileListeners();
    }

    attachProfileListeners() {
        const fileUpload = document.getElementById('file-upload');
        const regAvatar = document.getElementById('reg-avatar');

        if (fileUpload && regAvatar) {
            fileUpload.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        const url = evt.target.result;
                        // This is an explicit user upload action
                        this.setAvatar(url, 'upload');
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });

            // Also listen for manual text input changes to the avatar URL field
            regAvatar.addEventListener('change', () => {
                if (regAvatar.value && regAvatar.value.trim() !== '') {
                    this.setAvatar(regAvatar.value, 'upload');
                }
            });
        }
    }
}

const avatarManager = new AvatarManager();
document.addEventListener('DOMContentLoaded', () => {
    avatarManager.init();
});


/* ADD SOUND TOGGLE TO NAV */
const navLinks = document.querySelector('.nav-links');
if (navLinks) {
    const soundBtn = document.createElement('button');
    soundBtn.className = 'icon-btn';
    soundBtn.id = 'sound-toggle';
    soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    soundBtn.title = "Toggle Neuro-Audio";
    soundBtn.style.marginRight = '15px';

    soundBtn.addEventListener('click', () => {
        const isOn = sfx.toggle();
        soundBtn.innerHTML = isOn ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
        soundBtn.style.color = isOn ? '#0ff' : '#ccc';
        if (isOn) sfx.success();
    });

    /* NETRUNNER MODE TOGGLE */
    const netrunnerBtn = document.createElement('button');
    netrunnerBtn.className = 'icon-btn';
    netrunnerBtn.id = 'netrunner-toggle';
    netrunnerBtn.innerHTML = '<i class="fa-solid fa-eye"></i><span class="flowcard-badge" id="netrunner-badge">0</span>';
    netrunnerBtn.title = "Toggle Netrunner Mode";
    netrunnerBtn.style.marginRight = '10px';
    netrunnerBtn.style.position = 'relative'; // Fix badge positioning

    netrunnerBtn.addEventListener('click', () => {
        document.body.classList.toggle('netrunner-mode');
        const isNetrunner = document.body.classList.contains('netrunner-mode');
        netrunnerBtn.style.color = isNetrunner ? '#0f0' : '#ccc';

        // Toggle university and leaderboard icons
        const universityBtn = document.getElementById('university-btn');
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        if (universityBtn) universityBtn.style.display = isNetrunner ? 'block' : 'none';
        if (leaderboardBtn) leaderboardBtn.style.display = isNetrunner ? 'block' : 'none';

        sfx.click();
        if (isNetrunner) sfx.playTone(200, 'sawtooth', 0.5); // Low hum for activation
    });

    const signup = document.querySelector('.signup-btn');
    if (signup) {
        navLinks.insertBefore(soundBtn, signup);
        navLinks.insertBefore(netrunnerBtn, signup);
    } else {
        navLinks.appendChild(soundBtn);
        navLinks.appendChild(netrunnerBtn);
    }
}

document.querySelectorAll('a, button, .input-wrapper input').forEach(el => {
    el.addEventListener('mouseenter', () => sfx.hover());
    el.addEventListener('click', () => sfx.click());
});

/* LOGIN & NAV LOGIC */
const loginBtn = document.querySelector('.login-btn');
const signupBtn = document.querySelector('.signup-btn');
const userAvatar = document.querySelector('.user-avatar');
const dropdown = document.querySelector('.dropdown-menu');

if (loginBtn && signupBtn && userAvatar) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        userAvatar.style.display = 'block';
    });

    const avatarImg = userAvatar.querySelector('img');
    if (avatarImg && dropdown) {
        // Toggle Dropdown
        userAvatar.addEventListener('click', () => {
            dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
            sfx.click();
        });
    }

    /* KILL SIGNAL (SIGN OUT) LOGIC */
    const killSignals = document.querySelectorAll('.kill-signal');
    killSignals.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            sfx.error(); // "System shutdown" sound

            // Visual Logout
            if (userAvatar) userAvatar.style.display = 'none';
            if (dropdown) dropdown.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';

            // Optional: Redirect to Home
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        });
    });
}

// UNIVERSAL AVATAR DROPDOWN (Works on ALL pages, not just index.html)
// This ensures dropdown works on channel.html, terminal.html, etc.
if (!loginBtn && !signupBtn && userAvatar && dropdown) {
    console.log('Setting up universal avatar dropdown');
    userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        if (window.sfx) sfx.click();
        console.log('Avatar clicked, dropdown display:', dropdown.style.display);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userAvatar.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

window.addEventListener('click', (e) => {
    if (userAvatar && dropdown && !userAvatar.contains(e.target)) {
        dropdown.style.display = 'none';
    }

    /* CLICK RIPPLE EFFECT */
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.pageX - 10}px`; // Center offset
    ripple.style.top = `${e.pageY - 10}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

/* CURSOR TRAIL EFFECT */
let lastTrailTime = 0;
window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime > 20) { // Limit spawn rate
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = `${e.clientX - 4}px`;
        trail.style.top = `${e.clientY - 4}px`;
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 500);
        lastTrailTime = now;
    }
});

/* TYPING EFFECT: MAIN LOGO */
const logoElement = document.getElementById('logo-text');
const logoString = "<FLOW";
let charIndex = 0;

function typeLogo() {
    if (logoElement && charIndex < logoString.length) {
        logoElement.textContent += logoString.charAt(charIndex);
        charIndex++;
        setTimeout(typeLogo, 150);
    }
}
if (logoElement) setTimeout(typeLogo, 500);


/* 
   ================================================
   1.5 SIDEBAR DATA (Global Logic)
   ================================================
*/
const globalStreamers = [
    { name: "SkateGamer_OG", game: "ARC RAIDERS", desc: "Ranked Comp", viewers: "12k", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" },
    { name: "TheVicMendoza", game: "OVERWATCH 2", desc: "GM Support", viewers: "8.5k", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2070&auto=format&fit=crop" },
    { name: "CopperCarnie", game: "CODING", desc: "Python AI", viewers: "3.2k", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" },
    { name: "DJSwayforth", game: "MUSIC", desc: "DnB Set", viewers: "15k", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" },
    { name: "DjLinuxxx", game: "ROCKET LEAGUE", desc: "Road to SSL", viewers: "5.1k", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" },
    { name: "TheQueenHoneyBee", game: "COOKING", desc: "Cyber Ramen", viewers: "4k", image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop" },
    { name: "ibbunniie", game: "GTA V", desc: "NoPixel Heist", viewers: "22k", image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2000&auto=format&fit=crop" },
    { name: "DJGUNZZZZzzz", game: "TITANFALL 2", desc: "Northstar", viewers: "1.2k", image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1974&auto=format&fit=crop" },
    { name: "TwIzTeD_ArIeS", game: "JUST CHATTING", desc: "Metaverse", viewers: "900", image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop" },
    { name: "FaygoJuggalo710", game: "CS2", desc: "FaceIt Lv10", viewers: "10k", image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2000&auto=format&fit=crop" },
    { name: "Wisewoof", game: "ARCADE", desc: "Mario 64 Speed", viewers: "2.5k", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop" },
    { name: "Rainydevil", game: "WINDS MEET", desc: "Open Beta", viewers: "6k", image: "https://images.unsplash.com/photo-1519669556860-2c965f84704a?q=80&w=2070&auto=format&fit=crop" }
];

function populateSidebar() {
    const hackedList = document.getElementById('hacked-feeds');
    const liveList = document.getElementById('live-flow');
    const suggestedList = document.getElementById('suggested-feeds');

    if (!hackedList && !liveList && !suggestedList) return; // Exit if no sidebar

    function createSidebarItem(listElement, data) {
        if (!listElement) return;
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${data.image}" class="sidebar-avatar" alt="${data.name}">
            <div class="sidebar-info">
                <span class="sidebar-name">${data.name}</span>
                <span class="sidebar-game">${data.game}</span>
            </div>
            <div class="live-dot"></div>
        `;
        listElement.appendChild(li);
        li.addEventListener('mouseenter', () => sfx.hover());
    }

    if (hackedList) {
        hackedList.innerHTML = '';
        for (let i = 0; i < 3; i++) createSidebarItem(hackedList, globalStreamers[i]);
    }
    if (liveList) {
        liveList.innerHTML = '';
        for (let i = 3; i < 7; i++) createSidebarItem(liveList, globalStreamers[i]);
    }
    if (suggestedList) {
        suggestedList.innerHTML = '';
        for (let i = 7; i < 12; i++) createSidebarItem(suggestedList, globalStreamers[i]);
    }
}
populateSidebar();


/* 
   ================================================
   2. HOME PAGE LOGIC (index.html)
   ================================================
*/
const carouselTrack = document.getElementById('carousel-track');
const videoGrid = document.getElementById('video-grid');
const heroBg = document.getElementById('hero-bg');
const heroTitle = document.getElementById('hero-title');
const heroDesc = document.getElementById('hero-desc');
const noiseOverlay = document.getElementById('noise-overlay');

if (carouselTrack && heroBg) {

    /* CAROUSEL LOGIC */
    let currentIndex = 0;
    let isDown = false;
    let startX;
    let scrollLeft;
    let vel = 0;
    let momentumID;
    let isDragging = false;

    function initCarousel() {
        carouselTrack.innerHTML = '';
        globalStreamers.forEach((streamer, index) => {
            const item = document.createElement('div');
            item.classList.add('carousel-item');
            item.style.backgroundImage = `url(${streamer.image})`;
            item.addEventListener('click', (e) => {
                if (isDragging) { e.preventDefault(); return; }
                triggerBackgroundHack(index);
                resetTimer();
                sfx.click();
            });
            carouselTrack.appendChild(item);
        });
        updateHeroContent(0);
    }

    carouselTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        isDragging = false;
        cancelAnimationFrame(momentumID);
        carouselTrack.classList.add('active');
        startX = e.pageX - carouselTrack.offsetLeft;
        scrollLeft = carouselTrack.scrollLeft;
    });

    carouselTrack.addEventListener('mouseleave', () => { if (isDown) endDrag(); });
    carouselTrack.addEventListener('mouseup', () => { if (isDown) endDrag(); });

    carouselTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carouselTrack.offsetLeft;
        const walk = (x - startX);
        if (Math.abs(walk) > 5) isDragging = true;
        carouselTrack.scrollLeft = scrollLeft - walk;
        vel = walk * 0.1;
    });

    function endDrag() {
        isDown = false;
        carouselTrack.classList.remove('active');
        momentumLoop();
    }

    function momentumLoop() {
        carouselTrack.scrollLeft -= vel * 2;
        vel *= 0.95;
        if (Math.abs(vel) > 0.5) {
            momentumID = requestAnimationFrame(momentumLoop);
        } else {
            isDragging = false;
        }
    }

    /* TRANSITION LOGIC */
    function triggerBackgroundHack(index) {
        if (noiseOverlay) {
            noiseOverlay.classList.add('active');
            setTimeout(() => { updateHeroContent(index); }, 100);
            setTimeout(() => { noiseOverlay.classList.remove('active'); }, 600);
        } else {
            updateHeroContent(index);
        }
    }

    function updateHeroContent(index) {
        currentIndex = index;
        const data = globalStreamers[index];
        if (heroTitle) heroTitle.innerText = data.name;
        if (heroDesc) heroDesc.innerHTML = `Playing <strong>${data.game}</strong> - ${data.desc}`;
        if (heroBg) heroBg.style.backgroundImage = `url(${data.image})`;

        const items = document.querySelectorAll('.carousel-item');
        items.forEach(item => item.classList.remove('active'));
        if (items[currentIndex]) {
            items[currentIndex].classList.add('active');
            cancelAnimationFrame(momentumID);
            centerThumbnail(items[currentIndex]);
        }
    }

    function centerThumbnail(targetItem) {
        const trackWidth = carouselTrack.clientWidth;
        const itemLeft = targetItem.offsetLeft;
        const itemWidth = targetItem.clientWidth;
        const targetScroll = itemLeft - (trackWidth / 2) + (itemWidth / 2);
        carouselTrack.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }

    /* TIMER LOGIC */
    let autoRotate;
    function startTimer() {
        autoRotate = setInterval(() => {
            let nextIndex = (currentIndex + 1) % globalStreamers.length;
            triggerBackgroundHack(nextIndex);
        }, 45000);
    }
    function resetTimer() { clearInterval(autoRotate); startTimer(); }

    initCarousel();
    startTimer();
}

/* LIVE FEED GENERATOR UPDATE (Index Page) */
const moreStreamers = [
    { title: "No Hitting! | Elden Ring DLC Run", name: "Souls_Veteran", game: "ELDEN RING", viewers: "15.2k", tags: ["English", "No Hit"], image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" },
    { title: "Building a React App in 30 mins", name: "DevGuru", game: "SOFTWARE DEV", viewers: "2.1k", tags: ["Coding", "Educational"], image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2069&auto=format&fit=crop" },
    { title: "Chill Beats & Study Session ☕", name: "Lofi_Girl_Clone", game: "MUSIC", viewers: "40k", tags: ["Chill", "No Mic"], image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop" },
    { title: "Ranked Grind to Apex Predator", name: "WraithMain99", game: "APEX LEGENDS", viewers: "8k", tags: ["Competitive", "FPS"], image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2000&auto=format&fit=crop" },
    { title: "IRL: Exploring Tokyo at Night 🍜", name: "TravelBros", game: "IRL", viewers: "12k", tags: ["Travel", "Food"], image: "https://images.unsplash.com/photo-1554178286-db443a99268e?q=80&w=2070&auto=format&fit=crop" },
    { title: "Speedrunning Minecraft (Random Seed)", name: "BlockMaster", game: "MINECRAFT", viewers: "5.5k", tags: ["Speedrun", "English"], image: "https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?q=80&w=2070&auto=format&fit=crop" },
    { title: "Just Chatting: AI Taking Over?", name: "TechTalks", game: "JUST CHATTING", viewers: "1.2k", tags: ["Podcast", "Tech"], image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop" },
    { title: "Valorant Radiant Lobbies", name: "JettLagged", game: "VALORANT", viewers: "18k", tags: ["FPS", "Ranked"], image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" },
];

if (videoGrid && heroBg) {
    videoGrid.innerHTML = '';
    const fullList = [...moreStreamers, ...moreStreamers];
    fullList.forEach((stream, i) => {
        const isLocked = (i === 0 || i === 4) || Math.random() < 0.2;
        const card = document.createElement('div');
        card.classList.add('stream-card');
        card.innerHTML = `
            <div class="thumbnail-container">
                <img src="${stream.image}" alt="Thumbnail">
                <div class="live-tag-overlay">LIVE</div>
                <div class="viewer-count-overlay">${stream.viewers} viewers</div>
                <div class="watch-overlay">
                    ${isLocked ? '<i class="fa-solid fa-lock"></i> HACK' : '<i class="fa-solid fa-play"></i> WATCH'}
                </div>
            </div>
            <div class="stream-info">
                <img src="https://via.placeholder.com/40" class="card-avatar" alt="Avatar">
                <div class="text-content">
                    <div class="stream-title">${stream.title}</div>
                    <div class="streamer-name">${stream.name}</div>
                    <div class="game-name">${stream.game}</div>
                    <div class="tags">${stream.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                </div>
            </div>
        `;
        card.addEventListener('mouseenter', () => sfx.hover());
        card.addEventListener('click', (e) => {
            sfx.click();
            if (isLocked) {
                startHack('channel.html');
            } else {
                window.location.href = 'channel.html';
            }
        });
        if (isLocked) card.classList.add('locked-stream');
        videoGrid.appendChild(card);
    });
}

/* HACK TO WATCH MINIGAME LOGIC */
let hackOverlay, hackGrid, hackTitle, hackStatus, hackProgress;
let sequence = [];
let playerSequence = [];
let isHacking = false;

function initHackOverlay() {
    hackOverlay = document.createElement('div');
    hackOverlay.className = 'hack-overlay';
    hackOverlay.innerHTML = `
        <div class="hack-container">
            <div class="hack-title">ENCRYPTION DETECTED</div>
            <div class="hack-status">Break the security sequence to access stream.</div>
            <div class="hack-grid"></div>
            <div class="hack-timer"><div class="hack-progress"></div></div>
        </div>
    `;
    document.body.appendChild(hackOverlay);
    hackGrid = hackOverlay.querySelector('.hack-grid');
    hackTitle = hackOverlay.querySelector('.hack-title');
    hackStatus = hackOverlay.querySelector('.hack-status');
    hackProgress = hackOverlay.querySelector('.hack-progress');
}
initHackOverlay();

function startHack(targetUrl) {
    if (isHacking) return;
    isHacking = true;
    hackOverlay.classList.add('active');
    hackTitle.innerText = "DECRYPTING...";
    hackStatus.innerText = "MEMORE SEQUENCE INITIATED";
    hackProgress.style.width = '100%';
    sequence = [];
    playerSequence = [];
    hackGrid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const node = document.createElement('div');
        node.className = 'hack-node';
        node.innerText = Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0');
        node.dataset.index = i;
        node.addEventListener('click', () => handleNodeClick(i, node, targetUrl));
        hackGrid.appendChild(node);
    }
    setTimeout(() => {
        for (let i = 0; i < 4; i++) {
            let nodeIdx;
            do { nodeIdx = Math.floor(Math.random() * 9); } while (sequence.includes(nodeIdx));
            sequence.push(nodeIdx);
        }
        playSequence();
    }, 1000);
}

function playSequence() {
    let i = 0;
    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            hackStatus.innerText = "REPEAT SEQUENCE NOW";
            hackTitle.innerText = "AWAITING INPUT";
            return;
        }
        const idx = sequence[i];
        const node = hackGrid.children[idx];
        node.classList.add('active');
        sfx.playTone(400 + (i * 100), 'sine', 0.1);
        setTimeout(() => node.classList.remove('active'), 300);
        i++;
    }, 600);
}

function handleNodeClick(index, node, targetUrl) {
    if (playerSequence.length >= sequence.length) return;
    sfx.click();
    node.classList.add('active');
    setTimeout(() => node.classList.remove('active'), 200);
    if (index !== sequence[playerSequence.length]) {
        failHack();
    } else {
        playerSequence.push(index);
        if (playerSequence.length === sequence.length) {
            successHack(targetUrl);
        }
    }
}

function failHack() {
    sfx.error();
    hackTitle.innerText = "ACCESS DENIED";
    hackTitle.style.color = "red";
    hackStatus.innerText = "Sequence mismatch. Rebooting...";
    setTimeout(() => {
        isHacking = false;
        hackOverlay.classList.remove('active');
        hackTitle.style.color = "#ff0055";
    }, 1500);
}

function successHack(targetUrl) {
    sfx.success();
    hackTitle.innerText = "ACCESS GRANTED";
    hackTitle.style.color = "#0f0";
    hackStatus.innerText = "Proxy bypassed. Establishing connection...";
    setTimeout(() => {
        window.location.href = targetUrl || 'channel.html';
    }, 1000);
}

/* GLOBAL: LIVE BOUNTIES */
/* OLD BOUNTY SYSTEM - DISABLED (now using bounty-spawn.js)
const bountyStreamers = [
    'NeonPhantom', 'CyberRaven_X', 'GlitchWitch', 'QuantumDrifter',
    'VoidRunner', 'SynthLord', 'DataWraith', 'PixelPunk_99',
    'ChromeHeart', 'NightCode', 'ElectricDream', 'ShadowByte',
    'NeoMatrix', 'CryptoGhost', 'HoloHunter', 'ZeroDay_Queen'
];

function startBountySystem() {
    setInterval(() => {
        if (Math.random() < 0.3) spawnBounty();
    }, 60000);
}

function spawnBounty() {
    const streamer = bountyStreamers[Math.floor(Math.random() * bountyStreamers.length)];
    const tokenAmount = [100, 250, 500, 750, 1000][Math.floor(Math.random() * 5)];
    const bounty = document.createElement('div');
    bounty.style.cssText = `
        position: fixed; bottom: 30px; right: -300px; width: 280px;
        background: rgba(10, 20, 30, 0.95); border: 1px solid #ff0055;
        padding: 15px; border-radius: 5px; z-index: 9999;
        box-shadow: 0 0 20px rgba(255, 0, 85, 0.4);
        transition: right 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-family: 'Rajdhani', sans-serif;
    `;
    bounty.innerHTML = `
        <div style="font-size: 16px; color: #ff0055; font-weight: bold; margin-bottom: 5px;">
            <i class="fa-solid fa-crosshairs"></i> LIVE BOUNTY
        </div>
        <div style="color: #ccc; font-size: 13px; margin-bottom: 10px;">
            Watch <strong>${streamer}</strong> for 5 mins to earn <span style="color:#0ff">${tokenAmount} FLOW TOKENS</span>.
        </div>
        <button class="bounty-btn" style="
            background: #ff0055; color: #fff; border: none; padding: 5px 10px;
            width: 100%; cursor: pointer; font-family: 'Orbitron'; font-size: 11px;
        ">ACCEPT CONTRACT</button>
    `;
    document.body.appendChild(bounty);
    sfx.playTone(600, 'square', 0.1);
    setTimeout(() => bounty.style.right = '30px', 100);
    const btn = bounty.querySelector('.bounty-btn');
    btn.addEventListener('click', () => {
        console.log('=== BOUNTY BUTTON CLICKED ===');
        console.log('Streamer:', streamer, 'Token Amount:', tokenAmount);
        console.log('window.bountyWatchManager exists?', !!window.bountyWatchManager);

        sfx.success();

        // Start bounty watch if BountyWatchManager is available
        if (window.bountyWatchManager) {
            console.log('Starting bounty watch:', streamer, tokenAmount);
            const result = bountyWatchManager.startWatch(streamer, tokenAmount);
            console.log('startWatch returned:', result);
        } else {
            // Fallback: redirect directly and log warning
            console.warn('BountyWatchManager not available, redirecting to channel.html');
            window.location.href = 'channel.html';
        }

        // Remove bounty notification
        bounty.style.right = '-300px';
        setTimeout(() => bounty.remove(), 500);
    });
    setTimeout(() => {
        if (bounty.parentNode) {
            bounty.style.right = '-300px';
            setTimeout(() => bounty.remove(), 500);
        }
    }, 10000);
}
setTimeout(startBountySystem, 10000);
*/


/* 
   ================================================
   3. CHANNEL PAGE LOGIC
   ================================================
*/
const chatHeaderElement = document.getElementById('chat-header-text');
const emberContainer = document.getElementById('chat-ember-container');
const channelHackingContainer = document.getElementById('chat-hacking-bg');
const theaterBtn = document.getElementById('theater-btn');

if (chatHeaderElement) {
    const chatString = "STREAM CHAT";
    let chatCharIndex = 0;
    function typeChat() {
        if (chatCharIndex < chatString.length) {
            chatHeaderElement.textContent += chatString.charAt(chatCharIndex);
            chatCharIndex++;
            setTimeout(typeChat, 100);
        }
    }
    setTimeout(typeChat, 1500);

    function createEmbers() {
        if (!emberContainer) return;
        emberContainer.innerHTML = '';
        for (let i = 0; i < 40; i++) {
            const ember = document.createElement('div');
            ember.classList.add('ember');
            ember.style.left = Math.random() * 100 + "%";
            ember.style.animationDuration = (Math.random() * 3 + 2) + "s";
            ember.style.animationDelay = (Math.random() * 5) + "s";
            const colors = ['#ff0055', '#ff00aa', '#00e5ff', '#ffffff'];
            const chosenColor = colors[Math.floor(Math.random() * colors.length)];
            ember.style.background = chosenColor;
            ember.style.boxShadow = `0 0 10px ${chosenColor}`;
            emberContainer.appendChild(ember);
        }
    }
    createEmbers();

    const codeLines = [
        "> inject_payload(0x4F)", "> decrypting_stream...", "> bypass_firewall: OK", "> tracing_ip: 192.168.0.1",
        "> buffer_overflow", "> root_access: GRANTED", "> uploading_virus.exe", "> system_override: ACTIVE",
        "> matrix_reloading...", "> ping_server: 3ms"
    ];

    function runChannelHacking() {
        if (!channelHackingContainer) return;
        setInterval(() => {
            if (Math.random() < 0.1) channelHackingContainer.innerHTML = "";
            const randomLine = codeLines[Math.floor(Math.random() * codeLines.length)];
            const lineElement = document.createElement('div');
            lineElement.innerText = randomLine;
            channelHackingContainer.appendChild(lineElement);
            if (channelHackingContainer.children.length > 20) {
                channelHackingContainer.removeChild(channelHackingContainer.firstChild);
            }
        }, 200);
    }
    runChannelHacking();
}

if (theaterBtn) {
    theaterBtn.addEventListener('click', () => {
        document.body.classList.toggle('theater-active');
        const icon = theaterBtn.querySelector('i');
        sfx.click();
        if (document.body.classList.contains('theater-active')) {
            icon.style.color = "#0ff";
            icon.style.textShadow = "0 0 10px #0ff";
        } else {
            icon.style.color = "";
            icon.style.textShadow = "";
        }
    });
}

// CHANNEL INTERACTIONS
const followBtn = document.querySelector('.follow-btn');
const subBtn = document.querySelector('.sub-btn');
const shareBtn = document.querySelector('.share-btn');
const volumeSlider = document.querySelector('.volume-slider');
const volumeLevel = document.querySelector('.volume-level');
const qualityBtn = document.getElementById('quality-btn');
const qualityMenu = document.getElementById('quality-menu');
const fsBtn = document.getElementById('fs-btn');

// --- FIXED MODAL LOGIC ---
const modal = document.getElementById('confirmation-modal');
const modalText = document.getElementById('modal-text');

// Function to open modal
function confirmAction(text, onConfirm) {
    if (!modal) return;
    modalText.innerText = text;
    modal.classList.add('active');
    sfx.error(); // Warning sound

    // 1. Get the CURRENT buttons in the DOM (fresh reference)
    const currentConfirm = document.getElementById('modal-confirm');
    const currentCancel = document.getElementById('modal-cancel');

    // 2. Clone them to strip old listeners
    const newConfirm = currentConfirm.cloneNode(true);
    const newCancel = currentCancel.cloneNode(true);

    // 3. Replace in DOM
    currentConfirm.parentNode.replaceChild(newConfirm, currentConfirm);
    currentCancel.parentNode.replaceChild(newCancel, currentCancel);

    // 4. Add new listeners
    newConfirm.addEventListener('click', () => {
        modal.classList.remove('active');
        sfx.click();
        onConfirm();
    });

    newCancel.addEventListener('click', () => {
        modal.classList.remove('active');
        sfx.click();
    });
}

// FOLLOW BUTTON
if (followBtn) {
    followBtn.addEventListener('click', () => {
        if (followBtn.classList.contains('following')) {
            // UNFOLLOW ATTEMPT
            confirmAction("WARNING: Are you sure you want to unfollow this operative?", () => {
                followBtn.classList.remove('following');
                followBtn.innerHTML = '<i class="fa-solid fa-heart"></i> FOLLOW';
                followBtn.style.background = '';
                followBtn.style.color = '';
                followBtn.style.boxShadow = '';
            });
        } else {
            // FOLLOW
            sfx.success();
            followBtn.classList.add('following');
            followBtn.innerHTML = '<i class="fa-solid fa-heart"></i> FOLLOWING';
            followBtn.style.background = '#0ff';
            followBtn.style.color = '#000';
            followBtn.style.boxShadow = '0 0 15px #0ff';
        }
    });
}

// SUBSCRIBE BUTTON
if (subBtn) {
    subBtn.addEventListener('click', () => {
        if (subBtn.classList.contains('subscribed')) {
            // UNSUBSCRIBE ATTEMPT
            confirmAction("WARNING: Are you sure you want to cancel your Tier 1 Subscription?", () => {
                subBtn.classList.remove('subscribed');
                subBtn.innerHTML = '<i class="fa-solid fa-star"></i> SUBSCRIBE';
                subBtn.style.background = '';
                subBtn.style.color = '';
                subBtn.style.boxShadow = '';
                subBtn.style.border = '';
            });
        } else {
            // SUBSCRIBE
            sfx.success();
            subBtn.classList.add('subscribed');
            subBtn.innerHTML = '<i class="fa-solid fa-star"></i> SUBSCRIBED';
            subBtn.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
            subBtn.style.color = '#000';
            subBtn.style.boxShadow = '0 0 15px #FFD700';
            subBtn.style.border = 'none';
        }
    });
}

if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        sfx.click();
        const originalIcon = shareBtn.innerHTML;
        shareBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        shareBtn.style.color = '#0ff';
        const tooltip = document.createElement('div');
        tooltip.innerText = "LINK COPIED";
        tooltip.style.cssText = `
            position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
            background: #0ff; color: #000; padding: 5px 10px; font-size: 10px;
            font-weight: bold; border-radius: 4px; pointer-events: none; margin-bottom: 8px;
        `;
        shareBtn.style.position = "relative";
        shareBtn.appendChild(tooltip);
        setTimeout(() => {
            shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
            shareBtn.style.color = '';
            tooltip.remove();
        }, 2000);
    });
}

if (volumeSlider && volumeLevel) {
    let isDraggingVol = false;
    function setVolume(e) {
        const rect = volumeSlider.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let percent = (x / rect.width) * 100;
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;
        volumeLevel.style.width = percent + '%';
    }
    volumeSlider.addEventListener('mousedown', (e) => {
        isDraggingVol = true;
        setVolume(e);
        sfx.click();
    });
    window.addEventListener('mousemove', (e) => {
        if (isDraggingVol) setVolume(e);
    });
    window.addEventListener('mouseup', () => {
        isDraggingVol = false;
    });
}

// FULLSCREEN LOGIC
if (fsBtn) {
    const videoContainer = document.getElementById('main-video-container');
    fsBtn.addEventListener('click', () => {
        sfx.click();
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                alert(`Error: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
}

// QUALITY MENU LOGIC
if (qualityBtn && qualityMenu) {
    qualityBtn.addEventListener('click', () => {
        qualityMenu.classList.toggle('active');
        sfx.click();
    });
    const qItems = qualityMenu.querySelectorAll('.q-item');
    qItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent menu closing immediately
            qItems.forEach(q => q.classList.remove('active'));
            item.classList.add('active');
            qualityBtn.querySelector('span').innerText = item.innerText.split(' ')[0]; // Update label
            qualityMenu.classList.remove('active');
            sfx.click();
        });
    });
    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (!qualityBtn.contains(e.target)) {
            qualityMenu.classList.remove('active');
        }
    });
}

/* CHAT ENGINE */
const chatInput = document.querySelector('.chat-input');
const sendBtn = document.querySelector('.send-btn');
const chatFeed = document.getElementById('chat-feed');
const emoteBtn = document.getElementById('emote-btn');
const emotePicker = document.getElementById('emote-picker');

if (chatInput && sendBtn && chatFeed) {
    // Sound Toggle
    const typeSoundBtn = document.getElementById('type-sound-toggle');
    if (typeSoundBtn) {
        typeSoundBtn.addEventListener('click', () => {
            const isTypeOn = sfx.toggleTyping();
            typeSoundBtn.style.color = isTypeOn ? '#0ff' : '#555';
            if (isTypeOn) sfx.type();
        });
    }

    /* --- NEW ADVANCED EMOTE LOGIC --- */
    const quickBar = document.getElementById('quick-bar');
    const emoteNavItems = document.querySelectorAll('.emote-nav-item');
    const emoteSections = document.querySelectorAll('.emote-section');
    const emoteBtn = document.getElementById('emote-btn');
    const emotePicker = document.getElementById('emote-picker');

    // 1. Generate Quick Bar (First 8 Global Emotes)
    const globalEmotes = ['🤖', '👽', '👾', '🦾', '🧠', '👁️', '💿', '💾'];
    if (quickBar) {
        quickBar.innerHTML = ''; // prevent duplicates on reload
        globalEmotes.forEach(emo => {
            const span = document.createElement('span');
            span.className = 'quick-emote';
            span.innerText = emo;
            span.addEventListener('click', () => {
                chatInput.value += emo;
                sfx.type();
            });
            quickBar.appendChild(span);
        });
    }

    // 2. Emote Picker Toggle
    if (emoteBtn && emotePicker) {
        console.log('✓ Emote button found, attaching event listener');
        emoteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emotePicker.classList.toggle('active');
            sfx.click();
            console.log('📁 Emote directory toggled');

            // Prevent scroll manager from detecting height change as user scroll
            if (window.chatScrollManager) {
                window.chatScrollManager.ignoreScrollEventsTemporarily(600);

                // Force scroll to bottom after animation completes
                setTimeout(() => {
                    if (window.chatScrollManager && window.chatScrollManager.chatFeed) {
                        window.chatScrollManager.chatFeed.scrollTop = window.chatScrollManager.chatFeed.scrollHeight;
                    }
                }, 350); // After slide animation
            }
        });

        // 3. Tab Switching (FIXED JIGGLE)
        emoteNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                const targetId = item.dataset.target;
                const targetSection = document.getElementById(`sec-${targetId}`);
                const container = document.querySelector('.emote-directory-content');

                // Visual Selection
                emoteNavItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                sfx.click();

                // MANUAL SCROLL CALCULATION (Prevents Page Jiggle)
                if (targetSection && container) {
                    // Calculate where the section is relative to the container
                    const topPos = targetSection.offsetTop - container.offsetTop;
                    container.scrollTo({
                        top: topPos,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // 4. Insert Emote from Directory
        const allEmotes = document.querySelectorAll('.emote-grid-large span');
        allEmotes.forEach(emo => {
            emo.addEventListener('click', () => {
                chatInput.value += emo.innerText;
                sfx.type(); // feedback
            });
        });

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (!emotePicker.contains(e.target) && e.target !== emoteBtn) {
                emotePicker.classList.remove('active');
            }
        });
    }

    chatInput.addEventListener('keydown', (e) => {
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
            sfx.type();
        }
        if (e.key === 'Enter') sendMessage();
    });

    sendBtn.addEventListener('click', sendMessage);

    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;
        sfx.success();
        chatInput.value = "";
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.style.animation = "slideIn 0.3s ease-out";
        const username = "Operative_01";
        const color = "#0ff";
        msgDiv.innerHTML = `<span class="user" style="color:${color}">${username}:</span> <span class="text">${text}</span>`;
        chatFeed.appendChild(msgDiv);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }
}

// TERMINAL CHAT EMOTE SUPPORT (Same logic as channel.html but for terminal IDs)
const terminalChatInput = document.getElementById('terminal-chat-input');
const terminalChatSend = document.getElementById('terminal-chat-send');
const terminalEmoteBtn = document.getElementById('emote-btn');
const terminalEmotePicker = document.getElementById('emote-picker');

if (terminalChatInput && terminalChatSend && terminalEmoteBtn && terminalEmotePicker) {
    console.log('✓ Terminal chat emote system initialized');

    // Toggle emote picker
    terminalEmoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        terminalEmotePicker.classList.toggle('active');
        console.log('Emote picker toggled:', terminalEmotePicker.classList.contains('active'));
        if (window.sfx) sfx.click();
    });

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!terminalEmotePicker.contains(e.target) && !terminalEmoteBtn.contains(e.target)) {
            terminalEmotePicker.classList.remove('active');
        }
    });

    // Click emote to insert
    const terminalEmoteSpans = terminalEmotePicker.querySelectorAll('.emote-grid-large span');
    terminalEmoteSpans.forEach(span => {
        span.addEventListener('click', () => {
            terminalChatInput.value += span.textContent + ' ';
            terminalChatInput.focus();
            if (window.sfx) sfx.click();
        });
    });
}


/* 
   ================================================
   4. AUTH PAGE LOGIC
   ================================================
*/
const authTitleElement = document.getElementById('auth-title-text');
const authHackingBg = document.getElementById('auth-hacking-bg');
const nodeCanvas = document.getElementById('node-canvas');
const statusList = document.getElementById('status-list');

if (authTitleElement) {
    const isSignUp = window.location.pathname.includes('signup');
    const authString = isSignUp ? "CREATE ACCOUNT" : "SIGN IN";
    let authCharIndex = 0;

    function typeAuthTitle() {
        if (authCharIndex < authString.length) {
            authTitleElement.textContent += authString.charAt(authCharIndex);
            authCharIndex++;
            setTimeout(typeAuthTitle, 80);
        }
    }
    setTimeout(typeAuthTitle, 1500);

    const authCodeLines = [
        "> verifying_credentials...", "> handshake_initiated", "> ssl_certificate: VALID", "> connection: SECURE",
        "> ping: 12ms", "> loading_user_module...", "> decrypting_session_key", "> firewall: BYPASSED",
        "> neural_link: STANDBY", "> awaiting_input..."
    ];

    function runAuthHacking() {
        if (!authHackingBg) return;
        setInterval(() => {
            if (Math.random() < 0.15) authHackingBg.innerHTML = "";
            const randomLine = authCodeLines[Math.floor(Math.random() * authCodeLines.length)];
            const lineElement = document.createElement('div');
            lineElement.innerText = randomLine;
            authHackingBg.appendChild(lineElement);
            if (authHackingBg.children.length > 25) {
                authHackingBg.removeChild(authHackingBg.firstChild);
            }
        }, 300);
    }
    runAuthHacking();

    let nodes = [];
    let ctx = null;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let completedFields = 0;
    let totalFields = 0;
    let nodeSpawnRate = 2000;
    let spawnTimeout = null;

    function initNodeCanvas() {
        if (!nodeCanvas) return;
        ctx = nodeCanvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animateNodes();
        spawnNodeLoop();
    }

    function resizeCanvas() {
        if (!nodeCanvas) return;
        const panel = nodeCanvas.parentElement;
        if (panel) {
            canvasWidth = panel.offsetWidth;
            canvasHeight = panel.offsetHeight;
            nodeCanvas.width = canvasWidth;
            nodeCanvas.height = canvasHeight;
        }
    }

    function spawnNode() {
        if (!ctx) return;
        const node = {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            radius: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: 0,
            targetAlpha: 0.8
        };
        nodes.push(node);
        if (nodes.length > 100) nodes.shift();
    }

    function spawnNodeLoop() {
        if (!nodeCanvas) return;
        spawnNode();
        spawnTimeout = setTimeout(spawnNodeLoop, nodeSpawnRate);
    }

    function animateNodes() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        nodes.forEach((node, i) => {
            node.x += node.vx;
            node.y += node.vy;
            if (node.x < 0 || node.x > canvasWidth) node.vx *= -1;
            if (node.y < 0 || node.y > canvasHeight) node.vy *= -1;
            if (node.alpha < node.targetAlpha) node.alpha += 0.02;

            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 255, ${node.alpha})`;
            ctx.fill();

            nodes.forEach((otherNode, j) => {
                if (i === j) return;
                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 80) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(otherNode.x, otherNode.y);
                    ctx.strokeStyle = `rgba(0, 255, 255, ${(1 - dist / 80) * 0.3 * node.alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
        requestAnimationFrame(animateNodes);
    }
    initNodeCanvas();

    const inputGroups = document.querySelectorAll('.input-group[data-field]');
    totalFields = inputGroups.length;

    const fieldStatusMap = {
        'username': 'status-username',
        'email': 'status-email',
        'password': 'status-password',
        'confirm': 'status-confirm'
    };

    inputGroups.forEach(group => {
        const input = group.querySelector('input');
        const fieldName = group.dataset.field;
        const checkMark = group.querySelector('.field-check');
        const inputWrapper = group.querySelector('.input-wrapper');

        if (input) {
            input.addEventListener('blur', () => {
                if (input.value.trim().length > 0) {
                    if (!group.classList.contains('completed')) {
                        group.classList.add('completed');
                        if (inputWrapper) inputWrapper.classList.add('completed');
                        if (checkMark) checkMark.classList.add('visible');
                        completedFields++;
                        updateStatusPanel(fieldName, true);
                        updateNodeSpeed();
                        for (let i = 0; i < 5; i++) spawnNode();
                        checkAllComplete();
                        sfx.success();
                    }
                } else {
                    if (group.classList.contains('completed')) {
                        group.classList.remove('completed');
                        if (inputWrapper) inputWrapper.classList.remove('completed');
                        if (checkMark) checkMark.classList.remove('visible');
                        completedFields--;
                        updateStatusPanel(fieldName, false);
                        updateNodeSpeed();
                        checkAllComplete();
                        sfx.error();
                    }
                }
            });
        }
    });

    function updateStatusPanel(fieldName, isOnline) {
        const statusId = fieldStatusMap[fieldName];
        if (!statusId) return;
        const statusItem = document.getElementById(statusId);
        if (!statusItem) return;
        const statusValue = statusItem.querySelector('.status-value');
        if (statusValue) {
            if (isOnline) {
                statusValue.classList.remove('offline');
                statusValue.classList.add('online');
                statusValue.textContent = 'ONLINE';
            } else {
                statusValue.classList.remove('online');
                statusValue.classList.add('offline');
                statusValue.textContent = 'OFFLINE';
            }
        }
    }

    function updateNodeSpeed() {
        const progress = completedFields / totalFields;
        nodeSpawnRate = Math.max(100, 2000 - (progress * 1900));
    }

    function checkAllComplete() {
        if (completedFields >= totalFields) {
            const neuralStatus = document.getElementById('status-neural');
            if (neuralStatus) {
                const statusValue = neuralStatus.querySelector('.status-value');
                if (statusValue) {
                    statusValue.classList.remove('offline');
                    statusValue.classList.add('online');
                    statusValue.textContent = 'READY';
                }
            }
            if (statusList) statusList.classList.add('complete');
            for (let i = 0; i < 30; i++) setTimeout(() => spawnNode(), i * 50);
        } else {
            const neuralStatus = document.getElementById('status-neural');
            if (neuralStatus) {
                const statusValue = neuralStatus.querySelector('.status-value');
                if (statusValue) {
                    statusValue.classList.remove('online');
                    statusValue.classList.add('offline');
                    statusValue.textContent = 'STANDBY';
                }
            }
            if (statusList) statusList.classList.remove('complete');
        }
    }

    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');
    const submitBtn = document.getElementById('submit-btn');

    function handleFormSubmit(e) {
        e.preventDefault();
        if (!submitBtn) return;
        sfx.click();

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'flex';
        submitBtn.disabled = true;

        if (statusList) statusList.classList.add('complete');
        for (let i = 0; i < 50; i++) setTimeout(() => spawnNode(), i * 30);

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }

    if (signupForm) signupForm.addEventListener('submit', handleFormSubmit);
    if (signinForm) signinForm.addEventListener('submit', handleFormSubmit);
}


/* 
   ================================================
   5. OPERATIVE DOSSIER ENGINE (Profile Editor)
   ================================================
*/
const dossierFrame = document.getElementById('dossier-frame');
const compileBtn = document.getElementById('compile-btn');

console.log('Profile Editor Check:', {
    dossierFrame: dossierFrame ? 'FOUND' : 'NOT FOUND',
    compileBtn: compileBtn ? 'FOUND' : 'NOT FOUND'
});

if (dossierFrame && compileBtn) {
    console.log('✓ Profile editor initialized');
    // Main Modes
    const modeVisual = document.getElementById('mode-visual');
    const modeCode = document.getElementById('mode-code');
    const panelVisual = document.getElementById('panel-visual');
    const panelCode = document.getElementById('panel-code');

    // Code Sub-tabs
    const codeTabs = document.querySelectorAll('.code-tab');
    const codeBoxes = document.querySelectorAll('.code-box');

    const saveBtn = document.getElementById('global-save-btn');
    const resetBtn = document.getElementById('reset-template-btn');
    const navNetrunnerBtn = document.getElementById('nav-netrunner-btn');

    if (navNetrunnerBtn) {
        navNetrunnerBtn.addEventListener('click', () => {
            document.body.classList.toggle('netrunner-mode');
            const isNetrunner = document.body.classList.contains('netrunner-mode');
            navNetrunnerBtn.classList.toggle('active', isNetrunner);
            sfx.click();
            if (isNetrunner) sfx.playTone(200, 'sawtooth', 0.5);
        });
    }

    // Inputs
    const regUsername = document.getElementById('reg-username');
    const regLevel = document.getElementById('reg-level');
    const regColor = document.getElementById('reg-color');
    const regAvatar = document.getElementById('reg-avatar');
    const fileUpload = document.getElementById('file-upload');
    const regBio = document.getElementById('reg-bio');
    const colorHexDisplay = document.getElementById('color-hex');
    const regSocX = document.getElementById('reg-soc-x');
    const regSocInsta = document.getElementById('reg-soc-insta');
    const regSocTikTok = document.getElementById('reg-soc-tiktok');
    const regSocSnap = document.getElementById('reg-soc-snap');
    const regSocYt = document.getElementById('reg-soc-yt');
    const regSocDiscord = document.getElementById('reg-soc-discord');
    const regCustom1 = document.getElementById('reg-custom-1');
    const regCustom2 = document.getElementById('reg-custom-2');
    const regCustom3 = document.getElementById('reg-custom-3');

    /* DEFAULT TEMPLATE */
    const defaults = {
        html: `
<div class="profile-card">
    <div class="header">
        <img src="{{avatar}}" class="p-avatar">
        <h1>{{username}}</h1>
        <div class="badges">
            <span class="badge">NETRUNNER</span>
            <span class="badge">LVL {{level}}</span>
        </div>
    </div>
    <div class="bio">
        <h3>// BIO</h3>
        <p>{{bio}}</p>
    </div>
    <div class="socials">
        <h3>// CONNECT</h3>
        <div class="social-grid">
            <a href="{{soc_x}}" target="_blank" class="soc-btn" title="X"><i class="fa-brands fa-x-twitter"></i></a>
            <a href="{{soc_insta}}" target="_blank" class="soc-btn" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="{{soc_tiktok}}" target="_blank" class="soc-btn" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
            <a href="{{soc_snap}}" target="_blank" class="soc-btn" title="Snapchat"><i class="fa-brands fa-snapchat"></i></a>
            <a href="{{soc_yt}}" target="_blank" class="soc-btn" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
            <a href="{{soc_discord}}" target="_blank" class="soc-btn" title="Discord"><i class="fa-brands fa-discord"></i></a>
        </div>
        <div class="custom-links">
            <a href="{{cust_1}}" target="_blank">{{cust_1}}</a>
            <a href="{{cust_2}}" target="_blank">{{cust_2}}</a>
            <a href="{{cust_3}}" target="_blank">{{cust_3}}</a>
        </div>
    </div>
</div>`,
        css: `
body { font-family: 'Rajdhani', sans-serif; color: white; display: flex; flex-direction: column; min-height: 100vh; margin: 0; box-sizing: border-box; padding: 20px; }
.profile-card { width: 100%; max-width: 400px; background: rgba(0,0,0,0.85); border: 1px solid {{themeColor}}; padding: 30px; border-radius: 15px; box-shadow: 0 0 30px {{themeColor}}; text-align: center; margin: auto; }
.p-avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid {{themeColor}}; margin-bottom: 15px; object-fit: cover; }
h1 { margin: 0; font-family: 'Orbitron', sans-serif; letter-spacing: 2px; font-size: 28px; word-wrap: break-word; overflow-wrap: break-word; }
.badges { margin-top: 10px; display: flex; justify-content: center; gap: 10px; }
.badge { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid #333; }
.bio { margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; text-align: left; }
.bio h3, .socials h3 { color: {{themeColor}}; font-size: 14px; margin-bottom: 10px; letter-spacing: 1px; }
.bio p { color: #ccc; line-height: 1.6; font-size: 14px; word-wrap: break-word; overflow-wrap: break-word; }
.socials { margin-top: 25px; text-align: left; }
.social-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px; }
.soc-btn { width: 35px; height: 35px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; border-radius: 5px; color: #fff; text-decoration: none; transition: 0.2s; border: 1px solid transparent; font-size: 14px; }
.soc-btn:hover { background: {{themeColor}}; color: #000; box-shadow: 0 0 10px {{themeColor}}; }
a[href=""], a[href="undefined"] { display: none; }
.custom-links a { display: block; color: {{themeColor}}; text-decoration: none; font-size: 14px; margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.custom-links a:hover { text-decoration: underline; }`,
        js: `console.log("Profile Loaded");`,
        configs: `{}`,
        data: `{\n    "username": "Operative_01",\n    "level": "55",\n    "themeColor": "#00ffff",\n    "avatar": "https://ui-avatars.com/api/?name=Operative+01&background=0ff&color=000&size=150",\n    "bio": "Elite netrunner. Streaming mostly FPS and RPGs.",\n    "soc_x": "",\n    "soc_insta": "",\n    "soc_tiktok": "",\n    "soc_snap": "",\n    "soc_yt": "",\n    "soc_discord": "",\n    "cust_1": "",\n    "cust_2": "",\n    "cust_3": ""\n}`
    };

    // Use v2 key to force new defaults for bug fix
    const savedData = JSON.parse(localStorage.getItem('flow_profile_data_v2')) || defaults;

    function loadEditors(data) {
        ['html', 'css', 'js', 'configs', 'data'].forEach(type => {
            const el = document.querySelector(`#editor-${type} textarea`);
            if (el) el.value = data[type];
        });
        syncDataToRegular();
        compileProfile();
    }
    loadEditors(savedData);

    // --- NEW TAB LOGIC ---
    // 1. Main Mode Switching (Visual vs Code)
    function switchMode(mode) {
        if (mode === 'visual') {
            modeVisual.classList.add('active');
            modeCode.classList.remove('active');
            panelVisual.classList.add('active');
            panelCode.classList.remove('active');
        } else {
            modeVisual.classList.remove('active');
            modeCode.classList.add('active');
            panelVisual.classList.remove('active');
            panelCode.classList.add('active');
        }
        sfx.hover(); // reuse hover sound for switch
    }

    if (modeVisual && modeCode) {
        modeVisual.addEventListener('click', () => switchMode('visual'));
        modeCode.addEventListener('click', () => switchMode('code'));
    }

    // 2. Code Sub-tab Switching
    if (codeTabs && codeBoxes) {
        codeTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                // Deactivate all
                codeTabs.forEach(t => t.classList.remove('active'));
                codeBoxes.forEach(b => b.classList.remove('active'));

                // Activate clicked
                this.classList.add('active');
                const targetId = this.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
                sfx.hover();
            });
        });
    }

    // Compile Button Listener
    if (compileBtn) {
        compileBtn.addEventListener('click', () => {
            compileProfile();
            sfx.success();
        });
    }

    // Reset Button Listener
    console.log('Checking for reset button:', document.getElementById('reset-template-btn'));
    if (resetBtn) {
        console.log('✓ Reset button found, attaching listener');
        const modalOverlay = document.getElementById('reset-modal-overlay');
        const modalConfirm = document.getElementById('reset-modal-confirm');
        const modalCancel = document.getElementById('reset-modal-cancel');

        resetBtn.addEventListener('click', (e) => {
            console.log('🔴 RESET BUTTON CLICKED!');
            e.preventDefault();
            e.stopPropagation();
            if (modalOverlay) {
                modalOverlay.classList.add('active');
                if (window.sfx) sfx.click();
            }
        });

        if (modalConfirm) {
            console.log('✓ Modal confirm button found, attaching listener');
            modalConfirm.addEventListener('click', () => {
                console.log('🟢 CONFIRM BUTTON CLICKED!');

                // Get ALL editor elements
                const htmlEditor = document.querySelector('#editor-html textarea');
                const cssEditor = document.querySelector('#editor-css textarea');
                const jsEditor = document.querySelector('#editor-js textarea');
                const configsEditor = document.querySelector('#editor-configs textarea');
                const dataEditor = document.querySelector('#editor-data textarea');

                console.log('Editors found:', {
                    htmlEditor: htmlEditor ? 'YES' : 'NO',
                    cssEditor: cssEditor ? 'YES' : 'NO',
                    jsEditor: jsEditor ? 'YES' : 'NO',
                    configsEditor: configsEditor ? 'YES' : 'NO',
                    dataEditor: dataEditor ? 'YES' : 'NO'
                });

                // Reset ALL editors to defaults
                if (htmlEditor) {
                    console.log('Resetting HTML editor');
                    htmlEditor.value = defaults.html;
                }
                if (cssEditor) {
                    console.log('Resetting CSS editor');
                    cssEditor.value = defaults.css;
                }
                if (jsEditor) {
                    console.log('Resetting JS editor');
                    jsEditor.value = defaults.js;
                }
                if (configsEditor) {
                    console.log('Resetting CONFIGS editor');
                    configsEditor.value = defaults.configs;
                }
                if (dataEditor) {
                    console.log('Resetting DATA editor (username, bio, etc.)');
                    dataEditor.value = defaults.data;
                }

                // Sync data back to visual inputs
                syncDataToRegular();

                // Recompile
                console.log('Calling compileProfile()');
                compileProfile();
                if (window.sfx) sfx.success();

                // Hide modal
                console.log('Hiding modal');
                modalOverlay.classList.remove('active');

                // Show success message
                setTimeout(() => {
                    alert('✓ Profile reset to default template');
                }, 100);
            });
        } else {
            console.error('❌ Modal confirm button NOT FOUND');
        }

        if (modalCancel) {
            modalCancel.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
                if (window.sfx) sfx.click();
            });
        }
    } else {
        console.error('❌ Reset button NOT FOUND in DOM');
    }

    if (fileUpload) {
        fileUpload.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    regAvatar.value = e.target.result;
                    syncRegularToData();
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    function syncDataToRegular() {
        const dataRaw = document.querySelector('#editor-data textarea').value;
        try {
            const data = JSON.parse(dataRaw);
            if (regUsername) regUsername.value = data.username || "";
            if (regLevel) regLevel.value = data.level || "";
            if (regColor) {
                regColor.value = data.themeColor || "#00ffff";
                if (colorHexDisplay) colorHexDisplay.textContent = data.themeColor || "#00ffff";
            }
            if (regAvatar) regAvatar.value = data.avatar || "";
            if (regBio) regBio.value = data.bio || "";
            if (regSocX) regSocX.value = data.soc_x || "";
            if (regSocInsta) regSocInsta.value = data.soc_insta || "";
            if (regSocTikTok) regSocTikTok.value = data.soc_tiktok || "";
            if (regSocSnap) regSocSnap.value = data.soc_snap || "";
            if (regSocYt) regSocYt.value = data.soc_yt || "";
            if (regSocDiscord) regSocDiscord.value = data.soc_discord || "";
            if (regCustom1) regCustom1.value = data.cust_1 || "";
            if (regCustom2) regCustom2.value = data.cust_2 || "";
            if (regCustom3) regCustom3.value = data.cust_3 || "";
        } catch (e) { }
    }

    function syncRegularToData() {
        let currentData = {};
        try { currentData = JSON.parse(document.querySelector('#editor-data textarea').value); } catch (e) { currentData = {}; }

        currentData.username = regUsername.value;
        currentData.level = regLevel.value;
        currentData.themeColor = regColor.value;
        currentData.avatar = regAvatar.value;
        currentData.bio = regBio.value;
        currentData.soc_x = regSocX.value;
        currentData.soc_insta = regSocInsta.value;
        currentData.soc_tiktok = regSocTikTok.value;
        currentData.soc_snap = regSocSnap.value;
        currentData.soc_yt = regSocYt.value;
        currentData.soc_discord = regSocDiscord.value;
        currentData.cust_1 = regCustom1.value;
        currentData.cust_2 = regCustom2.value;
        currentData.cust_3 = regCustom3.value;

        document.querySelector('#editor-data textarea').value = JSON.stringify(currentData, null, 4);
        compileProfile();
    }

    const colorValDisplay = document.getElementById('color-val-display');

    const regularInputs = [regUsername, regLevel, regColor, regAvatar, regBio, regSocX, regSocInsta, regSocTikTok, regSocSnap, regSocYt, regSocDiscord, regCustom1, regCustom2, regCustom3];
    regularInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                if (input === regColor && colorValDisplay) colorValDisplay.textContent = input.value.toUpperCase();
                syncRegularToData();
            });
            // Add change event specifically for color picker
            if (input === regColor) {
                input.addEventListener('change', () => {
                    if (colorValDisplay) colorValDisplay.textContent = input.value.toUpperCase();
                    syncRegularToData();
                });
            }
        }
    });

    // DUPLICATE RESET HANDLER REMOVED - Using the one above with better logging

    // CHATTER METRIC - Updates as user types in bio
    const chatterFill = document.getElementById('chatter-fill');
    if (regBio && chatterFill) {
        const MAX_CHATTER_CHARS = 160;

        function updateChatterLevel() {
            const bioLength = regBio.value.length;
            const percent = Math.min(100, (bioLength / MAX_CHATTER_CHARS) * 100);
            chatterFill.style.width = percent + '%';
        }

        regBio.addEventListener('input', updateChatterLevel);
        regBio.addEventListener('keyup', updateChatterLevel);
        regBio.addEventListener('paste', () => setTimeout(updateChatterLevel, 10));

        // Initialize
        updateChatterLevel();
    }

    // =============================================
    // ACHIEVEMENT TRACKER SYSTEM
    // =============================================
    const achievementTracker = document.getElementById('achievement-tracker');
    const achievementDropdown = document.getElementById('achievement-dropdown');
    const achievementContent = document.getElementById('achievement-content');

    if (achievementTracker && achievementDropdown && achievementContent) {
        // Tier Data
        const tiers = {
            affiliate: {
                name: 'AFFILIATE',
                subtitle: 'Entry-Level Monetized',
                icon: '⭐',
                color: '#0ff',
                requirements: [
                    '≥ 50 followers',
                    '≥ 8 hours streamed in the last 30 days',
                    '≥ 3 different stream days',
                    'Average 2+ viewers'
                ],
                benefits: [
                    'Can receive subscriptions, tips, gifts',
                    'Access to basic emotes & custom badges'
                ],
                split: { creator: 80, platform: 20 }
            },
            verified: {
                name: 'VERIFIED',
                subtitle: 'Mid-tier / Serious Creators',
                icon: '⭐',
                color: '#ff0055',
                requirements: [
                    '≥ 250 followers',
                    '≥ 25 active paid subscribers, OR',
                    '≥ 15 average concurrent viewers (30-day window)',
                    'Consistent activity: ≥ 20 streaming hours in last 30 days'
                ],
                benefits: [
                    'More emotes, channel customization',
                    'Verified badge',
                    'Priority in support queue',
                    'Early access to new features'
                ],
                split: { creator: 85, platform: 15 }
            },
            partner: {
                name: 'PARTNER',
                subtitle: 'Professional / High-performing Creators',
                icon: '⭐',
                color: '#00ff88',
                requirements: [
                    '≥ 1,000 followers',
                    '≥ 100 active paid subscribers, OR',
                    '≥ 75 average concurrent viewers (30-day window)',
                    'Must maintain requirements for 2 out of 3 months'
                ],
                benefits: [
                    'Partner badge',
                    'Revenue bonuses (ads, sponsored placements)',
                    'Priority discovery (homepage rotation)',
                    'Faster payouts',
                    'Access to advanced analytics',
                    'Larger upload/VOD limits'
                ],
                split: { creator: 90, platform: 10 }
            }
        };

        // Load state from localStorage or default to demo mode
        let achievementState = JSON.parse(localStorage.getItem('flow_achievement_state')) || {
            currentTier: 'affiliate',
            progress: { affiliate: 45, verified: 0, partner: 0 },
            completed: { affiliate: false, verified: false, partner: false }
        };

        function saveAchievementState() {
            localStorage.setItem('flow_achievement_state', JSON.stringify(achievementState));
        }

        function renderTierContent(tierKey) {
            const tier = tiers[tierKey];
            const isCompleted = achievementState.completed[tierKey];

            achievementContent.innerHTML = `
                <div class="tier-title ${tierKey}">
                    <span class="tier-icon">${tier.icon}</span>
                    <span>${tier.name}</span>
                    <span class="tier-subtitle">(${tier.subtitle})</span>
                    ${isCompleted ? '<span style="color:#00ff88; margin-left:auto;">✓ COMPLETED</span>' : ''}
                </div>
                
                <div class="tier-section requirements">
                    <h4>Requirements</h4>
                    <ul>
                        ${tier.requirements.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="tier-section benefits">
                    <h4>Benefits</h4>
                    <ul>
                        ${tier.benefits.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="revenue-split">
                    <span class="split-label">Revenue Split:</span>
                    <span class="split-value">
                        <span class="creator">${tier.split.creator}% Creator</span> / 
                        <span class="platform">${tier.split.platform}% Platform</span>
                    </span>
                </div>
            `;
        }

        function updateBars() {
            const affiliateBar = document.getElementById('affiliate-bar');
            const verifiedBar = document.getElementById('verified-bar');
            const partnerBar = document.getElementById('partner-bar');

            const affiliateLabel = document.getElementById('affiliate-label');
            const verifiedLabel = document.getElementById('verified-label');
            const partnerLabel = document.getElementById('partner-label');

            // Update progress bars
            if (affiliateBar) affiliateBar.style.width = (achievementState.completed.affiliate ? 100 : achievementState.progress.affiliate) + '%';
            if (verifiedBar) verifiedBar.style.width = (achievementState.completed.verified ? 100 : achievementState.progress.verified) + '%';
            if (partnerBar) partnerBar.style.width = (achievementState.completed.partner ? 100 : achievementState.progress.partner) + '%';

            // Add completed class for flashing animation
            if (affiliateLabel && achievementState.completed.affiliate) affiliateLabel.classList.add('completed');
            if (verifiedLabel && achievementState.completed.verified) verifiedLabel.classList.add('completed');
            if (partnerLabel && achievementState.completed.partner) partnerLabel.classList.add('completed');

            // Mark current tier as in-progress
            document.querySelectorAll('.stat-line[data-tier]').forEach(line => {
                line.classList.remove('in-progress');
            });
            const currentLine = document.querySelector(`.stat-line[data-tier="${achievementState.currentTier}"]`);
            if (currentLine && !achievementState.completed[achievementState.currentTier]) {
                currentLine.classList.add('in-progress');
            }
        }

        // Toggle dropdown
        achievementTracker.addEventListener('click', (e) => {
            if (e.target.closest('.achievement-dropdown')) return; // Don't toggle if clicking inside dropdown

            achievementTracker.classList.toggle('expanded');
            sfx.click();

            if (achievementTracker.classList.contains('expanded')) {
                renderTierContent(achievementState.currentTier);
            }
        });

        // Initialize
        updateBars();
        renderTierContent(achievementState.currentTier);

        // Demo mode: Simulate progress (can be removed later for auto-detect)
        // REMINDER: User wants to be asked about switching to auto-detect mode later
    }

    const textareas = document.querySelectorAll('.code-editor textarea');
    textareas.forEach(ta => {
        ta.addEventListener('scroll', () => { ta.previousElementSibling.scrollTop = ta.scrollTop; });
        ta.addEventListener('input', () => {
            updateLineNumbers(ta);
        });
        ta.addEventListener('keyup', () => updateCursorPos(ta));
        ta.addEventListener('click', () => updateCursorPos(ta));
    });

    function updateLineNumbers(textarea) {
        const lines = textarea.value.split('\n').length;
        const gutter = textarea.previousElementSibling;
        gutter.innerHTML = Array(lines).fill('<span></span>').map((_, i) => `<div>${i + 1}</div>`).join('');
    }

    function updateCursorPos(textarea) {
        // Simple cursor tracking
    }

    function compileProfile() {
        let html = document.querySelector('#editor-html textarea').value;
        let css = document.querySelector('#editor-css textarea').value;
        let js = document.querySelector('#editor-js textarea').value;
        let dataRaw = document.querySelector('#editor-data textarea').value;

        let dataObj = {};
        try { dataObj = JSON.parse(dataRaw); } catch (e) { return; }

        function injectVariables(content) {
            return content.replace(/\{\{(.*?)\}\}/g, (match, key) => dataObj[key.trim()] || match);
        }
        html = injectVariables(html);
        css = injectVariables(css);

        const masterCSS = `html, body { height: 100%; margin: 0; padding: 0; width: 100%; overflow-x: hidden; overflow-y: auto; background: transparent; } 
        ::-webkit-scrollbar { width: 8px; } 
        ::-webkit-scrollbar-track { background: transparent; } 
        ::-webkit-scrollbar-thumb { background: rgba(0, 255, 255, 0.3); border-radius: 4px; } 
        ::-webkit-scrollbar-thumb:hover { background: #0ff; }`;
        const docContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet"><style>${masterCSS} ${css}</style></head><body>${html}<script>try { ${js} } catch(err) { window.parent.postMessage({ type: 'error', msg: err.message }, '*'); }</script></body></html>`;

        const blob = new Blob([docContent], { type: 'text/html;charset=utf-8' });
        dossierFrame.src = URL.createObjectURL(blob);
    }

    saveBtn.addEventListener('click', () => {
        const saveData = {
            html: document.querySelector('#editor-html textarea').value,
            css: document.querySelector('#editor-css textarea').value,
            js: document.querySelector('#editor-js textarea').value,
            configs: document.querySelector('#editor-configs textarea').value,
            data: document.querySelector('#editor-data textarea').value
        };
        localStorage.setItem('flow_profile_data_v2', JSON.stringify(saveData));
        alert("DOSSIER SAVED TO LOCAL STORAGE");
        sfx.success();
    });

    // Fix for the missing tabBtns definition
    const tabBtns = document.querySelectorAll('.term-tab');
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // This logic is handled by switchMode above, but if you have extra tabs in the future:
                sfx.click();
            });
        });
    }

    setTimeout(compileProfile, 500);
    compileBtn.addEventListener('click', () => {
        compileProfile();
        sfx.click();
    });
}


/* 
   ================================================
   6. INTERACTIVE FOOTER TERMINAL
   ================================================
*/
const terminalBody = document.getElementById('footer-terminal');
const terminalHeader = document.querySelector('.terminal-header');
const footerBinary = document.getElementById('footer-binary');
const pingValue = document.getElementById('ping-value');

if (terminalBody) {
    terminalBody.innerHTML = '';
    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-input-line';
    inputLine.innerHTML = `<span class="prompt">guest@flow:~$</span> <input type="text" id="term-input" autocomplete="off" spellcheck="false">`;
    terminalBody.appendChild(inputLine);
    const termInput = document.getElementById('term-input');

    const print = (text, type = 'info') => {
        const line = document.createElement('div');
        line.className = `line ${type}`;
        line.innerText = text;
        terminalBody.insertBefore(line, inputLine);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    };

    print("FlowOS v2.4 initialized...", 'success');
    print("Type 'help' for commands.");

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = termInput.value.trim().toLowerCase();
            print(`> ${cmd}`, 'info');
            termInput.value = '';
            sfx.click();

            switch (cmd) {
                case 'help':
                    print("Available Commands:", 'info');
                    print("  help      - Show this menu", 'info');
                    print("  status    - Check system diagnostics", 'info');
                    print("  clear     - Clear terminal", 'info');
                    print("  home      - Navigate to Home", 'success');
                    print("  hack      - [ENCRYPTED]", 'warning');
                    break;
                case 'clear':
                    terminalBody.innerHTML = '';
                    terminalBody.appendChild(inputLine);
                    termInput.focus();
                    break;
                case 'status':
                    print("System Integrity: 98%", 'success');
                    print("Ping: " + Math.floor(Math.random() * 20 + 5) + "ms", 'info');
                    print("Firewall: ACTIVE", 'success');
                    break;
                case 'home':
                    print("Navigating...", 'success');
                    setTimeout(() => window.location.href = 'index.html', 1000);
                    break;
                case 'hack':
                    print("ACCESS DENIED. AUTHORIZATION REQUIRED.", 'error');
                    sfx.error();
                    break;
                case 'sudo hack':
                    print("NICE TRY, SCRIPT KIDDIE.", 'warning');
                    break;
                default:
                    if (cmd !== '') print(`Command not found: ${cmd}`, 'error');
            }
        }
    });

    terminalBody.addEventListener('click', () => termInput.focus());

    function generateBinary() {
        if (!footerBinary) return;
        let binaryText = '';
        const chars = '01';
        const length = 5000;
        for (let i = 0; i < length; i++) {
            binaryText += chars.charAt(Math.floor(Math.random() * chars.length));
            if (i % 100 === 0) binaryText += '\n';
        }
        footerBinary.textContent = binaryText;
    }
    generateBinary();
    setInterval(generateBinary, 10000);

    function updatePing() {
        if (!pingValue) return;
        const ping = Math.floor(Math.random() * 17) + 8;
        pingValue.textContent = ping + 'ms';
        if (ping < 15) pingValue.style.color = '#0f0';
        else if (ping < 20) pingValue.style.color = '#ff0';
        else pingValue.style.color = '#f80';
    }
    setInterval(updatePing, 2000);
    updatePing();
}

/* KONAMI CODE - SYSTEM OVERRIDE */
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

window.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateSystemOverride();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateSystemOverride() {
    sfx.success();
    document.documentElement.style.setProperty('--primary-color', '#ff0000');
    document.body.classList.add('system-override');
    const alert = document.createElement('div');
    alert.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(255, 0, 0, 0.2); pointer-events: none; z-index: 9999; display: flex; justify-content: center; align-items: center; animation: flashRed 1s infinite;`;
    alert.innerHTML = `<h1 style="font-size: 100px; color: red; font-family: 'Orbitron'; text-shadow: 0 0 20px red;">SYSTEM OVERRIDE</h1>`;
    document.body.appendChild(alert);
    setTimeout(() => {
        alert.remove();
        document.body.classList.remove('system-override');
    }, 5000);
}

/* 
   ================================================
   7. OPERATOR TERMINAL DASHBOARD
   ================================================
*/

// Only run on terminal page
if (document.body.classList.contains('terminal-layout')) {

    // --- VIEWER COUNT TOGGLE ---
    const viewerChip = document.getElementById('viewer-chip');
    const viewerCount = document.getElementById('viewer-count');
    let viewerVisible = true;
    let actualViewerCount = '1,247';

    if (viewerChip && viewerCount) {
        viewerChip.addEventListener('click', () => {
            viewerVisible = !viewerVisible;
            if (viewerVisible) {
                viewerCount.textContent = actualViewerCount;
                viewerChip.querySelector('i').className = 'fa-solid fa-eye';
            } else {
                viewerCount.textContent = '-';
                viewerChip.querySelector('i').className = 'fa-solid fa-eye-slash';
            }
        });
    }

    // --- UPTIME COUNTER ---
    const uptimeDisplay = document.getElementById('uptime');
    let uptimeSeconds = 9257; // Start at 02:34:17

    function updateUptime() {
        if (!uptimeDisplay) return;
        uptimeSeconds++;
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;
        uptimeDisplay.textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    setInterval(updateUptime, 1000);

    // --- GAME AUTOCOMPLETE ---
    const gameSearch = document.getElementById('game-search');
    const gameDropdown = document.getElementById('game-dropdown');

    const games = [
        'Apex Legends', 'Valorant', 'Call of Duty: Warzone', 'Fortnite',
        'League of Legends', 'Minecraft', 'Grand Theft Auto V', 'Cyberpunk 2077',
        'Elden Ring', 'Counter-Strike 2', 'Overwatch 2', 'Rocket League',
        'Destiny 2', 'World of Warcraft', 'Final Fantasy XIV', 'Genshin Impact',
        'Starfield', 'Baldur\'s Gate 3', 'Diablo IV', 'Helldivers 2'
    ];

    if (gameSearch && gameDropdown) {
        gameSearch.addEventListener('input', () => {
            const query = gameSearch.value.toLowerCase();
            gameDropdown.innerHTML = '';

            if (query.length > 0) {
                const filtered = games.filter(g => g.toLowerCase().includes(query));
                if (filtered.length > 0) {
                    gameDropdown.classList.add('active');
                    filtered.forEach(game => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.textContent = game;
                        item.addEventListener('click', () => {
                            gameSearch.value = game;
                            gameDropdown.classList.remove('active');
                        });
                        gameDropdown.appendChild(item);
                    });
                } else {
                    gameDropdown.classList.remove('active');
                }
            } else {
                gameDropdown.classList.remove('active');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!gameSearch.contains(e.target) && !gameDropdown.contains(e.target)) {
                gameDropdown.classList.remove('active');
            }
        });
    }

    // --- LIVE CODE ANIMATION ---
    const codeTerminal = document.getElementById('code-terminal');

    const codeSnippets = [
        '\n<span class="code-comment">// Processing viewer packet...</span>',
        '\n<span class="code-keyword">await</span> <span class="code-func">handleViewerJoin</span>(<span class="code-string">"NeonUser_42"</span>);',
        '\n<span class="code-success">✓ Viewer authenticated</span>',
        '\n<span class="code-keyword">const</span> chat = <span class="code-func">parseMessage</span>(buffer);',
        '\n<span class="code-comment">// Anti-spam filter active</span>',
        '\n<span class="code-keyword">await</span> stream.<span class="code-func">distributePacket</span>(frame);',
        '\n<span class="code-comment">// Encoding frame 847291...</span>',
        '\n<span class="code-keyword">if</span> (viewer.isSubscriber) { <span class="code-func">grantBadge</span>(); }',
        '\n<span class="code-success">✓ Frame delivered to 1,247 viewers</span>',
        '\n<span class="code-keyword">await</span> <span class="code-func">syncCDN</span>(<span class="code-string">"edge-us-west-2"</span>);'
    ];

    let codeIndex = 0;

    function addCodeLine() {
        if (!codeTerminal) return;
        const codeOutput = codeTerminal.querySelector('.code-output');
        if (codeOutput) {
            codeOutput.innerHTML += codeSnippets[codeIndex];
            codeIndex = (codeIndex + 1) % codeSnippets.length;
            codeTerminal.scrollTop = codeTerminal.scrollHeight;
        }
    }
    setInterval(addCodeLine, 3000);

    // --- SIMULATED ACTIVITY FEED ---
    const activityFeed = document.getElementById('activity-feed');

    const usernames = ['NightOwl', 'CyberKid', 'ElectricDream', 'PixelPunk', 'NeonRider', 'DataGhost', 'VoidWalker', 'SynthMaster'];
    const actions = [
        { type: 'follow', icon: 'fa-heart', text: 'started following' },
        { type: 'subscribe', icon: 'fa-star', text: 'subscribed at <strong>Tier 1</strong>!' },
        { type: 'tokens', icon: 'fa-coins', text: 'sent <strong>100 FLOW TOKENS</strong>' }
    ];

    function addFeedEntry() {
        if (!activityFeed) return;

        const user = usernames[Math.floor(Math.random() * usernames.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];

        const entry = document.createElement('div');
        entry.className = `feed-entry ${action.type}`;
        entry.innerHTML = `
            <div class="entry-icon"><i class="fa-solid ${action.icon}"></i></div>
            <div class="entry-content">
                <span class="entry-user">${user}</span>
                <span class="entry-action">${action.text}</span>
            </div>
            <span class="entry-time">just now</span>
        `;

        activityFeed.insertBefore(entry, activityFeed.firstChild);

        // Remove old entries (keep feed manageable)
        while (activityFeed.children.length > 10) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
    }

    // Add new entry every 8-15 seconds
    setInterval(() => {
        addFeedEntry();
    }, Math.random() * 7000 + 8000);

    // --- VIEWER COUNT SIMULATION ---
    function updateViewerSim() {
        if (!viewerCount || !viewerVisible) return;
        const current = parseInt(actualViewerCount.replace(',', ''));
        const change = Math.floor(Math.random() * 20) - 8; // -8 to +11
        const newCount = Math.max(800, current + change);
        actualViewerCount = newCount.toLocaleString();
        viewerCount.textContent = actualViewerCount;
    }
    setInterval(updateViewerSim, 5000);
}

/* 
   ================================================
   8. PLAYLIST "FLOW" ENGINE
   ================================================
*/
const playlistBtn = document.getElementById('playlist-btn');
const streamTrack = document.getElementById('stream-track');
const videoContainer = document.getElementById('main-video-container');

if (playlistBtn && streamTrack && videoContainer) {
    let playlistActive = false;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let currentIndex = 0;

    // Toggle Playlist Mode
    playlistBtn.addEventListener('click', () => {
        playlistActive = !playlistActive;
        playlistBtn.classList.toggle('active');
        sfx.click();

        if (playlistActive) {
            // Visual feedback that playlist is ready
            sfx.playTone(800, 'sine', 0.1);
            videoContainer.style.borderColor = "#00ff88"; // Green border for "Playlist Ready"
        } else {
            videoContainer.style.borderColor = "rgba(0, 255, 255, 0.2)"; // Revert

            // IMPORTANT: When disabling playlist mode, pause/mute all non-visible streams
            const slides = document.querySelectorAll('.stream-slide');
            slides.forEach((slide, index) => {
                const video = slide.querySelector('video.video-feed');
                if (video && !slide.classList.contains('active')) {
                    // This stream is not visible, pause and mute it
                    video.pause();
                    video.muted = true;
                    console.log(`⏸️ Paused non-visible stream ${index}`);
                }
            });
            console.log('🎵 Playlist mode OFF - Only active stream playing');
        }
    });

    // Touch/Mouse Events
    videoContainer.addEventListener('mousedown', touchStart);
    videoContainer.addEventListener('touchstart', touchStart);

    // CRITICAL: Attach these immediately to window as well for robustness
    // But logically, we only attach window listeners AFTER mousedown
    // So the initial listeners must be on the container

    function touchStart(event) {
        if (!playlistActive) return;

        // CRITICAL: Prevent default behavior (stops image ghost dragging)
        event.preventDefault();

        isDragging = true;
        startPos = getPositionX(event);

        // Disable transition for 1:1 movement
        streamTrack.style.transition = 'none';

        // Add grabbing cursor
        document.body.classList.add('is-dragging-playlist');
        document.body.style.cursor = 'grabbing';

        // Attach global listeners
        window.addEventListener('mousemove', touchMove);
        window.addEventListener('mouseup', touchEnd);
        window.addEventListener('touchmove', touchMove, { passive: false });
        window.addEventListener('touchend', touchEnd);
    }

    function touchMove(event) {
        if (!isDragging) return;

        const currentPosition = getPositionX(event);
        const diff = currentPosition - startPos;
        currentTranslate = prevTranslate + diff;

        streamTrack.style.transform = `translateX(${currentTranslate}px)`;
    }

    function touchEnd() {
        if (!isDragging) return;
        isDragging = false;

        // Restore transition
        streamTrack.style.transition = 'transform 0.3s ease-out';

        // Restore cursor
        document.body.classList.remove('is-dragging-playlist');
        document.body.style.cursor = '';

        // Remove listeners
        window.removeEventListener('mousemove', touchMove);
        window.removeEventListener('mouseup', touchEnd);
        window.removeEventListener('touchmove', touchMove);
        window.removeEventListener('touchend', touchEnd);

        const movedBy = currentTranslate - prevTranslate;
        const threshold = 100; // sensitivity

        // Snap Logic
        if (movedBy < -threshold && currentIndex < 1) {
            currentIndex += 1;
        } else if (movedBy > threshold && currentIndex > 0) {
            currentIndex -= 1;
        }

        setPositionByIndex();
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function setPositionByIndex() {
        const containerWidth = videoContainer.clientWidth;
        currentTranslate = currentIndex * -containerWidth;
        prevTranslate = currentTranslate;

        streamTrack.style.transform = `translateX(${currentTranslate}px)`;

        updateStreamContext(currentIndex);
    }

    // STREAM CONTEXT SWITCHER (Chat & Info)
    function updateStreamContext(index) {
        const slides = document.querySelectorAll('.stream-slide');
        const activeSlide = slides[index];
        const streamerName = activeSlide.dataset.streamer;
        const gameName = activeSlide.dataset.game;

        // CRITICAL: Switch the actual video stream
        if (window.videoPlayer) {
            window.videoPlayer.switchStream(index);
            console.log(`🎬 Playlist switched video to stream ${index}`);
        }

        // 1. Update Info Text
        const titleEl = document.querySelector('.stream-title');
        const nameEl = document.querySelector('.streamer-name');
        const categoryEl = document.querySelector('.stream-category span');

        if (titleEl) titleEl.style.opacity = 0;

        setTimeout(() => {
            if (index === 0) {
                // Default Streamer
                if (nameEl) nameEl.innerHTML = `SkateGamer_OG <i class="fa-solid fa-circle-check" style="color:#0ff;"></i>`;
                if (titleEl) titleEl.textContent = "Ranked Competitive Matches | Drop Enabled [EN]";
                if (categoryEl) categoryEl.textContent = "ARC RAIDERS";
                refreshChat("SkateGamer_OG", "#0ff");
            } else {
                // Second Streamer (The Playlist one)
                if (nameEl) nameEl.innerHTML = `Neon_Valkyrie <i class="fa-solid fa-circle-check" style="color:#ff0055;"></i>`;
                if (titleEl) titleEl.textContent = "Night City Free Roam // Netrunner Build";
                if (categoryEl) categoryEl.textContent = "CYBERPUNK 2077";
                refreshChat("Neon_Valkyrie", "#ff0055");
            }
            if (titleEl) titleEl.style.opacity = 1;
        }, 200);

        sfx.playTone(600, 'sine', 0.2); // Success 'swish' sound
    }

    function refreshChat(streamerName, color) {
        const chatFeed = document.getElementById('chat-feed');
        const chatHeader = document.querySelector('.chat-header h3');
        if (!chatFeed) return;

        // DISABLED: Keep chat rolling across streams instead of clearing
        // chatFeed.innerHTML = '';

        // Update header with typing animation
        if (chatHeader) {
            const targetText = `STREAM_CHAT :: ${streamerName.toUpperCase()}`;
            let currentText = '';
            let charIndex = 0;

            const typeInterval = setInterval(() => {
                if (charIndex < targetText.length) {
                    currentText += targetText[charIndex];
                    chatHeader.innerHTML = `<span id="chat-header-text">${currentText}</span><span class="cursor">|</span>`;
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 30);
        }

        // DISABLED: Don't add system message or sample messages - let chat simulator continue
        // const sysMsg = document.createElement('div');
        // sysMsg.classList.add('message');
        // sysMsg.style.color = '#888';
        // sysMsg.style.fontStyle = 'italic';
        // sysMsg.innerText = `> Connecting to ${streamerName} secure feed...`;
        // chatFeed.appendChild(sysMsg);

        // DISABLED: Don't add sample messages - let chat simulator continue
        // const sampleMessages = [
        //     { user: streamerName, text: "Hey everyone! Thanks for tuning in!", color: color },
        //     { user: "CyberFan", text: "Yooo let's gooo!", color: "#aaa" },
        //     { user: "NetRunner99", text: "This stream is fire 🔥", color: "#0ff" }
        // ];
        // sampleMessages.forEach(msg => {
        //     const messageDiv = document.createElement('div');
        //     messageDiv.className = 'message';
        //     messageDiv.innerHTML = `<span class="user" style="color:${msg.color}">${msg.user}:</span> <span class="text">${msg.text}</span>`;
        //     chatFeed.appendChild(messageDiv);
        // });
    }
}

/* 
   ================================================
   9. BROWSE PAGE LOGIC
   ================================================
*/
const browseGrid = document.getElementById('browse-grid');
const filterChips = document.querySelectorAll('.filter-chip');

if (browseGrid) {
    // 1. Generate Massive Grid
    const browseData = [
        { title: "Ranked Grind", name: "SkateGamer", game: "ARC RAIDERS", viewers: "12k", tags: ["FPS"], image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070" },
        { title: "Chill Coding", name: "DevGuru", game: "CODE", viewers: "2k", tags: ["DEV"], image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2069" },
        { title: "Night City Runs", name: "NeonVal", game: "CYBERPUNK", viewers: "8k", tags: ["RPG"], image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2000" },
        { title: "Synthwave Radio", name: "LofiBot", game: "MUSIC", viewers: "40k", tags: ["MUSIC"], image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070" },
        { title: "Speedrun Any%", name: "Zoomer", game: "ELDEN RING", viewers: "15k", tags: ["RPG"], image: "https://images.unsplash.com/photo-1593305841991-05c29736cec7?q=80&w=2000" },
        { title: "IRL Tokyo Walk", name: "TravelX", game: "IRL", viewers: "12k", tags: ["IRL"], image: "https://images.unsplash.com/photo-1554178286-db443a99268e?q=80&w=2070" },
        { title: "Crypto Analysis", name: "BitLord", game: "TALK", viewers: "5k", tags: ["CRYPTO"], image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2000" },
        { title: "Valorant Radiant", name: "JettMain", game: "VALORANT", viewers: "18k", tags: ["FPS"], image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071" },
    ];

    function renderBrowseGrid(filterType) {
        browseGrid.innerHTML = '';

        // Multiply data to fill screen (x4)
        let displayList = [...browseData, ...browseData, ...browseData, ...browseData];

        // Filter Logic
        if (filterType !== 'all') {
            displayList = displayList.filter(item =>
                item.tags.some(t => t.toLowerCase() === filterType) ||
                item.game.toLowerCase().includes(filterType)
            );
        }

        displayList.forEach((stream, i) => {
            const card = document.createElement('div');
            card.classList.add('stream-card');
            // Add staggered animation
            card.style.animation = `slideIn 0.5s ease-out ${i * 0.05}s forwards`;
            card.style.opacity = '0'; // Start invisible for animation

            card.innerHTML = `
                <div class="thumbnail-container">
                    <img src="${stream.image}" alt="Thumbnail">
                    <div class="live-tag-overlay">LIVE</div>
                    <div class="viewer-count-overlay">${stream.viewers}</div>
                    <div class="watch-overlay"><i class="fa-solid fa-play"></i> WATCH</div>
                </div>
                <div class="stream-info">
                    <img src="https://via.placeholder.com/40" class="card-avatar">
                    <div class="text-content">
                        <div class="stream-title">${stream.title}</div>
                        <div class="streamer-name">${stream.name}</div>
                        <div class="game-name">${stream.game}</div>
                        <div class="tags">${stream.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                sfx.click();
                window.location.href = 'channel.html';
            });

            browseGrid.appendChild(card);
        });
    }

    // 2. Filter Button Logic
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // UI Toggle
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            sfx.click();

            // Render
            const filterType = chip.dataset.filter;
            renderBrowseGrid(filterType);
        });
    });

    // Initial Load
    renderBrowseGrid('all');
}