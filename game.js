// 素数判定ゲームのJavaScript

let score = 0;
let streak = 0;
let currentNumber = 0;
let isGameActive = false;
let selectedLevel = null;
let maxNumber = 299; // デフォルトは中級

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
        if (actuallyPrime) {
            resultMessage.textContent = `残念... ${currentNumber}は素数です`;
        } else {
            // 素因数分解を表示
            const factors = primeFactorization(currentNumber);
            const factorString = factors.join(' × ');
            resultMessage.textContent = `残念... ${currentNumber} = ${factorString}`;
        }
        resultMessage.className = 'result-message incorrect';
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
    isGameActive = true;
    score = 0;
    streak = 0;
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    
    startBtn.style.display = 'none';
    levelSelection.style.display = 'none';
    gameContent.classList.add('active');
    
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
        
        // レベル選択を非表示にしてスタートボタンを表示
        levelSelection.style.display = 'none';
        startBtn.style.display = 'block';
        startBtn.textContent = `${button.querySelector('.level-name').textContent}でスタート！`;
    });
});

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