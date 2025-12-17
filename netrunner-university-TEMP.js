/* 
   ================================================
   NETRUNNER UNIVERSITY - 3-Phase Learning System
   ================================================
   Manages coding challenges with Lesson, Practice, and Test phases
*/

class NetrunnerUniversity {
    constructor() {
        this.storageKey = 'netrunner_university_data';
        this.challenges = this.createChallenges();
        this.init();
    }

    init() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = {
                completedChallenges: [],
                failedToday: [],
                dailyChallenges: [],
                lastRotation: new Date().toDateString(),
                weekStartDate: this.getWeekStart()
            };
            this.rotateChallenges();
        }

        this.checkDailyReset();
    }

    getWeekStart() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        const weekStart = new Date(now.setDate(diff));
        return weekStart.toDateString();
    }

    checkDailyReset() {
        const today = new Date().toDateString();

        // Reset daily challenges if it's a new day
        if (this.data.lastRotation !== today) {
            this.data.failedToday = [];
            this.rotateChallenges();
        }

        // Reset weekly if new week
        const thisWeek = this.getWeekStart();
        if (this.data.weekStartDate !== thisWeek) {
            this.data.weekStartDate = thisWeek;
            // Could add weekly reset logic here if needed
        }
    }

    rotateChallenges() {
        // Select 3 random challenges that haven't been completed this week
        const available = this.challenges.filter(c =>
            !this.data.completedChallenges.includes(c.id)
        );

        // Shuffle and take 3
        const shuffled = available.sort(() => Math.random() - 0.5);
        this.data.dailyChallenges = shuffled.slice(0, 3).map(c => c.id);
        this.data.lastRotation = new Date().toDateString();
        this.save();
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    getAvailableChallenges() {
        this.checkDailyReset();

        return this.data.dailyChallenges
            .filter(id => !this.data.failedToday.includes(id))
            .map(id => this.challenges.find(c => c.id === id))
            .filter(c => c !== undefined);
    }

    getChallengeById(id) {
        return this.challenges.find(c => c.id === id);
    }

    markChallengeComplete(challengeId, tokensEarned) {
        if (!this.data.completedChallenges.includes(challengeId)) {
            this.data.completedChallenges.push(challengeId);
            this.save();

            // Award tokens through FlowBank
            if (window.flowBank) {
                const challenge = this.getChallengeById(challengeId);
                flowBank.addTokens(
                    tokensEarned,
                    `Netrunner University - "${challenge.title}"`,
                    'challenge'
                );
            }
        }
    }

    markChallengeFailed(challengeId) {
        if (!this.data.failedToday.includes(challengeId)) {
            this.data.failedToday.push(challengeId);
            this.save();
        }
    }

    getAvailableCount() {
        return this.getAvailableChallenges().length;
    }

    createChallenges() {
        return [
            {
                id: 'js_variables_001',
                title: 'Data Extraction Protocol',
                difficulty: 'easy',
                tokens: 300,
                category: 'JavaScript Basics',
                lesson: {
                    scenario: `You've infiltrated a corporate database. The system stores employee data in variables. To extract the information without triggering alarms, you need to understand how JavaScript variables work.`,
                    content: `
                        <h3>VARIABLES: DATA CONTAINERS</h3>
                        <p>Variables store data that can be used and changed. Think of them as labeled boxes.</p>
                        <pre><code>let employeeName = "Alex Chen";
let securityLevel = 5;
const companyCode = "FLOW-2026";</code></pre>
                        <ul>
                            <li><strong>let</strong> - Can be changed later</li>
                            <li><strong>const</strong> - Cannot be changed (constant)</li>
                            <li><strong>var</strong> - Old way (avoid using)</li>
                        </ul>
                        <p class="highlight">⚡ Use <code>const</code> by default. Only use <code>let</code> if you need to change the value.</p>
                    `
                },
                practice: [
                    {
                        question: 'Create a variable called <code>targetName</code> that stores the string "Dr. Morrison"',
                        hints: [
                            'Use the let keyword to create a variable',
                            'Strings must be wrapped in quotes: "text here"',
                            'The syntax is: let variableName = "value";'
                        ],
                        solution: 'let targetName = "Dr. Morrison";',
                        validation: (code) => {
                            return code.includes('targetName') &&
                                code.includes('Dr. Morrison') &&
                                (code.includes('let') || code.includes('const'));
                        }
                    },
                    {
                        question: 'Create a constant called <code>accessCode</code> with the number 4782',
                        hints: [
                            'Use const for values that won\'t change',
                            'Numbers don\'t need quotes',
                            'The syntax is: const variableName = value;'
                        ],
                        solution: 'const accessCode = 4782;',
                        validation: (code) => {
                            return code.includes('accessCode') &&
                                code.includes('4782') &&
                                code.includes('const');
                        }
                    }
                ],
                test: {
                    scenario: 'URGENT: Security detected unusual activity. You have 60 seconds to extract the data before lockdown!',
                    timeLimit: 60,
                    question: 'Create three variables: <code>agentId</code> (string "NR-7734"), <code>clearanceLevel</code> (number 9), and <code>missionCode</code> (constant "GHOST_PROTOCOL")',
                    solution: 'let agentId = "NR-7734";\nlet clearanceLevel = 9;\nconst missionCode = "GHOST_PROTOCOL";',
                    validation: (code) => {
                        return code.includes('agentId') && code.includes('NR-7734') &&
                            code.includes('clearanceLevel') && code.includes('9') &&
                            code.includes('missionCode') && code.includes('GHOST_PROTOCOL') &&
                            code.includes('const');
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
console.log('  → Available challenges:', netrunnerUniversity.getAvailableCount());
