// 假名数据：每个平假名对应若干可接受的罗马音写法（第一个为标准写法）
// 片假名由平假名自动转换，罗马音相同

function toKatakana(str) {
    return Array.from(str).map(ch => {
        const c = ch.charCodeAt(0);
        return c >= 0x3041 && c <= 0x3096 ? String.fromCharCode(c + 0x60) : ch;
    }).join('');
}

// 行分组：id 用于存档，name 用于显示
const KANA_GROUPS = [
    { id: 'a', name: 'あ行', kana: { 'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'] } },
    { id: 'k', name: 'か行', kana: { 'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'] } },
    { id: 's', name: 'さ行', kana: { 'さ': ['sa'], 'し': ['shi', 'si'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'] } },
    { id: 't', name: 'た行', kana: { 'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'] } },
    { id: 'n', name: 'な行', kana: { 'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'] } },
    { id: 'h', name: 'は行', kana: { 'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'] } },
    { id: 'm', name: 'ま行', kana: { 'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'] } },
    { id: 'y', name: 'や行', kana: { 'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'] } },
    { id: 'r', name: 'ら行', kana: { 'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'] } },
    { id: 'w', name: 'わ行', kana: { 'わ': ['wa'], 'を': ['wo'], 'ん': ['n', 'nn'] } },
    { id: 'g', name: 'が行', kana: { 'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'] } },
    { id: 'z', name: 'ざ行', kana: { 'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'] } },
    { id: 'd', name: 'だ行', kana: { 'だ': ['da'], 'ぢ': ['di'], 'づ': ['du'], 'で': ['de'], 'ど': ['do'] } },
    { id: 'b', name: 'ば行', kana: { 'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'] } },
    { id: 'p', name: 'ぱ行', kana: { 'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'] } },
    {
        id: 'y1', name: '拗音①', kana: {
            'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],
            'しゃ': ['sha', 'sya'], 'しゅ': ['shu', 'syu'], 'しょ': ['sho', 'syo'],
            'ちゃ': ['cha', 'tya'], 'ちゅ': ['chu', 'tyu'], 'ちょ': ['cho', 'tyo'],
            'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo']
        }
    },
    {
        id: 'y2', name: '拗音②', kana: {
            'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],
            'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],
            'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo']
        }
    },
    {
        id: 'y3', name: '拗音③', kana: {
            'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],
            'じゃ': ['ja', 'zya', 'jya'], 'じゅ': ['ju', 'zyu', 'jyu'], 'じょ': ['jo', 'zyo', 'jyo'],
            'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],
            'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo']
        }
    }
];

// 展开成 { 假名: [罗马音...] } 的总表（平假名 + 片假名）
const KANA_ROMAJI = {};
KANA_GROUPS.forEach(g => {
    g.hira = Object.keys(g.kana);
    g.kata = g.hira.map(toKatakana);
    g.hira.forEach(k => {
        KANA_ROMAJI[k] = g.kana[k];
        KANA_ROMAJI[toKatakana(k)] = g.kana[k];
    });
});

// 关卡：每个分组出一关平假名、一关片假名，并在若干节点插入混合挑战
const CHALLENGE_AFTER = {
    n: '混合挑战 あ〜な行',
    w: '混合挑战 基本五十音',
    p: '混合挑战 浊音·半浊音',
    y3: '终极挑战'
};

function buildLevels() {
    const levels = [];
    const seen = [];
    KANA_GROUPS.forEach((g, i) => {
        const target = 500 + Math.min(i, 12) * 100;
        levels.push({ id: g.id + '-hira', name: g.name + '平假名', type: 'hiragana', chars: g.hira, target });
        levels.push({ id: g.id + '-kata', name: g.name + '片假名', type: 'katakana', chars: g.kata, target });
        seen.push(g);
        if (CHALLENGE_AFTER[g.id]) {
            const chars = [];
            seen.forEach(s => chars.push(...s.hira, ...s.kata));
            levels.push({
                id: 'challenge-' + g.id, name: CHALLENGE_AFTER[g.id], type: 'challenge',
                chars, target: 1000 + levels.length * 40
            });
        }
    });
    return levels;
}

const levelConfig = buildLevels();
