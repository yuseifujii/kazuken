// 素数判定ゲームのJavaScript

let score = 0;
let streak = 0;
let currentNumber = 0;
let isGameActive = false;
let selectedLevel = null;
let maxNumber = 299; // デフォルトは中級
let questionsAnswered = 0;
let highScore = 0;
let lives = 3;
const MAX_LIVES = 3;

// DOM要素の取得
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const numberDisplay = document.getElementById('number-display');
const resultMessage = document.getElementById('result-message');
const startBtn = document.getElementById('start-btn');
const primeBtn = document.getElementById('prime-btn');
const notPrimeBtn = document.getElementById('not-prime-btn');
const gameContent = document.querySelector('.game-content');
const levelSelection = document.getElementById('level-selection');
const levelButtons = document.querySelectorAll('.level-btn');
const gameContainer = document.getElementById('prime-game');
const highScoreDisplay = document.getElementById('high-score-display');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.querySelector('.progress-container');
const livesDisplay = document.getElementById('lives-display');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const gameOverMessage = document.getElementById('game-over-message');
const restartBtn = document.getElementById('restart-btn');

// 新しく追加するDOM要素
const userInfoForm = document.getElementById('user-info-form');
const userAffiliationInput = document.getElementById('user-affiliation');
const userNicknameInput = document.getElementById('user-nickname');
const rankingDashboardBtn = document.getElementById('ranking-dashboard-btn');
const rankingModal = document.getElementById('ranking-modal');
const closeRankingBtn = document.getElementById('close-ranking-btn');
const rankingTableBody = document.getElementById('ranking-table-body');
const rankingUpdateTime = document.getElementById('ranking-update-time');
const rankingEmpty = document.getElementById('ranking-empty');

// ユーザー情報
let userInfo = {
    affiliation: '',
    nickname: ''
};

// ランキングシステム（モック実装）
class RankingSystem {
    constructor() {
        this.rankingKey = 'primeGameRanking_hard';
    }

    // ランキングデータを取得
    getRankings() {
        const data = localStorage.getItem(this.rankingKey);
        return data ? JSON.parse(data) : [];
    }

    // 新しいスコアを追加
    addScore(score, nickname, affiliation) {
        const rankings = this.getRankings();
        const newEntry = {
            score: score,
            nickname: nickname,
            affiliation: affiliation,
            timestamp: new Date().toISOString(),
            id: Date.now() + Math.random() // 簡易的なID生成
        };

        rankings.push(newEntry);
        
        // スコア順にソート（降順）
        rankings.sort((a, b) => b.score - a.score);
        
        // 上位50位まで保持
        const topRankings = rankings.slice(0, 50);
        
        localStorage.setItem(this.rankingKey, JSON.stringify(topRankings));
        return topRankings;
    }

    // ランキングをクリア（デバッグ用）
    clearRankings() {
        localStorage.removeItem(this.rankingKey);
    }
}

const rankingSystem = new RankingSystem();

// ランキングダッシュボードの表示
function showRankingDashboard() {
    updateRankingDisplay();
    rankingModal.style.display = 'block';
}

// ランキングダッシュボードを閉じる
function closeRankingDashboard() {
    rankingModal.style.display = 'none';
}

