// 游戏状态
let gameState = {
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    currentLevel: null,
    currentLevelIndex: 0,
    fallingKanas: [],
    wrongKanas: new Set(),
    gameRunning: false,
    spawnRate: 2000,   // 基础生成间隔（毫秒）
    fallSpeed: 120,    // 基础下落速度（像素/秒），与帧率无关
    paused: false,
    spawnTimer: 0,
    loopId: null,
    targetScore: 500
};

// 关卡数据（存储最高分）
let levelData = JSON.parse(localStorage.getItem('kanaGameLevelData_v2') || '{}');

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
                unlocked: level.id === levelConfig[0].id,
                completed: false,
                bestScore: 0
            };
        }
    });
    saveLevelData();
}

// 保存关卡数据
function saveLevelData() {
    localStorage.setItem('kanaGameLevelData_v2', JSON.stringify(levelData));
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
    stopLoop();

    // 清理之前的假名
    gameArea.innerHTML = '';

    gameState.currentLevel = levelId;
    gameState.currentLevelIndex = levelConfig.indexOf(level);
    gameState.targetScore = level.target;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.lives = 3;
    gameState.fallingKanas = [];
    gameState.wrongKanas.clear();
    gameState.gameRunning = true;
    setPaused(false);

    // 设置难度
    if (level.type === 'challenge') {
        gameState.spawnRate = 1500;
        gameState.fallSpeed = 180;
    } else {
        gameState.spawnRate = 2000;
        gameState.fallSpeed = 120;
    }

    gameState.spawnTimer = gameState.spawnRate; // 开局立即出第一个
    currentKanaPool = level.chars;
    
    document.getElementById('levelSelectScreen').style.display = 'none';
    currentLevelElement.textContent = gameState.currentLevelIndex + 1;
    updateDisplay();
    
    inputBox.value = '';
    inputBox.focus();
    
    startLoop();
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
    kanaElement.style.left = Math.random() * Math.max(0, gameArea.clientWidth - 100) + 'px';
    kanaElement.style.top = '-60px';
    
    const kanaObj = {
        element: kanaElement,
        kana: kana,
        x: parseFloat(kanaElement.style.left),
        y: -60,
        speed: gameState.fallSpeed * (isRevenge ? 1.5 : 1),  // 像素/秒（未含难度倍率）
        isRevenge: isRevenge
    };

    gameArea.appendChild(kanaElement);
    gameState.fallingKanas.push(kanaObj);
}

