/**
 * FLOW STREAMING - Game Selector for Creators
 * Provides searchable game/category selection for stream setup
 */

(function () {
    'use strict';

    // Comprehensive game/category database
    const gameDatabase = [
        // FPS / Shooters
        { name: "VALORANT", icon: "fa-crosshairs", category: "FPS", viewers: "156K", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200" },
        { name: "FORTNITE", icon: "fa-gamepad", category: "Battle Royale", viewers: "234K", thumbnail: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=200" },
        { name: "CALL OF DUTY: WARZONE", icon: "fa-crosshairs", category: "FPS", viewers: "189K", thumbnail: "https://images.unsplash.com/photo-1593305841991-05c29736cec7?w=200" },
        { name: "APEX LEGENDS", icon: "fa-crosshairs", category: "Battle Royale", viewers: "98K", thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=200" },
        { name: "COUNTER-STRIKE 2", icon: "fa-crosshairs", category: "FPS", viewers: "312K", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200" },
        { name: "OVERWATCH 2", icon: "fa-crosshairs", category: "FPS", viewers: "78K", thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200" },

        // RPG / Adventure
        { name: "ELDEN RING", icon: "fa-dragon", category: "RPG", viewers: "67K", thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200" },
        { name: "CYBERPUNK 2077", icon: "fa-city", category: "RPG", viewers: "89K", thumbnail: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=200" },
        { name: "BALDUR'S GATE 3", icon: "fa-hat-wizard", category: "RPG", viewers: "145K", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200" },
        { name: "FINAL FANTASY XIV", icon: "fa-dragon", category: "MMORPG", viewers: "56K", thumbnail: "https://images.unsplash.com/photo-1551103782-8ab07afc45c1?w=200" },
        { name: "WORLD OF WARCRAFT", icon: "fa-shield-halved", category: "MMORPG", viewers: "78K", thumbnail: "https://images.unsplash.com/photo-1563191911-e65f8655ebf9?w=200" },

        // Sports / Racing
        { name: "EA FC 24", icon: "fa-futbol", category: "Sports", viewers: "123K", thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200" },
        { name: "NBA 2K24", icon: "fa-basketball", category: "Sports", viewers: "67K", thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200" },
        { name: "ROCKET LEAGUE", icon: "fa-car", category: "Sports", viewers: "89K", thumbnail: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=200" },
        { name: "FORZA HORIZON 5", icon: "fa-car", category: "Racing", viewers: "45K", thumbnail: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200" },

        // Sandbox / Survival
        { name: "MINECRAFT", icon: "fa-cube", category: "Sandbox", viewers: "187K", thumbnail: "https://images.unsplash.com/photo-1587573089734-599d584d6db3?w=200" },
        { name: "GTA V", icon: "fa-car", category: "Action", viewers: "145K", thumbnail: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=200" },
        { name: "RUST", icon: "fa-skull", category: "Survival", viewers: "56K", thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200" },
        { name: "ARK: SURVIVAL ASCENDED", icon: "fa-dinosaur", category: "Survival", viewers: "34K", thumbnail: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=200" },

        // Strategy / MOBA
        { name: "LEAGUE OF LEGENDS", icon: "fa-chess", category: "MOBA", viewers: "276K", thumbnail: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=200" },
        { name: "DOTA 2", icon: "fa-chess", category: "MOBA", viewers: "134K", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200" },
        { name: "TEAMFIGHT TACTICS", icon: "fa-chess-board", category: "Auto Battler", viewers: "67K", thumbnail: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=200" },
        { name: "STARCRAFT II", icon: "fa-rocket", category: "RTS", viewers: "23K", thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=200" },

        // Non-Gaming Categories
        { name: "JUST CHATTING", icon: "fa-comments", category: "IRL", viewers: "312K", thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=200" },
        { name: "MUSIC", icon: "fa-music", category: "Creative", viewers: "45K", thumbnail: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=200" },
        { name: "ART", icon: "fa-palette", category: "Creative", viewers: "28K", thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200" },
        { name: "SOFTWARE & GAME DEVELOPMENT", icon: "fa-code", category: "Tech", viewers: "28K", thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200" },
        { name: "SCIENCE & TECHNOLOGY", icon: "fa-flask", category: "Tech", viewers: "15K", thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200" },
        { name: "ASMR", icon: "fa-ear-listen", category: "IRL", viewers: "34K", thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200" },
        { name: "COOKING", icon: "fa-utensils", category: "IRL", viewers: "22K", thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200" },
        { name: "TRAVEL & OUTDOORS", icon: "fa-mountain", category: "IRL", viewers: "18K", thumbnail: "https://images.unsplash.com/photo-1554178286-db443a99268e?w=200" },
        { name: "FITNESS & HEALTH", icon: "fa-dumbbell", category: "IRL", viewers: "12K", thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200" },
        { name: "TALK SHOWS & PODCASTS", icon: "fa-microphone", category: "IRL", viewers: "35K", thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200" },
        { name: "CRYPTO & TRADING", icon: "fa-coins", category: "Finance", viewers: "48K", thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=200" },
    ];

    // CSS for game selector dropdown
    const gameDropdownCSS = `
        .autocomplete-field {
            position: relative;
        }
        
        #game-dropdown {
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
            z-index: 1000;
            display: none;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
        }

        #game-dropdown.active {
            display: block;
        }

        .game-dropdown-section {
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .game-dropdown-section:last-child {
            border-bottom: none;
        }

        .game-dropdown-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 10px;
            color: #666;
            padding: 6px 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }

        .game-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .game-item:hover, .game-item.selected {
            background: rgba(0, 255, 255, 0.1);
        }

        .game-item.selected {
            border-left: 3px solid #0ff;
        }

        .game-item-thumb {
            width: 50px;
            height: 65px;
            border-radius: 4px;
            overflow: hidden;
            flex-shrink: 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .game-item-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .game-item-info {
            flex: 1;
            min-width: 0;
        }

        .game-item-name {
            font-family: 'Rajdhani', sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            margin-bottom: 4px;
        }

        .game-item-name .hl {
            color: #0ff;
            font-weight: 700;
        }

        .game-item-category {
            font-family: 'Share Tech Mono', monospace;
            font-size: 11px;
            color: #888;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .game-item-category i {
            color: #0ff;
            font-size: 10px;
        }

        .game-item-viewers {
            font-family: 'Share Tech Mono', monospace;
            font-size: 12px;
            color: #ff0055;
            white-space: nowrap;
        }

        .game-no-results {
            text-align: center;
            padding: 20px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 12px;
            color: #666;
        }

        .game-selected-display {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 6px;
            margin-top: 8px;
        }

        .game-selected-display img {
            width: 40px;
            height: 50px;
            border-radius: 4px;
            object-fit: cover;
        }

        .game-selected-display .name {
            font-family: 'Rajdhani', sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #0ff;
        }

        .game-selected-display .clear-btn {
            margin-left: auto;
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            font-size: 14px;
            padding: 5px;
        }

        .game-selected-display .clear-btn:hover {
            color: #ff0055;
        }
    `;

    // Inject CSS
    function injectCSS() {
        if (!document.getElementById('game-selector-css')) {
            const style = document.createElement('style');
            style.id = 'game-selector-css';
            style.textContent = gameDropdownCSS;
            document.head.appendChild(style);
        }
    }

    // Initialize game selector
    function init() {
        const gameSearch = document.getElementById('game-search');
        const gameDropdown = document.getElementById('game-dropdown');
        const gameThumb = document.getElementById('game-thumb');

        if (!gameSearch || !gameDropdown) return;

        injectCSS();

        let selectedIndex = -1;
        let selectedGame = null;

        // Live search
        gameSearch.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 1) {
                showDropdown(query);
            } else {
                showDropdown(''); // Show popular when empty
            }
        });

        // Show dropdown on focus
        gameSearch.addEventListener('focus', () => {
            showDropdown(gameSearch.value.trim());
        });

        // Keyboard navigation
        gameSearch.addEventListener('keydown', (e) => {
            const items = gameDropdown.querySelectorAll('.game-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    items[selectedIndex].click();
                }
            } else if (e.key === 'Escape') {
                hideDropdown();
            }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!gameSearch.contains(e.target) && !gameDropdown.contains(e.target)) {
                hideDropdown();
            }
        });

        function showDropdown(query) {
            selectedIndex = -1;
            const q = query.toLowerCase();

            let matchingGames;
            if (q.length === 0) {
                // Show popular games when empty
                matchingGames = [...gameDatabase].sort((a, b) =>
                    parseViewers(b.viewers) - parseViewers(a.viewers)
                ).slice(0, 10);
            } else {
                matchingGames = gameDatabase.filter(g =>
                    g.name.toLowerCase().includes(q) ||
                    g.category.toLowerCase().includes(q)
                ).slice(0, 10);
            }

            if (matchingGames.length === 0) {
                gameDropdown.innerHTML = `<div class="game-no-results"><i class="fa-solid fa-ghost"></i> No games found</div>`;
            } else {
                // Group by category
                const grouped = {};
                matchingGames.forEach(g => {
                    if (!grouped[g.category]) grouped[g.category] = [];
                    grouped[g.category].push(g);
                });

                let html = '';
                for (const [cat, games] of Object.entries(grouped)) {
                    html += `<div class="game-dropdown-section">
                        <div class="game-dropdown-title">${cat}</div>
                        ${games.map(g => `
                            <div class="game-item" data-name="${g.name}" data-thumb="${g.thumbnail}">
                                <div class="game-item-thumb">
                                    <img src="${g.thumbnail}" alt="${g.name}">
                                </div>
                                <div class="game-item-info">
                                    <div class="game-item-name">${highlightMatch(g.name, query)}</div>
                                    <div class="game-item-category">
                                        <i class="fa-solid ${g.icon}"></i> ${g.category}
                                    </div>
                                </div>
                                <div class="game-item-viewers">${g.viewers} viewers</div>
                            </div>
                        `).join('')}
                    </div>`;
                }
                gameDropdown.innerHTML = html;
            }

            gameDropdown.classList.add('active');

            // Add click handlers
            gameDropdown.querySelectorAll('.game-item').forEach(item => {
                item.addEventListener('click', () => {
                    selectGame(item.dataset.name, item.dataset.thumb);
                });
            });
        }

        function hideDropdown() {
            gameDropdown.classList.remove('active');
            selectedIndex = -1;
        }

        function selectGame(name, thumbnail) {
            selectedGame = { name, thumbnail };
            gameSearch.value = name;

            // Update the game thumbnail preview
            if (gameThumb) {
                gameThumb.src = thumbnail;
            }

            hideDropdown();

            // Save to localStorage
            localStorage.setItem('flow_selected_game', JSON.stringify(selectedGame));

            // Play sound if available
            if (window.sfx) sfx.click();

            console.log('✓ Game selected:', name);
        }

        function updateSelection(items) {
            items.forEach((item, i) => {
                item.classList.toggle('selected', i === selectedIndex);
            });
            if (selectedIndex >= 0 && items[selectedIndex]) {
                items[selectedIndex].scrollIntoView({ block: 'nearest' });
            }
        }

        function highlightMatch(text, query) {
            if (!query) return text;
            const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
            return text.replace(regex, '<span class="hl">$1</span>');
        }

        function escapeRegex(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function parseViewers(str) {
            const num = parseFloat(str);
            if (str.includes('K')) return num * 1000;
            if (str.includes('M')) return num * 1000000;
            return num;
        }

        // Load saved game
        const saved = localStorage.getItem('flow_selected_game');
        if (saved) {
            try {
                const { name, thumbnail } = JSON.parse(saved);
                gameSearch.value = name;
                if (gameThumb) gameThumb.src = thumbnail;
            } catch (e) { }
        }

        console.log('✓ FLOW Game Selector initialized');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external use
    window.FlowGameSelector = { gameDatabase, init };
})();
