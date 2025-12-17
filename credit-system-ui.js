/* 
   ================================================
   CREDIT SYSTEM UI INTEGRATION
   ================================================
   Builds UI modals and wires up event handlers
*/

// Initialize immediately or wait for DOM
function initCreditSystemUI() {

    // ============================================
    // 1. BUILD FLOWBANK MODAL
    // ============================================

    function createFlowBankModal() {
        const modal = document.createElement('div');
        modal.className = 'flowbank-overlay';
        modal.id = 'flowbank-modal';

        modal.innerHTML = `
            <div class="flowbank-container">
                <div class="flowbank-header">
                    <div class="flowbank-title">FLOWBANK</div>
                    <button class="flowbank-close" id="flowbank-close">×</button>
                </div>
                
                <div class="flowbank-balance">
                    <div class="balance-label">TOTAL BALANCE</div>
                    <div class="balance-amount" id="flowbank-balance-display">
                        0<span class="balance-currency">FLOW TOKENS</span>
                    </div>
                </div>
                
                <div class="flowbank-stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-label">EARNED TODAY</div>
                        <div class="stat-card-value" id="daily-earned">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-label">EARNED THIS WEEK</div>
                        <div class="stat-card-value" id="weekly-earned">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-label">AVAILABLE CHALLENGES</div>
                        <div class="stat-card-value" id="challenges-available">0</div>
                    </div>
                </div>
                
                <div class="flowbank-transactions">
                    <div class="transactions-header">TRANSACTION HISTORY</div>
                    <div class="transactions-list" id="transactions-list">
                        <div class="no-transactions">No transactions yet. Complete challenges or bounties to earn tokens!</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Wire up close button
        document.getElementById('flowbank-close').addEventListener('click', closeFlowBank);

        // Close on overlay click
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeFlowBank();
            }
        });
    }


    function openFlowBank() {
        console.log('💳 openFlowBank() called');
        const modal = document.getElementById('flowbank-modal');
        console.log('  → Modal element:', modal);
        if (!modal) {
            console.error('❌ FLOWBANK modal not found!');
            return;
        }

        // Update display with current data
        console.log('  → Fetching stats from flowBank...');
        const stats = flowBank.getStats();
        console.log('  → Stats:', stats);

        document.getElementById('flowbank-balance-display').innerHTML =
            `${stats.balance}<span class="balance-currency">FLOW TOKENS</span>`;
        document.getElementById('daily-earned').textContent = stats.dailyEarned;
        document.getElementById('weekly-earned').textContent = stats.weeklyEarned;
        document.getElementById('challenges-available').textContent = window.netrunnerUniversity ? window.netrunnerUniversity.getAvailableCount() : 0;

        // Update transactions
        const transactions = flowBank.getTransactions(20);
        const listEl = document.getElementById('transactions-list');

        if (transactions.length === 0) {
            listEl.innerHTML = '<div class="no-transactions">No transactions yet. Complete challenges or bounties to earn tokens!</div>';
        } else {
            listEl.innerHTML = transactions.map(t => {
                const isPositive = t.amount > 0;
                const iconClass = t.type === 'bounty' ? 'bounty' : t.type === 'challenge' ? 'challenge' : isPositive ? 'earned' : 'spent';
                const icon = t.type === 'bounty' ? '🎯' : t.type === 'challenge' ? '🎓' : isPositive ? '💰' : '🛒';

                return `
                    <div class="transaction-item">
                        <div class="transaction-icon ${iconClass}">${icon}</div>
                        <div class="transaction-details">
                            <div class="transaction-description">${t.description}</div>
                            <div class="transaction-date">${t.date}</div>
                        </div>
                        <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                            ${isPositive ? '+' : ''}${t.amount}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Mark transactions as read
        flowBank.markTransactionsRead();

        // Show modal
        console.log('  → Adding "active" class to modal...');
        modal.classList.add('active');
        console.log('✅ FLOWBANK opened successfully');
        console.log('  → Modal classList:', modal.classList);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        if (sfx) sfx.success();
    }

    function closeFlowBank() {
        const modal = document.getElementById('flowbank-modal');
        if (modal) {
            modal.classList.remove('active');

            // Restore body scroll
            document.body.style.overflow = '';

            if (sfx) sfx.click();
        }
    }

    // ============================================
    // 2. BUILD NETRUNNER UNIVERSITY MODAL
    // ============================================

    function createUniversityModal() {
        const modal = document.createElement('div');
        modal.className = 'university-overlay';
        modal.id = 'university-modal';

        modal.innerHTML = `
            <div class="university-modal">
                <div class="university-header">
                    <div class="university-title">NETRUNNER UNIVERSITY</div>
                    <button class="university-close" id="university-close">×</button>
                </div>
                
                <div id="university-content">
                    <!-- Content will be dynamically loaded -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Wire up close button
        document.getElementById('university-close').addEventListener('click', closeUniversity);

        // Close on overlay click
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeUniversity();
            }
        });
    }

    let currentChallenge = null;
    let currentPhase = 'list'; // 'list', 'lesson', 'practice', 'test'
    let currentPracticeIndex = 0;
    let currentHintLevel = 0;
    let practiceAttempts = 0;
    let testTimer = null;
    let testStartTime = null; // Track test start time for points

    function openUniversityModal() {
        console.log('🎓 Opening University Modal...');
        const modal = document.getElementById('university-modal');
        if (!modal) {
            console.error('❌ University modal not found!');
            return;
        }

        // Reset state
        currentChallenge = null;
        currentPhase = 'list';

        // Show challenge list
        showChallengeList();

        modal.classList.add('active');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        if (sfx) sfx.success();
    }

    function closeUniversity() {
        const modal = document.getElementById('university-modal');
        if (modal) {
            // Clear any running timers
            if (testTimer) {
                clearInterval(testTimer);
                testTimer = null;
            }

            modal.classList.remove('active');

            // Restore body scroll
            document.body.style.overflow = '';

            if (sfx) sfx.click();
        }
    }

    function showChallengeList() {
        console.log('📋 Showing challenge list...');
        const content = document.getElementById('university-content');

        // Get current or selected level
        const currentLevel = window.netrunnerUniversity.selectedLevel || window.netrunnerUniversity.getCurrentLevel();

        // Get challenges for the selected level
        const allChallenges = window.netrunnerUniversity ? window.netrunnerUniversity.getChallengesByLevel(currentLevel) : [];

        // Filter by availability (unless in testing mode)
        const challenges = TESTING_MODE ? allChallenges : allChallenges.filter(c => {
            return !window.netrunnerUniversity.data.completedChallenges.includes(c.id) &&
                !window.netrunnerUniversity.data.failedChallenges[c.id];
        });

        // Render level tabs
        const levelTabsContainer = window.netrunnerUniversity.renderLevelTabs();

        if (challenges.length === 0) {
            content.innerHTML = '';
            content.appendChild(levelTabsContainer);

            const emptyMessage = document.createElement('div');
            emptyMessage.style.cssText = 'text-align: center; padding: 60px 20px; color: #888;';
            emptyMessage.innerHTML = `
                <i class="fa-solid fa-check-circle" style="font-size: 64px; color: #00ff88; margin-bottom: 20px;"></i>
                <h2 style="color: #00ff88; margin-bottom: 15px;">LEVEL ${currentLevel} COMPLETE!</h2>
                <p>You've completed all challenges for this level.</p>
                <p style="margin-top: 10px;">Select another level or check back tomorrow!</p>
            `;
            content.appendChild(emptyMessage);
            return;
        }

        // Create challenge list HTML
        const challengeListHTML = `
            <div class="challenge-list">
                ${challenges.map(c => `
                    <div class="challenge-card" data-challenge-id="${c.id}">
                        <div class="challenge-card-header">
                            <div class="challenge-title">${c.title}</div>
                            <div class="challenge-tokens">+${c.tokens} 🪙</div>
                        </div>
                        <div class="challenge-category">${c.category}</div>
                        <div class="challenge-difficulty ${c.difficulty}">${c.difficulty.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Clear and rebuild content
        content.innerHTML = '';
        content.appendChild(levelTabsContainer);

        const listContainer = document.createElement('div');
        listContainer.innerHTML = challengeListHTML;
        content.appendChild(listContainer);

        // Wire up click handlers
        content.querySelectorAll('.challenge-card').forEach(card => {
            card.addEventListener('click', function () {
                const challengeId = this.getAttribute('data-challenge-id');
                startChallenge(challengeId);
            });
        });
    }

    function startChallenge(challengeId) {
        currentChallenge = netrunnerUniversity.getChallengeById(challengeId);
        if (!currentChallenge) return;

        currentPhase = 'lesson';
        currentPracticeIndex = 0;
        practiceAttempts = 0;
        currentHintLevel = 0;

        showLessonPhase();
        if (sfx) sfx.playTone(400, 'sine', 0.2);
    }

    function showLessonPhase() {
        console.log('📖 Showing lesson for:', currentChallenge.title);
        currentPhase = 'lesson';

        // Award points for reading lesson
        if (window.pointsSystem) {
            pointsSystem.lessonCompleted(currentChallenge.id);
        }

        const content = document.getElementById('university-content');
        const lesson = currentChallenge.lesson;

        content.innerHTML = `
            <div class="lesson-panel active">
                <div class="lesson-scenario">${lesson.scenario}</div>
                <div class="lesson-content">${lesson.content}</div>
                <button class="lesson-continue-btn" id="continue-to-practice">CONTINUE TO PRACTICE →</button>
            </div>
        `;

        document.getElementById('continue-to-practice').addEventListener('click', () => {
            currentPhase = 'practice';
            showPracticePhase();
            if (sfx) sfx.click();
        });
    }

    function showPracticePhase() {
        const content = document.getElementById('university-content');
        const problem = currentChallenge.practice[currentPracticeIndex];

        content.innerHTML = `
            <div class="practice-panel active">
                <div class="practice-problem">
                    <div class="problem-number">PRACTICE PROBLEM ${currentPracticeIndex + 1} of ${currentChallenge.practice.length}</div>
                    <div class="problem-question">${problem.question}</div>
                    
                    <div class="code-input-area">
                        <textarea id="practice-code-input" placeholder="// Write your code here..." spellcheck="false"></textarea>
                    </div>
                    
                    <div class="practice-actions">
                        <button class="check-answer-btn" id="check-practice-answer">CHECK ANSWER</button>
                        <button class="hint-btn" id="show-hint">SHOW HINT</button>
                    </div>
                    
                    <div class="hint-display" id="hint-display"></div>
                    <div class="feedback-message" id="practice-feedback"></div>
                    <button class="next-problem-btn" id="next-practice-problem">NEXT PROBLEM →</button>
                </div>
            </div>
        `;

        practiceAttempts = 0;
        currentHintLevel = 0;

        document.getElementById('check-practice-answer').addEventListener('click', checkPracticeAnswer);
        document.getElementById('show-hint').addEventListener('click', showHint);
        document.getElementById('next-practice-problem').addEventListener('click', nextPractice);
    }

    function checkPracticeAnswer() {
        const code = document.getElementById('practice-code-input').value.trim();
        const problem = currentChallenge.practice[currentPracticeIndex];
        const feedback = document.getElementById('practice-feedback');
        const hintBtn = document.getElementById('show-hint');

        if (!code) {
            feedback.textContent = 'Please write some code first!';
            feedback.className = 'feedback-message error visible';
            if (sfx) sfx.error();
            return;
        }

        const isCorrect = problem.validation(code);
        practiceAttempts++;

        if (isCorrect) {
            feedback.className = 'practice-feedback success';
            feedback.innerHTML = '✓ Correct! Moving to next question...';
            currentPracticeIndex++;
            currentHintLevel = 0;
            practiceAttempts = 0;
            document.getElementById('next-practice-problem').classList.add('visible');
            document.getElementById('check-practice-answer').disabled = true;
            if (sfx) sfx.success();

        } else {
            feedback.textContent = `✗ Not quite right. Try again! (Attempt ${practiceAttempts}/5)`;
            feedback.className = 'feedback-message error visible';

            // Show hint button after first wrong attempt
            if (practiceAttempts >= 1) {
                hintBtn.classList.add('visible');
            }

            // Auto-solve after 5 attempts
            if (practiceAttempts >= 5) {
                feedback.textContent = '💡 Here\'s the solution. Study it and move on!';
                feedback.className = 'feedback-message visible';
                document.getElementById('practice-code-input').value = problem.solution;
                document.getElementById('next-practice-problem').classList.add('visible');
                document.getElementById('check-practice-answer').disabled = true;
            }

            if (sfx) sfx.error();
        }
    }

    function showHint() {
        const problem = currentChallenge.practice[currentPracticeIndex];
        const hintDisplay = document.getElementById('hint-display');

        if (currentHintLevel < problem.hints.length) {
            hintDisplay.textContent = `💡 Hint ${currentHintLevel + 1}: ${problem.hints[currentHintLevel]}`;
            hintDisplay.classList.add('visible');
            currentHintLevel++;
            if (sfx) sfx.playTone(500, 'sine', 0.1);
        }
    }

    function nextPractice() {
        currentPracticeIndex++;

        if (currentPracticeIndex < currentChallenge.practice.length) {
            showPracticePhase();
        } else {
            // All practice complete
            const content = document.getElementById('university-content');
            content.innerHTML = `
                <div class="practice-complete">
                    <h2>🎯 PRACTICE COMPLETE!</h2>
                    <p>You're ready for the final test.</p>
                    <button class="start-test-btn" id="start-test">BEGIN FINAL TEST →</button>
                </div>
            `;
            document.getElementById('start-test').addEventListener('click', () => {
                currentPhase = 'test';
                showTestPhase();
                if (sfx) sfx.click();
            });

            // Award points for completing practice phase
            if (window.pointsSystem) {
                pointsSystem.practiceCompleted(currentChallenge.id);
            }
        }

        if (sfx) sfx.click();
    }

    function showTestPhase() {
        console.log('🧪 Showing test for:', currentChallenge.title);
        currentPhase = 'test';
        testStartTime = Date.now(); // Track when test started

        const content = document.getElementById('university-content');
        const test = currentChallenge.test;

        content.innerHTML = `
            <div class="test-panel active">
                <div class="test-scenario">${test.scenario}</div>
                
                <div class="timer-display">
                    <div class="timer-label">TIME REMAINING</div>
                    <div class="timer-value" id="test-timer">${test.timeLimit}s</div>
                </div>
                
                <div class="test-question">
                    <div class="test-question-text">${test.question}</div>
                    
                    <div class="code-input-area">
                        <textarea id="test-code-input" placeholder="// Write your code here... NO HINTS!" spellcheck="false"></textarea>
                    </div>
                    
                    <button class="submit-test-btn" id="submit-test">SUBMIT SOLUTION</button>
                </div>
                
                <div class="test-result" id="test-result"></div>
            </div>
        `;

        // Start timer
        let timeLeft = test.timeLimit;
        testStartTime = Date.now();
        const timerEl = document.getElementById('test-timer');

        testTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft + 's';

            // Warning at 30s
            if (timeLeft <= 30 && timeLeft > 10) {
                timerEl.classList.add('warning');
                timerEl.classList.remove('critical');
            }
            // Critical at 10s
            else if (timeLeft <= 10) {
                timerEl.classList.add('critical');
                timerEl.classList.remove('warning');
                if (sfx && timeLeft <= 5) sfx.playTone(800, 'square', 0.1);
            }

            // Time's up
            if (timeLeft <= 0) {
                clearInterval(testTimer);
                testTimer = null;
                failTest('Time\'s up! Mission failed.');
            }
        }, 1000);

        document.getElementById('submit-test').addEventListener('click', submitTest);

        if (sfx) sfx.playTone(200, 'sawtooth', 0.5);
    }

    function submitTest() {
        if (testTimer) {
            clearInterval(testTimer);
            testTimer = null;
        }

        const code = document.getElementById('test-code-input').value.trim();
        const test = currentChallenge.test;

        if (!code) {
            failTest('No code submitted!');
            return;
        }

        const isCorrect = test.validation(code);

        if (isCorrect) {
            passTest();
        } else {
            failTest('Solution incorrect. Better luck next time!');
        }
    }

    function passTest() {
        const resultEl = document.getElementById('test-result');
        resultEl.innerHTML = `
            <div class="result-icon">✓</div>
            <div class="result-title">MISSION SUCCESS!</div>
            <div class="result-message">
                You've earned <strong>${currentChallenge.tokens} FLOW TOKENS</strong>!<br>
                Challenge completed successfully.
            </div>
            <button class="return-to-challenges-btn" id="return-to-list">RETURN TO CHALLENGES</button>
        `;
        resultEl.className = 'test-result success visible';

        // Award tokens
        window.netrunnerUniversity.markChallengeComplete(currentChallenge.id, currentChallenge.tokens);

        // Award points for test completion
        if (window.pointsSystem) {
            const timeTaken = (Date.now() - testStartTime) / 1000;
            pointsSystem.testCompleted(currentChallenge.id, false, timeTaken); // No hints, pass time taken
        }

        // Add return button handler
        setTimeout(() => {
            const returnBtn = document.getElementById('return-to-list');
            if (returnBtn) {
                returnBtn.addEventListener('click', () => {
                    // Scroll to top
                    const modalContent = document.getElementById('university-content');
                    if (modalContent) {
                        modalContent.scrollTop = 0;
                    }
                    showChallengeList();
                });
            }
        }, 100);

        // Update badge
        updateUniversityBadge();

        // Play success sound
        if (sfx) {
            sfx.success();
            setTimeout(() => sfx.playTone(1200, 'sine', 0.3), 200);
        }

        // Scroll result into view
        setTimeout(() => {
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    function failTest(message) {
        const resultEl = document.getElementById('test-result');
        resultEl.innerHTML = `
            <div class="result-icon">✗</div>
            <div class="result-title">MISSION FAILED</div>
            <div class="result-message">
                ${message}<br>
                This challenge is now locked for today.
            </div>
            <button class="return-to-challenges-btn" id="return-to-list">RETURN TO CHALLENGES</button>
        `;
        resultEl.className = 'test-result failure visible';

        // Mark as failed
        netrunnerUniversity.markChallengeFailed(currentChallenge.id);

        // Update badge
        updateUniversityBadge();

        document.getElementById('return-to-list').addEventListener('click', () => {
            currentPhase = 'list';
            showChallengeList();
        });

        if (sfx) sfx.error();
    }

    // ============================================
    // 3. WIRE UP EVENT HANDLERS
    // ============================================

    function wireUpHandlers() {
        console.log('🔧 wireUpHandlers() called');

        // FLOWBANK buttons
        console.log('🔍 Looking for FLOWBANK buttons with selector: #flowcard-btn');
        const flowcardBtns = document.querySelectorAll('#flowcard-btn');
        console.log('✓ Found', flowcardBtns.length, 'FLOWBANK button(s):', flowcardBtns);

        flowcardBtns.forEach((btn, index) => {
            console.log(`  → Attaching click handler to FLOWBANK button ${index + 1}`);
            btn.addEventListener('click', function (e) {
                console.log('💳 FLOWBANK BUTTON CLICKED!', e);
                openFlowBank();
            });
        });

        // University buttons
        console.log('🔍 Looking for University buttons with selector: #university-btn');
        const universityBtn = document.getElementById('university-btn');
        if (universityBtn) {
            console.log('✓ Found University button:', universityBtn);
            console.log('  → Attaching click handler to University button');
            universityBtn.addEventListener('click', (e) => {
                console.log('🎓 UNIVERSITY BUTTON CLICKED!', e);
                openUniversityModal();
            });
        } else {
            console.log('✗ University button with selector #university-btn not found.');
        }

        // Update badges on load
        console.log('🔄 Updating badges...');
        updateUniversityBadge();
        flowBank.updateBadges();
        console.log('✓ Badges updated');
    }

    function updateUniversityBadge() {
        const badges = document.querySelectorAll('#university-badge');
        const count = netrunnerUniversity.getAvailableCount();

        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });

        // Also update Netrunner eye badge
        updateNetrunnerBadge(count);
    }

    function updateNetrunnerBadge(count) {
        const netrunnerBadge = document.getElementById('netrunner-badge');
        if (netrunnerBadge) {
            if (count > 0) {
                netrunnerBadge.textContent = count;
                netrunnerBadge.style.display = 'flex';
            } else {
                netrunnerBadge.style.display = 'none';
            }
        }
    }

    // ============================================
    // 4. INITIALIZE
    // ============================================

    console.log('📦 Creating FLOWBANK modal...');
    createFlowBankModal();
    console.log('✓ FLOWBANK modal created');

    console.log('📦 Creating University modal...');
    createUniversityModal();
    console.log('✓ University modal created');

    console.log('🔌 Wiring up event handlers...');
    wireUpHandlers();

    console.log('✅ Credit System UI Initialized');
}

// Call initialization immediately if DOM is ready, otherwise wait
console.log('🚀 credit-system-ui.js loaded, document.readyState:', document.readyState);
if (document.readyState === 'loading') {
    console.log('⏳ DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initCreditSystemUI);
} else {
    console.log('✓ DOM already ready, initializing immediately...');
    initCreditSystemUI();
}

// Retry badge updates after a delay to ensure netrunnerUniversity is loaded
setTimeout(() => {
    console.log('🔄 Retrying badge updates after delay...');
    if (window.netrunnerUniversity) {
        const count = netrunnerUniversity.getAvailableCount();
        console.log('  → Available challenges:', count);

        // Update all badges
        document.querySelectorAll('#university-badge').forEach(badge => {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            }
        });

        const netrunnerBadge = document.getElementById('netrunner-badge');
        if (netrunnerBadge && count > 0) {
            netrunnerBadge.textContent = count;
            netrunnerBadge.style.display = 'flex';
            console.log('  → Netrunner badge updated:', count);
        }
    } else {
        console.warn('  → netrunnerUniversity not loaded yet');
    }
}, 1000);
