/**
 * 「打开心扉」版心愿种子数据生成器
 * 
 * 设计理念：不是祝福语录，是真实心声
 * - 脆弱感：敢于暴露不安、焦虑、恐惧
 * - 具体场景：有时间、地点、人物、细节
 * - 秘密愿望：不敢对身边人说的心事
 * - 普通人视角：不是大词，是小事
 * 
 * 运行方式：
 * - node scripts/seed-wishes.js                 # 默认生产环境
 * - node scripts/seed-wishes.js http://localhost:8787  # 本地开发环境
 * - node scripts/seed-wishes.js --help          # 显示用法
 */

// ============================================================================
// 100 条「打开心扉」心愿
// ============================================================================

const WISHES = [
  // --- 深夜心事（15条）---
  // 凌晨三点醒来的那些念头
  "希望能睡个好觉，最近总是凌晨三点醒来，盯着天花板到天亮",
  "想给三年前的自己打个电话，告诉他别做那个决定",
  "希望妈妈不要每次打电话都问我什么时候结婚",
  "有时候觉得挺累的，但又不知道跟谁说",
  "希望前任过得好，但又不想他忘了我，我是不是很自私",
  "凌晨醒来，第一个想到的还是你，都两年了",
  "希望30岁的我，不会讨厌现在的自己",
  "有时候在想，如果当初选了另一条路会怎样",
  "希望有一天能不再假装快乐，而是真的快乐",
  "最近经常梦到外婆，醒来枕头都是湿的",
  "希望今年，能学会和自己和解",
  "有时候觉得孤独，但好像已经习惯了",
  "希望有人能看穿我的\"我没事\"",
  "凌晨4点，突然很想念一个已经不联系的朋友",
  "希望明天醒来，一切都会好起来",
  
  // --- 家人之间（15条）---
  // 那些想说但没说出口的话
  "下个月回家，想和爸爸好好聊一次天，但我不知道怎么开口",
  "希望妈妈不要再省了，你值得好的东西",
  "爸，我其实一直没告诉你，当初选专业是我自己决定的",
  "希望奶奶的腿能好起来，我还想带她去看海",
  "妈妈，对不起，上次的电话我态度不好",
  "希望外公外婆能看到我结婚，但我真的还没准备好",
  "弟弟要高考了，希望他能考上，但我帮不了他什么",
  "爸妈，我其实过得不太好，但我不想让你们担心",
  "希望有一天能让爸妈不再为钱发愁",
  "奶奶，我好想你做的红烧肉",
  "妈，我也许不会结婚，希望你能理解",
  "爸，别抽烟了，我真的担心你的肺",
  "希望有一天，能带爸妈去看看他们年轻时候想去的地方",
  "外婆，你走的时候我没能回来，这是我最大的遗憾",
  "希望家人平安，比什么都重要",
  
  // --- 爱情那些事（15条）---
  // 爱而不得、得而复失、失而难忘
  "希望能遇到一个，愿意听我说废话的人",
  "我们分手三年了，我还是会看你的朋友圈",
  "希望他能懂我的小情绪，而不是觉得我作",
  "异地恋第847天，希望下次见面不要再隔着屏幕",
  "单身28年，有时候怀疑是不是自己有问题",
  "希望前任过得好，但不要太好，这很小心眼对吧",
  "谈了五年还是分了，希望下一个是对的人",
  "我好像不会爱了，希望有人能教会我",
  "暗恋了三年，希望毕业前能勇敢一次",
  "希望他/她能回头看我一眼，就一眼",
  "我们好像越来越远了，希望是我多想了",
  "希望下次心动，不要再来得这么晚",
  "被拒绝了，希望时间能快点过去",
  "希望有一天，对的人出现，不再错过",
  "分手的时候，我们都没有好好说再见",
  
  // --- 工作与梦想（15条）---
  // 现实的无奈与坚持
  "希望能找到一份真正喜欢的工作，而不只是为了生存",
  "加班到凌晨，希望这一切都是值得的",
  "创业第三年，还是很难，希望今年能好一点",
  "希望能升职加薪，给家人更好的生活",
  "每天挤地铁两小时，希望有一天能有自己的小窝",
  "35岁了，希望不会被裁员",
  "希望能实现财务自由，不再为房租发愁",
  "辞职了，希望这是对的选择",
  "梦想是开一家咖啡店，希望有一天能实现",
  "希望我的努力，能被看到",
  "工作三年，感觉没什么成长，希望找到方向",
  "希望能存够首付，哪怕小一点也行",
  "自由职业一年了，收入不稳定，希望今年能好起来",
  "希望不再为别人的评价而活",
  "每个月还房贷，压力好大，希望一切值得",
  
  // --- 学业与未来（10条）---
  // 年轻的焦虑与期待
  "希望考研上岸，这一年我没白努力",
  "高考倒计时60天，希望能考上",
  "毕业了，不知道未来在哪里，希望找到方向",
  "论文写不出来，希望能顺利毕业",
  "希望能找到自己真正热爱的东西",
  "22岁，对未来很迷茫，希望时间能给我答案",
  "希望雅思能过，就能去见他了",
  "每天学到凌晨，希望这一切都有意义",
  "希望能成为爸妈骄傲的样子",
  "不想考公，但不知道还能做什么",
  
  // --- 身体与心理（10条）---
  // 看不见的战场
  "希望失眠能好起来，真的太累了",
  "抑郁症两年了，希望有一天能好起来",
  "希望能好好吃饭，好好睡觉，好好爱自己",
  "焦虑症，希望能学会和它共处",
  "希望体检报告上不要再有红色箭头了",
  "减肥第五次了，希望这次能成功",
  "希望能戒掉熬夜，虽然我知道很难",
  "希望父母的高血压能稳定下来",
  "有时候觉得撑不下去了，希望能找到勇气",
  "希望心理健康，和身体健康一样被重视",
  
  // --- 小小的愿望（10条）---
  // 看起来很小，但很重要
  "希望能养一只猫，取名叫土豆",
  "希望看完今年列的书单，不要又打脸",
  "希望学会游泳，不再怕水",
  "希望能早起看一次日出",
  "希望今年能去一次海边",
  "希望学会做饭，不再只会泡面",
  "希望养活一盆多肉，不要又养死了",
  "希望能看完那部电影，一个人也可以",
  "希望买一台相机，记录生活的美好",
  "希望学会独处，享受一个人的时光",
  
  // --- 社会与远方（10条）---
  // 我们都是更大世界的一部分
  "希望世界和平，不再有战争，孩子们都能好好长大",
  "希望流浪的小动物都能找到一个温暖的家",
  "希望有一天能去一次冰岛，看看极光",
  "希望贫困地区的孩子也能有学上",
  "希望蓝天白云能成为常态",
  "希望每个老人都能安享晚年",
  "希望善良的人都能被温柔以待",
  "希望所有的分别都有重逢",
  "希望有一天能看遍这世界的美",
  "愿星辰大海，守护每一个努力活着的人",
];

