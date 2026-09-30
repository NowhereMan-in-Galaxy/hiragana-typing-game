// 视觉特效：子弹
// 每敲一个正确字母发射一发子弹，从输入框飞向目标假名（追踪目标当前位置）。

const BULLET_MS = 110;

// 目标假名元素的中心点（相对 gameArea）
function kanaCenter(kanaObj) {
    return {
        x: kanaObj.x + kanaObj.element.offsetWidth / 2,
        y: kanaObj.y + kanaObj.element.offsetHeight / 2
    };
}

// target 为假名对象；为 null 时子弹笔直向上飞并淡出（表示打空）
function fireBullet(area, originEl, target, onArrive) {
    const areaRect = area.getBoundingClientRect();
    const o = originEl.getBoundingClientRect();
    const sx = o.left + o.width / 2 - areaRect.left;
    const sy = o.top - areaRect.top;

    const bullet = document.createElement('div');
    bullet.className = 'bullet' + (target ? '' : ' bullet-miss');
    area.appendChild(bullet);

    const start = performance.now();
    let last = target ? kanaCenter(target) : { x: sx + (Math.random() - 0.5) * 120, y: sy - 220 };

    const step = (now) => {
        const t = Math.min((now - start) / BULLET_MS, 1);
        // 目标被消灭后停在最后位置
        if (target && target.element.isConnected) last = kanaCenter(target);
        const x = sx + (last.x - sx) * t;
        const y = sy + (last.y - sy) * t;
        const angle = Math.atan2(last.y - sy, last.x - sx) * 180 / Math.PI + 90;
        bullet.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
        if (!target) bullet.style.opacity = 1 - t;

        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            bullet.remove();
            if (onArrive) onArrive();
        }
    };
    requestAnimationFrame(step);
}

// 被子弹击中但还没死：短暂闪一下（用 Web Animations，不覆盖复仇假名自带的 CSS 动画）
function flashKana(kanaObj) {
    kanaObj.element.animate(
        [{ filter: 'brightness(2.2)', scale: 1.35 }, { filter: 'brightness(1)', scale: 1 }],
        { duration: 150, easing: 'ease-out' }
    );
}
