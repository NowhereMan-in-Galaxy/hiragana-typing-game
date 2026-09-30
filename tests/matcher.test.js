// 运行：node tests/matcher.test.js
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { matchInput } = require('../js/matcher.js');

// data.js 是浏览器脚本，用 vm 加载
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/../js/data.js', 'utf8') + ';this.KANA_ROMAJI=KANA_ROMAJI;this.levelConfig=levelConfig;this.KANA_GROUPS=KANA_GROUPS;', ctx);
const { KANA_ROMAJI, levelConfig, KANA_GROUPS } = ctx;

const on = (...ks) => ks.map(k => ({ kana: k, romaji: KANA_ROMAJI[k] }));

// 多种写法
assert.deepStrictEqual(matchInput('shi', on('し')), { type: 'hit', index: 0 });
assert.deepStrictEqual(matchInput('si', on('し')), { type: 'hit', index: 0 });
assert.deepStrictEqual(matchInput('tu', on('つ')), { type: 'hit', index: 0 });
assert.deepStrictEqual(matchInput('hu', on('ふ')), { type: 'hit', index: 0 });
assert.strictEqual(matchInput('sh', on('し')).type, 'partial');
assert.strictEqual(matchInput('x', on('し')).type, 'miss');
assert.strictEqual(matchInput('ka', on('し')).type, 'miss');

// 片假名共用罗马音；优先命中列表靠前（最靠近底部）的
assert.deepStrictEqual(matchInput('a', on('ア', 'あ')), { type: 'hit', index: 0 });

// ん 与 な 行的冲突
assert.strictEqual(matchInput('n', on('ん', 'な')).type, 'partial');
assert.deepStrictEqual(matchInput('na', on('ん', 'な')), { type: 'hit', index: 1 });
assert.deepStrictEqual(matchInput('nn', on('ん', 'な')), { type: 'hit', index: 0 });
assert.deepStrictEqual(matchInput('n', on('ん', 'か')), { type: 'hit', index: 0 });
assert.deepStrictEqual(matchInput('n', on('ん')), { type: 'hit', index: 0 });
assert.strictEqual(matchInput('n', on('に')).type, 'partial');

// 拗音
assert.deepStrictEqual(matchInput('kya', on('きゃ')), { type: 'hit', index: 0 });
assert.deepStrictEqual(matchInput('ja', on('じゃ')), { type: 'hit', index: 0 });
assert.strictEqual(matchInput('ky', on('きゃ')).type, 'partial');

// 数据完整性
assert.strictEqual(Object.keys(KANA_ROMAJI).length, 2 * KANA_GROUPS.reduce((n, g) => n + g.hira.length, 0));
assert.ok(!('ゐ' in KANA_ROMAJI) && !('ゑ' in KANA_ROMAJI));
const ids = levelConfig.map(l => l.id);
assert.strictEqual(new Set(ids).size, ids.length, '关卡 id 必须唯一');
levelConfig.forEach(l => l.chars.forEach(c => assert.ok(KANA_ROMAJI[c], c + ' 缺少罗马音')));

console.log('OK: %d 个假名, %d 个关卡', Object.keys(KANA_ROMAJI).length, levelConfig.length);
