// 素数判定ゲームのJavaScript

let score = 0;
let streak = 0;
let currentNumber = 0;
let isGameActive = false;

// DOM要素の取得
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const numberDisplay = document.getElementById('number-display');
const resultMessage = document.getElementById('result-message');
const startBtn = document.getElementById('start-btn');
const primeBtn = document.getElementById('prime-btn');
const notPrimeBtn = document.getElementById('not-prime-btn');
const gameContent = document.querySelector('.game-content');

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

// ランダムな数を生成（2から200まで）
function generateRandomNumber() {
    return Math.floor(Math.random() * 199) + 2;
}

// 新しい問題を表示
function showNewNumber() {
    currentNumber = generateRandomNumber();
    numberDisplay.textContent = currentNumber;
    resultMessage.textContent = '';
    resultMessage.className = 'result-message';
}

// 答えをチェック
function checkAnswer(userSaysPrime) {
    const actuallyPrime = isPrime(currentNumber);
    const correct = userSaysPrime === actuallyPrime;
    
    if (correct) {
        score += 10;
        streak += 1;
        resultMessage.textContent = '正解！ 🎉';
        resultMessage.className = 'result-message correct';
        
        // 連続正解ボーナス
        if (streak % 5 === 0) {
            score += 20;
            resultMessage.textContent += ` ${streak}問連続正解！ボーナス +20点！`;
        }
    } else {
        streak = 0;
        resultMessage.textContent = `残念... ${currentNumber}は${actuallyPrime ? '素数' : '素数ではありません'}`;
        resultMessage.className = 'result-message incorrect';
    }
    
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    
    // 2秒後に次の問題へ
    setTimeout(() => {
        if (isGameActive) {
            showNewNumber();
        }
    }, 2000);
}

// ゲーム開始
function startGame() {
    isGameActive = true;
    score = 0;
    streak = 0;
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    
    startBtn.style.display = 'none';
    gameContent.classList.add('active');
    
    showNewNumber();
}

// イベントリスナーの設定
startBtn.addEventListener('click', startGame);

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