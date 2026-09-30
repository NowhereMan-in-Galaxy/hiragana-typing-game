// 五十音数据
const hiraganaData = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n'
};

const katakanaData = {
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヰ': 'wi', 'ヱ': 'we', 'ヲ': 'wo', 'ン': 'n'
};

// 关卡配置
const levelConfig = [
    // 学习关卡
    { id: 1, name: 'あ行平假名', type: 'hiragana', chars: ['あ', 'い', 'う', 'え', 'お'], target: 500 },
    { id: 2, name: 'あ行片假名', type: 'katakana', chars: ['ア', 'イ', 'ウ', 'エ', 'オ'], target: 500 },
    { id: 3, name: 'か行平假名', type: 'hiragana', chars: ['か', 'き', 'く', 'け', 'こ'], target: 600 },
    { id: 4, name: 'か行片假名', type: 'katakana', chars: ['カ', 'キ', 'ク', 'ケ', 'コ'], target: 600 },
    { id: 5, name: 'さ行平假名', type: 'hiragana', chars: ['さ', 'し', 'す', 'せ', 'そ'], target: 700 },
    { id: 6, name: 'さ行片假名', type: 'katakana', chars: ['サ', 'シ', 'ス', 'セ', 'ソ'], target: 700 },
    { id: 7, name: 'た行平假名', type: 'hiragana', chars: ['た', 'ち', 'つ', 'て', 'と'], target: 800 },
    { id: 8, name: 'た行片假名', type: 'katakana', chars: ['タ', 'チ', 'ツ', 'テ', 'ト'], target: 800 },
    { id: 9, name: 'な行平假名', type: 'hiragana', chars: ['な', 'に', 'ぬ', 'ね', 'の'], target: 900 },
    { id: 10, name: 'な行片假名', type: 'katakana', chars: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'], target: 900 },
    
    // 挑战关卡
    { id: 11, name: '混合挑战1', type: 'challenge', chars: ['あ', 'い', 'う', 'え', 'お', 'ア', 'イ', 'ウ', 'エ', 'オ'], target: 1000 },
    { id: 12, name: '混合挑战2', type: 'challenge', chars: ['か', 'き', 'く', 'け', 'こ', 'カ', 'キ', 'ク', 'ケ', 'コ'], target: 1200 },
    { id: 13, name: '终极挑战', type: 'challenge', chars: Object.keys({...hiraganaData, ...katakanaData}), target: 2000 }
];

// 游戏状态
let gameState = {
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    currentLevel: 1,
    fallingKanas: [],
    wrongKanas: new Set(),
    gameRunning: false,
    spawnRate: 2000,
    fallSpeed: 2,
    targetScore: 500,
    spawnInterval: null
};

// 关卡数据（存储最高分）
let levelData = JSON.parse(localStorage.getItem('kanaGameLevelData') || '{}');

// 当前关卡的假名池
let currentKanaPool = [];

// DOM元素
const gameContainer = document.getElementById('gameContainer');
const gameArea = document.getElementById('gameArea');
const inputBox = document.getElementById('inputBox');
const scoreElement = document.getElementById('score');
const comboElement = document.getElementById('combo');
const livesElement = document.getElementById('lives');
const comboDisplay = document.getElementById('comboDisplay');
const progressFill = document.getElementById('progressFill');
const currentLevelElement = document.getElementById('currentLevel');

// 初始化关卡数据
function initLevelData() {
    levelConfig.forEach(level => {
        if (!levelData[level.id]) {
            levelData[level.id] = {
                unlocked: level.id === 1,
                completed: false,
                bestScore: 0
            };
        }
    });
    saveLevelData();
}

// 保存关卡数据
function saveLevelData() {
    localStorage.setItem('kanaGameLevelData', JSON.stringify(levelData));
}

// 显示关卡选择
function showLevelSelect() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('levelSelectScreen').style.display = 'flex';
    renderLevelGrid();
}

