/*
   ================================================
   AVATAR CIRCLE FIX - Force Circular Shape
   ================================================
   Ensures avatar stays circular even after dynamic changes
*/

(function () {
    'use strict';

    function forceAvatarCircle() {
        const avatars = document.querySelectorAll('.sidebar-user-avatar');

        avatars.forEach(avatar => {
            // Force dimensions
            avatar.style.width = '50px';
            avatar.style.height = '50px';
            avatar.style.minWidth = '50px';
            avatar.style.minHeight = '50px';
            avatar.style.maxWidth = '50px';
            avatar.style.maxHeight = '50px';
            avatar.style.borderRadius = '50%';
            avatar.style.objectFit = 'cover';
            avatar.style.display = 'block';
        });
    }

    // Apply on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceAvatarCircle);
    } else {
        forceAvatarCircle();
    }

    // Re-apply after a short delay to override any dynamic changes
    setTimeout(forceAvatarCircle, 500);
    setTimeout(forceAvatarCircle, 1000);
    setTimeout(forceAvatarCircle, 2000);

    // Watch for any DOM changes that might affect avatar
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.classList.contains('sidebar-user-avatar')) {
                    forceAvatarCircle();
                }
            }
        });
    });

    // Observe avatar changes
    setTimeout(() => {
        const avatars = document.querySelectorAll('.sidebar-user-avatar');
        avatars.forEach(avatar => {
            observer.observe(avatar, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        });
    }, 100);

    console.log('✓ Avatar Circle Fix Applied');
})();
