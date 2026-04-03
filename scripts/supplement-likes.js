/**
 * 补充种子数据点赞 - 仅处理 likes == 0 的心愿
 * 
 * 运行方式：
 * node scripts/supplement-likes.js
 */

const BASE_URL = 'https://master.mywish-63v.pages.dev';

// 幂律分布参数
const LIKE_RANGES = {
  shoulder: { min: 50, max: 100 },  // 肩部 (index 5-14)
  body: { min: 15, max: 50 },       // 躯干 (index 15-44)
  tail: { min: 1, max: 15 }         // 尾部 (index 45+)
};

const REC_RANGES = {
  shoulder: { min: 25, max: 60 },
  body: { min: 8, max: 25 },
  tail: { min: 0, max: 10 }
};

// 已知的心愿 key 映射（从 seed-wishes.js 的 WISHES 数组）
const WISH_KEYS = [
  'jBrTFX', 'yl8iKO', 'NMg2ks', 'bhript', 'ryN2oE',  // 0-4 (头部已完成)
  'NsJFfV', 'd1Tn8G', 'vvYdb0', 'zn003o', 'I9af9b',  // 5-9 (肩部)
  'tc7BZr', 'zq7xHg', 'S1QkpM', 'LiAS5e', 'YWewdl',  // 10-14 (肩部)
  'u6yta9', 'EFGJ4X', 'f7xcHQ', 'cd9dvz', 'r9ta6W',  // 15-19 (躯干)
  '3LOnkj', 'zGuBH2', 'O25e1Q', 'StCrRh', 'SZqgrZ',  // 20-24 (躯干 - StCrRh 头部已完成)
  'coX3cK', 'katWy4', 'sQ62MM', 'rLelPG', 'wHC1aQ',  // 25-29 (躯干)
  'zYb13y', 'np7XBh', 'zuozqG', 'TlqSyR', 'cjlicu',  // 30-34 (躯干)
  'bwjbNw', 'spiTKo', 'E95uzP', '5bUBU5', 'belksG',  // 35-39 (躯干)
  '7EA5eN', 'JvDsSl', 'srLQ4T', 'Bm7Jyd', 'iFShv4',  // 40-44 (躯干)
  '64Iu3j', 'ckYWAp', 'sw3EiY', 'f15sht', 'AsC1gZ',  // 45-49 (尾部)
  '434Vok', '0bc7D3', 'XAPSzz', 'SGM9HP', 'gFnoGh',  // 50-54 (尾部)
  'qDxwKw', 'zH6OYq', '9RyrJf', 'q1iDQg', 'Ncr4cp',  // 55-59 (尾部)
  'GkZjou', 'Wokouv', 'JtiuL9', 'Sh3JGZ', 'EspExt',  // 60-64 (尾部)
  'lfAMTJ', 'ZzgBth', 'PpXmAe', 'gaMsS1', 'diY8h2',  // 65-69 (尾部)
  'PI1IzD', 'YqofmN', 'x26LQP', 'kOeGgF', 'WluUM0',  // 70-74 (尾部)
  'aG0APe', 'GPcG3h', 'LcCb6P', '2wqr73', 'C5bRlU',  // 75-79 (尾部)
  '9gK0eR', 'qzU4Yu', 'RBsDoI', 'BxaAsD', '2OG4Ai',  // 80-84 (尾部)
  'e8LngQ', 'pbzrhx', 'PhCCM2', 'i17CBB', 'yOorAq',  // 85-89 (尾部)
  'GHZzt8', 'l1X32a', 'hovDsS', 'IqUtCv', 'wRFKfK',  // 90-94 (尾部)
  'aEelWb', 'ku3I3t', 'BmQB8f', 'INJ9AD', 'u6JIhX'   // 95-99 (尾部)
];

const HEAD_INDICES = [0, 23];  // 已完成的头部心愿
const WARM_INDICES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];  // 肩部

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
    await sleep(50);
  }
}

async function addRecommends(key, count) {
  const batchSize = 10;
  for (let i = 0; i < count; i += batchSize) {
    const batch = Math.min(batchSize, count - i);
    const promises = [];
    for (let j = 0; j < batch; j++) {
      promises.push(
        fetch(`${BASE_URL}/api/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wishKey: key })
        })
      );
    }
    await Promise.all(promises);
    await sleep(50);
  }
}

async function getWishLikes(key) {
  try {
    const res = await fetch(`${BASE_URL}/api/wish/${key}`);
    const json = await res.json();
    return json.data?.realtime_likes || 0;
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

  let processed = 0;
  let skipped = 0;

  // 处理肩部心愿 (index 5-14)
  console.log('✨ 处理肩部心愿 (index 5-14)...');
  for (const idx of WARM_INDICES) {
    const key = WISH_KEYS[idx];
    if (!key) continue;

    const currentLikes = await getWishLikes(key);
    if (currentLikes > 0) {
      console.log(`  ⏭️ [${idx}] ${key}: 已有 ${currentLikes} 点赞，跳过`);
      skipped++;
      continue;
    }

    const likes = randomInt(LIKE_RANGES.shoulder.min, LIKE_RANGES.shoulder.max);
    const recs = randomInt(REC_RANGES.shoulder.min, REC_RANGES.shoulder.max);

    console.log(`  ⭐ [${idx}] ${key}: 添加 ${likes} 点赞, ${recs} 推荐...`);
    await Promise.all([addLikes(key, likes), addRecommends(key, recs)]);
    processed++;
  }

  // 处理躯干心愿 (index 15-44)
  console.log('\n📝 处理躯干心愿 (index 15-44)...');
  for (let idx = 15; idx < 45; idx++) {
    const key = WISH_KEYS[idx];
    if (!key || HEAD_INDICES.includes(idx)) continue;

    const currentLikes = await getWishLikes(key);
    if (currentLikes > 0) {
      skipped++;
      continue;
    }

    const likes = randomInt(LIKE_RANGES.body.min, LIKE_RANGES.body.max);
    const recs = randomInt(REC_RANGES.body.min, REC_RANGES.body.max);

    process.stdout.write(`\r  📄 [${idx}] ${key}: 添加 ${likes} 点赞...`);
    await Promise.all([addLikes(key, likes), addRecommends(key, recs)]);
    processed++;
  }

  // 处理尾部心愿 (index 45-99)
  console.log('\n\n🍃 处理尾部心愿 (index 45-99)...');
  for (let idx = 45; idx < 100; idx++) {
    const key = WISH_KEYS[idx];
    if (!key) continue;

    const currentLikes = await getWishLikes(key);
    if (currentLikes > 0) {
      skipped++;
      continue;
    }

    const likes = randomInt(LIKE_RANGES.tail.min, LIKE_RANGES.tail.max);
    const recs = randomInt(REC_RANGES.tail.min, REC_RANGES.tail.max);

    process.stdout.write(`\r  🌿 [${idx}] ${key}: 添加 ${likes} 点赞...`);
    await addLikes(key, likes);
    if (recs > 0) {
      await addRecommends(key, recs);
    }
    processed++;
  }

  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ 补充完成                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n  处理: ${processed} 条 | 跳过: ${skipped} 条\n`);
}

main().catch(console.error);