// 更新掉落的假名位置
function updateFallingKanas(dt) {
    const toRemove = [];
    const ramp = difficultyRamp();

    gameState.fallingKanas.forEach((kanaObj, index) => {
        kanaObj.y += kanaObj.speed * ramp * dt;
        kanaObj.element.style.top = kanaObj.y + 'px';

        if (kanaObj.y > gameArea.clientHeight) {
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

// 命中一个掉落的假名
function hitKana(kanaObj) {
    kanaObj.element.classList.add('hit');
    createExplosion(kanaObj.x + 25, kanaObj.y + 25);

    const baseScore = kanaObj.isRevenge ? 50 : 20;
    const comboBonus = Math.floor(gameState.combo * 5);
    gameState.score += baseScore + comboBonus;
    gameState.combo++;

    if (gameState.combo > gameState.maxCombo) {
        gameState.maxCombo = gameState.combo;
    }

    gameState.wrongKanas.delete(kanaObj.kana);

    if (gameState.combo % 5 === 0) {
        comboDisplay.classList.add('active');
        setTimeout(() => comboDisplay.classList.remove('active'), 300);
    }

    if (gameState.combo % 20 === 0) {
        gameContainer.classList.add('bullet-time');
        setTimeout(() => gameContainer.classList.remove('bullet-time'), 1000);
    }

    // 立即移出判定列表，动画结束后再移除 DOM
    const idx = gameState.fallingKanas.indexOf(kanaObj);
    if (idx > -1) gameState.fallingKanas.splice(idx, 1);
    setTimeout(() => kanaObj.element.remove(), 300);

    updateDisplay();

    if (gameState.score >= gameState.targetScore) {
        completeLevel();
    }
}

// 检查输入：与屏幕上的假名逐个比对（最靠近底部的优先）
function checkInput() {
    const input = inputBox.value.toLowerCase().trim();
    if (!input) return;

    const candidates = gameState.fallingKanas
        .slice()
        .sort((a, b) => b.y - a.y)
        .map(k => ({ obj: k, kana: k.kana, romaji: KANA_ROMAJI[k.kana] }));

    const result = matchInput(input, candidates);

    // 部分匹配的假名高亮，其余恢复
    candidates.forEach(c => {
        const partial = c.romaji.some(r => r.startsWith(input));
        const el = c.obj.element;
        if (partial) {
            el.style.color = '#ffff00';
            el.style.textShadow = '0 0 30px #ffff00';
        } else {
            el.style.color = '';
            el.style.textShadow = '';
        }
    });

    if (result.type === 'hit') {
        inputBox.value = '';
        hitKana(candidates[result.index].obj);
    } else if (result.type === 'miss') {
        inputBox.value = '';
        resetCombo();
        shakeScreen();
    }
}

// 完成关卡
function completeLevel() {
    gameState.gameRunning = false;
    setPaused(false);
    
    stopLoop();
    
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
    const next = levelConfig[gameState.currentLevelIndex + 1];
    if (next) {
        levelData[next.id] = levelData[next.id] || {};
        levelData[next.id].unlocked = true;
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
    const next = levelConfig[gameState.currentLevelIndex + 1];
    if (next) {
        startLevel(next.id);
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
    setPaused(false);
    
    stopLoop();
    
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

// 难度随进度递增：接近目标分数时，下落更快、生成更密（最高约 1.6 倍）
function difficultyRamp() {
    return 1 + 0.6 * Math.min(1, gameState.score / gameState.targetScore);
}

// 游戏主循环：用真实时间差驱动，不受屏幕刷新率影响
function startLoop() {
    let last = null;
    const frame = (now) => {
        if (!gameState.gameRunning) return;
        // 暂停期间不推进时间；恢复后重新计时，避免一帧内跳很远
        if (gameState.paused || last === null) {
            last = now;
        } else {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            gameState.spawnTimer += dt * 1000 * difficultyRamp();
            if (gameState.spawnTimer >= gameState.spawnRate) {
                gameState.spawnTimer = 0;
                createFallingKana();
            }
            updateFallingKanas(dt);
        }
        gameState.loopId = requestAnimationFrame(frame);
    };
    gameState.loopId = requestAnimationFrame(frame);
}

function stopLoop() {
    if (gameState.loopId) cancelAnimationFrame(gameState.loopId);
    gameState.loopId = null;
}

// 暂停 / 继续
function setPaused(paused) {
    gameState.paused = paused;
    document.getElementById('pauseScreen').style.display = paused ? 'flex' : 'none';
    if (!paused && gameState.gameRunning) inputBox.focus();
}

function togglePause() {
    if (gameState.gameRunning) setPaused(!gameState.paused);
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
inputBox.addEventListener('input', () => {
    if (!gameState.paused) checkInput();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') togglePause();
});

// 切到别的标签页 / 窗口时自动暂停
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState.gameRunning) setPaused(true);
});
window.addEventListener('blur', () => {
    if (gameState.gameRunning) setPaused(true);
});

// 移除了 Enter 键的监听，因为现在使用实时匹配

// 防止输入框失去焦点
document.addEventListener('click', () => {
    if (gameState.gameRunning && !gameState.paused) {
        inputBox.focus();
    }
});

// 初始化游戏
initLevelData();

document.getElementById('resumeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    setPaused(false);
});
document.getElementById('quitBtn').addEventListener('click', () => {
    gameState.gameRunning = false;
    stopLoop();
    gameArea.innerHTML = '';
    gameState.fallingKanas = [];
    setPaused(false);
    showLevelSelect();
});
