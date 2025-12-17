/* 
   ================================================
   VIDEO PLAYER - Mock Live Stream Controller
   ================================================
   Simulates live streaming with HTML5 video
*/

console.log('📹 video-player.js loading...');

class VideoPlayer {
    constructor() {
        this.currentVideoIndex = 0;
        this.isPlaying = true;
        this.volume = 0.5;
        this.isMuted = true; // Start muted for autoplay
        this.isFullscreen = false;
        this.viewerCount = 0;
        this.viewerUpdateInterval = null;

        this.init();
    }

    init() {
        console.log('🎬 Initializing video player...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Replace static images with video elements
        this.replaceImagesWithVideos();

        // Set up controls
        this.setupControls();

        // Start viewer count simulation
        this.startViewerSimulation();

        console.log('✓ Video player initialized');
    }

    replaceImagesWithVideos() {
        const slides = document.querySelectorAll('.stream-slide');

        slides.forEach((slide, index) => {
            const img = slide.querySelector('.video-feed');
            if (!img) return;

            // Get video source from mock data
            const videoSource = window.mockData ?
                window.mockData.getVideoSource(index) :
                { url: '', poster: img.src };

            // Create video element
            const video = document.createElement('video');
            video.className = 'video-feed';
            video.src = videoSource.url;
            video.poster = videoSource.poster;
            video.autoplay = true; // Autoplay both videos
            video.muted = true; // Required for autoplay
            video.loop = true;
            video.playsInline = true;
            video.controls = false; // Use custom controls

            // Handle video load errors - fallback to poster image
            video.addEventListener('error', (e) => {
                console.warn('Video failed to load, using poster image', e);
                video.style.display = 'none';
                img.style.display = 'block';
            });

            // Handle successful load
            video.addEventListener('loadeddata', () => {
                console.log(`✓ Video ${index} loaded successfully`);

                // Store video reference
                if (index === 0) {
                    this.video1 = video;
                    this.currentVideo = video;
                    // Manually trigger play for first video
                    video.play().then(() => {
                        console.log('✓ Video 1 playback started');
                        // Auto-unmute after playback starts
                        setTimeout(() => {
                            video.muted = false;
                            video.volume = 0.5;
                            this.volume = 0.5;
                            this.isMuted = false;
                            this.updateMuteIcon();
                            // Update volume slider visual
                            const volumeLevel = document.querySelector('.volume-level');
                            if (volumeLevel) {
                                volumeLevel.style.width = '50%';
                            }
                            console.log('✓ Audio unmuted at 50% volume');
                        }, 500);
                    }).catch(err => {
                        console.warn('⚠️ Autoplay blocked, click to play:', err.message);
                        this.showPlayButton(video);
                    });
                } else if (index === 1) {
                    this.video2 = video;
                    // Second video - start muted, will play when slide becomes active
                    video.muted = true;
                    video.volume = 0.5;
                    // Trigger play for second video
                    video.play().then(() => {
                        console.log('✓ Video 2 loaded and playing (muted)');
                    }).catch(err => {
                        console.warn('⚠️ Video 2 autoplay issue:', err.message);
                    });
                }
            });

            // Replace image with video
            img.parentNode.insertBefore(video, img);
            img.style.display = 'none'; // Keep as fallback
        });
    }

    showPlayButton(video) {
        // Create a play button overlay
        const playOverlay = document.createElement('div');
        playOverlay.className = 'video-play-overlay';
        playOverlay.innerHTML = '<i class="fa-solid fa-play"></i>';
        playOverlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: rgba(0, 255, 136, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100;
            font-size: 32px;
            color: #000;
            transition: all 0.3s ease;
        `;

        playOverlay.addEventListener('click', () => {
            video.play();
            playOverlay.remove();
            this.isPlaying = true;
        });

        playOverlay.addEventListener('mouseenter', () => {
            playOverlay.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });

        playOverlay.addEventListener('mouseleave', () => {
            playOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        video.parentElement.appendChild(playOverlay);
    }

    setupControls() {
        // Play/Pause button
        const playPauseBtn = document.querySelector('.video-controls .control-btn i.fa-pause');
        if (playPauseBtn && playPauseBtn.parentElement) {
            playPauseBtn.parentElement.addEventListener('click', () => this.togglePlayPause());
        }

        // Volume control - larger hit area
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('click', (e) => this.handleVolumeClick(e));
            // Make it easier to grab
            volumeSlider.style.cursor = 'pointer';
            volumeSlider.style.padding = '10px 0';
        }

        // Mute button - Working inline implementation
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            const self = this;

            muteBtn.addEventListener('click', function () {
                const video = self.getCurrentVideo();
                if (!video) return;

                // Toggle mute state
                self.isMuted = !self.isMuted;
                video.muted = self.isMuted;

                // Update icon and styling
                const icon = muteBtn.querySelector('i');
                if (self.isMuted) {
                    muteBtn.classList.add('muted');
                    if (icon) {
                        icon.classList.remove('fa-volume-high');
                        icon.classList.add('fa-volume-xmark');
                    }
                } else {
                    muteBtn.classList.remove('muted');
                    if (icon) {
                        icon.classList.remove('fa-volume-xmark');
                        icon.classList.add('fa-volume-high');
                    }
                }

                if (window.sfx) window.sfx.click();
            });
        }

        // Quality selector
        const qualityBtn = document.getElementById('quality-btn');
        const qualityMenu = document.getElementById('quality-menu');

        if (qualityBtn && qualityMenu) {
            qualityBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                qualityMenu.classList.toggle('active');
            });

            // Quality options
            qualityMenu.querySelectorAll('.q-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    this.changeQuality(e.target.textContent);
                    qualityMenu.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', () => {
                qualityMenu.classList.remove('active');
            });
        }

        // Fullscreen button
        const fsBtn = document.getElementById('fs-btn');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    togglePlayPause() {
        const video = this.getCurrentVideo();
        if (!video) return;

        const playPauseIcon = document.querySelector('.video-controls .control-btn i.fa-pause, .video-controls .control-btn i.fa-play');

        if (this.isPlaying) {
            video.pause();
            this.isPlaying = false;
            if (playPauseIcon) {
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
            }
        } else {
            video.play();
            this.isPlaying = true;
            if (playPauseIcon) {
                playPauseIcon.classList.remove('fa-play');
                playPauseIcon.classList.add('fa-pause');
            }
        }

        if (window.sfx) window.sfx.click();
    }

    updateVolumeSlider() {
        const volumeLevel = document.querySelector('.volume-level');
        if (volumeLevel) {
            volumeLevel.style.width = `${this.volume * 100}%`;
        }
    }

    updatePlayPauseIcon() {
        const playPauseIcon = document.querySelector('.video-controls .control-btn i.fa-pause, .video-controls .control-btn i.fa-play');
        if (playPauseIcon) {
            if (this.isPlaying) {
                playPauseIcon.classList.remove('fa-play');
                playPauseIcon.classList.add('fa-pause');
            } else {
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
            }
        }
    }

    handleVolumeClick(e) {
        const video = this.getCurrentVideo();
        if (!video) return;

        const slider = e.currentTarget;
        const rect = slider.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;

        this.volume = Math.max(0, Math.min(1, percentage));
        video.volume = this.volume;

        // Unmute if volume is set
        if (this.volume > 0) {
            video.muted = false;
            this.isMuted = false;
            this.updateMuteIcon();
        }

        // Update visual
        const volumeLevel = slider.querySelector('.volume-level');
        if (volumeLevel) {
            volumeLevel.style.width = `${this.volume * 100}%`;
            // Add glitch effect
            volumeLevel.classList.add('changing');
            setTimeout(() => volumeLevel.classList.remove('changing'), 200);
        }

        console.log(`🔊 Volume set to ${Math.round(this.volume * 100)}%`);
    }

    toggleMute() {
        const video = this.getCurrentVideo();
        if (!video) {
            return;
        }

        // Toggle mute state
        this.isMuted = !this.isMuted;
        video.muted = this.isMuted;

        // Update icon AFTER changing state
        this.updateMuteIcon();

        if (window.sfx) window.sfx.click();
    }

    updateMuteIcon() {
        const muteBtn = document.getElementById('mute-btn');
        if (!muteBtn) return;

        const icon = muteBtn.querySelector('i');
        if (!icon) return;

        // Toggle muted class for cyberpunk styling
        if (this.isMuted || this.volume === 0) {
            muteBtn.classList.add('muted');
            icon.classList.remove('fa-volume-high');
            icon.classList.add('fa-volume-xmark');
        } else {
            muteBtn.classList.remove('muted');
            icon.classList.remove('fa-volume-xmark');
            icon.classList.add('fa-volume-high');
        }
    }

    changeQuality(quality) {
        console.log(`📊 Quality changed to: ${quality}`);

        // Update button text
        const qualityBtn = document.getElementById('quality-btn');
        if (qualityBtn) {
            const span = qualityBtn.querySelector('span');
            if (span) span.textContent = quality.split(' ')[0]; // e.g., "1080p"
        }

        // Update active state
        document.querySelectorAll('.q-item').forEach(item => {
            item.classList.toggle('active', item.textContent === quality);
        });

        // In a real app, this would switch video sources
        // For now, just show feedback
        if (window.sfx) window.sfx.click();
    }

    toggleFullscreen() {
        const videoContainer = document.getElementById('main-video-container');
        if (!videoContainer) return;

        if (!this.isFullscreen) {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.webkitRequestFullscreen) {
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.msRequestFullscreen) {
                videoContainer.msRequestFullscreen();
            }
            this.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.isFullscreen = false;
        }

        // Update icon
        const fsIcon = document.querySelector('#fs-btn i');
        if (fsIcon) {
            fsIcon.classList.toggle('fa-expand', !this.isFullscreen);
            fsIcon.classList.toggle('fa-compress', this.isFullscreen);
        }

        if (window.sfx) window.sfx.click();
    }

    handleKeyboard(e) {
        // Space = play/pause
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            this.togglePlayPause();
        }

        // F = fullscreen (but NOT when typing in chat/input)
        if (e.code === 'KeyF' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            this.toggleFullscreen();
        }

        // M = mute (but NOT when typing in chat/input)
        if (e.code === 'KeyM' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            this.toggleMute();
        }
    }

    toggleMute() {
        const video = this.getCurrentVideo();
        if (!video) return;

        this.isMuted = !this.isMuted;
        video.muted = this.isMuted;
    }

    getCurrentVideo() {
        const activeSlide = document.querySelector('.stream-slide.active');
        return activeSlide ? activeSlide.querySelector('video.video-feed') : null;
    }

    // Simulate live viewer count changes
    startViewerSimulation() {
        const viewerCountEl = document.querySelector('.viewers-count');
        if (!viewerCountEl) return;

        // Extract initial count
        const text = viewerCountEl.textContent;
        const match = text.match(/[\d,]+/);
        this.viewerCount = match ? parseInt(match[0].replace(/,/g, '')) : 12403;

        // Update every 5-15 seconds
        this.viewerUpdateInterval = setInterval(() => {
            // Random change between -100 and +200
            const change = Math.floor(Math.random() * 300) - 100;
            this.viewerCount = Math.max(50, this.viewerCount + change);

            // Format with commas
            const formatted = this.viewerCount.toLocaleString();

            // Update display
            const icon = viewerCountEl.querySelector('i');
            if (icon) {
                viewerCountEl.innerHTML = `<i class="fa-solid fa-eye"></i> ${formatted}`;
            } else {
                viewerCountEl.textContent = formatted;
            }
        }, Math.random() * 10000 + 5000); // 5-15 seconds
    }

    // Switch to different stream (for playlist mode)
    switchStream(index) {
        const slides = document.querySelectorAll('.stream-slide');
        if (index >= slides.length) return;

        // Get current video before switching
        const currentVideo = this.getCurrentVideo();

        // Remove active class from all slides
        slides.forEach(slide => slide.classList.remove('active'));

        // Activate new slide
        slides[index].classList.add('active');
        this.currentVideoIndex = index;

        // Get the NEW active video
        const newVideo = this.getCurrentVideo();

        if (!newVideo) {
            console.error('❌ No video found in new slide');
            return;
        }

        console.log(`📺 Switching to stream ${index}`);
        console.log('🎥 New video element:', newVideo);

        // IMPORTANT: DON'T pause or mute the previous stream - let it keep playing!
        if (currentVideo && currentVideo !== newVideo) {
            console.log('🎵 Previous stream continues playing in background');
        }

        // Sync controls with new video's state
        this.isMuted = newVideo.muted;
        this.volume = newVideo.volume;
        this.isPlaying = !newVideo.paused;

        console.log(`🔊 New stream state - Muted: ${this.isMuted}, Volume: ${this.volume}, Playing: ${this.isPlaying}`);

        // Update UI controls to match new video
        this.updateMuteIcon();
        this.updateVolumeSlider();
        this.updatePlayPauseIcon();

        // If new video is not playing, start it MUTED
        if (newVideo.paused) {
            newVideo.muted = true; // Start muted so user can hear previous stream
            newVideo.play().then(() => {
                console.log('▶️ New stream started (muted)');
            }).catch(err => {
                console.warn('⚠️ Autoplay blocked:', err.message);
            });
        }

        console.log(`✓ Switched to stream ${index} - Previous stream still playing`);
    }

    // Cleanup
    destroy() {
        if (this.viewerUpdateInterval) {
            clearInterval(this.viewerUpdateInterval);
        }
    }
}

// Create global instance
let videoPlayer;

function initVideoPlayer() {
    console.log('🎬 Initializing VideoPlayer...');
    videoPlayer = new VideoPlayer();
    window.videoPlayer = videoPlayer;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoPlayer);
} else {
    initVideoPlayer();
}

console.log('✓ video-player.js loaded');
