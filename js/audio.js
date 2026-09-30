// 音效：Web Audio 实时合成，无需音频文件。
// 五声音阶（C 大调五声）保证任何顺序敲出来都不会难听；
// 命中音随连击沿音阶「上行再回落」，连击本身就是一段旋律。

const Sound = (() => {
    // C4 D4 E4 G4 A4 C5 D5 E5 G5 A5 —— 频率 Hz
    const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];
    let ctx = null;
    let muted = false;
    try { muted = localStorage.getItem('kanaGameMuted') === '1'; } catch (e) { /* 存储不可用则忽略 */ }

    // 音阶位置：0..9 上行，再 8..1 下行，循环（周期 18）
    function degree(n) {
        const p = n % 18;
        return p < 10 ? p : 18 - p;
    }

    // 必须在用户手势（点击/按键）中调用，否则浏览器不允许出声
    function init() {
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            ctx = new AC();
        }
        if (ctx.state === 'suspended') ctx.resume();
    }

    // 播放一个音：type 波形、freq 频率、dur 时长、vol 音量、delay 延迟（秒）、slideTo 滑音终点
    function tone(type, freq, dur, vol, delay = 0, slideTo = null) {
        if (!ctx || muted) return;
        const t = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    }

    return {
        init,
        get muted() { return muted; },
        setMuted(m) {
            muted = m;
            try { localStorage.setItem('kanaGameMuted', m ? '1' : '0'); } catch (e) { /* 忽略 */ }
        },
        // 敲对一个字母（还没消灭）：轻柔的拨弦，音高预示接下来的命中音
        pluck(combo) {
            tone('triangle', SCALE[degree(combo)], 0.14, 0.05);
        },
        // 命中：明亮的主音 + 高八度泛音；每 5 连击叠一个五度
        hit(combo) {
            const f = SCALE[degree(combo)];
            tone('triangle', f, 0.32, 0.12);
            tone('sine', f * 2, 0.22, 0.05);
            if (combo > 0 && combo % 5 === 0) tone('triangle', f * 1.5, 0.4, 0.08, 0.05);
        },
        // 打错：低沉的下滑
        miss() {
            tone('sawtooth', 150, 0.18, 0.06, 0, 70);
        },
        // 漏掉假名、失去生命：两声下行
        lose() {
            tone('square', 330, 0.16, 0.05);
            tone('square', 247, 0.28, 0.05, 0.14);
        },
        // 通关：上行琶音
        win() {
            [0, 2, 4, 5, 7].forEach((d, i) => tone('triangle', SCALE[d], 0.3, 0.1, i * 0.09));
            tone('sine', SCALE[9], 0.6, 0.08, 0.45);
        },
        // 游戏结束：缓慢下行
        over() {
            [4, 3, 1, 0].forEach((d, i) => tone('sine', SCALE[d] / 2, 0.4, 0.1, i * 0.18));
        }
    };
})();
