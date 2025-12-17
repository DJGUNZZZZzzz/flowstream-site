/*
   ================================================
   INTEGRATION FIXES
   ================================================
   Fixes for issues reported by user
*/

document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // 1. BADGE UPDATE SYSTEM
    // ============================================

    function updateAllBadges() {
        if (!window.netrunnerUniversity) {
            console.warn('⚠️ netrunnerUniversity not loaded yet');
            return;
        }

        const count = netrunnerUniversity.getAvailableCount();
        console.log('🔄 Updating all badges, count:', count);

        // Update Netrunner eye badge
        const netrunnerBadge = document.getElementById('netrunner-badge');
        if (netrunnerBadge) {
            if (count > 0) {
                netrunnerBadge.textContent = count;
                netrunnerBadge.style.display = 'flex';
                console.log('  ✓ Netrunner eye badge updated:', count);
            } else {
                netrunnerBadge.style.display = 'none';
            }
        } else {
            console.warn('  ⚠️ netrunner-badge element not found');
        }

        // Update University graduation cap badges
        const universityBadges = document.querySelectorAll('#university-badge');
        console.log('  → Found', universityBadges.length, 'university badges');
        universityBadges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });

        console.log('  ✓ All badges updated');
    }

    // ============================================
    // 2. SHOW/HIDE NETRUNNER UNIVERSITY ICON BASED ON NETRUNNER MODE
    // ============================================

    function updateNetrunnerModeUI() {
        const isNetrunnerMode = document.body.classList.contains('netrunner-mode');
        const universityBtns = document.querySelectorAll('#university-btn');

        console.log('🔄 Updating Netrunner mode UI, isNetrunnerMode:', isNetrunnerMode);

        universityBtns.forEach(btn => {
            if (isNetrunnerMode) {
                btn.style.display = 'inline-block';
            } else {
                btn.style.display = 'none';
            }
        });

        // Update badges regardless of mode
        updateAllBadges();
    }

    // Listen for netrunner mode toggle
    const netrunnerToggle = document.getElementById('netrunner-toggle');
    if (netrunnerToggle) {
        netrunnerToggle.addEventListener('click', function () {
            // Wait for the class to be toggled by the existing script
            setTimeout(updateNetrunnerModeUI, 100);
        });
    }

    // Initial update after a delay to ensure all scripts are loaded
    setTimeout(() => {
        console.log('🚀 Running initial badge update...');
        updateNetrunnerModeUI();
    }, 1500);

    // ============================================
    // 3. SIDEBAR AVATAR DROPDOWN FUNCTIONALITY
    // ============================================

    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarDropdown = document.getElementById('sidebar-dropdown');

    if (sidebarAvatar && sidebarDropdown) {
        sidebarAvatar.addEventListener('click', function (e) {
            e.stopPropagation();
            const isVisible = sidebarDropdown.style.display === 'block';
            sidebarDropdown.style.display = isVisible ? 'none' : 'block';
            if (window.sfx) sfx.click();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!sidebarAvatar.contains(e.target) && !sidebarDropdown.contains(e.target)) {
                sidebarDropdown.style.display = 'none';
            }
        });

        // Wire up sign out button
        const sidebarSignOut = document.getElementById('sidebar-sign-out');
        if (sidebarSignOut) {
            sidebarSignOut.addEventListener('click', function (e) {
                e.preventDefault();
                if (window.sfx) sfx.error();
                // Redirect to home after short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            });
        }
    }

    console.log('✓ Integration Fixes Applied');
});
