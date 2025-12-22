/**
 * FLOW STREAMING - Global Search Autocomplete
 * Provides live autocomplete search functionality across all pages
 */

(function () {
    'use strict';

    // Searchable data (mock data for demo)
    const searchData = {
        games: [
            { name: "VALORANT", icon: "fa-crosshairs", viewers: "156K" },
            { name: "FORTNITE", icon: "fa-gamepad", viewers: "234K" },
            { name: "CYBERPUNK 2077", icon: "fa-city", viewers: "89K" },
            { name: "ELDEN RING", icon: "fa-dragon", viewers: "67K" },
            { name: "LIVE DJ", icon: "fa-headphones", viewers: "48K" },
            { name: "THE WORKPLACE", icon: "fa-briefcase", viewers: "25K" },
            { name: "ART", icon: "fa-palette", viewers: "38K" },
            { name: "NEWS & PODCASTS", icon: "fa-newspaper", viewers: "42K" },
            { name: "MUSIC", icon: "fa-music", viewers: "45K" },
            { name: "SOFTWARE DEV", icon: "fa-code", viewers: "28K" },
            { name: "IRL", icon: "fa-camera", viewers: "112K" },
            { name: "JUST CHATTING", icon: "fa-comments", viewers: "312K" },
            { name: "APEX LEGENDS", icon: "fa-crosshairs", viewers: "98K" },
            { name: "MINECRAFT", icon: "fa-cube", viewers: "187K" },
            { name: "LEAGUE OF LEGENDS", icon: "fa-chess", viewers: "276K" },
            { name: "GTA V", icon: "fa-car", viewers: "145K" },
            { name: "SPECIAL EVENTS", icon: "fa-star", viewers: "89K" },
        ],
        channels: [
            { name: "NeonGamer_X", game: "VALORANT", viewers: "12.4K" },
            { name: "CyberKate", game: "CYBERPUNK 2077", viewers: "8.9K" },
            { name: "DevGuru", game: "SOFTWARE DEV", viewers: "2.1K" },
            { name: "SynthWave_DJ", game: "LIVE DJ", viewers: "24.3K" },
            { name: "SpeedRunner99", game: "ELDEN RING", viewers: "5.6K" },
            { name: "TravelVibes", game: "IRL", viewers: "15.2K" },
            { name: "BitLord", game: "NEWS & PODCASTS", viewers: "4.8K" },
            { name: "JettMain", game: "VALORANT", viewers: "18.7K" },
            { name: "VictoryRoyal", game: "FORTNITE", viewers: "31.2K" },
            { name: "MelodyMaster", game: "MUSIC", viewers: "7.3K" },
            { name: "ArtistFlow", game: "ART", viewers: "5.1K" },
            { name: "WorkStreamPro", game: "THE WORKPLACE", viewers: "3.2K" },
        ]
    };

    // CSS for autocomplete (injected if not already present)
    const autocompleteCSS = `
        .nav-search-wrapper {
            position: relative;
            flex: 1;
        }
        .nav-autocomplete-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(10, 10, 15, 0.98);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 350px;
            overflow-y: auto;
            z-index: 10000;
            display: none;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
        }
        .nav-autocomplete-dropdown.active {
            display: block;
        }
        .nav-ac-section {
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nav-ac-section:last-child {
            border-bottom: none;
        }
        .nav-ac-section-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 9px;
            color: #666;
            padding: 4px 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }
        .nav-ac-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .nav-ac-item:hover, .nav-ac-item.selected {
            background: rgba(0, 255, 255, 0.1);
        }
        .nav-ac-item.selected {
            border-left: 2px solid #0ff;
        }
        .nav-ac-icon {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(0, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0ff;
            font-size: 11px;
            flex-shrink: 0;
        }
        .nav-ac-icon.live {
            border: 2px solid #ff0055;
        }
        .nav-ac-icon img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }
        .nav-ac-info {
            flex: 1;
            min-width: 0;
        }
        .nav-ac-title {
            font-family: 'Rajdhani', sans-serif;
            font-size: 13px;
            font-weight: 600;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .nav-ac-title .hl {
            color: #0ff;
            font-weight: 700;
        }
        .nav-ac-meta {
            font-family: 'Share Tech Mono', monospace;
            font-size: 10px;
            color: #888;
        }
        .nav-ac-viewers {
            font-family: 'Share Tech Mono', monospace;
            font-size: 11px;
            color: #ff0055;
        }
        .nav-ac-hint {
            text-align: center;
            padding: 12px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 11px;
            color: #555;
        }
    `;

    // Inject CSS if not present
    function injectCSS() {
        if (!document.getElementById('flow-autocomplete-css')) {
            const style = document.createElement('style');
            style.id = 'flow-autocomplete-css';
            style.textContent = autocompleteCSS;
            document.head.appendChild(style);
        }
    }

    // Initialize autocomplete on a search input
    function initAutocomplete(searchInput, searchBox) {
        if (!searchInput || searchInput.dataset.autocompleteInit) return;
        searchInput.dataset.autocompleteInit = 'true';

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'nav-search-wrapper';
        searchBox.style.position = 'relative';

        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'nav-autocomplete-dropdown';
        dropdown.id = 'nav-ac-' + Math.random().toString(36).substr(2, 9);
        searchBox.appendChild(dropdown);

        let selectedIndex = -1;

        // Live search as you type
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 1) {
                showDropdown(dropdown, query);
            } else {
                hideDropdown(dropdown);
            }
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            const items = dropdown.querySelectorAll('.nav-ac-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items, selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(items, selectedIndex);
            } else if (e.key === 'Enter') {
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    e.preventDefault();
                    items[selectedIndex].click();
                } else if (searchInput.value.trim()) {
                    hideDropdown(dropdown);
                    navigateToSearch(searchInput.value.trim());
                }
            } else if (e.key === 'Escape') {
                hideDropdown(dropdown);
            }
        });

        // Focus shows dropdown
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length >= 1) {
                showDropdown(dropdown, searchInput.value.trim());
            }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target)) {
                hideDropdown(dropdown);
            }
        });
    }

    function showDropdown(dropdown, query) {
        const q = query.toLowerCase();
        let selectedIndex = -1;

        // Find matches
        const matchingGames = searchData.games.filter(g =>
            g.name.toLowerCase().includes(q)
        ).slice(0, 3);

        const matchingChannels = searchData.channels.filter(c =>
            c.name.toLowerCase().includes(q) || c.game.toLowerCase().includes(q)
        ).slice(0, 4);

        // Build HTML
        let html = '';

        if (matchingGames.length > 0) {
            html += `<div class="nav-ac-section">
                <div class="nav-ac-section-title"><i class="fa-solid fa-gamepad"></i> Categories</div>
                ${matchingGames.map(g => `
                    <div class="nav-ac-item" data-type="game" data-value="${g.name}">
                        <div class="nav-ac-icon"><i class="fa-solid ${g.icon}"></i></div>
                        <div class="nav-ac-info">
                            <div class="nav-ac-title">${highlightMatch(g.name, query)}</div>
                            <div class="nav-ac-meta">${g.viewers} viewers</div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        if (matchingChannels.length > 0) {
            html += `<div class="nav-ac-section">
                <div class="nav-ac-section-title"><i class="fa-solid fa-broadcast-tower"></i> Live Channels</div>
                ${matchingChannels.map(c => `
                    <div class="nav-ac-item" data-type="channel" data-value="${c.name}">
                        <div class="nav-ac-icon live"><img src="https://via.placeholder.com/28" alt="${c.name}"></div>
                        <div class="nav-ac-info">
                            <div class="nav-ac-title">${highlightMatch(c.name, query)}</div>
                            <div class="nav-ac-meta">${c.game}</div>
                        </div>
                        <div class="nav-ac-viewers">${c.viewers}</div>
                    </div>
                `).join('')}
            </div>`;
        }

        if (html === '') {
            html = `<div class="nav-ac-hint"><i class="fa-solid fa-search"></i> Press Enter to search for "${query}"</div>`;
        }

        dropdown.innerHTML = html;
        dropdown.classList.add('active');

        // Add click handlers
        dropdown.querySelectorAll('.nav-ac-item').forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                navigateToSearch(value);
                if (window.sfx) sfx.click();
            });
        });
    }

    function hideDropdown(dropdown) {
        dropdown.classList.remove('active');
    }

    function updateSelection(items, selectedIndex) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === selectedIndex);
        });
        if (selectedIndex >= 0 && items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<span class="hl">$1</span>');
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function navigateToSearch(query) {
        window.location.href = `browse.html?q=${encodeURIComponent(query)}`;
    }

    // Initialize on DOM ready
    function init() {
        injectCSS();

        // Find all navbar search boxes
        const searchBoxes = document.querySelectorAll('.search-box');
        searchBoxes.forEach(box => {
            const input = box.querySelector('input[type="text"]');
            if (input) {
                initAutocomplete(input, box);
            }
        });

        console.log('✓ FLOW Autocomplete initialized');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external use if needed
    window.FlowAutocomplete = { init, searchData };
})();
