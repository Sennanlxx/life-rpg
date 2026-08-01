// ============================================================
// 人生RPG - 核心应用逻辑
// ============================================================

const STORAGE_KEY = 'life-rpg-data';
let appData = null;
let currentTab = 'dashboard';
let currentDomainId = null;
let radarChart = null;

// ============================================================
// 数据管理
// ============================================================

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      appData = JSON.parse(raw);
      // 确保数据结构完整
      if (!appData.rewards) appData.rewards = DEFAULT_DATA.rewards;
      if (!appData.titleLog) appData.titleLog = [];
    } else {
      appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
      saveData();
    }
  } catch (e) {
    console.error('数据加载失败，使用默认数据', e);
    appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  if (typeof cloudSave === 'function') {
    clearTimeout(window._syncTimer);
    window._syncTimer = setTimeout(() => cloudSave(), 500);
  }
}

function resetData() {
  appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveData();
}

function exportData() {
  const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `life-rpg-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ 数据已导出', 'success');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.player || !data.domains) throw new Error('数据格式错误');
      appData = data;
      saveData();
      refreshAll();
      showToast('✅ 数据已导入并恢复', 'success');
    } catch (err) {
      showToast('❌ 文件格式不正确', '');
    }
  };
  reader.readAsText(file);
}

// ============================================================
// 计算
// ============================================================

function getTotalExp() {
  let total = 0;
  for (const key in appData.domains) {
    total += appData.domains[key].exp;
  }
  return total;
}

function getPlayerLevel() {
  return getLevelFromExp(getTotalExp());
}

function getTasksDueToday() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const dayOfMonth = today.getDate();

  const tasks = [];
  for (const domainKey in appData.domains) {
    const domain = appData.domains[domainKey];
    for (const task of domain.tasks) {
      let isDue = false;
      switch (task.recurrence) {
        case 'daily': isDue = true; break;
        case 'weekly': isDue = (dayOfWeek === 1); break; // 周一
        case 'monthly': isDue = (dayOfMonth === 1); break;
      }
      if (isDue) {
        tasks.push({ ...task, domainId: domainKey, domainName: domain.name, domainIcon: domain.icon, domainColor: domain.color });
      }
    }
  }
  return tasks;
}

function isTaskCompletedToday(task, domainId) {
  const today = new Date().toISOString().slice(0, 10);
  return appData.taskLog.some(log =>
    log.taskId === task.id && log.domainId === domainId && log.date === today
  );
}

function getTodayCompletedCount() {
  const today = new Date().toISOString().slice(0, 10);
  return appData.taskLog.filter(log => log.date === today).length;
}

function getCompletedTitles() {
  return appData.titleLog || [];
}

// ============================================================
// Toast 通知
// ============================================================

function showToast(msg, type = '') {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// XP 飘字动画
function showXpGain(xp, x, y) {
  const el = document.createElement('div');
  el.className = 'xp-gain';
  el.textContent = `+${xp} EXP`;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

// ============================================================
// 完成任务
// ============================================================

function completeTask(task, domainId, event) {
  if (isTaskCompletedToday(task, domainId)) return;

  const today = new Date().toISOString().slice(0, 10);
  const domain = appData.domains[domainId];

  // 记录日志
  appData.taskLog.push({ taskId: task.id, domainId, date: today, xp: task.xp, timestamp: new Date().toISOString() });

  // 增加经验
  const oldLevel = getDomainLevel(domain.exp);
  domain.exp += task.xp;
  const newLevel = getDomainLevel(domain.exp);

  // 更新 streak (简化：连续天数)
  task.streak = (task.streak || 0) + 1;

  saveData();

  // 动画
  if (event) {
    const rect = event.target.getBoundingClientRect();
    showXpGain(task.xp, rect.left + rect.width / 2 - 20, rect.top - 10);
  }

  // 升级检查
  if (newLevel > oldLevel) {
    showToast(`🎉 ${domain.name} 升到 Lv.${newLevel}！`, 'levelup');
    // 检查称号
    checkTitleUnlock(domain);
  } else {
    showToast(`+${task.xp} ${domain.icon} ${domain.name}经验`, 'success');
  }

  // 检查奖励解锁
  checkRewardUnlock();

  refreshAll();
}

function undoTask(task, domainId) {
  const today = new Date().toISOString().slice(0, 10);
  const idx = appData.taskLog.findIndex(log =>
    log.taskId === task.id && log.domainId === domainId && log.date === today
  );
  if (idx === -1) return;

  const log = appData.taskLog[idx];
  appData.taskLog.splice(idx, 1);
  appData.domains[domainId].exp -= log.xp;
  if (task.streak > 0) task.streak--;
  saveData();
  showToast('↩️ 已撤销');
  refreshAll();
}

function checkTitleUnlock(domain) {
  const title = getCurrentTitle(domain);
  const alreadyLogged = (appData.titleLog || []).some(
    t => t.domainId === domain.id && t.title === title
  );
  if (!alreadyLogged && title !== domain.titles[0]) {
    if (!appData.titleLog) appData.titleLog = [];
    appData.titleLog.push({
      domainId: domain.id,
      domainName: domain.name,
      domainIcon: domain.icon,
      title,
      date: new Date().toISOString().slice(0, 10)
    });
    setTimeout(() => showToast(`🏆 获得称号：${title}`, 'levelup'), 1500);
  }
}

function checkRewardUnlock() {
  if (!appData.rewards) return;
  let unlocked = false;
  for (const reward of appData.rewards) {
    if (!reward.unlocked) {
      const domain = appData.domains[reward.domainId];
      if (domain && domain.exp >= reward.xpRequired) {
        reward.unlocked = true;
        unlocked = true;
      }
    }
  }
  if (unlocked) {
    saveData();
    setTimeout(() => showToast('🎁 新奖励已解锁！', 'levelup'), 2000);
  }
}

// ============================================================
// 渲染：仪表盘
// ============================================================

function renderDashboard() {
  const container = document.getElementById('panel-dashboard');
  const totalExp = getTotalExp();
  const playerLevel = getPlayerLevel();
  const currentLevelExp = totalExpForLevel(playerLevel);
  const nextLevelExp = totalExpForLevel(playerLevel + 1);
  const levelProgress = totalExp - currentLevelExp;
  const levelTotal = expForLevel(playerLevel);
  const progressPct = Math.min(100, Math.round((levelProgress / levelTotal) * 100));

  const todayCompleted = getTodayCompletedCount();
  const todayTotal = getTasksDueToday().length;

  // 找出最高和最低领域
  let maxDomain = null, minDomain = null;
  let maxExp = -1, minExp = Infinity;
  for (const key in appData.domains) {
    const d = appData.domains[key];
    if (d.exp > maxExp) { maxExp = d.exp; maxDomain = d; }
    if (d.exp < minExp) { minExp = d.exp; minDomain = d; }
  }

  // 今日最推荐的碎片任务（所有领域中耗时<=15分钟且未完成的）
  const allTasks = getTasksDueToday();
  const quickTasks = allTasks
    .filter(t => !isTaskCompletedToday(t, t.domainId) && t.minutes <= 15)
    .sort((a, b) => a.minutes - b.minutes)
    .slice(0, 3);

  container.innerHTML = `
    <div class="radar-container">
      <canvas id="radarChart"></canvas>
    </div>
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-card-label">📋 今日进度</div>
        <div class="stat-card-value" style="color: var(--success)">${todayCompleted}/${todayTotal}</div>
        <div class="stat-card-sub">已完成任务</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">⭐ 总经验值</div>
        <div class="stat-card-value" style="color: var(--accent)">${totalExp.toLocaleString()}</div>
        <div class="stat-card-sub">Lv.${playerLevel} · ${progressPct}% 升级中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">🏆 最高领域</div>
        <div class="stat-card-value" style="font-size: 16px;">${maxDomain ? maxDomain.icon + ' ' + maxDomain.name : '-'}</div>
        <div class="stat-card-sub">${maxDomain ? 'Lv.' + getDomainLevel(maxDomain.exp) + ' · ' + maxDomain.exp + ' EXP' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">📉 待提升</div>
        <div class="stat-card-value" style="font-size: 16px; color: var(--warning)">${minDomain ? minDomain.icon + ' ' + minDomain.name : '-'}</div>
        <div class="stat-card-sub">${minDomain ? 'Lv.' + getDomainLevel(minDomain.exp) + ' · ' + minDomain.exp + ' EXP' : ''}</div>
      </div>
    </div>
    ${quickTasks.length > 0 ? `
    <div style="margin-bottom: 16px;">
      <div class="section-title">⚡ 碎片时间推荐（≤15分钟）</div>
      ${quickTasks.map(t => `
        <div class="task-card" style="border-left-color: ${t.domainColor}" onclick="switchToTasks()">
          <div class="task-card-header">
            <div class="task-info">
              <div class="task-name">${t.domainIcon} ${t.name}</div>
              <div class="task-desc">${t.desc}</div>
              <div class="task-meta">
                <span class="task-time">⏱ ${t.minutes}分钟</span>
                <span class="task-xp">+${t.xp} EXP</span>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    <div class="recent-activity">
      <div class="section-title">📜 最近动态</div>
      ${renderRecentActivity()}
    </div>
  `;

  // 延迟渲染雷达图
  setTimeout(renderRadarChart, 100);
}

function renderRadarChart() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;

  if (radarChart) radarChart.destroy();

  const labels = [];
  const data = [];
  const colors = [];
  const sorted = Object.values(appData.domains).sort((a, b) => a.order - b.order);

  for (const domain of sorted) {
    labels.push(domain.icon + ' ' + domain.name);
    data.push(domain.exp);
    colors.push(domain.color);
  }

  const ctx = canvas.getContext('2d');
  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: '经验值',
        data,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: colors,
        pointBorderColor: colors,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            display: false,
            stepSize: 50
          },
          pointLabels: {
            color: '#94a3b8',
            font: { size: 11 }
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.15)'
          },
          angleLines: {
            color: 'rgba(148, 163, 184, 0.15)'
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderRecentActivity() {
  const logs = [...appData.taskLog].reverse().slice(0, 10);
  if (logs.length === 0) {
    return `<div class="empty-state">
      <div class="empty-state-icon">🎮</div>
      <div class="empty-state-text">还没有任何记录<br>去完成第一个任务吧！</div>
    </div>`;
  }
  return logs.map(log => {
    const domain = appData.domains[log.domainId];
    const task = domain ? domain.tasks.find(t => t.id === log.taskId) : null;
    return `<div style="padding: 6px 0; font-size: 13px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
      <span>${domain ? domain.icon : '❓'} ${task ? task.name : '已完成任务'}</span>
      <span style="color: var(--accent); font-family: var(--font-mono); font-size: 12px;">+${log.xp} EXP · ${log.date}</span>
    </div>`;
  }).join('');
}

// ============================================================
// 渲染：今日任务
// ============================================================

function renderTasks(filter = 'all') {
  const container = document.getElementById('panel-tasks');
  const tasks = getTasksDueToday();

  // 按领域分组
  const grouped = {};
  for (const task of tasks) {
    if (!grouped[task.domainId]) grouped[task.domainId] = [];
    grouped[task.domainId].push(task);
  }

  // 排序
  const sorted = Object.entries(grouped).sort((a, b) => {
    return (appData.domains[a[0]].order || 99) - (appData.domains[b[0]].order || 99);
  });

  let html = `
    <div class="task-filters">
      <button class="filter-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">全部</button>
      <button class="filter-btn ${filter === 'unfinished' ? 'active' : ''}" data-filter="unfinished">未完成</button>
      <button class="filter-btn ${filter === 'quick' ? 'active' : ''}" data-filter="quick">⚡ 碎片时间</button>
      <button class="filter-btn ${filter === 'completed' ? 'active' : ''}" data-filter="completed">已完成</button>
    </div>
  `;

  let totalVisible = 0;

  for (const [domainId, domainTasks] of sorted) {
    const domain = appData.domains[domainId];
    let visibleTasks = domainTasks;

    if (filter === 'unfinished') {
      visibleTasks = domainTasks.filter(t => !isTaskCompletedToday(t, domainId));
    } else if (filter === 'quick') {
      visibleTasks = domainTasks.filter(t => !isTaskCompletedToday(t, domainId) && t.minutes <= 15);
    } else if (filter === 'completed') {
      visibleTasks = domainTasks.filter(t => isTaskCompletedToday(t, domainId));
    }

    if (visibleTasks.length === 0) continue;
    totalVisible += visibleTasks.length;

    const completedInGroup = domainTasks.filter(t => isTaskCompletedToday(t, domainId)).length;

    html += `
      <div class="task-group">
        <div class="task-group-header">
          <div class="task-group-icon" style="background: ${domain.color}22">${domain.icon}</div>
          <div class="task-group-name">${domain.name}</div>
          <div class="task-group-count">${completedInGroup}/${domainTasks.length}</div>
        </div>
    `;

    for (const task of visibleTasks) {
      const completed = isTaskCompletedToday(task, domainId);
      html += `
        <div class="task-card ${completed ? 'completed' : ''}" style="border-left-color: ${domain.color}" id="task-${domainId}-${task.id}">
          <div class="task-card-header">
            <div class="task-info">
              <div class="task-name">${task.name}</div>
              <div class="task-desc">${task.desc}</div>
              <div class="task-meta">
                <span class="task-time">⏱ ${task.minutes}分钟</span>
                <span class="task-xp">+${task.xp} EXP</span>
                ${task.streak > 0 ? `<span class="task-streak">🔥 ${task.streak}天</span>` : ''}
              </div>
            </div>
            <button class="complete-btn ${completed ? 'done' : ''}" 
              onclick="handleTaskClick(event, '${domainId}', '${task.id}')"
              ${completed ? 'oncontextmenu="handleUndo(event, \'' + domainId + '\', \'' + task.id + '\'); return false;"' : ''}>
              ${completed ? '✓' : '○'}
            </button>
          </div>
        </div>
      `;
    }
    html += `</div>`;
  }

  if (totalVisible === 0) {
    html += `<div class="empty-state">
      <div class="empty-state-icon">✨</div>
      <div class="empty-state-text">${filter === 'completed' ? '还没有完成任何任务' : '今日任务全部完成！'}</div>
    </div>`;
  }

  // 未完成任务数
  const unfinishedCount = tasks.filter(t => !isTaskCompletedToday(t, t.domainId)).length;
  updateTabBadge('tab-tasks', unfinishedCount > 0 ? unfinishedCount : '');

  container.innerHTML = html;

  // 绑定筛选按钮
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => renderTasks(btn.dataset.filter));
  });
}

function handleTaskClick(event, domainId, taskId) {
  event.stopPropagation();
  const domain = appData.domains[domainId];
  const task = domain.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (isTaskCompletedToday(task, domainId)) {
    handleUndo(event, domainId, taskId);
  } else {
    completeTask(task, domainId, event);
  }
}

function handleUndo(event, domainId, taskId) {
  event.preventDefault();
  event.stopPropagation();
  const domain = appData.domains[domainId];
  const task = domain.tasks.find(t => t.id === taskId);
  if (!task) return;
  if (confirm(`撤销完成"${task.name}"？将扣除${task.xp}经验值。`)) {
    undoTask(task, domainId);
  }
}

// ============================================================
// 渲染：领域列表
// ============================================================

function renderDomains() {
  const container = document.getElementById('panel-domains');
  const sorted = Object.values(appData.domains).sort((a, b) => a.order - b.order);

  container.innerHTML = `
    <div class="domain-grid">
      ${sorted.map(d => {
        const level = getDomainLevel(d.exp);
        const nextLevelExp = totalExpForLevel(level + 1) - totalExpForLevel(level);
        const currentLevelExp = totalExpForLevel(level);
        const progress = Math.min(100, Math.round(((d.exp - currentLevelExp) / nextLevelExp) * 100));
        const title = getCurrentTitle(d);
        return `
          <div class="domain-card" onclick="showDomainDetail('${d.id}')" style="border: 1px solid ${d.color}33">
            <div class="domain-card-icon">${d.icon}</div>
            <div class="domain-card-name">${d.name}</div>
            <div class="domain-card-level">Lv.${level} · ${d.exp} EXP</div>
            <div style="font-size: 10px; color: var(--warning); margin-top: 2px;">${title}</div>
            <div class="domain-card-exp">
              <div class="domain-card-exp-fill" style="width: ${progress}%; background: ${d.color}"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============================================================
// 渲染：领域详情
// ============================================================

function showDomainDetail(domainId) {
  currentDomainId = domainId;
  const domain = appData.domains[domainId];
  const level = getDomainLevel(domain.exp);
  const nextLevelExp = totalExpForLevel(level + 1) - totalExpForLevel(level);
  const currentLevelExp = totalExpForLevel(level);
  const progress = Math.min(100, Math.round(((domain.exp - currentLevelExp) / nextLevelExp) * 100));
  const title = getCurrentTitle(domain);
  const nextTitle = getNextTitle(domain);

  const container = document.getElementById('panel-domain-detail');
  const allPanels = document.querySelectorAll('.panel');
  allPanels.forEach(p => p.classList.remove('active'));
  container.classList.add('active');

  document.querySelector('.tabs').style.display = 'none';

  // 称号阶梯
  const titleThresholds = Object.entries(domain.titles)
    .map(([exp, name]) => ({ exp: Number(exp), name }))
    .sort((a, b) => a.exp - b.exp);

  // 该领域的今日任务
  const todayTasks = getTasksDueToday().filter(t => t.domainId === domainId);

  container.innerHTML = `
    <div class="domain-detail-header" style="border: 1px solid ${domain.color}44; background: linear-gradient(135deg, ${domain.color}11, var(--bg-card));">
      <button class="back-btn" onclick="hideDomainDetail()">←</button>
      <div class="domain-detail-icon">${domain.icon}</div>
      <div class="domain-detail-info">
        <div class="domain-detail-name">${domain.name}</div>
        <div class="domain-detail-desc">${domain.description}</div>
        <div class="domain-detail-title">🏆 ${title}</div>
        ${nextTitle ? `<div style="font-size: 11px; color: var(--text-muted);">下一称号: ${nextTitle.title} (需${nextTitle.exp} EXP)</div>` : ''}
        <div class="domain-detail-progress">
          <div class="domain-detail-progress-bar">
            <div class="domain-detail-progress-fill" style="width: ${progress}%; background: ${domain.color}"></div>
          </div>
          <div class="domain-detail-progress-text">Lv.${level} → Lv.${level + 1} · ${domain.exp - currentLevelExp}/${nextLevelExp} EXP (${progress}%)</div>
        </div>
      </div>
    </div>

    ${todayTasks.length > 0 ? `
    <div class="domain-detail-section">
      <h3>📋 今日任务</h3>
      ${todayTasks.map(t => {
        const completed = isTaskCompletedToday(t, domainId);
        return `
          <div class="task-card ${completed ? 'completed' : ''}" style="border-left-color: ${domain.color}">
            <div class="task-card-header">
              <div class="task-info">
                <div class="task-name">${t.name}</div>
                <div class="task-desc">${t.desc}</div>
                <div class="task-meta">
                  <span class="task-time">⏱ ${t.minutes}分钟</span>
                  <span class="task-xp">+${t.xp} EXP</span>
                  ${t.streak > 0 ? `<span class="task-streak">🔥 ${t.streak}天</span>` : ''}
                </div>
              </div>
              <button class="complete-btn ${completed ? 'done' : ''}" 
                onclick="handleTaskClick(event, '${domainId}', '${t.id}')">
                ${completed ? '✓' : '○'}
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    ` : ''}

    <div class="domain-detail-section">
      <h3>🎖️ 称号阶梯</h3>
      <div class="title-ladder">
        ${titleThresholds.map(t => {
          const achieved = domain.exp >= t.exp;
          const current = title === t.name;
          return `
            <div class="title-step ${achieved ? 'achieved' : ''} ${current ? 'current' : ''}">
              ${achieved ? '<div class="title-step-badge">✓</div>' : ''}
              <div class="title-step-exp">${t.exp} EXP</div>
              <div class="title-step-name">${t.name}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    ${domain.longGoals && domain.longGoals.length > 0 ? `
    <div class="domain-detail-section">
      <h3>🎯 长期目标</h3>
      ${domain.longGoals.map(g => {
        const pct = Math.min(100, Math.round((g.progress / g.total) * 100));
        return `
          <div class="long-goal-card">
            <div class="long-goal-name">${g.name}</div>
            <div class="long-goal-desc">${g.desc} · 奖励 ${g.xpReward} EXP</div>
            <div class="long-goal-progress">
              <div class="long-goal-progress-fill" style="width: ${pct}%"></div>
            </div>
            <div class="long-goal-progress-text">${g.progress}/${g.total} (${pct}%)</div>
          </div>
        `;
      }).join('')}
    </div>
    ` : ''}

    <div class="domain-detail-section">
      <h3>📊 任务列表</h3>
      ${domain.tasks.map(t => `
        <div class="task-card" style="border-left-color: ${domain.color}">
          <div class="task-card-header">
            <div class="task-info">
              <div class="task-name">${t.name} <span style="font-size: 10px; color: var(--text-muted);">${t.category}</span></div>
              <div class="task-desc">${t.desc}</div>
              <div class="task-meta">
                <span>⏱ ${t.minutes}分钟</span>
                <span class="task-xp">+${t.xp} EXP</span>
                <span>🔄 ${t.recurrence === 'daily' ? '每日' : t.recurrence === 'weekly' ? '每周' : '每月'}</span>
                ${t.streak > 0 ? `<span class="task-streak">🔥 ${t.streak}天</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function hideDomainDetail() {
  currentDomainId = null;
  document.querySelector('.tabs').style.display = 'flex';
  switchTab(currentTab);
}

// ============================================================
// 渲染：成就
// ============================================================

function renderAchievements() {
  const container = document.getElementById('panel-achievements');
  const titles = getCompletedTitles();
  const rewards = appData.rewards || [];

  let html = '';

  // 已获称号
  html += `<div class="section-title" style="padding: 8px 0;">🏆 已获称号 (${titles.length})</div>`;
  if (titles.length === 0) {
    html += `<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-text">还未获得任何称号<br>积累经验来解锁吧！</div></div>`;
  } else {
    html += titles.reverse().map(t => `
      <div class="achievement-card">
        <div class="achievement-icon">${t.domainIcon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${t.title}</div>
          <div class="achievement-domain">${t.domainName}</div>
        </div>
        <div class="achievement-date">${t.date}</div>
      </div>
    `).join('');
  }

  // 奖励
  html += `<div class="section-title" style="padding: 20px 0 8px;">🎁 现实奖励</div>`;
  for (const reward of rewards) {
    html += `
      <div class="reward-card ${reward.unlocked ? 'unlocked' : 'locked'}">
        <div class="reward-badge">${reward.unlocked ? '✅' : '🔒'}</div>
        <div class="reward-name">${reward.name}</div>
        <div class="reward-desc">${reward.desc}</div>
        <div class="reward-xp">${reward.unlocked ? '已解锁！' : '需要 ' + reward.xpRequired + ' EXP'}</div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ============================================================
// 渲染：设置
// ============================================================

function renderSettings() {
  const container = document.getElementById('panel-settings');
  const dataSize = JSON.stringify(appData).length;
  const logCount = appData.taskLog.length;
  const syncCode = getSyncCode();

  container.innerHTML = `
    <div class="settings-section">
      <h3>☁️ 云同步 (Bmob)</h3>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
        <span id="sync-status-text" style="font-size: 13px; color: var(--success);">✅ 就绪</span>
        <span id="sync-status-time" style="font-size: 11px; color: var(--text-muted);"></span>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">📡 你的同步码（跨设备共享）</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <code style="font-size: 22px; font-weight: bold; color: var(--accent); letter-spacing: 3px; font-family: monospace;">${syncCode}</code>
          <button class="settings-btn" style="padding: 4px 10px; font-size: 11px;" onclick="navigator.clipboard.writeText('${syncCode}'); showToast('📋 已复制同步码', 'success');">复制</button>
        </div>
      </div>

      <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">🔗 绑定其他设备</div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="bind-input" placeholder="输入6位同步码" maxlength="6" 
            style="flex: 1; background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 8px; border-radius: 6px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; text-align: center;">
          <button class="settings-btn" onclick="_doBind()" style="padding: 8px 16px;">绑定</button>
        </div>
      </div>

      <button class="settings-btn" onclick="cloudLoad().then(r => { if(!r) showToast('📡 本地数据已是最新', ''); })">🔄 手动同步</button>
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
        💡 数据自动同步。在其他设备输入同一同步码即可共享进度
      </div>
    </div>

    <div class="settings-section">
      <h3>📊 数据统计</h3>
      <div style="font-size: 13px; color: var(--text-secondary);">
        <div style="margin-bottom: 4px;">总记录数：${logCount} 条</div>
        <div>数据大小：${(dataSize / 1024).toFixed(1)} KB</div>
      </div>
    </div>

    <div class="settings-section">
      <h3>💾 备份与恢复</h3>
      <button class="settings-btn" onclick="exportData()">📥 导出数据备份 (JSON)</button>
      <button class="settings-btn" onclick="document.getElementById('import-file').click()">📤 导入数据恢复</button>
      <input type="file" id="import-file" accept=".json" style="display: none" onchange="importData(this.files[0])">
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">建议定期导出备份，防止数据丢失</div>
    </div>

    <div class="settings-section">
      <h3>🔧 操作</h3>
      <button class="settings-btn danger" onclick="handleReset()">⚠️ 重置所有数据</button>
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">重置将清除所有数据，请先导出备份</div>
    </div>

    <div class="settings-section">
      <h3>📱 使用说明</h3>
      <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.8;">
        <div>1️⃣ 在 Safari 打开本页面</div>
        <div>2️⃣ 点击分享按钮 → 添加到主屏幕</div>
        <div>3️⃣ 主屏幕出现"人生RPG"图标</div>
        <div>4️⃣ 像原生App一样使用</div>
        <div style="margin-top: 8px; color: var(--text-muted);">💡 长按已完成任务可撤销</div>
      </div>
    </div>
  `;
}

// 绑定同步码
function _doBind() {
  const input = document.getElementById('bind-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  if (code.length !== 6) {
    showToast('⚠️ 请输入6位同步码', '');
    return;
  }
  bindSyncCode(code);
}

function handleReset() {
  if (confirm('确定要重置所有数据吗？此操作不可恢复！\n\n建议先导出备份。\n\n确定继续？')) {
    if (confirm('再次确认：所有经验值、记录、称号将被清空。确定？')) {
      resetData();
      refreshAll();
      showToast('🔄 数据已重置', '');
    }
  }
}

// ============================================================
// Tab 切换
// ============================================================

function switchTab(tab) {
  currentTab = tab;

  // 如果正在查看领域详情，先退出
  if (currentDomainId) {
    hideDomainDetail();
  }

  document.querySelector('.tabs').style.display = 'flex';

  // 更新 tab 按钮
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const tabBtn = document.getElementById(`tab-${tab}`);
  if (tabBtn) tabBtn.classList.add('active');

  // 更新面板
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`panel-${tab}`);
  if (panel) panel.classList.add('active');

  // 渲染对应内容
  switch (tab) {
    case 'dashboard': renderDashboard(); break;
    case 'tasks': renderTasks(); break;
    case 'domains': renderDomains(); break;
    case 'achievements': renderAchievements(); break;
    case 'settings': renderSettings(); break;
  }

  window.scrollTo(0, 0);
}

function switchToTasks() {
  switchTab('tasks');
  setTimeout(() => {
    const quickBtn = document.querySelector('.filter-btn[data-filter="quick"]');
    if (quickBtn) quickBtn.click();
  }, 100);
}

// ============================================================
// 更新 tab 徽章
// ============================================================

function updateTabBadge(tabId, count) {
  const tab = document.getElementById(tabId);
  if (!tab) return;
  let badge = tab.querySelector('.tab-badge');
  if (count) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'tab-badge';
      tab.appendChild(badge);
    }
    badge.textContent = count;
  } else {
    if (badge) badge.remove();
  }
}

// ============================================================
// 刷新全部
// ============================================================

function refreshAll() {
  // 更新头部
  updateHeader();
  // 重新渲染当前面板
  switchTab(currentTab);
}

function updateHeader() {
  const totalExp = getTotalExp();
  const playerLevel = getPlayerLevel();
  const currentLevelExp = totalExpForLevel(playerLevel);
  const nextLevelExp = totalExpForLevel(playerLevel + 1);
  const levelProgress = totalExp - currentLevelExp;
  const levelTotal = expForLevel(playerLevel);
  const progressPct = Math.min(100, Math.round((levelProgress / levelTotal) * 100));

  document.getElementById('player-level').textContent = `Lv.${playerLevel}`;
  document.getElementById('xp-bar-fill').style.width = `${progressPct}%`;
  document.getElementById('xp-bar-text').textContent = `${levelProgress}/${levelTotal} EXP · ${progressPct}%`;
  document.getElementById('total-exp').textContent = `⭐ ${totalExp.toLocaleString()}`;
}

// ============================================================
// 初始化
// ============================================================

function init() {
  loadData();

  // 绑定 tab
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  updateHeader();
  switchTab('dashboard');

  // 启动时从云端同步
  setTimeout(() => cloudLoad(), 1000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// ============================================================
// Bmob 云同步
// ============================================================

const BMOB = {
  APP_ID: 'bee9ddef0803355b3fb37184822713f7',
  API_KEY: '4f2bc1ca2611e0afdba22edf72f9ffd4',
  BASE: 'https://api2.bmob.cn/1'
};

const SYNC_CODE_KEY = 'life-rpg-sync-code';
let _syncStatus = 'idle'; // idle | syncing | success | error

function getSyncCode() {
  let code = localStorage.getItem(SYNC_CODE_KEY);
  if (!code) {
    code = _genCode();
    localStorage.setItem(SYNC_CODE_KEY, code);
  }
  return code;
}

function setSyncCode(code) {
  localStorage.setItem(SYNC_CODE_KEY, code.toUpperCase());
}

function _genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function _deviceTag() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent) ? '📱手机' : '💻Mac';
}

function _bmobHeaders() {
  return {
    'X-Bmob-Application-Id': BMOB.APP_ID,
    'X-Bmob-REST-API-Key': BMOB.API_KEY,
    'Content-Type': 'application/json'
  };
}

async function cloudSave() {
  try {
    const code = getSyncCode();
    const json = JSON.stringify(appData);
    const device = _deviceTag();

    // 查询是否已有记录
    const q = await fetch(`${BMOB.BASE}/classes/GameData?where={"syncCode":"${code}"}&limit=1`, {
      headers: _bmobHeaders()
    });
    const qr = await q.json();

    if (qr.results && qr.results.length > 0) {
      // 更新
      await fetch(`${BMOB.BASE}/classes/GameData/${qr.results[0].objectId}`, {
        method: 'PUT',
        headers: _bmobHeaders(),
        body: JSON.stringify({ data: json, device, totalExp: getTotalExp() })
      });
    } else {
      // 新建
      await fetch(`${BMOB.BASE}/classes/GameData`, {
        method: 'POST',
        headers: _bmobHeaders(),
        body: JSON.stringify({ syncCode: code, data: json, device, totalExp: getTotalExp() })
      });
    }
    _syncStatus = 'success';
    _updateSyncUI('✅ 已同步', new Date().toLocaleTimeString());
  } catch (e) {
    console.warn('云同步失败:', e.message);
    _syncStatus = 'error';
    _updateSyncUI('⚠️ 同步失败', '');
  }
}

async function cloudLoad() {
  try {
    const code = getSyncCode();
    const r = await fetch(`${BMOB.BASE}/classes/GameData?where={"syncCode":"${code}"}&order=-updatedAt&limit=1`, {
      headers: _bmobHeaders()
    });
    const d = await r.json();

    if (!d.results || d.results.length === 0) {
      _updateSyncUI('☁️ 云端无数据', '');
      return false;
    }

    const cloud = JSON.parse(d.results[0].data);
    const cloudExp = d.results[0].totalExp || 0;
    const localExp = getTotalExp();

    if (cloudExp > localExp) {
      appData = cloud;
      saveDataToLocal();
      refreshAll();
      showToast('☁️ 已从云端恢复最新数据', 'success');
      _updateSyncUI('⬇️ 已同步', new Date().toLocaleTimeString());
      return true;
    } else {
      await cloudSave();
      _updateSyncUI('✅ 本地已最新', new Date().toLocaleTimeString());
      return false;
    }
  } catch (e) {
    console.warn('云端加载失败:', e.message);
    _updateSyncUI('⚠️ 连接失败', '');
    return false;
  }
}

// 不触发云同步的纯本地保存
function saveDataToLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function _updateSyncUI(text, time) {
  const el = document.getElementById('sync-status-text');
  if (el) el.textContent = text;
  const t = document.getElementById('sync-status-time');
  if (t) t.textContent = time;
}

function getDeviceSyncCode() {
  return getSyncCode();
}

function bindSyncCode(code) {
  setSyncCode(code);
  showToast('🔗 同步码已绑定: ' + code, 'success');
  cloudLoad();
  renderSettings();
}

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
