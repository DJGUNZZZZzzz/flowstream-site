/**
 * FLOW STREAMING - Game Selector for Creators
 * Complete database of 100 games with years, bios, and IGDB slugs
 */

(function () {
    'use strict';

    // Complete game database - 100 games
    const gameDatabase = [
        // FPS / Shooters
        { name: "Call of Duty: Modern Warfare III", year: "2023", bio: "Fast-paced military FPS featuring cinematic campaigns and competitive multiplayer.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Call of Duty Modern Warfare III" },
        { name: "Call of Duty: Warzone", year: "2020", bio: "Free-to-play battle royale set in the Call of Duty universe.", category: "Battle Royale", icon: "fa-crosshairs", igdbSlug: "Call of Duty Warzone" },
        { name: "Battlefield 2042", year: "2021", bio: "Large-scale multiplayer shooter set in near-future warfare.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Battlefield 2042" },
        { name: "Counter-Strike 2", year: "2023", bio: "Tactical competitive shooter built on precision gunplay.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Counter-Strike 2" },
        { name: "Valorant", year: "2020", bio: "Tactical FPS combining accurate shooting and hero abilities.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Valorant" },
        { name: "Apex Legends", year: "2019", bio: "Squad-based battle royale with fast movement and hero abilities.", category: "Battle Royale", icon: "fa-crosshairs", igdbSlug: "Apex Legends" },
        { name: "Fortnite", year: "2017", bio: "Battle royale phenomenon featuring building mechanics and live events.", category: "Battle Royale", icon: "fa-gamepad", igdbSlug: "Fortnite" },
        { name: "Rainbow Six Siege", year: "2015", bio: "Tactical shooter focused on destruction and close-quarters combat.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Rainbow Six Siege" },
        { name: "Escape from Tarkov", year: "2017", bio: "Hardcore extraction shooter emphasizing realism and survival.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Escape from Tarkov" },
        { name: "Destiny 2", year: "2017", bio: "Shared-world FPS blending story missions, raids, and PvP.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Destiny 2" },
        { name: "Helldivers 2", year: "2024", bio: "Chaotic cooperative shooter emphasizing teamwork and friendly fire.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Helldivers 2" },
        { name: "Overwatch 2", year: "2022", bio: "Team-based hero shooter with objective-focused gameplay.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Overwatch 2" },
        { name: "Doom Eternal", year: "2020", bio: "High-speed FPS focused on aggressive combat.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Doom Eternal" },
        { name: "Ready or Not", year: "2023", bio: "Tactical FPS simulating realistic law enforcement operations.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Ready or Not" },
        { name: "Squad", year: "2020", bio: "Large-scale military shooter emphasizing communication.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Squad" },
        { name: "Hell Let Loose", year: "2021", bio: "WWII shooter focused on teamwork and strategy.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Hell Let Loose" },
        { name: "The Finals", year: "2023", bio: "Destruction-driven competitive FPS.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "The Finals" },
        { name: "Splitgate", year: "2021", bio: "Arena shooter combining FPS and portals.", category: "FPS", icon: "fa-crosshairs", igdbSlug: "Splitgate" },

        // RPG / Action RPG
        { name: "Baldur's Gate 3", year: "2023", bio: "Choice-driven fantasy RPG based on Dungeons & Dragons with deep narrative decisions.", category: "RPG", icon: "fa-hat-wizard", igdbSlug: "Baldur's Gate 3" },
        { name: "Elden Ring", year: "2022", bio: "Open-world action RPG with challenging combat and deep lore.", category: "RPG", icon: "fa-dragon", igdbSlug: "Elden Ring" },
        { name: "Cyberpunk 2077", year: "2020", bio: "Futuristic RPG set in Night City with player choice.", category: "RPG", icon: "fa-city", igdbSlug: "Cyberpunk 2077" },
        { name: "The Witcher 3: Wild Hunt", year: "2015", bio: "Story-driven fantasy RPG following monster hunter Geralt.", category: "RPG", icon: "fa-dragon", igdbSlug: "The Witcher 3 Wild Hunt" },
        { name: "Starfield", year: "2023", bio: "Space exploration RPG focused on discovery and player freedom.", category: "RPG", icon: "fa-rocket", igdbSlug: "Starfield" },
        { name: "Diablo IV", year: "2023", bio: "Dark fantasy action RPG with shared-world features.", category: "RPG", icon: "fa-skull", igdbSlug: "Diablo IV" },
        { name: "Hogwarts Legacy", year: "2023", bio: "Open-world RPG set in the Wizarding World.", category: "RPG", icon: "fa-hat-wizard", igdbSlug: "Hogwarts Legacy" },
        { name: "God of War", year: "2022", bio: "Norse mythology action-adventure with cinematic combat.", category: "Action", icon: "fa-axe-battle", igdbSlug: "God of War" },
        { name: "Fallout 4", year: "2015", bio: "Post-apocalyptic open-world RPG.", category: "RPG", icon: "fa-radiation", igdbSlug: "Fallout 4" },
        { name: "Fallout: New Vegas", year: "2010", bio: "Narrative-driven post-apocalyptic RPG.", category: "RPG", icon: "fa-radiation", igdbSlug: "Fallout New Vegas" },
        { name: "Mass Effect Legendary Edition", year: "2021", bio: "Remastered sci-fi RPG trilogy.", category: "RPG", icon: "fa-rocket", igdbSlug: "Mass Effect Legendary Edition" },
        { name: "Dragon Age: Inquisition", year: "2014", bio: "Fantasy RPG with party-based combat.", category: "RPG", icon: "fa-dragon", igdbSlug: "Dragon Age Inquisition" },
        { name: "Disco Elysium", year: "2019", bio: "Narrative RPG centered on dialogue and investigation.", category: "RPG", icon: "fa-magnifying-glass", igdbSlug: "Disco Elysium" },

        // Open World / Action
        { name: "Grand Theft Auto V", year: "2015", bio: "Open-world crime epic with expansive single-player and online modes.", category: "Action", icon: "fa-car", igdbSlug: "Grand Theft Auto V" },
        { name: "Red Dead Redemption 2", year: "2019", bio: "Immersive open-world western with cinematic storytelling.", category: "Action", icon: "fa-horse", igdbSlug: "Red Dead Redemption 2" },
        { name: "Spider-Man Remastered", year: "2022", bio: "Open-world superhero action game set in NYC.", category: "Action", icon: "fa-spider", igdbSlug: "Spider-Man Remastered" },
        { name: "Assassin's Creed Valhalla", year: "2020", bio: "Viking-era open-world action RPG.", category: "Action", icon: "fa-shield", igdbSlug: "Assassin's Creed Valhalla" },
        { name: "Assassin's Creed Odyssey", year: "2018", bio: "Open-world RPG set in ancient Greece.", category: "Action", icon: "fa-shield", igdbSlug: "Assassin's Creed Odyssey" },
        { name: "Far Cry 6", year: "2021", bio: "Open-world shooter with guerrilla warfare themes.", category: "Action", icon: "fa-crosshairs", igdbSlug: "Far Cry 6" },
        { name: "Watch Dogs 2", year: "2016", bio: "Open-world hacking adventure set in San Francisco.", category: "Action", icon: "fa-laptop-code", igdbSlug: "Watch Dogs 2" },
        { name: "Metal Gear Solid V: The Phantom Pain", year: "2015", bio: "Open-world stealth action game.", category: "Stealth", icon: "fa-user-secret", igdbSlug: "Metal Gear Solid V The Phantom Pain" },
        { name: "Control", year: "2019", bio: "Supernatural action game with physics-based combat.", category: "Action", icon: "fa-bolt", igdbSlug: "Control" },
        { name: "Death Stranding", year: "2020", bio: "Narrative-driven exploration game focused on connection.", category: "Action", icon: "fa-baby", igdbSlug: "Death Stranding" },

        // Survival / Crafting
        { name: "Ark Raiders", year: "2025", bio: "Cooperative third-person shooter fighting mechanized alien threats.", category: "Survival", icon: "fa-robot", igdbSlug: "Ark Raiders" },
        { name: "Rust", year: "2018", bio: "Multiplayer survival game centered on base-building and PvP.", category: "Survival", icon: "fa-skull", igdbSlug: "Rust" },
        { name: "Minecraft", year: "2011", bio: "Sandbox game focused on creativity, survival, and exploration.", category: "Sandbox", icon: "fa-cube", igdbSlug: "Minecraft" },
        { name: "Terraria", year: "2011", bio: "2D sandbox adventure with crafting, exploration, and bosses.", category: "Sandbox", icon: "fa-cube", igdbSlug: "Terraria" },
        { name: "Valheim", year: "2021", bio: "Viking-themed survival game with cooperative exploration.", category: "Survival", icon: "fa-axe", igdbSlug: "Valheim" },
        { name: "Palworld", year: "2024", bio: "Open-world survival game blending creature collection and combat.", category: "Survival", icon: "fa-paw", igdbSlug: "Palworld" },
        { name: "DayZ", year: "2018", bio: "Hardcore survival game set in a zombie apocalypse.", category: "Survival", icon: "fa-biohazard", igdbSlug: "DayZ" },
        { name: "ARK: Survival Evolved", year: "2017", bio: "Survival game featuring dinosaurs and tribes.", category: "Survival", icon: "fa-dinosaur", igdbSlug: "ARK Survival Evolved" },
        { name: "Sons of the Forest", year: "2023", bio: "Survival horror sequel with crafting and exploration.", category: "Survival", icon: "fa-tree", igdbSlug: "Sons of the Forest" },
        { name: "Subnautica", year: "2018", bio: "Survival exploration game set in an alien ocean.", category: "Survival", icon: "fa-water", igdbSlug: "Subnautica" },
        { name: "Project Zomboid", year: "2013", bio: "Deep isometric zombie survival simulation.", category: "Survival", icon: "fa-biohazard", igdbSlug: "Project Zomboid" },
        { name: "No Man's Sky", year: "2016", bio: "Procedural space exploration with continuous updates.", category: "Survival", icon: "fa-rocket", igdbSlug: "No Man's Sky" },
        { name: "Enshrouded", year: "2024", bio: "Survival RPG with co-op exploration and crafting.", category: "Survival", icon: "fa-cloud", igdbSlug: "Enshrouded" },

        // Horror
        { name: "Alan Wake 2", year: "2023", bio: "Psychological horror sequel with narrative depth.", category: "Horror", icon: "fa-ghost", igdbSlug: "Alan Wake 2" },
        { name: "Dead by Daylight", year: "2016", bio: "Asymmetrical multiplayer horror experience.", category: "Horror", icon: "fa-skull-crossbones", igdbSlug: "Dead by Daylight" },
        { name: "Phasmophobia", year: "2020", bio: "Cooperative ghost-hunting horror game.", category: "Horror", icon: "fa-ghost", igdbSlug: "Phasmophobia" },
        { name: "Lethal Company", year: "2023", bio: "Cooperative horror scavenging game with emergent chaos.", category: "Horror", icon: "fa-skull", igdbSlug: "Lethal Company" },
        { name: "Returnal", year: "2023", bio: "Roguelike shooter blending narrative and bullet-hell combat.", category: "Horror", icon: "fa-meteor", igdbSlug: "Returnal" },

        // MOBA / Strategy
        { name: "League of Legends", year: "2009", bio: "Competitive MOBA with global esports dominance.", category: "MOBA", icon: "fa-chess", igdbSlug: "League of Legends" },
        { name: "Dota 2", year: "2013", bio: "Deep strategic MOBA with a massive competitive scene.", category: "MOBA", icon: "fa-chess", igdbSlug: "Dota 2" },
        { name: "Civilization VI", year: "2016", bio: "Turn-based strategy guiding civilizations through history.", category: "Strategy", icon: "fa-monument", igdbSlug: "Civilization VI" },
        { name: "Manor Lords", year: "2024", bio: "Medieval city builder emphasizing realism.", category: "Strategy", icon: "fa-chess-rook", igdbSlug: "Manor Lords" },

        // Looter Shooter
        { name: "Monster Hunter: World", year: "2018", bio: "Action RPG centered on hunting massive creatures.", category: "Action RPG", icon: "fa-dragon", igdbSlug: "Monster Hunter World" },
        { name: "Warframe", year: "2013", bio: "Fast-paced sci-fi looter shooter.", category: "Looter Shooter", icon: "fa-robot", igdbSlug: "Warframe" },
        { name: "Borderlands 3", year: "2019", bio: "Looter shooter with over-the-top weapons and humor.", category: "Looter Shooter", icon: "fa-gun", igdbSlug: "Borderlands 3" },
        { name: "Warhammer 40K: Darktide", year: "2022", bio: "Cooperative FPS set in the grimdark universe.", category: "Looter Shooter", icon: "fa-skull", igdbSlug: "Warhammer 40K Darktide" },
        { name: "Warhammer 40K: Space Marine 2", year: "2024", bio: "Brutal third-person action shooter.", category: "Action", icon: "fa-skull", igdbSlug: "Warhammer 40K Space Marine 2" },

        // Co-op / Heist
        { name: "Payday 2", year: "2013", bio: "Cooperative heist shooter emphasizing teamwork.", category: "Co-op", icon: "fa-mask", igdbSlug: "Payday 2" },
        { name: "Payday 3", year: "2023", bio: "Modern cooperative heist shooter.", category: "Co-op", icon: "fa-mask", igdbSlug: "Payday 3" },
        { name: "Sea of Thieves", year: "2020", bio: "Shared-world pirate adventure with emergent gameplay.", category: "Co-op", icon: "fa-ship", igdbSlug: "Sea of Thieves" },

        // Roguelike / Indie
        { name: "Hades", year: "2020", bio: "Roguelike action game blending fast combat with mythology.", category: "Roguelike", icon: "fa-fire", igdbSlug: "Hades" },
        { name: "Slay the Spire", year: "2019", bio: "Deck-building roguelike focused on strategy.", category: "Roguelike", icon: "fa-layer-group", igdbSlug: "Slay the Spire" },
        { name: "Dead Cells", year: "2018", bio: "Fast-paced roguelike platformer.", category: "Roguelike", icon: "fa-skull", igdbSlug: "Dead Cells" },
        { name: "Vampire Survivors", year: "2022", bio: "Minimalist roguelike focused on survival and upgrades.", category: "Roguelike", icon: "fa-ghost", igdbSlug: "Vampire Survivors" },
        { name: "Hollow Knight", year: "2017", bio: "Hand-drawn Metroidvania with tight combat.", category: "Metroidvania", icon: "fa-bug", igdbSlug: "Hollow Knight" },
        { name: "Hollow Knight: Silksong", year: "2025", bio: "Sequel expanding the Hollow Knight universe.", category: "Metroidvania", icon: "fa-bug", igdbSlug: "Hollow Knight Silksong" },
        { name: "Cuphead", year: "2017", bio: "Run-and-gun action game with hand-animated visuals.", category: "Platformer", icon: "fa-mug-hot", igdbSlug: "Cuphead" },
        { name: "Celeste", year: "2018", bio: "Precision platformer with mental health themes.", category: "Platformer", icon: "fa-mountain", igdbSlug: "Celeste" },
        { name: "Undertale", year: "2015", bio: "Indie RPG focused on player choice and emotion.", category: "RPG", icon: "fa-heart", igdbSlug: "Undertale" },
        { name: "Outer Wilds", year: "2019", bio: "Exploration mystery set in a looping solar system.", category: "Adventure", icon: "fa-meteor", igdbSlug: "Outer Wilds" },

        // Racing / Sports
        { name: "Forza Horizon 5", year: "2021", bio: "Open-world racing game set in Mexico.", category: "Racing", icon: "fa-car", igdbSlug: "Forza Horizon 5" },
        { name: "Need for Speed Unbound", year: "2022", bio: "Stylized arcade street racing experience.", category: "Racing", icon: "fa-car", igdbSlug: "Need for Speed Unbound" },
        { name: "EA Sports FC 24", year: "2023", bio: "Modern football simulation continuing the FIFA legacy.", category: "Sports", icon: "fa-futbol", igdbSlug: "EA Sports FC 24" },

        // Simulation
        { name: "Cities: Skylines", year: "2015", bio: "City-building simulator with deep infrastructure systems.", category: "Simulation", icon: "fa-city", igdbSlug: "Cities Skylines" },
        { name: "Microsoft Flight Simulator", year: "2020", bio: "Ultra-realistic flight simulation powered by real-world data.", category: "Simulation", icon: "fa-plane", igdbSlug: "Microsoft Flight Simulator" },
        { name: "The Sims 4", year: "2014", bio: "Life simulation with extensive customization.", category: "Simulation", icon: "fa-house", igdbSlug: "The Sims 4" },
        { name: "SimCity", year: "2013", bio: "City simulation focused on urban management.", category: "Simulation", icon: "fa-city", igdbSlug: "SimCity" },
        { name: "Stardew Valley", year: "2016", bio: "Farming and life simulation focused on community.", category: "Simulation", icon: "fa-seedling", igdbSlug: "Stardew Valley" },
        { name: "RimWorld", year: "2018", bio: "Colony simulation driven by AI storytelling.", category: "Simulation", icon: "fa-rocket", igdbSlug: "RimWorld" },
        { name: "Star Citizen", year: "2017", bio: "Ambitious space simulation focused on realism and scale.", category: "Simulation", icon: "fa-rocket", igdbSlug: "Star Citizen" },

        // Party / Social
        { name: "Among Us", year: "2018", bio: "Social deduction multiplayer game.", category: "Party", icon: "fa-user-secret", igdbSlug: "Among Us" },
        { name: "Garry's Mod", year: "2006", bio: "Physics sandbox driven by community mods.", category: "Sandbox", icon: "fa-cogs", igdbSlug: "Garry's Mod" },

        // Fighting
        { name: "Street Fighter 6", year: "2023", bio: "Competitive fighting game with modern mechanics.", category: "Fighting", icon: "fa-hand-fist", igdbSlug: "Street Fighter 6" },
        { name: "Tekken 8", year: "2024", bio: "Next-generation cinematic fighting game.", category: "Fighting", icon: "fa-hand-fist", igdbSlug: "Tekken 8" },
        { name: "Mortal Kombat 1", year: "2023", bio: "Reboot of the iconic fighting franchise.", category: "Fighting", icon: "fa-hand-fist", igdbSlug: "Mortal Kombat 1" },

        // Classic / Narrative
        { name: "L.A. Noire", year: "2011", bio: "Detective game focused on investigation and interrogation.", category: "Adventure", icon: "fa-magnifying-glass", igdbSlug: "LA Noire" },
        { name: "Max Payne 3", year: "2012", bio: "Cinematic third-person shooter with noir storytelling.", category: "Action", icon: "fa-gun", igdbSlug: "Max Payne 3" },
        { name: "BioShock Infinite", year: "2013", bio: "Narrative FPS set in a floating city.", category: "FPS", icon: "fa-cloud", igdbSlug: "Bioshock Infinite" },
        { name: "The Stanley Parable", year: "2013", bio: "Narrative-driven exploration game about choice.", category: "Adventure", icon: "fa-door-open", igdbSlug: "The Stanley Parable" },

        // Non-Gaming Categories (for IRL streaming)
        { name: "Just Chatting", year: "-", bio: "Talk with your audience about anything.", category: "IRL", icon: "fa-comments", igdbSlug: null },
        { name: "Live DJ", year: "-", bio: "Live DJ sets, music mixing, and electronic performances.", category: "Music", icon: "fa-headphones", igdbSlug: null },
        { name: "Music & Performing Arts", year: "-", bio: "Live music, performances, and creative shows.", category: "Music", icon: "fa-music", igdbSlug: null },
        { name: "The Workplace", year: "-", bio: "Work streams, productivity, and professional content.", category: "IRL", icon: "fa-briefcase", igdbSlug: null },
        { name: "Art", year: "-", bio: "Digital art, traditional art, illustration, and creative work.", category: "Creative", icon: "fa-palette", igdbSlug: null },
        { name: "News & Podcasts", year: "-", bio: "News coverage, commentary, interviews, and podcast content.", category: "IRL", icon: "fa-newspaper", igdbSlug: null },
        { name: "Software & Game Development", year: "-", bio: "Coding, game dev, and tech projects.", category: "Tech", icon: "fa-code", igdbSlug: null },
        { name: "ASMR", year: "-", bio: "Relaxing audio experiences.", category: "IRL", icon: "fa-ear-listen", igdbSlug: null },
        { name: "Cooking & Food", year: "-", bio: "Cooking streams and food content.", category: "IRL", icon: "fa-utensils", igdbSlug: null },
        { name: "Travel & Outdoors", year: "-", bio: "IRL exploration and outdoor adventures.", category: "IRL", icon: "fa-mountain", igdbSlug: null },
        { name: "Fitness & Health", year: "-", bio: "Workout streams and health content.", category: "IRL", icon: "fa-dumbbell", igdbSlug: null },
        { name: "Talk Shows & Podcasts", year: "-", bio: "Discussion, interviews, and podcasts.", category: "IRL", icon: "fa-microphone", igdbSlug: null },
        { name: "Special Events", year: "-", bio: "Limited-time events, tournaments, and special broadcasts.", category: "Events", icon: "fa-star", igdbSlug: null },
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
            max-height: 400px;
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

        .game-item-icon {
            width: 45px;
            height: 60px;
            border-radius: 4px;
            overflow: hidden;
            flex-shrink: 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,85,0.1));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #0ff;
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
            margin-bottom: 2px;
        }

        .game-item-name .hl {
            color: #0ff;
            font-weight: 700;
        }

        .game-item-year {
            font-family: 'Orbitron', sans-serif;
            font-size: 11px;
            color: #ff0055;
            margin-left: 6px;
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

        .game-no-results {
            text-align: center;
            padding: 25px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 12px;
            color: #666;
        }

        .game-selected-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 20px;
            margin-top: 10px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 12px;
            color: #0ff;
        }

        .game-selected-badge .year {
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
            showDropdown(query);
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
                matchingGames = gameDatabase.slice(0, 12);
            } else {
                matchingGames = gameDatabase.filter(g =>
                    g.name.toLowerCase().includes(q) ||
                    g.category.toLowerCase().includes(q)
                ).slice(0, 15);
            }

            if (matchingGames.length === 0) {
                gameDropdown.innerHTML = `<div class="game-no-results"><i class="fa-solid fa-ghost"></i> No games found for "${query}"</div>`;
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
                            <div class="game-item" data-name="${g.name}" data-year="${g.year}" data-bio="${encodeURIComponent(g.bio)}" data-icon="${g.icon}">
                                <div class="game-item-icon">
                                    <i class="fa-solid ${g.icon}"></i>
                                </div>
                                <div class="game-item-info">
                                    <div class="game-item-name">
                                        ${highlightMatch(g.name, query)}
                                        ${g.year !== '-' ? `<span class="game-item-year">(${g.year})</span>` : ''}
                                    </div>
                                    <div class="game-item-category">
                                        <i class="fa-solid ${g.icon}"></i> ${g.category}
                                    </div>
                                </div>
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
                    selectGame(
                        item.dataset.name,
                        item.dataset.year,
                        decodeURIComponent(item.dataset.bio),
                        item.dataset.icon
                    );
                });
            });
        }

        function hideDropdown() {
            gameDropdown.classList.remove('active');
            selectedIndex = -1;
        }

        function selectGame(name, year, bio, icon) {
            selectedGame = { name, year, bio, icon };
            gameSearch.value = name;

            hideDropdown();

            // Save to localStorage
            localStorage.setItem('flow_selected_game', JSON.stringify(selectedGame));

            // Play sound if available
            if (window.sfx) sfx.click();

            console.log('✓ Game selected:', name, `(${year})`);
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

        // Load saved game
        const saved = localStorage.getItem('flow_selected_game');
        if (saved) {
            try {
                const { name } = JSON.parse(saved);
                gameSearch.value = name;
            } catch (e) { }
        }

        console.log(`✓ FLOW Game Selector initialized with ${gameDatabase.length} games`);
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