// ランキング表示を更新
function updateRankingDisplay() {
    const rankings = rankingSystem.getRankings();
    
    if (rankings.length === 0) {
        rankingTableBody.style.display = 'none';
        rankingEmpty.style.display = 'block';
        rankingUpdateTime.textContent = '--';
        return;
    }

    rankingTableBody.style.display = 'table-row-group';
    rankingEmpty.style.display = 'none';
    
    // テーブルの内容をクリア
    rankingTableBody.innerHTML = '';
    
    // ランキングデータを表示
    rankings.forEach((entry, index) => {
        const row = document.createElement('tr');
        if (index < 3) {
            row.classList.add(`rank-${index + 1}`);
        }
        
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        
        const date = new Date(entry.timestamp);
        const timeString = date.toLocaleString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td>${medal} ${rank}</td>
            <td class="score-cell">${entry.score}</td>
            <td class="nickname-cell">${escapeHtml(entry.nickname)}</td>
            <td class="affiliation-cell">${escapeHtml(entry.affiliation)}</td>
            <td class="time-cell">${timeString}</td>
        `;
        
        rankingTableBody.appendChild(row);
    });
    
    // 最終更新時刻を設定
    const now = new Date();
    rankingUpdateTime.textContent = now.toLocaleString('ja-JP');
}

// HTMLエスケープ関数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 効果音を作成する関数
function playSound(frequency, duration, type = 'sine') {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// 正解音
function playCorrectSound() {
    playSound(523, 0.1); // C5
    setTimeout(() => playSound(659, 0.1), 100); // E5
    setTimeout(() => playSound(784, 0.2), 200); // G5
}

// 不正解音
function playIncorrectSound() {
    playSound(300, 0.3, 'sawtooth');
}

// レベルアップ音
function playLevelUpSound() {
    playSound(440, 0.1); // A4
    setTimeout(() => playSound(554, 0.1), 100); // C#5
    setTimeout(() => playSound(659, 0.1), 200); // E5
    setTimeout(() => playSound(880, 0.3), 300); // A5
}

// 紙吹雪エフェクト
function createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        container.appendChild(confetti);
    }
    
    setTimeout(() => container.remove(), 3000);
}

// レベルごとのハイスコアを取得
function getHighScoreForLevel(level) {
    const key = `primeGameHighScore_${level}`;
    return parseInt(localStorage.getItem(key)) || 0;
}

// レベルごとのハイスコアを保存
function saveHighScoreForLevel(level, score) {
    const key = `primeGameHighScore_${level}`;
    localStorage.setItem(key, score);
}

// ハイスコア表示を更新
function updateHighScoreDisplay() {
    if (selectedLevel) {
        highScore = getHighScoreForLevel(selectedLevel);
        if (highScore > 0) {
            highScoreDisplay.textContent = `ハイスコア (${selectedLevel}): ${highScore}`;
        } else {
            highScoreDisplay.textContent = `ハイスコア (${selectedLevel}): --`;
        }
    }
}

// ライフ表示を更新
function updateLivesDisplay() {
    const lifeIcons = livesDisplay.querySelectorAll('.life-icon');
    lifeIcons.forEach((icon, index) => {
        if (index >= lives) {
            icon.classList.add('lost');
        } else {
            icon.classList.remove('lost');
        }
    });
}

// ゲームオーバー処理
function gameOver() {
    isGameActive = false;
    gameContent.classList.remove('active');
    gameOverScreen.style.display = 'block';
    finalScoreElement.textContent = score;
    
    // 上級レベルでスコアが記録できる場合、ランキングに追加
    if (selectedLevel === 'hard' && userInfo.nickname && userInfo.affiliation && score > 0) {
        rankingSystem.addScore(score, userInfo.nickname, userInfo.affiliation);
    }
    
    // ゲームオーバーメッセージ
    if (score >= 100) {
        gameOverMessage.textContent = 'すばらしい成績です！素数マスターですね！';
    } else if (score >= 50) {
        gameOverMessage.textContent = 'よく頑張りました！もう一度挑戦してみましょう！';
    } else {
        gameOverMessage.textContent = '練習あるのみ！次はもっと高得点を目指しましょう！';
    }
    
    // 上級レベルの場合、ランキング追加のメッセージを表示
    if (selectedLevel === 'hard' && userInfo.nickname && userInfo.affiliation && score > 0) {
        gameOverMessage.textContent += ' ランキングに記録されました！';
    }
    
    // ゲームオーバー音
    playSound(200, 0.5, 'sawtooth');
}

// 素数判定関数
function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) {
            return false;
        }
    }
    return true;
}

// 素因数分解関数
function primeFactorization(n) {
    const factors = [];
    let num = n;
    
    // 2で割れるだけ割る
    while (num % 2 === 0) {
        factors.push(2);
        num = num / 2;
    }
    
    // 3以上の奇数で割る
    for (let i = 3; i * i <= num; i += 2) {
        while (num % i === 0) {
            factors.push(i);
            num = num / i;
        }
    }
    
    // 残った数が1より大きければそれも素因数
    if (num > 1) {
        factors.push(num);
    }
    
    return factors;
}

// ランダムな奇数を生成
function generateRandomNumber() {
    // maxNumberに基づいて奇数を生成
    const maxOddIndex = Math.floor((maxNumber - 1) / 2);
    const oddIndex = Math.floor(Math.random() * maxOddIndex) + 1;
    return oddIndex * 2 + 1;
}

// 新しい問題を表示
function showNewNumber() {
    currentNumber = generateRandomNumber();
    
    // フェードアニメーション
    numberDisplay.classList.add('changing');
    setTimeout(() => {
        numberDisplay.textContent = currentNumber;
        numberDisplay.classList.remove('changing');
    }, 100);
    
    resultMessage.textContent = '';
    resultMessage.className = 'result-message';
    
    // プログレスバー更新
    questionsAnswered++;
    const progress = Math.min((questionsAnswered / 20) * 100, 100);
    progressBar.style.width = progress + '%';
}

// 答えをチェック
function checkAnswer(userSaysPrime) {
    const actuallyPrime = isPrime(currentNumber);
    const correct = userSaysPrime === actuallyPrime;
    
    // 振動フィードバック（対応デバイスのみ）
    if ('vibrate' in navigator) {
        navigator.vibrate(correct ? 50 : [100, 50, 100]);
    }
    
    if (correct) {
        score += 10;
        streak += 1;
        resultMessage.textContent = '正解！ 🎉';
        resultMessage.className = 'result-message correct';
        
        // 効果音
        playCorrectSound();
        
        // スコア更新アニメーション
        scoreElement.parentElement.classList.add('updating');
        setTimeout(() => scoreElement.parentElement.classList.remove('updating'), 300);
        
        // 連続正解ボーナス
        if (streak % 5 === 0) {
            score += 20;
            resultMessage.textContent += ` ${streak}問連続正解！ボーナス +20点！`;
            playLevelUpSound();
            createConfetti();
            
            // 虹色の枠線
            gameContainer.classList.add('streak-5');
            setTimeout(() => gameContainer.classList.remove('streak-5'), 3000);
        }
        
        // ハイスコア更新
        if (score > highScore) {
            highScore = score;
            saveHighScoreForLevel(selectedLevel, highScore);
            updateHighScoreDisplay();
        }
    } else {
        streak = 0;
        lives--;
        
        // ライフアイコンにアニメーション
        const lifeIcons = livesDisplay.querySelectorAll('.life-icon');
        if (lives >= 0 && lives < MAX_LIVES) {
            lifeIcons[lives].classList.add('losing');
            setTimeout(() => {
                lifeIcons[lives].classList.remove('losing');
                updateLivesDisplay();
            }, 500);
        }
        
        if (actuallyPrime) {
            resultMessage.textContent = `残念... ${currentNumber}は素数です`;
        } else {
            // 素因数分解を表示
            const factors = primeFactorization(currentNumber);
            const factorString = factors.join(' × ');
            resultMessage.textContent = `残念... ${currentNumber} = ${factorString}`;
        }
        
        // 残りライフを表示
        if (lives > 0) {
            resultMessage.textContent += ` (残りライフ: ${lives})`;
        }
        
        resultMessage.className = 'result-message incorrect';
        
        // 効果音
        playIncorrectSound();
        
        // ゲームオーバーチェック
        if (lives <= 0) {
            setTimeout(() => {
                gameOver();
            }, 1500);
            return;
        }
    }
    
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    
    // 3秒後に次の問題へ（素因数分解を見る時間を確保）
    setTimeout(() => {
        if (isGameActive) {
            showNewNumber();
        }
    }, 3000);
}

// ゲーム開始
function startGame() {
    // 上級レベルの場合、ユーザー情報をバリデーション
    if (selectedLevel === 'hard') {
        const affiliation = userAffiliationInput.value.trim();
        const nickname = userNicknameInput.value.trim();
        
        if (!affiliation || !nickname) {
            alert('ランキングに参加するには、所属とニックネームの入力が必要です。');
            return;
        }
        
        userInfo.affiliation = affiliation;
        userInfo.nickname = nickname;
    }
    
    isGameActive = true;
    score = 0;
    streak = 0;
    questionsAnswered = 0;
    lives = MAX_LIVES;
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    
    startBtn.style.display = 'none';
    levelSelection.style.display = 'none';
    userInfoForm.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameContent.classList.add('active');
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    
    updateHighScoreDisplay();
    updateLivesDisplay();
    showNewNumber();
}

// レベル選択の処理
levelButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedLevel = button.dataset.level;
        
        // レベルに応じて最大数を設定
        switch(selectedLevel) {
            case 'easy':
                maxNumber = 99;
                break;
            case 'medium':
                maxNumber = 299;
                break;
            case 'hard':
                maxNumber = 999;
                break;
        }
        
        // レベル選択を非表示
        levelSelection.style.display = 'none';
        
        // 上級レベルの場合、ユーザー情報入力フォームを表示
        if (selectedLevel === 'hard') {
            userInfoForm.style.display = 'block';
            startBtn.textContent = '上級でスタート！';
            
            // ランキングボタンを表示
            rankingDashboardBtn.style.display = 'block';
        } else {
            userInfoForm.style.display = 'none';
            startBtn.textContent = `${button.querySelector('.level-name').textContent}でスタート！`;
            
            // ランキングボタンを非表示
            rankingDashboardBtn.style.display = 'none';
        }
        
        startBtn.style.display = 'block';
    });
});

// イベントリスナーの設定
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    levelSelection.style.display = 'block';
    userInfoForm.style.display = 'none';
    rankingDashboardBtn.style.display = 'none';
    selectedLevel = null;
    
    // ユーザー情報をリセット
    userInfo.affiliation = '';
    userInfo.nickname = '';
    userAffiliationInput.value = '';
    userNicknameInput.value = '';
});

// ランキングダッシュボードのイベントリスナー
rankingDashboardBtn.addEventListener('click', showRankingDashboard);
closeRankingBtn.addEventListener('click', closeRankingDashboard);

// モーダルの外側をクリックしたときに閉じる
rankingModal.addEventListener('click', (e) => {
    if (e.target === rankingModal) {
        closeRankingDashboard();
    }
});

primeBtn.addEventListener('click', () => {
    if (isGameActive && numberDisplay.textContent) {
        checkAnswer(true);
    }
});

notPrimeBtn.addEventListener('click', () => {
    if (isGameActive && numberDisplay.textContent) {
        checkAnswer(false);
    }
});

// タッチデバイス用の処理（ボタンの反応を良くする）
if ('ontouchstart' in window) {
    primeBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isGameActive && numberDisplay.textContent) {
            checkAnswer(true);
        }
    });
    
    notPrimeBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isGameActive && numberDisplay.textContent) {
            checkAnswer(false);
        }
    });
} 