// ============================================================================
// 幂律分布配置
// ============================================================================

// 头部心愿（Top 5）- 最击中人心的那句
const HOT_INDICES = [0, 23, 4, 12, 30];

// 肩部心愿（Top 6-15）- 有具体场景，能共鸣
const WARM_INDICES = [1, 2, 5, 6, 7, 22, 25, 36, 40, 45];

// 点赞范围配置
const LIKE_RANGES = {
  hot: { min: 150, max: 300 },    // 头部：150-300
  warm: { min: 50, max: 100 },    // 肩部：50-100
  body: { min: 15, max: 50 },     // 躯干：15-50
  tail: { min: 1, max: 15 },      // 尾部：1-15
};

// 推荐范围配置
const REC_RANGES = {
  hot: { min: 80, max: 150 },     // 头部：80-150
  warm: { min: 25, max: 60 },     // 肩部：25-60
  body: { min: 8, max: 25 },      // 躯干：8-25
  tail: { min: 0, max: 10 },      // 尾部：0-10
};

// ============================================================================
// 时间分布配置
// ============================================================================

/**
 * 时间分布设计
 * - 今天（5条）：最当下的心声
 * - 这一周（15条）：近期的事
 * - 这一个月（25条）：一直惦记的
 * - 1-3月（30条）：持续的愿望
 * - 更早（25条）：时间沉淀
 */
function getTimeOffset(index) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  
  // 深夜心愿 → 凌晨发布（更有氛围感）
  // 工作心愿 → 工作日发布
  // 情感心愿 → 晚间发布
  
  if (index < 5) {
    // 今天：随机时间戳（0-24小时内）
    // 深夜心愿倾向凌晨发布
    const hourOffset = index < 3 ? 
      Math.floor(Math.random() * 6) + 0 :  // 0-6点（凌晨）
      Math.floor(Math.random() * 18) + 6;   // 6-24点
    return -(hourOffset * 60 * 60 * 1000);
  } else if (index < 20) {
    // 这一周：1-7天前
    return -(Math.floor(Math.random() * 7) + 1) * DAY;
  } else if (index < 45) {
    // 这一个月：8-30天前
    return -(Math.floor(Math.random() * 23) + 8) * DAY;
  } else if (index < 75) {
    // 1-3月：31-90天前
    return -(Math.floor(Math.random() * 60) + 31) * DAY;
  } else {
    // 更早：91-180天前
    return -(Math.floor(Math.random() * 90) + 91) * DAY;
  }
}

