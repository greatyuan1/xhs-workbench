(function () {
  'use strict';

  // 禁止浏览器恢复上次滚动位置，确保每次打开都停在顶部（首页概览）
  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

  // ---------- 常量 ----------
  var WORD = { '独立向导': '向导', '包车司机': '司机', '小众定制社': '定制社' };
  var ICONS = { '独立向导': '🧭', '包车司机': '🚗', '小众定制社': '🎯' };
  var STATS = {
    '独立向导': { fans: '2.8w', likes: '186', collect: '120' },
    '包车司机': { fans: '1.6w', likes: '98', collect: '64' },
    '小众定制社': { fans: '3.1w', likes: '243', collect: '198' }
  };
  var NAV = [
    { id: 'hero', ic: '🏠', label: '首页概览' },
    { id: 'card-builder', ic: '📇', label: '信任名片' },
    { id: 'reputation', ic: '📊', label: '口碑面板' },
    { id: 'notes', ic: '✍️', label: '种草笔记' },
    { id: 'profile-preview', ic: '👤', label: '主页预览' }
  ];
  var FEATURES = [
    { ic: '📇', name: '信任名片', desc: '30秒生成游客敢私信的专业名片' },
    { ic: '📊', name: '口碑面板', desc: '好评差评可视化，数据驱动改进' },
    { ic: '✍️', name: '种草笔记', desc: 'AI生成小红书爆款笔记，直接复制发布' },
    { ic: '👤', name: '主页预览', desc: '模拟你的小红书商家主页长什么样' }
  ];
  var CHIPS = ['无人机航拍', '会拍照出片', '不进购物店', '小众路线', '地道美食', '回头客多', '路线定制', '不赶路'];
  var SAMPLES = [
    { type: '包车司机', name: '老张', region: '大理',
      desc: '开了十几年山路，车况好，不进购物店，带游客去游客找不到的白族村子，会推荐当地人吃的馆子，帮搬行李，老客户都介绍朋友来。',
      quote: '老张不仅开车稳，还带我们去了游客找不到的白族村子，吃了一顿地道家常菜，回来一直回味！' },
    { type: '独立向导', name: '阿杰', region: '川西',
      desc: '会带无人机航拍，能拍雪山大片，路线都是自己踩过的小众点，不赶路，不购物，照片比专业旅拍还出片，档期要提前两周约。',
      quote: '阿杰拍的照片比我自己花2000块找的旅拍还好，全程不赶路，雪山星空都看到了，值！' },
    { type: '小众定制社', name: '山海定制', region: '西藏',
      desc: '一人成团、路线自由定制，车和吃住全安排得明明白白，报价透明实在，全程零操心，老客户口碑好。',
      quote: '价格比普通向导贵一点，但值——路线、车、吃住全安排得明明白白，全程零操心。' }
  ];

  // ---------- 状态 ----------
  var state = {
    type: '独立向导', name: '', region: '', desc: '', sampleQuote: '',
    generated: false, data: null
  };
  var demoCache = null;
  var toastTimer;

  // ---------- 工具 ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1900);
  }

  // ---------- 分析 ----------
  function analyze(t) {
    t = (t || '') + '';
    var has = {};
    has.drone = /无人机|航拍|跟拍/.test(t);
    has.photo = /摄影|拍照|出片|大片|单反|相机|机位|照片|旅拍/.test(t);
    has.noShop = /不进店|不进.{0,2}购物|无购物|纯玩|不购物|不推销|零购物/.test(t);
    has.noRush = /不赶路|慢节奏|放松|随走|悠/.test(t);
    has.small = /小众|冷门|踩点|踩过|私藏|宝藏|游客找不到/.test(t);
    has.village = /村子|白族|寨|村落|原生态/.test(t);
    has.food = /当地|本地|馆子|吃|美食|味道|小吃|家常菜/.test(t);
    has.experience = /山路|驾龄|老司机|路熟|复杂路况|经验|十几年|多年|开车|车况/.test(t);
    has.refer = /介绍朋友|回头客|老客户|口碑|转介绍|朋友来|朋友都/.test(t);
    has.booking = /档期|提前|预约|预定|预订/.test(t);
    has.culture = /人文|讲解|历史|文化|民俗|故事/.test(t);
    has.clean = /车况.{0,3}干净|整洁|保养|明明白白/.test(t);
    has.transparent = /透明|无隐形|实在|公道/.test(t);
    has.custom = /定制|自由行|自由|成团|一人成团/.test(t);
    has.price = /贵|价格|值|性价比/.test(t);
    var m = t.match(/(\d{1,2})\s*年/);
    has.years = m ? m[1] : null;
    return has;
  }

  // ---------- 生成 ----------
  function buildTag(type, name, region, has) {
    var short = WORD[type];
    var label;
    if (has.drone || has.photo) label = '摄影' + short;
    else if (type === '包车司机' && has.experience) label = '老司机';
    else if (type === '小众定制社') label = '小众定制';
    else if (has.noShop) label = '纯玩' + short;
    else if (has.small || has.village) label = '小众' + short;
    else if (has.food) label = '地道' + short;
    else label = short;
    return region + label + '·' + name;
  }

  function selling(has, type, region) {
    if (has.drone) return '随行无人机航拍，全程跟拍带你出大片';
    if (has.photo) return '会找机位、会拍照，出片比专业旅拍还惊艳';
    if (has.village) return '带你去游客找不到的原生态村落，地道体验';
    if (has.small) return '路线全是自己踩过的小众冷门点，避开人潮';
    if (has.food) return '带你吃本地人私藏馆子，地道又实惠';
    if (has.culture) return '边走边讲当地人文风物，深度不打卡';
    if (type === '小众定制社') return '一人成团、路线定制，全程零操心';
    if (type === '包车司机') return '车干净舒适，随走随停，路线你说了算';
    return '路线自由定制，走少有游客的小众玩法';
  }

  function promise(has, type) {
    if (has.noShop) return '纯玩无购物，全程不安排购物点';
    if (has.transparent) return '报价透明实在，无任何隐形消费';
    if (has.noRush) return '不赶路，行程完全按你的节奏来';
    if (has.custom || type === '小众定制社') return '路线自由定制，想去哪你定';
    if (has.price) return '价格公道，值回票价，不玩虚的';
    return '纯玩不推销，时间全留给你';
  }

  function backing(has, type, region) {
    if (has.experience && has.years) return has.years + '年' + region + '复杂路况驾龄，安全稳当';
    if (has.experience) return '多年' + region + '复杂路况驾龄，路熟心细';
    if (has.refer) return '老客户回头率高，靠介绍朋友来';
    if (has.booking) return '档期需提前预订，好东西藏不住';
    if (has.clean) return '车况定期保养，安全有保障';
    if (type === '包车司机') return region + '本地人，路熟服务细致';
    if (type === '小众定制社') return '深耕' + region + '多年，定制经验足';
    return '常年深耕' + region + '，带队经验足';
  }

  function buildQuote(name, has) {
    if (has.drone || has.photo) return '“' + name + '拍的照片比专门找的旅拍还出片，全程跟拍不催不赶，太值了！”';
    if (has.village) return '“' + name + '不仅开车稳，还带我们去了游客找不到的小村子，地道又难忘！”';
    if (has.food) return '“' + name + '推荐的本地馆子家家好吃，比网红店强太多，省心！”';
    if (has.noShop) return '“全程纯玩不进店，' + name + '还帮搬行李、介绍好吃馆子，回来后一直介绍朋友来！”';
    if (has.small || has.noRush) return '“跟' + name + '走了趟不赶路的小众路线，没人打扰，体验感拉满！”';
    if (has.refer) return '“老客户都介绍朋友来找' + name + '，靠谱！”';
    if (has.price) return '“价格比普通向导贵一点，但值，全程零操心！”';
    return '“' + name + '服务细致靠谱，朋友看了都来要联系方式。”';
  }

  function noteHook(has) {
    if (has.drone) return '无人机全程航拍，出片率高到朋友圈被问爆～';
    if (has.photo) return '会找机位会拍照，出片比专业旅拍还惊艳，不踩雷；';
    if (has.village) return '带去游客找不到的原生态村子，地道又难忘；';
    if (has.small) return '路线都是自己踩过的小众冷门点，避开人潮慢慢玩；';
    if (has.food) return '带你吃本地人私藏馆子，地道又实惠；';
    return '人靠谱、话不多，服务细节拉满；';
  }

  function buildPosWords(has) {
    var pos = [];
    if (has.drone) pos.push('无人机航拍');
    if (has.photo) pos.push('出片', '会找机位', '拍得好看');
    if (has.experience) pos.push('老司机', '驾驶稳', '路熟');
    if (has.village) pos.push('原生态村落', '地道体验');
    if (has.noShop) pos.push('纯玩无购物', '不推销');
    if (has.noRush) pos.push('不赶路', '节奏舒服');
    if (has.small) pos.push('小众路线', '避人潮', '冷门宝藏');
    if (has.food) pos.push('本地美食', '地道馆子');
    if (has.culture) pos.push('人文讲解');
    if (has.refer) pos.push('回头客多', '口碑好');
    if (has.transparent) pos.push('价格实在', '无隐形消费');
    if (has.clean) pos.push('车况好');
    if (has.booking) pos.push('提前预约');
    if (pos.length < 5) pos.push('靠谱省心', '服务细致', '行程自由');
    return pos.slice(0, 9);
  }

  function buildNegWords(has, type) {
    var neg = [];
    if (!has.transparent) neg.push('价格波动', '报价不清');
    if (has.booking) neg.push('档期难约');
    if (!has.noRush) neg.push('节奏偏快');
    if (type === '包车司机') neg.push('拼车舒适度', '山路颠簸');
    else if (type === '小众定制社') neg.push('成团人数', '拼团等待');
    else neg.push('天气影响', '旺季排队');
    if (has.small) neg.push('点位分散');
    if (neg.length < 3) neg.push('沟通时效', '行程变动');
    return neg.slice(0, 4);
  }

  function buildScores(has, type) {
    return [
      { dim: '服务态度', val: Math.min(100, 90 + (has.clean ? 3 : 0) + (has.noShop ? 3 : 0) + (has.refer ? 2 : 0)) },
      { dim: '专业能力', val: Math.min(100, 88 + (has.experience ? 6 : 0) + ((has.photo || has.drone) ? 4 : 0) + (has.culture ? 2 : 0)) },
      { dim: '行程体验', val: Math.min(100, 90 + (has.small ? 3 : 0) + (has.food ? 3 : 0) + (has.noRush ? 2 : 0) + (has.village ? 2 : 0)) },
      { dim: '价格透明', val: Math.min(100, 86 + (has.transparent ? 7 : 0) + (has.noShop ? 3 : 0) + (has.price ? 4 : 0)) },
      { dim: '口碑推荐', val: Math.min(100, 89 + (has.refer ? 6 : 0) + (has.booking ? 2 : 0)) }
    ];
  }

  function buildSentiment(has) {
    var good = 84 + (has.refer ? 3 : 0) + (has.noShop ? 2 : 0) + (has.noRush ? 1 : 0) +
      (has.food ? 1 : 0) + (has.small ? 1 : 0) + (has.photo ? 1 : 0);
    var mid = 9;
    var bad = 100 - good - mid;
    if (bad < 2) { bad = 2; mid = 100 - good - bad; }
    return { good: good, mid: mid, bad: bad };
  }

  function buildAdvice(has) {
    var tips = [];
    if (!has.transparent) tips.push('在笔记里主动标注价格区间，减少反复询价');
    if (has.booking) tips.push('把档期做成置顶笔记，老客户可直接约');
    if (has.photo || has.drone) tips.push('多发拍摄花絮合集，强化「比专业旅拍还出片」记忆点');
    if (has.food) tips.push('做一期「本地人私藏馆子」合集，天然拉新');
    if (has.small || has.village) tips.push('用小众路线打差异化，配「避人潮」关键词投放');
    if (has.refer) tips.push('置顶老客户真实评价，截屏口碑做信任背书');
    if (tips.length === 0) tips.push('持续发布真实带队日常，建立长期信任');
    return '运营建议：' + tips.slice(0, 3).join('；') + '。';
  }

  function buildBio(tag, region, has) {
    var seg = [];
    if (has.photo || has.drone) seg.push('会拍照能出片');
    if (has.small || has.village) seg.push('专走小众路线');
    if (has.noShop) seg.push('纯玩无购物');
    if (has.refer) seg.push('回头客多');
    if (seg.length === 0) seg.push('靠谱省心');
    return '「' + tag + '」' + region + '本地宝藏' + WORD[state.type] + '。' + seg.join('，') + '。欢迎私信约档期～';
  }

  function buildGridNotes(region) {
    return [
      { emoji: '🏔️', grad: 'linear-gradient(135deg,#ff6b81,#ff2442)', title: '「' + region + '」小众路线实测，避人潮', likes: '1688' },
      { emoji: '📷', grad: 'linear-gradient(135deg,#8e9eff,#2f54eb)', title: '手机也能拍的' + region + '大片机位', likes: '2431' },
      { emoji: '🍜', grad: 'linear-gradient(135deg,#ffa940,#fa8c16)', title: region + '本地人私藏馆子合集', likes: '992' }
    ];
  }

  function buildData() {
    var name = state.name.trim();
    var region = state.region.trim();
    var desc = state.desc || '';
    var type = state.type;
    var has = analyze(desc);
    return {
      type: type,
      name: name,
      region: region,
      avatar: ICONS[type],
      short: WORD[type],
      has: has,
      tag: buildTag(type, name, region, has),
      h1: selling(has, type, region),
      h2: promise(has, type),
      h3: backing(has, type, region),
      quote: state.sampleQuote || buildQuote(name, has),
      posWords: buildPosWords(has),
      negWords: buildNegWords(has, type),
      scores: buildScores(has, type),
      sentiment: buildSentiment(has),
      advice: buildAdvice(has),
      bio: buildBio(buildTag(type, name, region, has), region, has),
      stats: STATS[type],
      gridNotes: buildGridNotes(region),
      noteHookText: noteHook(has),
      noteVariant: 0,
      theme: ''
    };
  }

  function makeNote(d, variant, theme) {
    var name = d.name;
    var region = d.region;
    var short = d.short;
    var themeTag = theme ? (' #' + theme) : '';
    var themeText = theme ? ('这次重点体验了「' + theme + '」，') : '';
    var title, body;
    if (variant === 1) {
      title = region + '攻略｜这样玩才不踩雷，亲测「' + name + '」值得冲';
      body = '来' + region + '做攻略做到头秃？这份亲测避雷版收好👇\n\n' +
        '✅ 路线：' + d.h1 + '\n✅ 服务：' + d.h2 + '\n✅ 靠谱：' + d.h3 + '\n\n' +
        '全程无购物、不赶路，' + (theme ? '尤其' + theme + '这块安排得明明白白，' : '') + '体验一次就懂了。\n\n' +
        '评论扣「' + region + '」，帮你看档期～';
    } else if (variant === 2) {
      title = '价格比普通向导贵一点，但真的值（亲测）';
      body = '很多人问我' + name + '贵不贵？说实话，比普通' + short + '贵一点，但值回票价👇\n\n' +
        '值在哪：\n· ' + d.h1 + '\n· ' + d.h2 + '\n· ' + d.h3 + '\n\n' +
        (theme ? '这次' + theme + '体验是真的惊喜，\n' : '') +
        '贵的那点钱，换的是不操心、不踩雷的全程体验，我觉得很值。\n\n' +
        '预算紧张先私我聊路线，' + name + '能按你预算来🫡';
    } else if (variant === 3) {
      title = '花2000块找旅拍？不如直接找' + name + '📷';
      body = (d.has.photo || d.has.drone)
        ? '之前找旅拍花了2000块，出片还不如' + name + '随手拍的…\n\n' + d.h1 + '\n\n' +
          '全程跟拍、会找机位、不催不赶，' + (theme ? theme + '也能出片，' : '') + '出片率高到朋友追着要联系方式。\n\n私我发「' + region + '」约档期～'
        : '在' + region + '被' + name + '的服务细节折服了👇\n\n' + d.h1 + '｜' + d.h2 + '\n\n' +
          '全程不推销不赶路，' + (theme ? theme + '体验也好，' : '') + '就是踏实。\n\n想约的私我发「' + region + '」～';
    } else {
      title = '在' + region + '挖到一位宝藏' + short + '「' + name + '」🔥';
      body = d.noteHookText + '\n' +
        (themeText ? themeText + '体验感直接拉满！\n' : '') +
        '主打：' + d.h1 + '｜' + d.h2 + '｜' + d.h3 + '\n' +
        '不推销、不赶路，全程纯玩，真把自己当朋友带。\n' +
        '想来的姐妹👇私我发「' + region + '」，帮你看档期～';
    }
    var tags = '#小红书旅行 #' + region + '旅行 #宝藏' + short + themeTag;
    return { title: title, body: body, tags: tags };
  }

  // ---------- demo 数据 ----------
  function buildDemoData() {
    var s = SAMPLES[0];
    var saved = { type: state.type, name: state.name, region: state.region, desc: state.desc, sampleQuote: state.sampleQuote };
    state.type = s.type; state.name = s.name; state.region = s.region; state.desc = s.desc; state.sampleQuote = s.quote;
    var d = buildData();
    state.type = saved.type; state.name = saved.name; state.region = saved.region; state.desc = saved.desc; state.sampleQuote = saved.sampleQuote;
    return d;
  }
  function activeData() {
    if (state.generated && state.data) return state.data;
    if (!demoCache) demoCache = buildDemoData();
    return demoCache;
  }
  function isDemo() { return !state.generated || !state.data; }

  // ---------- HTML 片段 ----------
  function headerHtml() {
    return '<header class="topbar"><div class="topbar-inner">' +
      '<div class="brand">' +
        '<span class="logo">红</span>' +
        '<span class="brand-name">小红书文旅商家 · 一站式获客工作台</span>' +
        '<span class="brand-badge">小红书大商业校招 AI Builder 作品</span>' +
      '</div>' +
      '</div></header>';
  }

  function navHtml() {
    return NAV.map(function (n) {
      return '<a class="side-link' + (n.id === 'hero' ? ' active' : '') + '" href="#' + n.id + '" data-id="' + n.id + '">' +
        '<span class="side-ic">' + n.ic + '</span><span>' + n.label + '</span></a>';
    }).join('');
  }

  function sectionHero() {
    var cards = FEATURES.map(function (f) {
      return '<div class="feature-card">' +
        '<div class="feature-ic">' + f.ic + '</div>' +
        '<div class="feature-name">' + f.name + '</div>' +
        '<div class="feature-desc">' + f.desc + '</div>' +
        '</div>';
    }).join('');
    return '<section class="sec hero" id="hero"><div class="hero-inner">' +
      '<span class="hero-overline">AI Builder · 小红书文旅商家获客神器</span>' +
      '<h1 class="hero-title">小红书文旅商家·一站式获客工作台</h1>' +
      '<p class="hero-sub">有好服务，不会在小红书上表达？AI帮你搞定名片、口碑、笔记、主页</p>' +
      '<div class="feature-grid">' + cards + '</div>' +
      '<button class="hero-btn" id="heroBtn">🚀 立即体验</button>' +
      '</div></section>';
  }

  function formHtml() {
    var typeHtml = Object.keys(ICONS).map(function (t) {
      return '<div class="type-card' + (state.type === t ? ' active' : '') + '" data-type="' + t + '">' +
        '<span class="ic">' + ICONS[t] + '</span>' + t + '</div>';
    }).join('');
    var chipHtml = CHIPS.map(function (c) {
      var on = state.desc.indexOf(c) !== -1;
      return '<span class="chip' + (on ? ' active' : '') + '" data-kw="' + c + '">' + c + '</span>';
    }).join('');
    var sampleHtml = SAMPLES.map(function (s, i) {
      return '<button class="sample-btn" data-sample="' + i + '">📌 ' + esc(s.name) + '（' + esc(s.type) + '·' + esc(s.region) + '）</button>';
    }).join('');
    return '<div class="field">' +
        '<label>主理人类型</label>' +
        '<div class="type-row" id="typeRow">' + typeHtml + '</div>' +
      '</div>' +
      '<div class="field"><label>主理人称呼</label><input type="text" id="fName" placeholder="如：阿杰 / 老张" value="' + esc(state.name) + '"></div>' +
      '<div class="field"><label>所在地区</label><input type="text" id="fRegion" placeholder="如：川西 / 大理" value="' + esc(state.region) + '"></div>' +
      '<div class="field"><label>一句话介绍（亮点 / 口碑 / 特色）</label><textarea id="fDesc" placeholder="例：会带无人机航拍，能拍雪山大片，路线都是自己踩过的小众点…">' + esc(state.desc) + '</textarea></div>' +
      '<div class="chip-row"><span class="chip-label">快捷标签（点击添加/取消）</span>' + chipHtml + '</div>' +
      '<div class="sample-row">' + sampleHtml + '</div>' +
      '<button class="gen-btn" id="genBtn">🚀 一键生成全部内容</button>' +
      '<div class="gen-hint">生成后，口碑面板 / 种草笔记 / 主页预览 同步产出</div>';
  }

  function sectionCard() {
    return '<section class="sec" id="card-builder">' +
      '<div class="sec-head"><h2>📇 信任名片</h2><p class="sec-sub">填写基础资料，一键生成小红书官方信任名片</p></div>' +
      '<div class="card-layout">' +
        '<div class="panel form-panel">' +
          '<div class="panel-head-sub">填写基础资料</div>' +
          formHtml() +
        '</div>' +
        '<div id="cardResult"></div>' +
      '</div>' +
      '</section>';
  }

  function sectionReputation() {
    return '<section class="sec" id="reputation">' +
      '<div class="sec-head"><h2>📊 口碑面板</h2><p class="sec-sub">好评差评可视化，数据驱动体验改进</p></div>' +
      '<div class="panel" id="reputationBody"></div>' +
      '</section>';
  }

  function sectionNotes() {
    return '<section class="sec" id="notes">' +
      '<div class="sec-head"><h2>✍️ 种草笔记</h2><p class="sec-sub">AI 自动生成小红书网感文案，直接复制发布</p></div>' +
      '<div id="notesBody"></div>' +
      '</section>';
  }

  function sectionProfile() {
    return '<section class="sec" id="profile-preview">' +
      '<div class="sec-head"><h2>👤 主页预览</h2><p class="sec-sub">模拟你的小红书商家主页长什么样</p></div>' +
      '<div id="profileBody"></div>' +
      '</section>';
  }

  // ---------- 结果渲染 ----------
  function trustCardHtml(d) {
    return '<div class="panel trust-card">' +
      '<div class="trust-head">' +
        '<div class="trust-head-l">' +
          '<span class="trust-badge">小红书 · 官方信任名片</span>' +
          '<div class="trust-title">' + esc(d.tag) + '</div>' +
        '</div>' +
        '<div class="trust-stars">' +
          '<div class="stars">⭐⭐⭐⭐⭐</div>' +
          '<div class="stars-sub">信任指数 4.9 / 5.0</div>' +
        '</div>' +
      '</div>' +
      '<div class="trust-body">' +
        '<span class="tag-line">' + esc(d.tag) + '</span>' +
        '<div class="hl-head">🌟 核心服务亮点</div>' +
        '<ul class="hl">' +
          '<li><span class="hl-lab">亮点1</span>' + esc(d.h1) + '</li>' +
          '<li><span class="hl-lab">亮点2</span>' + esc(d.h2) + '</li>' +
          '<li><span class="hl-lab">亮点3</span>' + esc(d.h3) + '</li>' +
        '</ul>' +
        '<div class="quote"><span class="q-lab">💬 口碑背书（来自老客户）</span>' + esc(d.quote) + '</div>' +
      '</div>' +
      '<div class="card-actions"><button class="copy-btn" data-copy="card">📋 复制名片</button></div>' +
      '</div>';
  }

  function renderCardResult() {
    var box = document.getElementById('cardResult');
    if (!box) return;
    var d = activeData();
    box.innerHTML = (isDemo() ? '<div class="demo-tip">示例名片 · 填写信息生成后替换为你的专属名片</div>' : '') + trustCardHtml(d);
  }

  function reputationHtml(d) {
    var posHtml = d.posWords.map(function (w) { return '<span class="kw-tag pos">' + esc(w) + '</span>'; }).join('');
    var negHtml = d.negWords.map(function (w) { return '<span class="kw-tag neg">' + esc(w) + '</span>'; }).join('');
    var scoreHtml = d.scores.map(function (s) {
      return '<div class="score-row">' +
        '<span class="score-dim">' + esc(s.dim) + '</span>' +
        '<span class="score-bar"><span class="score-fill" style="width:' + s.val + '%"></span></span>' +
        '<span class="score-val">' + s.val + '</span>' +
        '</div>';
    }).join('');
    var sen = d.sentiment;
    var senHtml = '<div class="sentiment">' +
      '<div class="sentiment-bar">' +
        '<span class="sent-seg good" style="width:' + sen.good + '%"></span>' +
        '<span class="sent-seg mid" style="width:' + sen.mid + '%"></span>' +
        '<span class="sent-seg bad" style="width:' + sen.bad + '%"></span>' +
      '</div>' +
      '<div class="sent-legend">' +
        '<span><i class="g"></i>好评 ' + sen.good + '%</span>' +
        '<span><i class="m"></i>中评 ' + sen.mid + '%</span>' +
        '<span><i class="b"></i>差评 ' + sen.bad + '%</span>' +
      '</div>' +
      '</div>';
    return (isDemo() ? '<div class="demo-tip">口碑诊断仪表盘 · 当前为示例数据，生成后自动切换为你的真实诊断</div>' : '') +
      '<div class="metrics">' +
        '<div class="metric"><div class="metric-b">98%</div><div class="metric-l">用户满意度</div></div>' +
        '<div class="metric"><div class="metric-b">' + sen.good + '%</div><div class="metric-l">好评占比</div></div>' +
        '<div class="metric"><div class="metric-b">' + d.negWords.length + '</div><div class="metric-l">待改进要点</div></div>' +
      '</div>' +
      '<div class="repo-block"><div class="repo-label">👍 高频好评词 <span class="badge pos">关键词云</span></div>' +
        '<div class="kw-cloud">' + posHtml + '</div></div>' +
      '<div class="repo-block"><div class="repo-label">⚠️ 风险 / 差评词 <span class="badge neg">需留意</span></div>' +
        '<div class="kw-cloud">' + negHtml + '</div></div>' +
      '<div class="repo-block"><div class="repo-label">📈 五维评分</div>' + scoreHtml + '</div>' +
      '<div class="repo-block"><div class="repo-label">😊 口碑情感分布</div>' + senHtml + '</div>' +
      '<div class="repo-block"><div class="advice">' + esc(d.advice) + '</div></div>';
  }

  function renderReputation() {
    var box = document.getElementById('reputationBody');
    if (!box) return;
    box.innerHTML = reputationHtml(activeData());
  }

  function notesHtml(d) {
    var note = makeNote(d, d.noteVariant, d.theme);
    return (isDemo() ? '<div class="demo-tip">爆款笔记 · 当前为示例文案，生成后自动切换</div>' : '') +
      '<div class="panel">' +
        '<div class="note-input-row">' +
          '<input type="text" id="noteTheme" placeholder="想突出的主题，如：亲子游 / 摄影 / 美食" value="' + esc(d.theme) + '">' +
          '<button id="noteApply">✦ 应用主题</button>' +
        '</div>' +
        '<div class="note-card">' +
          '<div class="note-top">' +
            '<span class="note-flag">📝 小红书笔记</span>' +
            '<button class="copy-btn" data-copy="note">📋 复制</button>' +
          '</div>' +
          '<div class="note-title">' + esc(note.title) + '</div>' +
          '<div class="note-body">' + esc(note.body) + '</div>' +
          '<div class="note-tags">' + esc(note.tags) + '</div>' +
          '<div class="note-actions"><button class="swap-btn" id="noteSwap">🎲 换一篇</button></div>' +
        '</div>' +
      '</div>';
  }

  function renderNotes() {
    var box = document.getElementById('notesBody');
    if (!box) return;
    box.innerHTML = notesHtml(activeData());
  }

  function profileCardInner(d) {
    var wall = d.posWords.slice(0, 6).map(function (w) {
      return '<span class="tw-tag">' + esc(w) + '</span>';
    }).join('');
    var grid = d.gridNotes.map(function (n) {
      return '<div class="p-note">' +
        '<div class="p-cover" style="background:' + n.grad + '">' + n.emoji + '</div>' +
        '<div class="p-title">' + esc(n.title) + '</div>' +
        '<div class="p-likes">❤️ ' + n.likes + '</div>' +
        '</div>';
    }).join('');
    return '<div class="profile-card">' +
      '<div class="profile-head">' +
        '<div class="avatar">' + d.avatar + '</div>' +
        '<div class="profile-meta">' +
          '<div class="nick">' + esc(d.tag) + '</div>' +
          '<div class="region-tag">📍 ' + esc(d.region) + ' · 本地认证</div>' +
        '</div>' +
        '<div class="stats">' +
          '<div><b>' + d.stats.fans + '</b>粉丝</div>' +
          '<div><b>' + d.stats.likes + '</b>获赞</div>' +
          '<div><b>' + d.stats.collect + '</b>收藏</div>' +
        '</div>' +
      '</div>' +
      '<div class="bio">' + esc(d.bio) + '</div>' +
      '<div class="tag-wall">' + wall + '</div>' +
      '<div class="note-grid">' + grid + '</div>' +
      '</div>';
  }

  function renderProfile() {
    var box = document.getElementById('profileBody');
    if (!box) return;
    var d = activeData();
    box.innerHTML = (isDemo() ? '<div class="demo-tip">主页预览 · 当前为示例数据，生成后自动切换为你的主页</div>' : '') +
      '<div class="profile-wrap"><div class="phone">' +
        '<div class="phone-notch"></div>' +
        '<div class="phone-screen">' +
          '<div class="p-statusbar"><span>9:41</span><span>📶 🔋</span></div>' +
          profileCardInner(d) +
        '</div>' +
      '</div></div>';
  }

  // ---------- 复制 ----------
  function copyPayload(kind) {
    var d = activeData();
    if (kind === 'card') {
      return '【小红书信任名片】\n\n' +
        '专属标签：' + d.tag + '\n\n' +
        '信任指数：⭐⭐⭐⭐⭐\n基于：服务经验 · 口碑透明度 · 特色差异化\n\n' +
        '🌟 核心服务亮点\n· ' + d.h1 + '\n· ' + d.h2 + '\n· ' + d.h3 + '\n\n' +
        '💬 口碑背书（来自老客户）\n' + d.quote;
    } else if (kind === 'note') {
      var n = makeNote(d, d.noteVariant, d.theme);
      return n.title + '\n\n' + n.body + '\n\n' + n.tags;
    }
    return '';
  }

  function copyText(text, btn) {
    var done = function () {
      if (btn) {
        var o = btn.textContent;
        btn.textContent = '✅ 已复制';
        setTimeout(function () { btn.textContent = o; }, 1400);
      }
      toast('已复制到剪贴板');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }

  // ---------- 表单绑定 ----------
  function bindForm() {
    var typeRow = document.getElementById('typeRow');
    typeRow.addEventListener('click', function (e) {
      var c = e.target.closest('.type-card');
      if (!c) return;
      state.type = c.getAttribute('data-type');
      Array.prototype.forEach.call(typeRow.querySelectorAll('.type-card'), function (x) {
        x.classList.toggle('active', x.getAttribute('data-type') === state.type);
      });
    });

    var fName = document.getElementById('fName');
    var fRegion = document.getElementById('fRegion');
    var fDesc = document.getElementById('fDesc');
    fName.addEventListener('input', function () { state.name = fName.value; });
    fRegion.addEventListener('input', function () { state.region = fRegion.value; });
    fDesc.addEventListener('input', function () {
      state.desc = fDesc.value;
      refreshChips();
    });

    var chipRow = document.querySelector('.chip-row');
    chipRow.addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (!c) return;
      var kw = c.getAttribute('data-kw');
      var cur = (state.desc || '').trim();
      var has = cur.indexOf(kw) !== -1;
      if (has) {
        cur = cur.split(kw).join('').replace(/，+/g, '，').replace(/^，|，$/g, '').trim();
      } else {
        cur = cur ? cur + '，' + kw : kw;
      }
      state.desc = cur;
      fDesc.value = cur;
      refreshChips();
    });

    var samples = document.querySelectorAll('.sample-btn');
    Array.prototype.forEach.call(samples, function (b) {
      b.addEventListener('click', function () {
        var s = SAMPLES[parseInt(b.getAttribute('data-sample'), 10)];
        state.type = s.type;
        state.name = s.name;
        state.region = s.region;
        state.desc = s.desc;
        state.sampleQuote = s.quote;
        fName.value = s.name;
        fRegion.value = s.region;
        fDesc.value = s.desc;
        Array.prototype.forEach.call(typeRow.querySelectorAll('.type-card'), function (x) {
          x.classList.toggle('active', x.getAttribute('data-type') === state.type);
        });
        refreshChips();
      });
    });

    document.getElementById('genBtn').addEventListener('click', generateAll);
  }

  function refreshChips() {
    var chips = document.querySelectorAll('.chip');
    Array.prototype.forEach.call(chips, function (c) {
      var kw = c.getAttribute('data-kw');
      c.classList.toggle('active', (state.desc || '').indexOf(kw) !== -1);
    });
  }

  function generateAll() {
    var name = (state.name || '').trim();
    var region = (state.region || '').trim();
    if (!name || !region) {
      toast('请先填写「主理人称呼」和「所在地区」～');
      return;
    }
    state.generated = true;
    state.data = buildData();
    renderCardResult();
    renderReputation();
    renderNotes();
    renderProfile();
    toast('已生成 信任名片 / 口碑面板 / 种草笔记 / 主页预览');
  }

  // ---------- 全局委托（复制 / 换一篇 / 应用主题）----------
  function bindGlobal() {
    document.addEventListener('click', function (e) {
      var copy = e.target.closest('.copy-btn');
      if (copy) {
        copyText(copyPayload(copy.getAttribute('data-copy')), copy);
        return;
      }
      var swap = e.target.closest('#noteSwap');
      if (swap) {
        var d1 = activeData();
        d1.noteVariant = (d1.noteVariant + 1) % 4;
        renderNotes();
        toast('换了一篇～');
        return;
      }
      var apply = e.target.closest('#noteApply');
      if (apply) {
        var d2 = activeData();
        var input = document.getElementById('noteTheme');
        d2.theme = input ? input.value.trim() : '';
        d2.noteVariant = randInt(0, 3);
        renderNotes();
        toast('已按主题重新生成笔记');
        return;
      }
    });
    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'noteTheme') {
        activeData().theme = e.target.value;
      }
    });
  }

  // ---------- 导航 & scrollspy ----------
  function bindNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.side-link'));
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = document.getElementById(a.getAttribute('data-id'));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    var heroBtn = document.getElementById('heroBtn');
    if (heroBtn) {
      heroBtn.addEventListener('click', function () {
        var el = document.getElementById('card-builder');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    var sections = NAV.map(function (n) { return document.getElementById(n.id); });
    var HEADER = 90;

    function applyActive(activeId) {
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-id') === activeId);
      });
    }

    // 基于实时视口位置计算高亮；预览窗格未展开(隐藏/零高度)时跳过，
    // 避免拿到全 0 的坐标把高亮错误地落在最后一项
    function computeActive() {
      if (document.visibilityState !== 'visible' || window.innerHeight < 50) return;
      var first = sections[0] ? sections[0].getBoundingClientRect() : null;
      if (!first || first.height === 0) return; // 布局尚未展开
      var activeId = 'hero';
      sections.forEach(function (sec) {
        if (!sec) return;
        if (sec.getBoundingClientRect().top <= HEADER) activeId = sec.id;
      });
      applyActive(activeId);
    }

    window.addEventListener('scroll', computeActive, { passive: true });
    window.addEventListener('resize', computeActive);
    document.addEventListener('visibilitychange', computeActive);
    // 自愈循环：任何迟到的布局展开/滚动恢复后，400ms 内自动纠正高亮
    setInterval(computeActive, 400);
    computeActive();
  }

  // ---------- 启动 ----------
  function renderApp() {
    var app = document.getElementById('app');
    app.innerHTML = headerHtml() +
      '<div class="layout">' +
        '<aside class="sidebar"><nav class="side-nav">' + navHtml() + '</nav></aside>' +
        '<main class="main">' +
          sectionHero() +
          sectionCard() +
          sectionReputation() +
          sectionNotes() +
          sectionProfile() +
        '</main>' +
      '</div>';
    bindForm();
    bindGlobal();
    bindNav();
    renderCardResult();
    renderReputation();
    renderNotes();
    renderProfile();
  }

  renderApp();

  // ===== 打开即回顶：左侧红色光标停在「首页概览」=====
  // 清掉外部带来的 #hash，防止浏览器自动跳到锚点
  try {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  } catch (e) {}

  function forceTop() {
    var html = document.documentElement;
    var prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto'; // 临时关闭 smooth，瞬时回顶
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }
  forceTop();
  window.addEventListener('DOMContentLoaded', forceTop);
  window.addEventListener('load', function () {
    forceTop();
    requestAnimationFrame(forceTop);
    setTimeout(forceTop, 120);  // 拦截晚到的滚动恢复
    setTimeout(forceTop, 400);
  });
  // bfcache / 预览窗格重新显示时也回顶
  window.addEventListener('pageshow', function () { forceTop(); });
})();