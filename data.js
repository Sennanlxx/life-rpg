// ============================================================
// 人生RPG - 数据模型 & 预设
// ============================================================

const DEFAULT_DATA = {
  player: {
    name: '勇者',
    level: 1,
    totalExp: 0,
    joinedAt: new Date().toISOString()
  },
  domains: {
    health: {
      id: 'health',
      name: '健康',
      icon: '❤️',
      color: '#ef4444',
      order: 1,
      exp: 0,
      level: 1,
      description: '身体是革命的本钱',
      tasks: [
        { id: 'h1', name: '规律睡眠', desc: '23:00前入睡，保证7小时睡眠', diff: 2, minutes: 5, xp: 15, recurrence: 'daily', streak: 0, category: '生活习惯' },
        { id: 'h2', name: '个人护理', desc: '完成早晚护肤/口腔护理流程', diff: 2, minutes: 10, xp: 15, recurrence: 'daily', streak: 0, category: '生活习惯' },
        { id: 'h3', name: '每日健康总结', desc: '记录当日身体状况和感受', diff: 1, minutes: 5, xp: 20, recurrence: 'daily', streak: 0, category: '生活习惯' },
        { id: 'h4', name: '戒烟进度', desc: '记录当日吸烟情况，逐步减量', diff: 4, minutes: 3, xp: 30, recurrence: 'daily', streak: 0, category: '克服坏习惯' },
        { id: 'h5', name: '戒冰冷食品', desc: '不摄入冰水、冰淇淋等冷食', diff: 3, minutes: 2, xp: 25, recurrence: 'daily', streak: 0, category: '克服坏习惯' },
        { id: 'h6', name: '戒酒记录', desc: '记录当日饮酒情况', diff: 3, minutes: 2, xp: 25, recurrence: 'daily', streak: 0, category: '克服坏习惯' },
        { id: 'h7', name: '个人护理知识学习', desc: '阅读护理/养生文章或视频15分钟', diff: 2, minutes: 15, xp: 20, recurrence: 'daily', streak: 0, category: '理论学习' },
        { id: 'h8', name: '饮食健康学习', desc: '学习营养学知识15分钟', diff: 2, minutes: 15, xp: 20, recurrence: 'weekly', streak: 0, category: '理论学习' },
        { id: 'h9', name: '体态矫正训练', desc: '完成15分钟体态矫正小训练', diff: 3, minutes: 15, xp: 25, recurrence: 'daily', streak: 0, category: '修复体态' },
        { id: 'h10', name: '体态理论学习', desc: '学习体态矫正相关知识', diff: 2, minutes: 10, xp: 15, recurrence: 'weekly', streak: 0, category: '修复体态' },
        { id: 'h11', name: '健康实践记录', desc: '记录本周健康实践的收获和反馈', diff: 2, minutes: 10, xp: 20, recurrence: 'weekly', streak: 0, category: '实践' },
        { id: 'h12', name: '健康计划调整', desc: '回顾并调整下周健康计划', diff: 3, minutes: 15, xp: 25, recurrence: 'weekly', streak: 0, category: '改良调整' }
      ],
      longGoals: [
        { id: 'hg1', name: '达到理想体态', desc: '坚持3个月体态矫正，拍照对比', progress: 0, total: 100, xpReward: 200 },
        { id: 'hg2', name: '完全戒烟', desc: '逐步减量至0', progress: 0, total: 100, xpReward: 500 }
      ],
      titles: { 0: '初识健康', 100: '养生新手', 300: '自律学徒', 600: '体态修复者', 1000: '健康达人', 2000: '养生大师', 5000: '不死之身' }
    },

    law: {
      id: 'law',
      name: '法学',
      icon: '⚖️',
      color: '#3b82f6',
      order: 2,
      exp: 0,
      level: 1,
      description: '法理昭昭，正义之道',
      tasks: [
        { id: 'l1', name: '法条背诵', desc: '背诵今日法条或法律概念', diff: 3, minutes: 15, xp: 25, recurrence: 'daily', streak: 0, category: '基础积累' },
        { id: 'l2', name: '案例分析', desc: '阅读并分析一个法律案例', diff: 4, minutes: 25, xp: 30, recurrence: 'daily', streak: 0, category: '实战训练' },
        { id: 'l3', name: '法学期刊阅读', desc: '阅读最新法学期刊或论文', diff: 4, minutes: 20, xp: 25, recurrence: 'weekly', streak: 0, category: '知识更新' },
        { id: 'l4', name: '法律写作练习', desc: '撰写一段法律意见书或辩护词', diff: 5, minutes: 30, xp: 40, recurrence: 'weekly', streak: 0, category: '技能训练' },
        { id: 'l5', name: '模拟法庭', desc: '参与或观看模拟法庭', diff: 5, minutes: 60, xp: 80, recurrence: 'monthly', streak: 0, category: '实战训练' }
      ],
      longGoals: [
        { id: 'lg1', name: '通过法律资格考试', desc: '系统备考', progress: 0, total: 1000, xpReward: 2000 }
      ],
      titles: { 0: '法学入门', 200: '见习法师', 500: '法律学徒', 1000: '初级律师', 2000: '资深大状', 5000: '法理之光' }
    },

    medicine: {
      id: 'medicine',
      name: '医学',
      icon: '🩺',
      color: '#06b6d4',
      order: 3,
      exp: 0,
      level: 1,
      description: '悬壶济世，仁心仁术',
      tasks: [
        { id: 'm1', name: '医学知识学习', desc: '学习医学教材或课程30分钟', diff: 4, minutes: 30, xp: 30, recurrence: 'daily', streak: 0, category: '理论学习' },
        { id: 'm2', name: '解剖学复习', desc: '复习解剖学知识15分钟', diff: 4, minutes: 15, xp: 25, recurrence: 'daily', streak: 0, category: '基础巩固' },
        { id: 'm3', name: '临床病例学习', desc: '研读一个临床病例', diff: 5, minutes: 20, xp: 30, recurrence: 'weekly', streak: 0, category: '临床思维' },
        { id: 'm4', name: '医学英语', desc: '学习医学术语和英语表达', diff: 3, minutes: 10, xp: 20, recurrence: 'daily', streak: 0, category: '工具技能' },
        { id: 'm5', name: '前沿研究追踪', desc: '阅读一篇最新医学研究论文', diff: 5, minutes: 30, xp: 35, recurrence: 'weekly', streak: 0, category: '知识更新' }
      ],
      longGoals: [
        { id: 'mg1', name: '完成医学核心课程', desc: '系统学完基础医学课程', progress: 0, total: 500, xpReward: 1000 }
      ],
      titles: { 0: '医学新生', 200: '见习医者', 500: '实习医师', 1000: '主治医师', 2000: '主任医师', 5000: '医学圣手' }
    },

    sports: {
      id: 'sports',
      name: '运动',
      icon: '🏃',
      color: '#22c55e',
      order: 4,
      exp: 0,
      level: 1,
      description: '生命在于运动',
      tasks: [
        { id: 's1', name: '晨间运动', desc: '完成30分钟晨间训练', diff: 3, minutes: 30, xp: 30, recurrence: 'daily', streak: 0, category: '日常训练' },
        { id: 's2', name: '营养三餐记录', desc: '记录三餐内容和营养摄入', diff: 2, minutes: 5, xp: 15, recurrence: 'daily', streak: 0, category: '营养管理' },
        { id: 's3', name: '水分摄入', desc: '喝够8杯水', diff: 1, minutes: 2, xp: 10, recurrence: 'daily', streak: 0, category: '基础习惯' },
        { id: 's4', name: '力量训练', desc: '完成力量训练45分钟', diff: 4, minutes: 45, xp: 40, recurrence: 'weekly', streak: 0, category: '专项训练' },
        { id: 's5', name: '有氧运动', desc: '跑步/游泳/骑行30分钟', diff: 3, minutes: 30, xp: 30, recurrence: 'weekly', streak: 0, category: '专项训练' },
        { id: 's6', name: '柔韧拉伸', desc: '完成15分钟全身拉伸', diff: 2, minutes: 15, xp: 15, recurrence: 'daily', streak: 0, category: '恢复训练' }
      ],
      longGoals: [
        { id: 'sg1', name: '达成目标体重', desc: '减脂/增肌到目标体重', progress: 0, total: 100, xpReward: 500 },
        { id: 'sg2', name: '完成半程马拉松', desc: '训练并完成一次半马', progress: 0, total: 100, xpReward: 800 }
      ],
      titles: { 0: '运动新手', 150: '晨跑者', 400: '健身达人', 800: '铁人预备', 1500: '运动健将', 3000: '体能之王' }
    },

    business: {
      id: 'business',
      name: '商学',
      icon: '💼',
      color: '#f59e0b',
      order: 5,
      exp: 0,
      level: 1,
      description: '经世济民，商业智慧',
      tasks: [
        { id: 'b1', name: '商业新闻阅读', desc: '阅读今日商业财经新闻', diff: 2, minutes: 10, xp: 15, recurrence: 'daily', streak: 0, category: '信息获取' },
        { id: 'b2', name: '经济学学习', desc: '学习经济学概念或模型30分钟', diff: 4, minutes: 30, xp: 30, recurrence: 'daily', streak: 0, category: '理论学习' },
        { id: 'b3', name: '案例分析', desc: '分析一个商业案例', diff: 4, minutes: 25, xp: 30, recurrence: 'weekly', streak: 0, category: '实战分析' },
        { id: 'b4', name: '财务报表学习', desc: '阅读并分析一份财报', diff: 5, minutes: 30, xp: 40, recurrence: 'weekly', streak: 0, category: '技能训练' },
        { id: 'b5', name: '商业书籍阅读', desc: '阅读商业书籍30分钟', diff: 3, minutes: 30, xp: 25, recurrence: 'daily', streak: 0, category: '知识积累' }
      ],
      longGoals: [
        { id: 'bg1', name: '制定个人商业计划', desc: '完成一份完整的商业计划书', progress: 0, total: 100, xpReward: 500 }
      ],
      titles: { 0: '商学入门', 200: '见习商人', 500: 'MBA学员', 1000: '商业分析师', 2000: '企业家', 5000: '商业巨擘' }
    },

    spiritual: {
      id: 'spiritual',
      name: '课外精神追求',
      icon: '🎨',
      color: '#a855f7',
      order: 6,
      exp: 0,
      level: 1,
      description: '灵魂的滋养，精神的富足',
      tasks: [
        { id: 'sp1', name: '阅读时光', desc: '阅读非专业书籍30分钟', diff: 2, minutes: 30, xp: 20, recurrence: 'daily', streak: 0, category: '阅读' },
        { id: 'sp2', name: '音乐练习', desc: '练习乐器30分钟', diff: 4, minutes: 30, xp: 35, recurrence: 'daily', streak: 0, category: '音乐' },
        { id: 'sp3', name: '冥想正念', desc: '完成10分钟冥想', diff: 2, minutes: 10, xp: 15, recurrence: 'daily', streak: 0, category: '心灵' },
        { id: 'sp4', name: '创意写作', desc: '自由写作15分钟', diff: 3, minutes: 15, xp: 20, recurrence: 'weekly', streak: 0, category: '创作' },
        { id: 'sp5', name: '艺术欣赏', desc: '欣赏一部电影/展览/音乐会', diff: 2, minutes: 90, xp: 50, recurrence: 'monthly', streak: 0, category: '审美' },
        { id: 'sp6', name: '哲学思考', desc: '阅读哲学或深度思考类内容', diff: 4, minutes: 20, xp: 25, recurrence: 'weekly', streak: 0, category: '思辨' }
      ],
      longGoals: [
        { id: 'spg1', name: '学会一首完整曲目', desc: '掌握一首新曲子并能完整演奏', progress: 0, total: 100, xpReward: 300 },
        { id: 'spg2', name: '完成12本书阅读', desc: '一年内读完12本非专业书籍', progress: 0, total: 12, xpReward: 400 }
      ],
      titles: { 0: '精神旅人', 150: '文艺青年', 400: '琴棋书画', 800: '文艺复兴者', 1500: '心灵大师', 3000: '精神之光' }
    },

    responsibility: {
      id: 'responsibility',
      name: '责任',
      icon: '🛡️',
      color: '#64748b',
      order: 7,
      exp: 0,
      level: 1,
      description: '肩扛责任，浩然正气',
      tasks: [
        { id: 'r1', name: '家庭关怀', desc: '与家人沟通或做一件家务', diff: 2, minutes: 15, xp: 20, recurrence: 'daily', streak: 0, category: '家庭' },
        { id: 'r2', name: '财务管理', desc: '记账并回顾当日收支', diff: 2, minutes: 5, xp: 15, recurrence: 'daily', streak: 0, category: '理财' },
        { id: 'r3', name: '储蓄计划', desc: '按计划存入今日储蓄金额', diff: 2, minutes: 3, xp: 15, recurrence: 'daily', streak: 0, category: '理财' },
        { id: 'r4', name: '周度回顾', desc: '回顾本周责任履行情况', diff: 3, minutes: 15, xp: 25, recurrence: 'weekly', streak: 0, category: '总结' },
        { id: 'r5', name: '规划未来', desc: '思考和调整中长期规划', diff: 3, minutes: 20, xp: 20, recurrence: 'weekly', streak: 0, category: '规划' }
      ],
      longGoals: [
        { id: 'rg1', name: '建立紧急备用金', desc: '攒够6个月生活费', progress: 0, total: 100, xpReward: 600 }
      ],
      titles: { 0: '见习担当', 150: '靠谱伙伴', 400: '家中脊梁', 800: '责任担当', 1500: '顶梁柱', 3000: '天塌不惊' }
    },

    virtue: {
      id: 'virtue',
      name: '品德',
      icon: '🌟',
      color: '#ec4899',
      order: 8,
      exp: 0,
      level: 1,
      description: '修身立德，止于至善',
      tasks: [
        { id: 'v1', name: '善行记录', desc: '记录今天做的一件好事', diff: 2, minutes: 5, xp: 15, recurrence: 'daily', streak: 0, category: '善行' },
        { id: 'v2', name: '感恩日记', desc: '写下今天感恩的三件事', diff: 1, minutes: 5, xp: 15, recurrence: 'daily', streak: 0, category: '感恩' },
        { id: 'v3', name: '耐心练习', desc: '在冲动时练习深呼吸和冷静', diff: 4, minutes: 5, xp: 25, recurrence: 'daily', streak: 0, category: '修身' },
        { id: 'v4', name: '诚实自省', desc: '自我反思今日言行是否一致', diff: 3, minutes: 10, xp: 20, recurrence: 'daily', streak: 0, category: '自省' },
        { id: 'v5', name: '志愿服务', desc: '参与一次志愿服务', diff: 3, minutes: 60, xp: 50, recurrence: 'monthly', streak: 0, category: '利他' }
      ],
      longGoals: [
        { id: 'vg1', name: '完成100件善行', desc: '累计完成100件记录在案的善意之举', progress: 0, total: 100, xpReward: 300 }
      ],
      titles: { 0: '向善之心', 150: '善行者', 400: '仁者爱人', 800: '德行兼备', 1500: '温润如玉', 3000: '圣人之德' }
    },

    tools: {
      id: 'tools',
      name: '工具',
      icon: '🔧',
      color: '#f97316',
      order: 9,
      exp: 0,
      level: 1,
      description: '善假于物，效率倍增',
      tasks: [
        { id: 't1', name: 'AI工具学习', desc: '学习或使用一个新AI工具功能', diff: 3, minutes: 15, xp: 25, recurrence: 'daily', streak: 0, category: 'AI工具' },
        { id: 't2', name: '效率工具探索', desc: '尝试一个效率类软件或技巧', diff: 3, minutes: 15, xp: 20, recurrence: 'weekly', streak: 0, category: '效率' },
        { id: 't3', name: '编程学习', desc: '学习编程知识30分钟', diff: 4, minutes: 30, xp: 30, recurrence: 'daily', streak: 0, category: '编程' },
        { id: 't4', name: '快捷键练习', desc: '学习和练习新的快捷键', diff: 2, minutes: 5, xp: 15, recurrence: 'daily', streak: 0, category: '效率' },
        { id: 't5', name: '工具复盘', desc: '回顾本周使用的工具并优化工作流', diff: 3, minutes: 15, xp: 20, recurrence: 'weekly', streak: 0, category: '优化' }
      ],
      longGoals: [
        { id: 'tg1', name: '搭建个人效率系统', desc: '完成个人工作流的搭建和优化', progress: 0, total: 100, xpReward: 400 }
      ],
      titles: { 0: '工具学徒', 150: '数字工匠', 400: '效率猎手', 800: '工具大师', 1500: '自动化之王', 3000: '万物皆可编程' }
    },

    diplomacy: {
      id: 'diplomacy',
      name: '外交',
      icon: '🤝',
      color: '#14b8a6',
      order: 10,
      exp: 0,
      level: 1,
      description: '合纵连横，四海之内',
      tasks: [
        { id: 'd1', name: '主动联系', desc: '主动联系一位朋友或同事', diff: 2, minutes: 10, xp: 20, recurrence: 'daily', streak: 0, category: '关系维护' },
        { id: 'd2', name: '倾听练习', desc: '与一人深度交流，专注倾听', diff: 3, minutes: 20, xp: 25, recurrence: 'daily', streak: 0, category: '沟通' },
        { id: 'd3', name: '社交活动', desc: '参与一次社交活动或聚会', diff: 3, minutes: 60, xp: 40, recurrence: 'weekly', streak: 0, category: '社交' },
        { id: 'd4', name: '人脉整理', desc: '整理和更新联系人信息', diff: 2, minutes: 15, xp: 15, recurrence: 'monthly', streak: 0, category: '管理' },
        { id: 'd5', name: '帮助他人', desc: '为他人提供实质性帮助', diff: 3, minutes: 20, xp: 30, recurrence: 'weekly', streak: 0, category: '利他' }
      ],
      longGoals: [
        { id: 'dg1', name: '建立深度关系', desc: '与5个人建立深度友谊或合作关系', progress: 0, total: 5, xpReward: 300 }
      ],
      titles: { 0: '社交新手', 150: '友善邻居', 400: '社交达人', 800: '人脉节点', 1500: '合纵连横', 3000: '四海之内皆兄弟' }
    }
  },
  rewards: [
    { id: 'rw1', name: '🎹 解锁音乐任务线', desc: '购买钢琴或乐器 → 解锁课外精神追求中的音乐进阶任务', domainId: 'spiritual', xpRequired: 500, unlocked: false },
    { id: 'rw2', name: '📚 解锁深度学习', desc: '购买专业书籍套装 → 解锁法学/医学进阶学习任务', domainId: 'law', xpRequired: 400, unlocked: false },
    { id: 'rw3', name: '🏋️ 解锁专业健身', desc: '购买健身器材/健身房会员 → 解锁运动进阶训练', domainId: 'sports', xpRequired: 300, unlocked: false },
    { id: 'rw4', name: '✈️ 解锁旅行任务', desc: '规划一次旅行 → 解锁外交领域的旅行社交任务', domainId: 'diplomacy', xpRequired: 600, unlocked: false }
  ],
  taskLog: [],
  titleLog: []
};

// 经验值等级公式：每级需要 level^2 * 10 经验
function expForLevel(level) {
  return level * level * 10;
}

function totalExpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += expForLevel(i);
  }
  return total;
}

function getLevelFromExp(totalExp) {
  let level = 1;
  let acc = 0;
  while (true) {
    acc += expForLevel(level);
    if (totalExp < acc) return level;
    level++;
  }
}

function getDomainLevel(exp) {
  return getLevelFromExp(exp);
}

// 获取当前称号
function getCurrentTitle(domain) {
  const thresholds = Object.keys(domain.titles).map(Number).sort((a, b) => a - b);
  let title = domain.titles[0];
  for (const t of thresholds) {
    if (domain.exp >= t) title = domain.titles[t];
  }
  return title;
}

// 获取下一称号
function getNextTitle(domain) {
  const thresholds = Object.keys(domain.titles).map(Number).sort((a, b) => a - b);
  for (const t of thresholds) {
    if (domain.exp < t) return { exp: t, title: domain.titles[t] };
  }
  return null;
}
