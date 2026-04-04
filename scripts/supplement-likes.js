/**
 * 补充种子数据点赞 - 仅处理点赞数为0的心愿
 * 
 * 运行方式：
 * node scripts/supplement-likes.js
 */

const BASE_URL = 'https://master.mywish-63v.pages.dev';

const LIKE_RANGES = {
  hot: { min: 150, max: 300 },
  warm: { min: 50, max: 100 },
  body: { min: 15, max: 50 },
  tail: { min: 1, max: 15 }
};

const WISH_KEYS = [
  'WTGBj6', 'Zr61K7', 'lzih0r', 'u56byP', '0cu6lD',
  'MWx8H8', 'HnQUNS', '1MG0U4', 'B3Q4dz', 'mk4dSA',
  '3jrx4t', 'B4CTkv', 'YV0c5c', 'fcJUiG', 'zFC0ET',
  '0gqox0', 'ZSdHIa', 'gxtvPx', 'ZxIDnR', 'wSnySs',
  'rAzwVI', '11ZKQ5', 'KI7TSm', 'EmQ2dA', '7oKTrW',
  '1AN6hN', 'Vgi63h', 'p6XKLg', 'OuoUtY',
  'eSBgN5', 'xd12Bx', '9pNudX', 'vqPECM', 'vTZxvJ',
  'tIv0xJ', 'CNdiIs', 'XwUCS6', 'wDMNkJ', '0KQhII',
  '1pglMO', 'ohmqrq', 'VrdwlL', 'o2mbZl', 'UWk98x',
  'ErVObd', 'oSAy6a', 'pNBRUE', 'WPgzcJ', 'HihL6y',
  'ARQcNz', '2w9qlT', 'CQhOgr', 'CZ3s1I', 'zUM8rB',
  'ylHM7U', 'CwNDlC', 'RawCFc', '8YYvCu', 'OMalMV',
  '9a4zF9', '4lPXFO', '4NfEiS', 'OhmBvJ', 'Xx09KT',
  'YACMbl', 'jshta0', 'LQWG9J', 'FE3wLU', 'Ek4CcM',
  'e8X1dv', 'AWe4zL', 'NCOL2e', 'DBnWy0', 's1CuCk',
  'WPSTiD', 'LWAN3n', 'Wwbb2K', 'f9MFR1', 'KjirNA',
  'XzvJra', 'lUfrtz', 'KFebfR', 'RJ8BJZ', 'FMebyd',
  'PHrMyc', 'NS76eu', 'avLuRU', 'pZCeUE', 'aElt0H',
  'zFzqe1', 'zNjWiG', 'yP6xZz', '23nt2F', '7cdElO',
  'TGw7mJ', 'irUOBv', 'YouEfw', '0RqB3C', 'GAARaN'
];

const HOT_INDICES = [0, 23, 4, 12, 30];
const WARM_INDICES = [1, 2, 5, 6, 7, 22, 25, 36, 40, 45];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addLikes(key, count) {
  const batchSize = 10;
  for (let i = 0; i < count; i += batchSize) {
    const batch = Math.min(batchSize, count - i);
    const promises = [];
    for (let j = 0; j < batch; j++) {
      promises.push(
        fetch(`${BASE_URL}/api/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wishKey: key })
        })
      );
    }
    await Promise.all(promises);
    await sleep(30);
  }
}

async function getWishLikes(key) {
  try {
    const res = await fetch(`${BASE_URL}/api/wish/${key}`);
    const json = await res.json();
    return json.data?.realtime_likes || json.data?.likes || 0;
  } catch {
    return 0;
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              补充种子数据点赞 - 批量并发版                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`📍 目标环境: ${BASE_URL}`);
  console.log(`📝 心愿总数: ${WISH_KEYS.length} 条`);
  console.log('\n');

  let processed = 0;
  let skipped = 0;

  console.log('🔥 处理头部心愿 (Top 5)...');
  for (const idx of HOT_INDICES) {
    const key = WISH_KEYS[idx];
    if (!key) continue;

    const currentLikes = await getWishLikes(key);
    if (currentLikes > 0) {
      console.log(`  ⏭️ [${idx}] ${key}: 已有 ${currentLikes} 点赞，跳过`);
      skipped++;
      continue;
    }

    const likes = randomInt(LIKE_RANGES.hot.min, LIKE_RANGES.hot.max);
    console.log(`  ⭐ [${idx}] ${key}: 添加 ${likes} 点赞...`);
    await addLikes(key, likes);
    processed++;
  }

  console.log('\n✨ 处理肩部心愿 (Top 6-15)...');
  for (const idx of WARM_INDICES) {
    const key = WISH_KEYS[idx];
    if (!key || HOT_INDICES.includes(idx)) continue;

    const currentLikes = await getWishLikes(key);
    if (currentLikes > 0) {
      console.log(`  ⏭️ [${idx}] ${key}: 已有 ${currentLikes} 点赞，跳过`);
      skipped++;
      continue;
    }

    const likes = randomInt(LIKE_RANGES.warm.min, LIKE_RANGES.warm.max);
    console.log(`  ✨ [${idx}] ${key}: 添加 ${likes} 点赞...`);
    await addLikes(key, likes);
    processed++;
  }

  console.log('\n📝 处理躯干心愿 (index 0-44, 非头部/肩部)...');
  for (let idx = 0; idx < 45; idx++) {
    const key = WISH_KEYS[idx];
    if (!key || HOT_INDICES.includes(idx) || WARM_INDICES.includes(idx)) continue;

    const currentLikes = await getWishLikes(key);
    if (currentLikes > 0) {
      skipped++;
      continue;
    }

    const likes = randomInt(LIKE_RANGES.body.min, LIKE_RANGES.body.max);
    process.stdout.write(`\r  📄 [${idx}] ${key}: ${likes} 点赞 | 已处理 ${processed + 1} 条...`);
    await addLikes(key, likes);
    processed++;
  }

  console.log('\n\n🍃 处理尾部心愿 (index 45+)...');
  for (let idx = 45; idx < WISH_KEYS.length; idx++) {
    const key = WISH_KEYS[idx];
    if (!key) continue;

    const currentLikes = await getWishLikes(key);
    if (currentLikes > 0) {
      skipped++;
      continue;
    }

    const likes = randomInt(LIKE_RANGES.tail.min, LIKE_RANGES.tail.max);
    process.stdout.write(`\r  🌿 [${idx}] ${key}: ${likes} 点赞 | 已处理 ${processed + 1} 条...`);
    await addLikes(key, likes);
    processed++;
  }

  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ 补充完成                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n  处理: ${processed} 条 | 跳过: ${skipped} 条\n`);
}

main().catch(console.error);