// ============================================================================
// 工具函数
// ============================================================================

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// API 调用函数
// ============================================================================

async function createWish(baseUrl, text, timeOffset) {
  try {
    const res = await fetch(`${baseUrl}/api/wish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text,
        createdAt: Date.now() + timeOffset  // 应用时间偏移
      })
    });
    const json = await res.json();
    
    if (json.success) {
      return json.data;
    }
    console.error(`❌ 创建失败: ${text.substring(0, 30)}... - ${json.error || '未知错误'}`);
    return null;
  } catch (e) {
    console.error(`❌ 创建失败: ${text.substring(0, 30)}... - ${e.message}`);
    return null;
  }
}

async function addLikes(baseUrl, key, count) {
  try {
    for (let i = 0; i < count; i++) {
      await fetch(`${baseUrl}/api/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishKey: key })
      });
      // 批量操作时添加短暂延迟，避免请求过快
      if (i % 20 === 0 && count > 20) {
        await sleep(50);
      }
    }
    return true;
  } catch (e) {
    console.error(`❌ 点赞失败: ${key}`);
    return false;
  }
}

async function addRecommends(baseUrl, key, count) {
  try {
    for (let i = 0; i < count; i++) {
      await fetch(`${baseUrl}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishKey: key })
      });
      if (i % 20 === 0 && count > 20) {
        await sleep(50);
      }
    }
    return true;
  } catch (e) {
    console.error(`❌ 推荐失败: ${key}`);
    return false;
  }
}

// ============================================================================
// 主流程
// ============================================================================

async function main(baseUrl) {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       「打开心扉」版心愿种子数据生成器                      ║');
  console.log('║       Design Philosophy: Real Voices, Not Quotes           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  console.log(`📍 目标环境: ${baseUrl}`);
  console.log(`📝 心愿总数: ${WISHES.length} 条`);
  console.log(`📊 幂律分布:`);
  console.log(`   - 头部（${HOT_INDICES.length}条）：点赞 ${LIKE_RANGES.hot.min}-${LIKE_RANGES.hot.max}，推荐 ${REC_RANGES.hot.min}-${REC_RANGES.hot.max}`);
  console.log(`   - 肩部（${WARM_INDICES.length}条）：点赞 ${LIKE_RANGES.warm.min}-${LIKE_RANGES.warm.max}，推荐 ${REC_RANGES.warm.min}-${REC_RANGES.warm.max}`);
  console.log(`   - 躯干（30条）：点赞 ${LIKE_RANGES.body.min}-${LIKE_RANGES.body.max}，推荐 ${REC_RANGES.body.min}-${REC_RANGES.body.max}`);
  console.log(`   - 尾部（55条）：点赞 ${LIKE_RANGES.tail.min}-${LIKE_RANGES.tail.max}，推荐 ${REC_RANGES.tail.min}-${REC_RANGES.tail.max}`);
  console.log('\n');
  
  // Step 1: 创建所有心愿
  console.log('🚀 Step 1: 创建心愿...');
  console.log('─────────────────────────────────────────');
  
  const createdWishes = [];
  
  for (let i = 0; i < WISHES.length; i++) {
    const text = WISHES[i];
    const timeOffset = getTimeOffset(i);
    
    const wish = await createWish(baseUrl, text, timeOffset);
    if (wish) {
      createdWishes.push({ index: i, wish });
      process.stdout.write(`\r✅ [${i + 1}/${WISHES.length}] ${wish.key} - ${text.substring(0, 20)}...`);
    }
    
    // 创建间隔，模拟真实发布节奏
    if (i > 0 && i % 10 === 0) {
      await sleep(100);
    }
  }
  
  console.log(`\n\n✨ 创建完成: ${createdWishes.length}/${WISHES.length} 条心愿\n`);
  
  if (createdWishes.length === 0) {
    console.log('❌ 没有成功创建任何心愿，请检查 API 是否可用');
    return;
  }
  
  // Step 2: 添加点赞和推荐
  console.log('📊 Step 2: 添加点赞和推荐（幂律分布）...');
  console.log('─────────────────────────────────────────');
  
  // 处理头部心愿
  console.log('\n🔥 头部心愿（高互动）:');
  for (const idx of HOT_INDICES) {
    const entry = createdWishes.find(e => e.index === idx);
    if (!entry) continue;
    
    const likes = randomInt(LIKE_RANGES.hot.min, LIKE_RANGES.hot.max);
    const recs = randomInt(REC_RANGES.hot.min, REC_RANGES.hot.max);
    
    process.stdout.write(`\r   ⭐ [${idx + 1}] ${entry.wish.key}: ❤️${likes} 🌟${recs}...`);
    
    await addLikes(baseUrl, entry.wish.key, likes);
    await addRecommends(baseUrl, entry.wish.key, recs);
    await sleep(100);
  }
  
  // 处理肩部心愿
  console.log('\n\n Shoulder 心愿（中互动）:');
  for (const idx of WARM_INDICES) {
    const entry = createdWishes.find(e => e.index === idx);
    if (!entry) continue;
    
    const likes = randomInt(LIKE_RANGES.warm.min, LIKE_RANGES.warm.max);
    const recs = randomInt(REC_RANGES.warm.min, REC_RANGES.warm.max);
    
    process.stdout.write(`\r   ✨ [${idx + 1}] ${entry.wish.key}: ❤️${likes} 🌟${recs}...`);
    
    await addLikes(baseUrl, entry.wish.key, likes);
    await addRecommends(baseUrl, entry.wish.key, recs);
    await sleep(80);
  }
  
  // 处理躯干心愿
  console.log('\n\n📝 躯干心愿（正常互动）:');
  const bodyIndices = createdWishes
    .filter(e => !HOT_INDICES.includes(e.index) && !WARM_INDICES.includes(e.index) && e.index < 45)
    .map(e => e.index);
  
  for (const idx of bodyIndices) {
    const entry = createdWishes.find(e => e.index === idx);
    if (!entry) continue;
    
    const likes = randomInt(LIKE_RANGES.body.min, LIKE_RANGES.body.max);
    const recs = randomInt(REC_RANGES.body.min, REC_RANGES.body.max);
    
    await addLikes(baseUrl, entry.wish.key, likes);
    await addRecommends(baseUrl, entry.wish.key, recs);
    
    if (idx % 5 === 0) {
      process.stdout.write(`\r   📄 已处理 ${bodyIndices.indexOf(idx) + 1}/${bodyIndices.length} 条...`);
    }
  }
  
  // 处理尾部心愿
  console.log('\n\n🍃 尾部心愿（低互动）:');
  const tailIndices = createdWishes
    .filter(e => e.index >= 45)
    .map(e => e.index);
  
  for (const idx of tailIndices) {
    const entry = createdWishes.find(e => e.index === idx);
    if (!entry) continue;
    
    const likes = randomInt(LIKE_RANGES.tail.min, LIKE_RANGES.tail.max);
    const recs = randomInt(REC_RANGES.tail.min, REC_RANGES.tail.max);
    
    await addLikes(baseUrl, entry.wish.key, likes);
    if (recs > 0) {
      await addRecommends(baseUrl, entry.wish.key, recs);
    }
    
    if (idx % 10 === 0) {
      process.stdout.write(`\r   🌿 已处理 ${tailIndices.indexOf(idx) + 1}/${tailIndices.length} 条...`);
    }
  }
  
  // 完成报告
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    🎉 生成完成                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`✅ 心愿总数: ${createdWishes.length} 条`);
  console.log(`✅ 点赞分布: 幂律分布（头部 ${HOT_INDICES.length} 条高互动）`);
  console.log(`✅ 时间分布: 模拟真实发布节奏`);
  console.log(`✅ 内容风格: 「打开心扉」版 - 脆弱感 + 具体场景 + 秘密愿望`);
  console.log('\n');
  console.log('💡 提示: 用户读完后应该有这些感受:');
  console.log('   - "原来不止我一个人这样想"');
  console.log('   - "这说的就是我心里的声音"');
  console.log('   - "我也想写一个"');
  console.log('\n');
}

// ============================================================================
// 命令行入口
// ============================================================================

function showHelp() {
  console.log('\n');
  console.log('「打开心扉」版心愿种子数据生成器');
  console.log('\n');
  console.log('用法:');
  console.log('  node scripts/seed-wishes.js [环境地址]');
  console.log('\n');
  console.log('参数:');
  console.log('  环境地址    API 基础 URL（可选）');
  console.log('              默认: https://master.mywish-63v.pages.dev');
  console.log('              本地: http://localhost:8787');
  console.log('\n');
  console.log('示例:');
  console.log('  node scripts/seed-wishes.js                          # 生产环境');
  console.log('  node scripts/seed-wishes.js http://localhost:8787    # 本地开发');
  console.log('  node scripts/seed-wishes.js --help                   # 显示帮助');
  console.log('\n');
  console.log('设计理念:');
  console.log('  不是祝福语录，是真实心声');
  console.log('  - 脆弱感: 敢于暴露不安、焦虑、恐惧');
  console.log('  - 具体场景: 有时间、地点、人物、细节');
  console.log('  - 秘密愿望: 不敢对身边人说的心事');
  console.log('  - 普通人视角: 不是大词，是小事');
  console.log('\n');
}

// 解析命令行参数
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const baseUrl = args[0] || 'https://master.mywish-63v.pages.dev';

main(baseUrl).catch(error => {
  console.error('\n❌ 执行失败:', error.message);
  process.exit(1);
});