// 渲染关卡网格
function renderLevelGrid() {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';

    levelConfig.forEach(level => {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        
        const data = levelData[level.id];
        if (data.completed) {
            btn.classList.add('completed');
        } else if (data.unlocked) {
            btn.classList.add('unlocked');
        }

        if (level.type === 'challenge' && data.unlocked) {
            btn.classList.add('challenge');
        }

        btn.innerHTML = `
            <div class="level-title">${level.name}</div>
            <div class="level-score">目标: ${level.target}</div>
            <div class="level-score">最高: ${data.bestScore}</div>
        `;

        if (data.unlocked) {
            btn.onclick = () => startLevel(level.id);
        }

        grid.appendChild(btn);
    });
}

// 开始指定关卡
function startLevel(levelId) {
    const level = levelConfig.find(l => l.id === levelId);
    if (!level || !levelData[levelId].unlocked) return;

    // 清理之前的游戏状态
    if (gameState.spawnInterval) {
        clearInterval(gameState.spawnInterval);
    }
    
    // 清理之前的假名
    gameArea.innerHTML = '';

    gameState.currentLevel = levelId;
    gameState.targetScore = level.target;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.lives = 3;
    gameState.fallingKanas = [];
    gameState.wrongKanas.clear();
    gameState.gameRunning = true;

    // 设置难度
    if (level.type === 'challenge') {
        gameState.spawnRate = 1500;
        gameState.fallSpeed = 3;
    } else {
        gameState.spawnRate = 2000;
        gameState.fallSpeed = 2;
    }

    currentKanaPool = level.chars;
    
    document.getElementById('levelSelectScreen').style.display = 'none';
    currentLevelElement.textContent = levelId;
    updateDisplay();
    
    inputBox.value = '';
    inputBox.focus();
    
    gameLoop();
    
    // 开始生成假名
    gameState.spawnInterval = setInterval(() => {
        if (!gameState.gameRunning) {
            clearInterval(gameState.spawnInterval);
            return;
        }
        createFallingKana();
    }, gameState.spawnRate);
}

// 生成随机假名
function getRandomKana() {
    if (Math.random() < 0.3 && gameState.wrongKanas.size > 0) {
        const wrongKanasArray = Array.from(gameState.wrongKanas);
        const wrongKana = wrongKanasArray[Math.floor(Math.random() * wrongKanasArray.length)];
        if (currentKanaPool.includes(wrongKana)) {
            return wrongKana;
        }
    }
    return currentKanaPool[Math.floor(Math.random() * currentKanaPool.length)];
}

// 创建掉落的假名
function createFallingKana() {
    if (!gameState.gameRunning) return;

    const kana = getRandomKana();
    const isRevenge = gameState.wrongKanas.has(kana);
    
    const kanaElement = document.createElement('div');
    kanaElement.className = 'falling-kana' + (isRevenge ? ' revenge' : '');
    kanaElement.textContent = kana;
    kanaElement.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    kanaElement.style.top = '-60px';
    
    const kanaObj = {
        element: kanaElement,
        kana: kana,
        x: parseFloat(kanaElement.style.left),
        y: -60,
        speed: gameState.fallSpeed * (isRevenge ? 1.5 : 1),
        isRevenge: isRevenge
    };

    gameArea.appendChild(kanaElement);
    gameState.fallingKanas.push(kanaObj);
}

// 更新掉落的假名位置
function updateFallingKanas() {
    const toRemove = [];
    
    gameState.fallingKanas.forEach((kanaObj, index) => {
        kanaObj.y += kanaObj.speed;
        kanaObj.element.style.top = kanaObj.y + 'px';

        if (kanaObj.y > window.innerHeight) {
            kanaObj.element.remove();
            toRemove.push(index);
            loseLife();
            resetCombo();
        }
    });

    // 从后往前删除，避免索引问题
    for (let i = toRemove.length - 1; i >= 0; i--) {
        gameState.fallingKanas.splice(toRemove[i], 1);
    }
}

