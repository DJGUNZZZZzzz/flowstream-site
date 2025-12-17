/*
   ================================================
   NETRUNNER UNIVERSITY - Coding Challenge System
   ================================================
   Manages coding lessons, practice, and tests
*/

// TESTING MODE - Set to true to always reset challenges
const TESTING_MODE = true;

class NetrunnerUniversity {
    constructor() {
        this.storageKey = 'netrunner_university_data';
        this.challenges = this.initializeChallenges();
        this.currentLevel = 1; // Default to level 1
        this.selectedLevel = null; // For filtering
        this.init();
    }

    init() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = {
                completedChallenges: [],
                failedChallenges: {},
                lastResetDate: new Date().toDateString()
            };
        }

        // Check for daily reset
        this.checkDailyReset();
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.data.lastResetDate !== today) {
            // Reset failed challenges daily
            this.data.failedChallenges = {};
            this.data.lastResetDate = today;
            this.save();
        }
    }

    getAvailableChallenges() {
        if (TESTING_MODE) {
            // In testing mode, always show all challenges
            return this.challenges;
        }

        return this.challenges.filter(challenge => {
            // Don't show completed challenges
            if (this.data.completedChallenges.includes(challenge.id)) {
                return false;
            }
            // Don't show failed challenges (locked until tomorrow)
            if (this.data.failedChallenges[challenge.id]) {
                return false;
            }
            return true;
        });
    }

    getAvailableCount() {
        return this.getAvailableChallenges().length;
    }

    getChallengeById(id) {
        return this.challenges.find(c => c.id === id);
    }

    markChallengeComplete(challengeId, tokensEarned) {
        console.log(`✅ Challenge ${challengeId} completed! Earned ${tokensEarned} tokens`);

        if (TESTING_MODE) {
            console.log('🧪 TESTING MODE: Challenge will reset immediately');
            // In testing mode, don't mark as completed so it stays available
        } else {
            if (!this.data.completedChallenges.includes(challengeId)) {
                this.data.completedChallenges.push(challengeId);
            }
        }

        // Award tokens to FLOWBANK
        if (window.flowBank) {
            window.flowBank.addTokens(tokensEarned, `Completed: ${this.getChallengeById(challengeId).title}`, 'challenge');
            console.log(`💰 ${tokensEarned} FLOW Tokens added to FLOWBANK`);
        }

        this.save();
    }

    markChallengeFailed(challengeId) {
        console.log(`❌ Challenge ${challengeId} failed`);

        if (TESTING_MODE) {
            console.log('🧪 TESTING MODE: Challenge will reset immediately');
            // In testing mode, don't lock the challenge
        } else {
            this.data.failedChallenges[challengeId] = true;
        }

        this.save();
    }

    getAvailableCount() {
        return this.getAvailableChallenges().length;
    }

    // ============================================
    // LEVEL PROGRESSION SYSTEM
    // ============================================

    getChallengeLevel(challengeId) {
        // Map challenge IDs to levels based on ID prefix
        if (challengeId.startsWith('js_variables') || challengeId.startsWith('js_functions') ||
            challengeId.startsWith('js_loops') || challengeId.startsWith('js_conditionals') ||
            challengeId.startsWith('html_basics') || challengeId.startsWith('css_basics') ||
            challengeId.startsWith('js_arrays') || challengeId.startsWith('js_objects') ||
            challengeId.startsWith('crypto_basics') || challengeId.startsWith('string_manipulation')) {
            return 1; // Level 1: Basics
        }
        if (challengeId.startsWith('js_dom') || challengeId.startsWith('js_events') ||
            challengeId.startsWith('js_forms') || challengeId.startsWith('js_fetch') ||
            challengeId.startsWith('js_async') || challengeId.startsWith('js_errors') ||
            challengeId.startsWith('js_storage') || challengeId.startsWith('js_json') ||
            challengeId.startsWith('js_debug') || challengeId.startsWith('js_best')) {
            return 2; // Level 2: Intermediate
        }
        // Future levels
        if (challengeId.includes('_advanced_')) return 3;
        if (challengeId.includes('_expert_')) return 4;
        if (challengeId.includes('_master_')) return 5;
        return 1; // Default to level 1
    }

    getCurrentLevel() {
        if (TESTING_MODE) {
            return 1; // In testing mode, always show level 1 as current
        }

        // Calculate current level based on completed challenges
        const completedByLevel = {};
        const totalByLevel = {};

        // Count challenges per level
        this.challenges.forEach(challenge => {
            const level = this.getChallengeLevel(challenge.id);
            totalByLevel[level] = (totalByLevel[level] || 0) + 1;

            if (this.data.completedChallenges.includes(challenge.id)) {
                completedByLevel[level] = (completedByLevel[level] || 0) + 1;
            }
        });

        // Find first incomplete level
        for (let level = 1; level <= 5; level++) {
            const total = totalByLevel[level] || 0;
            const completed = completedByLevel[level] || 0;

            if (total > 0 && completed < total) {
                return level; // First level with incomplete challenges
            }
        }

        return 5; // All levels complete, show level 5
    }

    getLevelProgress(level) {
        const levelChallenges = this.challenges.filter(c => this.getChallengeLevel(c.id) === level);
        const total = levelChallenges.length;
        const completed = levelChallenges.filter(c => this.data.completedChallenges.includes(c.id)).length;

        return {
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    getLevelStatus(level) {
        const currentLevel = this.getCurrentLevel();

        if (TESTING_MODE) {
            return level === 1 ? 'current' : 'available'; // In testing, all levels available
        }

        const progress = this.getLevelProgress(level);

        if (progress.completed === progress.total && progress.total > 0) {
            return 'completed';
        } else if (level === currentLevel) {
            return 'current';
        } else if (level < currentLevel) {
            return 'completed';
        } else {
            return 'locked';
        }
    }

    renderLevelTabs() {
        const container = document.createElement('div');
        container.className = 'level-tabs-container';

        const tabsRow = document.createElement('div');
        tabsRow.className = 'level-tabs';

        for (let level = 1; level <= 5; level++) {
            const status = this.getLevelStatus(level);
            const progress = this.getLevelProgress(level);

            const tab = document.createElement('div');
            tab.className = `level-tab ${status}`;
            tab.dataset.level = level;

            // Level number
            const levelNumber = document.createElement('div');
            levelNumber.className = 'level-number';
            levelNumber.textContent = `Level ${level}`;

            // Icon based on status
            const icon = document.createElement('div');
            icon.className = 'level-icon';
            if (status === 'completed') {
                icon.textContent = '✓';
            } else if (status === 'current') {
                icon.textContent = '⚡';
            } else if (status === 'locked') {
                icon.textContent = '🔒';
            } else {
                icon.textContent = '◆';
            }

            // Status text
            const statusText = document.createElement('div');
            statusText.className = 'level-status';
            if (status === 'completed') {
                statusText.textContent = 'Completed';
            } else if (status === 'current') {
                statusText.textContent = `${progress.completed}/${progress.total} Complete`;
            } else if (status === 'locked') {
                statusText.textContent = 'Locked';
            } else {
                statusText.textContent = 'Available';
            }

            tab.appendChild(levelNumber);
            tab.appendChild(icon);
            tab.appendChild(statusText);

            // Click handler
            if (status !== 'locked' || TESTING_MODE) {
                tab.addEventListener('click', () => {
                    if (window.sfx) window.sfx.click();
                    this.selectedLevel = level;
                    this.showChallengeList();
                });
            }

            tabsRow.appendChild(tab);
        }

        container.appendChild(tabsRow);

        // Progress bar
        const currentLevel = this.selectedLevel || this.getCurrentLevel();
        const currentProgress = this.getLevelProgress(currentLevel);

        const progressBar = document.createElement('div');
        progressBar.className = 'level-progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'level-progress-fill';
        progressFill.style.width = `${currentProgress.percentage}%`;
        progressBar.appendChild(progressFill);
        container.appendChild(progressBar);

        // Info text
        const infoText = document.createElement('div');
        infoText.className = 'level-info-text';
        infoText.innerHTML = `Level ${currentLevel}: <strong>${currentProgress.completed}/${currentProgress.total}</strong> challenges completed`;
        container.appendChild(infoText);

        return container;
    }

    getChallengesByLevel(level) {
        return this.challenges.filter(c => this.getChallengeLevel(c.id) === level);
    }

    initializeChallenges() {
        return [
            {
                id: 'js_variables_001',
                title: 'Data Extraction Protocol',
                difficulty: 'beginner',
                tokens: 300,
                category: 'JavaScript Basics',
                lesson: {
                    scenario: `Welcome to your first coding lesson! Let's learn how to store information.`,
                    content: `
                        <h3>📦 LESSON 1: STORING INFORMATION</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        A <strong>variable</strong> is like a labeled box where you can store information.<br>
                        You give it a name, and put something inside.<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>let name = "Alex";</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This creates a box called <code>name</code> and puts <code>"Alex"</code> inside it.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Text needs quotes, numbers don't!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to create a box called "name":<br><br><code>___ name = "Alex";</code>',
                        hints: [
                            'We use a keyword to create a box',
                            'The keyword starts with "l"',
                            'Type: let'
                        ],
                        solution: 'let name = "Alex";',
                        validation: (code) => {
                            return code.includes('let') && code.includes('name') && code.includes('Alex');
                        }
                    },
                    {
                        question: 'Fill in the blank to create a box called "age" with the number 25:<br><br><code>let age = ___;</code>',
                        hints: [
                            'Numbers don\'t need quotes',
                            'Just type the number',
                            'Type: 25'
                        ],
                        solution: 'let age = 25;',
                        validation: (code) => {
                            return code.includes('age') && code.includes('25') && !code.includes('"25"');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Create a variable!',
                    timeLimit: 60,
                    question: 'Create a box called "score" with the number 100:<br><br><code>___ score = ___;</code>',
                    solution: 'let score = 100;',
                    validation: (code) => {
                        return code.includes('let') && code.includes('score') && code.includes('100');
                    }
                }
            },
            {
                id: 'js_functions_001',
                title: 'Encryption Subroutine',
                difficulty: 'beginner',
                tokens: 400,
                category: 'JavaScript Basics',
                lesson: {
                    scenario: `Let's learn how to reuse code!`,
                    content: `
                        <h3>🔧 LESSON 2: REUSING CODE</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        A <strong>function</strong> is like a recipe you can use over and over.<br>
                        You give it a name, tell it what to do, and then you can use it anytime!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>function sayHi() {
    return "Hello!";
}</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This creates a function called <code>sayHi</code> that returns <code>"Hello!"</code>
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Functions save you from writing the same code over and over!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to create a function called "greet":<br><br><code>___ greet() {<br>&nbsp;&nbsp;return "Hi";<br>}</code>',
                        hints: [
                            'We use a keyword to create a function',
                            'The keyword is "function"',
                            'Type: function'
                        ],
                        solution: 'function greet() {\n    return "Hi";\n}',
                        validation: (code) => {
                            return code.includes('function') && code.includes('greet');
                        }
                    },
                    {
                        question: 'Fill in the blank to make the function return "Bye":<br><br><code>function sayBye() {<br>&nbsp;&nbsp;___ "Bye";<br>}</code>',
                        hints: [
                            'Functions send back values with a keyword',
                            'The keyword is "return"',
                            'Type: return'
                        ],
                        solution: 'function sayBye() {\n    return "Bye";\n}',
                        validation: (code) => {
                            return code.includes('return') && code.includes('Bye');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Create a function!',
                    timeLimit: 60,
                    question: 'Create a function called "welcome" that returns "Welcome!":<br><br><code>___ welcome() {<br>&nbsp;&nbsp;___ "Welcome!";<br>}</code>',
                    solution: 'function welcome() {\n    return "Welcome!";\n}',
                    validation: (code) => {
                        return code.includes('function') && code.includes('welcome') && code.includes('return');
                    }
                }
            },
            {
                id: 'js_loops_001',
                title: 'Database Iteration Attack',
                difficulty: 'intermediate',
                tokens: 500,
                category: 'JavaScript Basics',
                lesson: {
                    scenario: `Let's learn how to repeat actions!`,
                    content: `
                        <h3>🔁 LESSON 3: REPEATING ACTIONS</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        A <strong>loop</strong> is like counting to 10.<br>
                        You tell the computer to do something over and over!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>for (let i = 1; i <= 3; i++) {
    console.log(i);
}
// Prints: 1, 2, 3</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This counts from 1 to 3 and prints each number.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Loops save you from typing the same thing many times!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to count from 1 to 5:<br><br><code>for (let i = 1; i <= ___; i++) {<br>&nbsp;&nbsp;console.log(i);<br>}</code>',
                        hints: [
                            'We want to count to 5',
                            'The number should be 5',
                            'Type: 5'
                        ],
                        solution: 'for (let i = 1; i <= 5; i++) {\n    console.log(i);\n}',
                        validation: (code) => {
                            return code.includes('for') && code.includes('5');
                        }
                    },
                    {
                        question: 'Fill in the blank to start counting from 1:<br><br><code>for (let i = ___; i <= 10; i++) {<br>&nbsp;&nbsp;console.log(i);<br>}</code>',
                        hints: [
                            'We want to start at 1',
                            'The number should be 1',
                            'Type: 1'
                        ],
                        solution: 'for (let i = 1; i <= 10; i++) {\n    console.log(i);\n}',
                        validation: (code) => {
                            return code.includes('i = 1') && code.includes('10');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Create a loop!',
                    timeLimit: 60,
                    question: 'Create a loop that counts from 1 to 7:<br><br><code>for (let i = ___; i <= ___; i++) {<br>&nbsp;&nbsp;console.log(i);<br>}</code>',
                    solution: 'for (let i = 1; i <= 7; i++) {\n    console.log(i);\n}',
                    validation: (code) => {
                        return code.includes('for') && code.includes('i = 1') && code.includes('7');
                    }
                }
            },
            {
                id: 'js_conditionals_001',
                title: 'Making Decisions',
                difficulty: 'beginner',
                tokens: 350,
                category: 'JavaScript Basics',
                lesson: {
                    scenario: `Let's learn how to make decisions!`,
                    content: `
                        <h3>🤔 LESSON 4: MAKING DECISIONS</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        An <strong>if statement</strong> is like asking a question.<br>
                        If the answer is yes, do one thing. If no, do something else!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>let age = 18;
if (age >= 18) {
    console.log("Adult");
} else {
    console.log("Child");
}</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This checks if age is 18 or more. If yes, prints "Adult". If no, prints "Child".
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Use if/else to make choices in your code!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to check if score is greater than 50:<br><br><code>___ (score > 50) {<br>&nbsp;&nbsp;console.log("Pass");<br>}</code>',
                        hints: [
                            'We use a keyword to ask questions',
                            'The keyword is "if"',
                            'Type: if'
                        ],
                        solution: 'if (score > 50) {\n    console.log("Pass");\n}',
                        validation: (code) => {
                            return code.includes('if') && code.includes('score');
                        }
                    },
                    {
                        question: 'Fill in the blank for the "no" part:<br><br><code>if (age >= 18) {<br>&nbsp;&nbsp;console.log("Adult");<br>} ___ {<br>&nbsp;&nbsp;console.log("Child");<br>}</code>',
                        hints: [
                            'We use a keyword for "otherwise"',
                            'The keyword is "else"',
                            'Type: else'
                        ],
                        solution: 'if (age >= 18) {\n    console.log("Adult");\n} else {\n    console.log("Child");\n}',
                        validation: (code) => {
                            return code.includes('if') && code.includes('else');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Make a decision!',
                    timeLimit: 60,
                    question: 'Check if temperature is above 30, print "Hot", otherwise print "Cold":<br><br><code>___ (temperature > 30) {<br>&nbsp;&nbsp;console.log("Hot");<br>} ___ {<br>&nbsp;&nbsp;console.log("Cold");<br>}</code>',
                    solution: 'if (temperature > 30) {\n    console.log("Hot");\n} else {\n    console.log("Cold");\n}',
                    validation: (code) => {
                        return code.includes('if') && code.includes('else') && code.includes('temperature');
                    }
                }
            },
            {
                id: 'html_basics_001',
                title: 'Building Web Pages',
                difficulty: 'beginner',
                tokens: 350,
                category: 'HTML Basics',
                lesson: {
                    scenario: `Let's learn how to build web pages!`,
                    content: `
                        <h3>🌐 LESSON 7: BUILDING WEB PAGES</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>HTML</strong> is like building blocks for websites.<br>
                        You use tags to create headings, paragraphs, and buttons!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>&lt;h1&gt;Hello&lt;/h1&gt;
&lt;p&gt;Welcome!&lt;/p&gt;</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This creates a heading that says "Hello" and a paragraph that says "Welcome".
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Tags have opening &lt;tag&gt; and closing &lt;/tag&gt; parts!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to create a heading:<br><br><code>___h1___Hello___/h1___</code>',
                        hints: [
                            'Tags use angle brackets',
                            'Opening tag is <h1>',
                            'Type: <h1>Hello</h1>'
                        ],
                        solution: '<h1>Hello</h1>',
                        validation: (code) => {
                            return code.includes('<h1>') && code.includes('Hello') && code.includes('</h1>');
                        }
                    },
                    {
                        question: 'Fill in the blank to create a paragraph:<br><br><code>___p___Welcome___/p___</code>',
                        hints: [
                            'Paragraphs use <p> tags',
                            'Don\'t forget the closing tag',
                            'Type: <p>Welcome</p>'
                        ],
                        solution: '<p>Welcome</p>',
                        validation: (code) => {
                            return code.includes('<p>') && code.includes('Welcome') && code.includes('</p>');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Build a web page!',
                    timeLimit: 60,
                    question: 'Create a heading with "Home":<br><br><code>___h1___Home___/h1___</code>',
                    solution: '<h1>Home</h1>',
                    validation: (code) => {
                        return code.includes('<h1>') && code.includes('Home') && code.includes('</h1>');
                    }
                }
            },
            {
                id: 'css_basics_001',
                title: 'Styling Web Pages',
                difficulty: 'beginner',
                tokens: 350,
                category: 'CSS Basics',
                lesson: {
                    scenario: `Let's learn how to make websites look good!`,
                    content: `
                        <h3>🎨 LESSON 8: STYLING WEB PAGES</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>CSS</strong> is like paint for websites.<br>
                        You use it to change colors, sizes, and make things pretty!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>h1 {
    color: blue;
    font-size: 30px;
}</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This makes all headings blue and 30 pixels big.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> CSS makes websites beautiful!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to make text red:<br><br><code>h1 {<br>&nbsp;&nbsp;color: ___;<br>}</code>',
                        hints: [
                            'We want the color red',
                            'Just type the color name',
                            'Type: red'
                        ],
                        solution: 'h1 {\n    color: red;\n}',
                        validation: (code) => {
                            return code.includes('color') && code.includes('red');
                        }
                    },
                    {
                        question: 'Fill in the blank to make text bigger:<br><br><code>p {<br>&nbsp;&nbsp;font-size: ___;<br>}</code>',
                        hints: [
                            'Font size uses pixels',
                            'Pixels are written as px',
                            'Type: 20px'
                        ],
                        solution: 'p {\n    font-size: 20px;\n}',
                        validation: (code) => {
                            return code.includes('font-size') && code.includes('px');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Style a page!',
                    timeLimit: 60,
                    question: 'Make h1 text green:<br><br><code>h1 {<br>&nbsp;&nbsp;color: ___;<br>}</code>',
                    solution: 'h1 {\n    color: green;\n}',
                    validation: (code) => {
                        return code.includes('color') && code.includes('green');
                    }
                }
            },
            {
                id: 'js_arrays_001',
                title: 'Making Lists',
                difficulty: 'beginner',
                tokens: 350,
                category: 'JavaScript Basics',
                lesson: {
                    scenario: `Let's learn how to make lists!`,
                    content: `
                        <h3>📋 LESSON 5: MAKING LISTS</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        An <strong>array</strong> is like a shopping list.<br>
                        You can store many items in one place!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>let fruits = ["apple", "banana", "orange"];
console.log(fruits[0]); // "apple"</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This creates a list of fruits. We can get the first item with [0].
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Lists start counting at 0, not 1!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to create a list of colors:<br><br><code>let colors = ___"red", "blue"___;</code>',
                        hints: [
                            'Lists use square brackets',
                            'The brackets are [ and ]',
                            'Type: ["red", "blue"]'
                        ],
                        solution: 'let colors = ["red", "blue"];',
                        validation: (code) => {
                            return code.includes('[') && code.includes('red') && code.includes('blue');
                        }
                    },
                    {
                        question: 'Fill in the blank to get the first item:<br><br><code>let names = ["Alice", "Bob"];<br>console.log(names___0___);</code>',
                        hints: [
                            'We use brackets to get items',
                            'The first item is at position 0',
                            'Type: [0]'
                        ],
                        solution: 'let names = ["Alice", "Bob"];\nconsole.log(names[0]);',
                        validation: (code) => {
                            return code.includes('[0]') && code.includes('names');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Make a list!',
                    timeLimit: 60,
                    question: 'Create a list called numbers with 1, 2, 3:<br><br><code>let numbers = ___1, 2, 3___;</code>',
                    solution: 'let numbers = [1, 2, 3];',
                    validation: (code) => {
                        return code.includes('[') && code.includes('1') && code.includes('2') && code.includes('3');
                    }
                }
            },
            {
                id: 'js_objects_001',
                title: 'Grouping Information',
                difficulty: 'beginner',
                tokens: 350,
                category: 'JavaScript Basics',
                lesson: {
                    scenario: `Let's learn how to group information!`,
                    content: `
                        <h3>📋 LESSON 6: GROUPING INFORMATION</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        An <strong>object</strong> is like a person's profile.<br>
                        It stores related information together (name, age, etc.)!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>let person = {
    name: "Alice",
    age: 25
};
console.log(person.name); // "Alice"</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This creates a person with a name and age. We can get the name with .name
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Objects group related information!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to create a person object:<br><br><code>let person = ___name: "Bob"___;</code>',
                        hints: [
                            'Objects use curly braces',
                            'The braces are { and }',
                            'Type: {name: "Bob"}'
                        ],
                        solution: 'let person = {name: "Bob"};',
                        validation: (code) => {
                            return code.includes('{') && code.includes('name') && code.includes('Bob');
                        }
                    },
                    {
                        question: 'Fill in the blank to get the name:<br><br><code>let car = {brand: "Toyota"};<br>console.log(car___brand___);</code>',
                        hints: [
                            'We use a dot to get properties',
                            'The dot is .',
                            'Type: .brand'
                        ],
                        solution: 'let car = {brand: "Toyota"};\nconsole.log(car.brand);',
                        validation: (code) => {
                            return code.includes('.brand') && code.includes('car');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Create an object!',
                    timeLimit: 60,
                    question: 'Create an object called book with title "Code":<br><br><code>let book = ___title: "Code"___;</code>',
                    solution: 'let book = {title: "Code"};',
                    validation: (code) => {
                        return code.includes('{') && code.includes('title') && code.includes('Code');
                    }
                }
            },
            {
                id: 'crypto_basics_001',
                title: 'Working with Text',
                difficulty: 'beginner',
                tokens: 350,
                category: 'JavaScript Basics',
                lesson: {
                    scenario: `Let's learn how to work with text!`,
                    content: `
                        <h3>🔤 LESSON 9: WORKING WITH TEXT</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>Text methods</strong> help you change text.<br>
                        You can make it UPPERCASE, lowercase, or find its length!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>let name = "Alice";
console.log(name.toUpperCase()); // "ALICE"
console.log(name.length); // 5</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This makes the name uppercase and shows how long it is.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Text has helpful methods!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to make text UPPERCASE:<br><br><code>let word = "hello";<br>console.log(word.___);</code>',
                        hints: [
                            'We want uppercase letters',
                            'The method is toUpperCase()',
                            'Type: toUpperCase()'
                        ],
                        solution: 'let word = "hello";\nconsole.log(word.toUpperCase());',
                        validation: (code) => {
                            return code.includes('toUpperCase');
                        }
                    },
                    {
                        question: 'Fill in the blank to get text length:<br><br><code>let text = "Hi";<br>console.log(text.___);</code>',
                        hints: [
                            'We want to know how long the text is',
                            'The property is length',
                            'Type: length'
                        ],
                        solution: 'let text = "Hi";\nconsole.log(text.length);',
                        validation: (code) => {
                            return code.includes('length');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Work with text!',
                    timeLimit: 60,
                    question: 'Make "hello" uppercase:<br><br><code>let word = "hello";<br>console.log(word.___);</code>',
                    solution: 'let word = "hello";\nconsole.log(word.toUpperCase());',
                    validation: (code) => {
                        return code.includes('toUpperCase');
                    }
                }
            },
            {
                id: 'string_manipulation_001',
                title: 'Finding Text',
                difficulty: 'beginner',
                tokens: 350,
                category: 'JavaScript Basics',
                lesson: {
                    scenario: `Let's learn how to find things in text!`,
                    content: `
                        <h3>🔍 LESSON 10: FINDING TEXT</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>Text searching</strong> helps you find words.<br>
                        You can check if text includes a word or split it into pieces!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>let sentence = "Hello World";
console.log(sentence.includes("World")); // true
let words = sentence.split(" "); // ["Hello", "World"]</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This checks if "World" is in the sentence and splits it into words.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> You can search and split text!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to check if text contains a word:<br><br><code>let text = "Hello World";<br>console.log(text.___("World"));</code>',
                        hints: [
                            'We want to check if it includes something',
                            'The method is includes()',
                            'Type: includes("World")'
                        ],
                        solution: 'let text = "Hello World";\nconsole.log(text.includes("World"));',
                        validation: (code) => {
                            return code.includes('includes');
                        }
                    },
                    {
                        question: 'Fill in the blank to split text into words:<br><br><code>let sentence = "Hi there";<br>let words = sentence.___(" ");</code>',
                        hints: [
                            'We want to split by spaces',
                            'The method is split()',
                            'Type: split(" ")'
                        ],
                        solution: 'let sentence = "Hi there";\nlet words = sentence.split(" ");',
                        validation: (code) => {
                            return code.includes('split');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Find text!',
                    timeLimit: 60,
                    question: 'Check if "Hello" includes "ell":<br><br><code>let word = "Hello";<br>console.log(word.___("ell"));</code>',
                    solution: 'let word = "Hello";\nconsole.log(word.includes("ell"));',
                    validation: (code) => {
                        return code.includes('includes');
                    }
                }
            },
            // ============================================
            // LEVEL 2: INTERMEDIATE JAVASCRIPT
            // ============================================
            {
                id: 'js_dom_001',
                title: 'DOM Infiltration Protocol',
                difficulty: 'intermediate',
                tokens: 500,
                category: 'JavaScript DOM',
                lesson: {
                    scenario: `Learn to control web page elements!`,
                    content: `
                        <h3>🎯 LESSON 1: CONTROLLING WEB PAGES</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        The <strong>DOM</strong> (Document Object Model) lets you change web pages with code.<br>
                        You can find elements, change their text, and make them interactive!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>document.getElementById('title').textContent = 'Hello!';</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This finds an element with id="title" and changes its text to "Hello!".
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> getElementById finds ONE element by its ID!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to find an element with id="header":<br><br><code>document.___("header")</code>',
                        hints: [
                            'We use a method to get elements by ID',
                            'The method is getElementById',
                            'Type: getElementById'
                        ],
                        solution: 'document.getElementById("header")',
                        validation: (code) => {
                            return code.includes('getElementById') && code.includes('header');
                        }
                    },
                    {
                        question: 'Fill in the blank to change text:<br><br><code>document.getElementById("title").___ = "Welcome";</code>',
                        hints: [
                            'We use a property to change text',
                            'The property is textContent',
                            'Type: textContent'
                        ],
                        solution: 'document.getElementById("title").textContent = "Welcome";',
                        validation: (code) => {
                            return code.includes('textContent') && code.includes('Welcome');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Change page content!',
                    timeLimit: 60,
                    question: 'Change the text of element with id="message" to "Success":<br><br><code>document.getElementById("message").___ = "___";</code>',
                    solution: 'document.getElementById("message").textContent = "Success";',
                    validation: (code) => {
                        return code.includes('getElementById') && code.includes('textContent') && code.includes('Success');
                    }
                }
            },
            {
                id: 'js_events_001',
                title: 'User Interaction Capture',
                difficulty: 'intermediate',
                tokens: 550,
                category: 'JavaScript Events',
                lesson: {
                    scenario: `Learn to respond to user actions!`,
                    content: `
                        <h3>👆 LESSON 2: RESPONDING TO CLICKS</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>Events</strong> let your code react when users click, type, or move the mouse.<br>
                        You add a listener that waits for the event, then runs your code!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>button.addEventListener('click', function() {
    alert('Clicked!');
});</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This waits for a click on the button, then shows an alert.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> addEventListener takes the event name and a function!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to listen for clicks:<br><br><code>button.___("click", function() {...})</code>',
                        hints: [
                            'We use a method to add event listeners',
                            'The method is addEventListener',
                            'Type: addEventListener'
                        ],
                        solution: 'button.addEventListener("click", function() {...})',
                        validation: (code) => {
                            return code.includes('addEventListener') && code.includes('click');
                        }
                    },
                    {
                        question: 'Fill in the blank for the event type:<br><br><code>input.addEventListener("___", function() {...})</code>',
                        hints: [
                            'We want to detect typing',
                            'The event for typing is "input"',
                            'Type: input'
                        ],
                        solution: 'input.addEventListener("input", function() {...})',
                        validation: (code) => {
                            return code.includes('addEventListener') && code.includes('input');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Add a click listener!',
                    timeLimit: 60,
                    question: 'Add a click listener to myButton that runs myFunction:<br><br><code>myButton.___("___", myFunction);</code>',
                    solution: 'myButton.addEventListener("click", myFunction);',
                    validation: (code) => {
                        return code.includes('addEventListener') && code.includes('click') && code.includes('myFunction');
                    }
                }
            },
            {
                id: 'js_forms_001',
                title: 'Data Input Extraction',
                difficulty: 'intermediate',
                tokens: 550,
                category: 'JavaScript Forms',
                lesson: {
                    scenario: `Learn to get data from forms!`,
                    content: `
                        <h3>📝 LESSON 3: GETTING FORM DATA</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>Forms</strong> let users enter information.<br>
                        You can get what they typed using the value property!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>let name = document.getElementById('nameInput').value;
console.log(name); // Shows what user typed</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This gets the text from an input field and stores it in a variable.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Use .value to get what's in an input field!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to get input value:<br><br><code>let email = document.getElementById("email").___;</code>',
                        hints: [
                            'We use a property to get input values',
                            'The property is value',
                            'Type: value'
                        ],
                        solution: 'let email = document.getElementById("email").value;',
                        validation: (code) => {
                            return code.includes('.value') && code.includes('email');
                        }
                    },
                    {
                        question: 'Fill in the blank to prevent form submission:<br><br><code>form.addEventListener("submit", function(e) {<br>&nbsp;&nbsp;e.___();<br>})</code>',
                        hints: [
                            'We need to prevent the default action',
                            'The method is preventDefault',
                            'Type: preventDefault'
                        ],
                        solution: 'form.addEventListener("submit", function(e) {\n    e.preventDefault();\n})',
                        validation: (code) => {
                            return code.includes('preventDefault');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Get form data!',
                    timeLimit: 60,
                    question: 'Get the value from input with id="username":<br><br><code>let user = document.getElementById("username").___;</code>',
                    solution: 'let user = document.getElementById("username").value;',
                    validation: (code) => {
                        return code.includes('getElementById') && code.includes('value') && code.includes('username');
                    }
                }
            },
            {
                id: 'js_fetch_001',
                title: 'Network Data Retrieval',
                difficulty: 'intermediate',
                tokens: 600,
                category: 'JavaScript API',
                lesson: {
                    scenario: `Learn to get data from the internet!`,
                    content: `
                        <h3>🌐 LESSON 4: GETTING DATA FROM SERVERS</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>Fetch</strong> lets you get data from websites and APIs.<br>
                        You give it a URL, and it brings back the data!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data));</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This gets data from a URL and shows it in the console.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Fetch returns a promise - use .then() to handle the data!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to fetch data:<br><br><code>___("https://api.example.com/users")</code>',
                        hints: [
                            'We use a function to fetch data',
                            'The function is fetch',
                            'Type: fetch'
                        ],
                        solution: 'fetch("https://api.example.com/users")',
                        validation: (code) => {
                            return code.includes('fetch') && code.includes('https://');
                        }
                    },
                    {
                        question: 'Fill in the blank to convert to JSON:<br><br><code>fetch(url).then(response => response.___())</code>',
                        hints: [
                            'We need to convert the response to JSON',
                            'The method is json',
                            'Type: json'
                        ],
                        solution: 'fetch(url).then(response => response.json())',
                        validation: (code) => {
                            return code.includes('.json()');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Fetch some data!',
                    timeLimit: 60,
                    question: 'Fetch data from "https://api.test.com/data" and convert to JSON:<br><br><code>___("https://api.test.com/data").then(r => r.___())</code>',
                    solution: 'fetch("https://api.test.com/data").then(r => r.json())',
                    validation: (code) => {
                        return code.includes('fetch') && code.includes('json');
                    }
                }
            },
            {
                id: 'js_async_001',
                title: 'Asynchronous Code Mastery',
                difficulty: 'intermediate',
                tokens: 650,
                category: 'JavaScript Async',
                lesson: {
                    scenario: `Learn to write cleaner async code!`,
                    content: `
                        <h3>⏳ LESSON 5: WAITING FOR THINGS</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>Async/Await</strong> makes waiting for data easier to read.<br>
                        Instead of .then(), you can use await to wait for promises!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>async function getData() {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This waits for the fetch, then waits for JSON conversion. Much cleaner!
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Use async before function, await before promises!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to make function async:<br><br><code>___ function loadData() {...}</code>',
                        hints: [
                            'We use a keyword to make functions async',
                            'The keyword is async',
                            'Type: async'
                        ],
                        solution: 'async function loadData() {...}',
                        validation: (code) => {
                            return code.includes('async') && code.includes('function');
                        }
                    },
                    {
                        question: 'Fill in the blank to wait for a promise:<br><br><code>const data = ___ fetch(url);</code>',
                        hints: [
                            'We use a keyword to wait',
                            'The keyword is await',
                            'Type: await'
                        ],
                        solution: 'const data = await fetch(url);',
                        validation: (code) => {
                            return code.includes('await') && code.includes('fetch');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Use async/await!',
                    timeLimit: 60,
                    question: 'Create async function that awaits fetch:<br><br><code>___ function get() {<br>&nbsp;&nbsp;const r = ___ fetch(url);<br>}</code>',
                    solution: 'async function get() {\n    const r = await fetch(url);\n}',
                    validation: (code) => {
                        return code.includes('async') && code.includes('await');
                    }
                }
            },
            {
                id: 'js_errors_001',
                title: 'Exception Management Protocol',
                difficulty: 'intermediate',
                tokens: 550,
                category: 'JavaScript Errors',
                lesson: {
                    scenario: `Learn to handle errors gracefully!`,
                    content: `
                        <h3>🛡️ LESSON 6: CATCHING ERRORS</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>Try/Catch</strong> protects your code from crashing.<br>
                        If something goes wrong in try, catch handles it!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>try {
    const data = JSON.parse(text);
} catch (error) {
    console.log("Error:", error.message);
}</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ If JSON.parse fails, the catch block runs instead of crashing.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Always catch errors when dealing with user input or network requests!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to try code:<br><br><code>___ {<br>&nbsp;&nbsp;riskyCode();<br>}</code>',
                        hints: [
                            'We use a keyword to try code',
                            'The keyword is try',
                            'Type: try'
                        ],
                        solution: 'try {\n    riskyCode();\n}',
                        validation: (code) => {
                            return code.includes('try');
                        }
                    },
                    {
                        question: 'Fill in the blank to catch errors:<br><br><code>try {...} ___ (error) {<br>&nbsp;&nbsp;console.log(error);<br>}</code>',
                        hints: [
                            'We use a keyword to catch errors',
                            'The keyword is catch',
                            'Type: catch'
                        ],
                        solution: 'try {...} catch (error) {\n    console.log(error);\n}',
                        validation: (code) => {
                            return code.includes('catch') && code.includes('error');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Handle an error!',
                    timeLimit: 60,
                    question: 'Wrap JSON.parse in try/catch:<br><br><code>___ {<br>&nbsp;&nbsp;JSON.parse(text);<br>} ___ (e) {...}</code>',
                    solution: 'try {\n    JSON.parse(text);\n} catch (e) {...}',
                    validation: (code) => {
                        return code.includes('try') && code.includes('catch');
                    }
                }
            },
            {
                id: 'js_storage_001',
                title: 'Client-Side Data Persistence',
                difficulty: 'intermediate',
                tokens: 550,
                category: 'JavaScript Storage',
                lesson: {
                    scenario: `Learn to save data in the browser!`,
                    content: `
                        <h3>💾 LESSON 7: SAVING DATA LOCALLY</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>localStorage</strong> saves data in the browser.<br>
                        Data stays even when you close the page!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>// Save
localStorage.setItem('name', 'Alex');

// Get
let name = localStorage.getItem('name');</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This saves "Alex" and can retrieve it later.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> localStorage only stores strings!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to save data:<br><br><code>localStorage.___(\'score\', \'100\');</code>',
                        hints: [
                            'We use a method to save items',
                            'The method is setItem',
                            'Type: setItem'
                        ],
                        solution: 'localStorage.setItem(\'score\', \'100\');',
                        validation: (code) => {
                            return code.includes('setItem') && code.includes('score');
                        }
                    },
                    {
                        question: 'Fill in the blank to get data:<br><br><code>let user = localStorage.___(\'username\');</code>',
                        hints: [
                            'We use a method to get items',
                            'The method is getItem',
                            'Type: getItem'
                        ],
                        solution: 'let user = localStorage.getItem(\'username\');',
                        validation: (code) => {
                            return code.includes('getItem') && code.includes('username');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Save some data!',
                    timeLimit: 60,
                    question: 'Save "dark" as the theme:<br><br><code>localStorage.___(\'theme\', \'dark\');</code>',
                    solution: 'localStorage.setItem(\'theme\', \'dark\');',
                    validation: (code) => {
                        return code.includes('setItem') && code.includes('theme') && code.includes('dark');
                    }
                }
            },
            {
                id: 'js_json_001',
                title: 'Data Serialization Protocol',
                difficulty: 'intermediate',
                tokens: 550,
                category: 'JavaScript JSON',
                lesson: {
                    scenario: `Learn to work with JSON data!`,
                    content: `
                        <h3>📦 LESSON 8: CONVERTING DATA</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>JSON</strong> is a way to store objects as text.<br>
                        You can convert objects to text and back!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>// Object to text
let text = JSON.stringify({name: "Alex"});

// Text to object
let obj = JSON.parse(text);</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ stringify makes text, parse makes objects.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Use JSON for saving objects in localStorage!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to convert object to text:<br><br><code>let text = JSON.___(myObject);</code>',
                        hints: [
                            'We use a method to make strings',
                            'The method is stringify',
                            'Type: stringify'
                        ],
                        solution: 'let text = JSON.stringify(myObject);',
                        validation: (code) => {
                            return code.includes('stringify');
                        }
                    },
                    {
                        question: 'Fill in the blank to convert text to object:<br><br><code>let obj = JSON.___(jsonText);</code>',
                        hints: [
                            'We use a method to parse strings',
                            'The method is parse',
                            'Type: parse'
                        ],
                        solution: 'let obj = JSON.parse(jsonText);',
                        validation: (code) => {
                            return code.includes('parse');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Convert to JSON!',
                    timeLimit: 60,
                    question: 'Convert user object to JSON string:<br><br><code>let json = JSON.___(user);</code>',
                    solution: 'let json = JSON.stringify(user);',
                    validation: (code) => {
                        return code.includes('stringify') && code.includes('user');
                    }
                }
            },
            {
                id: 'js_debug_001',
                title: 'Code Diagnostic Techniques',
                difficulty: 'intermediate',
                tokens: 500,
                category: 'JavaScript Debugging',
                lesson: {
                    scenario: `Learn to find and fix bugs!`,
                    content: `
                        <h3>🐛 LESSON 9: FINDING BUGS</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>console.log</strong> is your best debugging friend.<br>
                        Print values to see what's happening in your code!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>let x = 5;
console.log("x is:", x);
console.log("Type:", typeof x);</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ This shows the value and type of x in the console.
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Use console.log everywhere to track your code's behavior!</p>
                    `
                },
                practice: [
                    {
                        question: 'Fill in the blank to print a value:<br><br><code>console.___(myVariable);</code>',
                        hints: [
                            'We use a method to print to console',
                            'The method is log',
                            'Type: log'
                        ],
                        solution: 'console.log(myVariable);',
                        validation: (code) => {
                            return code.includes('console.log');
                        }
                    },
                    {
                        question: 'Fill in the blank to check type:<br><br><code>console.log(___ myVar);</code>',
                        hints: [
                            'We use an operator to check types',
                            'The operator is typeof',
                            'Type: typeof'
                        ],
                        solution: 'console.log(typeof myVar);',
                        validation: (code) => {
                            return code.includes('typeof');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Debug your code!',
                    timeLimit: 60,
                    question: 'Print the value and type of score:<br><br><code>console.log("Score:", score, "Type:", ___ score);</code>',
                    solution: 'console.log("Score:", score, "Type:", typeof score);',
                    validation: (code) => {
                        return code.includes('console.log') && code.includes('typeof');
                    }
                }
            },
            {
                id: 'js_best_001',
                title: 'Code Quality Standards',
                difficulty: 'intermediate',
                tokens: 500,
                category: 'JavaScript Best Practices',
                lesson: {
                    scenario: `Learn to write clean code!`,
                    content: `
                        <h3>✨ LESSON 10: WRITING GOOD CODE</h3>
                        
                        <p style="font-size: 18px; line-height: 1.8;">
                        <strong>Good code</strong> is easy to read and understand.<br>
                        Use clear names, add comments, and keep functions small!<br>
                        That's it!
                        </p>
                        
                        <h4>Example:</h4>
                        <pre><code>// Good: Clear name
function calculateTotal(price, tax) {
    return price + tax;
}

// Bad: Unclear name
function calc(p, t) {
    return p + t;
}</code></pre>
                        
                        <p style="font-size: 16px;">
                        ☝️ The first function is much easier to understand!
                        </p>
                        
                        <p class="highlight">⚡ <strong>Remember:</strong> Write code for humans to read, not just computers!</p>
                    `
                },
                practice: [
                    {
                        question: 'Which is a better variable name?<br><br>A) <code>let x = 25;</code><br>B) <code>let userAge = 25;</code>',
                        hints: [
                            'Good names describe what they store',
                            'userAge is more descriptive than x',
                            'Answer: B'
                        ],
                        solution: 'let userAge = 25;',
                        validation: (code) => {
                            return code.includes('userAge') || code.toLowerCase().includes('b');
                        }
                    },
                    {
                        question: 'Add a comment to explain this code:<br><br><code>___ Calculate discount<br>let discount = price * 0.1;</code>',
                        hints: [
                            'Comments start with //',
                            'Type: //',
                            'Answer: //'
                        ],
                        solution: '// Calculate discount\nlet discount = price * 0.1;',
                        validation: (code) => {
                            return code.includes('//');
                        }
                    }
                ],
                test: {
                    scenario: 'Quick! Write clean code!',
                    timeLimit: 60,
                    question: 'Rename this function to be more descriptive:<br><br><code>function calc(n) {<br>&nbsp;&nbsp;return n * 2;<br>}</code>',
                    solution: 'function doubleNumber(n) {\n    return n * 2;\n}',
                    validation: (code) => {
                        return code.includes('function') && !code.includes('function calc') && code.includes('n * 2');
                    }
                }
            }
        ];
    }

    reset() {
        localStorage.removeItem(this.storageKey);
        this.init();
    }
}

// Create global instance
console.log('🎓 Creating NetrunnerUniversity instance...');
const netrunnerUniversity = new NetrunnerUniversity();
window.netrunnerUniversity = netrunnerUniversity;
console.log('✓ netrunnerUniversity created and assigned to window');
console.log(`  → Available Challenges: ${netrunnerUniversity.getAvailableCount()}`);
