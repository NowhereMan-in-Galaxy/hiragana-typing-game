// 输入判定（纯函数，无 DOM 依赖，便于测试）
//
// 输入 input 与屏幕上的一组假名 kanas（{ kana, romaji: [...] } 列表）比对：
//   { type: 'hit', index }   完整命中 kanas[index]
//   { type: 'partial' }      还是某个假名的前缀，继续等待输入
//   { type: 'miss' }         不可能命中任何一个假名
//
// 特殊处理：'n' 既是「ん」的完整写法，又是 na/ni/... 的前缀。
// 只有当屏幕上没有其他以 n 开头的更长写法可能时，才把 'n' 直接判为「ん」；
// 否则等待下一个字母（打 'nn' 一定是「ん」）。
//
// order 越靠前越优先（调用方按「最靠近底部」排序），相同罗马音的多个假名只命中一个。

function matchInput(input, kanas) {
    if (!input) return { type: 'partial' };

    let partial = false;
    let hitIndex = -1;
    let hitIsAmbiguous = false;

    kanas.forEach((k, index) => {
        k.romaji.forEach(r => {
            if (r === input) {
                if (hitIndex === -1) hitIndex = index;
                // 'n' 命中，但存在更长的候选（如 na）
                if (r === 'n') {
                    const longer = kanas.some(o => o.romaji.some(x => x.length > 1 && x.startsWith('n') && x !== 'nn'));
                    if (longer) hitIsAmbiguous = true;
                }
            } else if (r.startsWith(input)) {
                partial = true;
            }
        });
    });

    if (hitIndex !== -1 && !hitIsAmbiguous) return { type: 'hit', index: hitIndex };
    if (partial || hitIsAmbiguous) return { type: 'partial' };
    return { type: 'miss' };
}

if (typeof module !== 'undefined') module.exports = { matchInput };