// 检查输入 - 改进版：支持部分匹配和完全匹配
function checkInput() {
    const input = inputBox.value.toLowerCase().trim();
    if (!input) return;

    const allKanas = {...hiraganaData, ...katakanaData};
    let matched = false;
    let partialMatch = false;

    // 检查完全匹配
    gameState.fallingKanas.forEach((kanaObj, index) => {
        if (kanaObj.element.classList.contains('hit')) return;
        
        const romaji = allKanas[kanaObj.kana];
        
        // 完全匹配
        if (romaji === input) {
            matched = true;
            kanaObj.element.classList.add('hit');
            
            createExplosion(kanaObj.x + 25, kanaObj.y + 25);
            
            const baseScore = kanaObj.isRevenge ? 50 : 20;
            const comboBonus = Math.floor(gameState.combo * 5);
            gameState.score += baseScore + comboBonus;
            gameState.combo++;
            
            if (gameState.combo > gameState.maxCombo) {
                gameState.maxCombo = gameState.combo;
            }

            if (gameState.wrongKanas.has(kanaObj.kana)) {
                gameState.wrongKanas.delete(kanaObj.kana);
            }

            if (gameState.combo % 5 === 0) {
                comboDisplay.classList.add('active');
                setTimeout(() => comboDisplay.classList.remove('active'), 300);
            }

            if (gameState.combo % 20 === 0) {
                gameContainer.classList.add('bullet-time');
                setTimeout(() => gameContainer.classList.remove('bullet-time'), 1000);
            }

            setTimeout(() => {
                const idx = gameState.fallingKanas.indexOf(kanaObj);
                if (idx > -1) {
                    kanaObj.element.remove();
                    gameState.fallingKanas.splice(idx, 1);
                }
            }, 300);

            updateDisplay();
            
            // 检查是否达到目标分数
            if (gameState.score >= gameState.targetScore) {
                completeLevel();
            }
            
            // 清空输入框
            inputBox.value = '';
        }
        // 部分匹配 - 输入是正确罗马音的开头
        else if (romaji.startsWith(input)) {
            partialMatch = true;
            // 给假名添加部分匹配的视觉提示
            kanaObj.element.style.color = '#ffff00';
            kanaObj.element.style.textShadow = '0 0 30px #ffff00';
        }
        // 不匹配 - 恢复原始颜色
        else {
            if (!kanaObj.isRevenge) {
                kanaObj.element.style.color = '#00ffff';
                kanaObj.element.style.textShadow = '0 0 20px #00ffff';
            }
        }
    });

    // 如果完全匹配了，已经清空输入框
    if (matched) {
        return;
    }

    // 如果有部分匹配，保留输入等待完成
    if (partialMatch) {
        return;
    }

    // 没有任何匹配 - 检查是否输入了错误的完整罗马音
    let isCompleteWrongInput = false;
    const possibleKanas = Object.keys(allKanas).filter(k => allKanas[k] === input);
    
    if (possibleKanas.length > 0) {
        // 输入了完整的罗马音，但不是当前掉落的假名
        possibleKanas.forEach(kana => {
            if (currentKanaPool.includes(kana)) {
                gameState.wrongKanas.add(kana);
            }
        });
        isCompleteWrongInput = true;
    } else {
        // 检查输入是否不可能匹配任何假名（不是任何罗马音的前缀）
        const anyPossibleMatch = currentKanaPool.some(kana => {
            const romaji = allKanas[kana];
            return romaji && romaji.startsWith(input);
        });
        
        if (!anyPossibleMatch && input.length >= 2) {
            isCompleteWrongInput = true;
        }
    }

    // 如果是完全错误的输入，清空并惩罚
    if (isCompleteWrongInput) {
        resetCombo();
        shakeScreen();
        inputBox.value = '';
    }
}

// 完成关卡
function completeLevel() {
    gameState.gameRunning = false;
    
    if (gameState.spawnInterval) {
        clearInterval(gameState.spawnInterval);
    }
    
    gameState.fallingKanas.forEach(kanaObj => {
        kanaObj.element.remove();
    });
    gameState.fallingKanas = [];

    // 更新关卡数据
    const currentLevelData = levelData[gameState.currentLevel];
    const isNewRecord = gameState.score > currentLevelData.bestScore;
    
    currentLevelData.completed = true;
    currentLevelData.bestScore = Math.max(currentLevelData.bestScore, gameState.score);

    // 解锁下一关
    if (gameState.currentLevel < levelConfig.length) {
        levelData[gameState.currentLevel + 1] = levelData[gameState.currentLevel + 1] || {};
        levelData[gameState.currentLevel + 1].unlocked = true;
    }

    saveLevelData();

    // 显示完成界面
    document.getElementById('completeScore').textContent = `分数: ${gameState.score}`;
    document.getElementById('completeCombo').textContent = `最高连击: ${gameState.maxCombo}` + (isNewRecord ? ' 🎉新纪录!' : '');
    document.getElementById('levelComplete').style.display = 'block';
}

// 下一关
function nextLevel() {
    document.getElementById('levelComplete').style.display = 'none';
    if (gameState.currentLevel < levelConfig.length) {
        startLevel(gameState.currentLevel + 1);
    } else {
        backToLevelSelect();
    }
}

// 重置连击
function resetCombo() {
    gameState.combo = 0;
    updateDisplay();
}

// 失去生命
function loseLife() {
    gameState.lives--;
    shakeScreen();
    updateDisplay();
    
    if (gameState.lives <= 0) {
        gameOver();
    }
}

// 游戏结束
function gameOver() {
    gameState.gameRunning = false;
    
    if (gameState.spawnInterval) {
        clearInterval(gameState.spawnInterval);
    }
    
    gameState.fallingKanas.forEach(kanaObj => {
        kanaObj.element.remove();
    });
    gameState.fallingKanas = [];

    // 更新最高分（即使没完成关卡）
    const currentLevelData = levelData[gameState.currentLevel];
    const isNewRecord = gameState.score > currentLevelData.bestScore;
    currentLevelData.bestScore = Math.max(currentLevelData.bestScore, gameState.score);
    saveLevelData();
    
    document.getElementById('finalScore').textContent = `分数: ${gameState.score}`;
    document.getElementById('finalCombo').textContent = `最高连击: ${gameState.maxCombo}`;
    document.getElementById('newRecord').textContent = isNewRecord ? '🎉 新纪录！' : '';
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// 屏幕震动
function shakeScreen() {
    gameContainer.classList.add('screen-shake');
    setTimeout(() => gameContainer.classList.remove('screen-shake'), 300);
}

// 创建爆炸效果
function createExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#ffff00';
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 10px #ffff00';
        
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        gameArea.appendChild(particle);
        
        let px = x, py = y;
        const animateParticle = () => {
            px += vx * 0.02;
            py += vy * 0.02;
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = parseFloat(particle.style.opacity || 1) - 0.05;
            
            if (parseFloat(particle.style.opacity) > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animateParticle);
    }
}

// 更新显示
function updateDisplay() {
    scoreElement.textContent = gameState.score;
    comboElement.textContent = gameState.combo;
    
    const hearts = '❤️'.repeat(gameState.lives) + '🖤'.repeat(3 - gameState.lives);
    livesElement.textContent = hearts;

    // 更新进度条
    const progress = Math.min((gameState.score / gameState.targetScore) * 100, 100);
    progressFill.style.width = progress + '%';
}

// 游戏主循环
function gameLoop() {
    if (!gameState.gameRunning) return;
    
    updateFallingKanas();
    requestAnimationFrame(gameLoop);
}

// 重新挑战当前关卡
function restartLevel() {
    document.getElementById('gameOverScreen').style.display = 'none';
    startLevel(gameState.currentLevel);
}

// 返回关卡选择
function backToLevelSelect() {
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('levelComplete').style.display = 'none';
    showLevelSelect();
}

// 返回主菜单
function backToStart() {
    document.getElementById('levelSelectScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
}

// 事件监听
inputBox.addEventListener('input', checkInput);

// 移除了 Enter 键的监听，因为现在使用实时匹配

// 防止输入框失去焦点
document.addEventListener('click', () => {
    if (gameState.gameRunning) {
        inputBox.focus();
    }
});

// 初始化游戏
initLevelData();
