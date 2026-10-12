/* ============================================================
   app.js v5 — v4 基础上新增「💬 咨询话术助手」模块（其余未改动）
   UI 组件：Ant Design v4.24.15 官方构建（vendor/antd.js + antd.css）
   组件本体：vendor/antd.js + vendor/antd.css（antd 官方 dist，UMD）
   渲染层：React 18.2.0 UMD + htm 3.1.1（tagged template 代替 JSX）
   使用的 antd 官方组件：
     Layout / Layout.Header / Layout.Sider / Layout.Content
     Menu / Typography(Title,Text) / Card / Tag / Tag.CheckableTag
     Form / Form.Item / Input / Input.TextArea / Input.Search
     Button / Rate / List / List.Item / Statistic / Progress
     Alert / Segmented / Row / Col / message
   业务逻辑与旧版 app-classic.js 逐行一致（生成规则 / 示例数据 /
   文案模板 / 复制行为 / 换一篇 / 应用主题 均未改动）
   ============================================================ */
(function () {
  'use strict';

  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;
  var html = htm.bind(React.createElement);

  var A = antd;
  var Layout = A.Layout, Header = A.Layout.Header, Sider = A.Layout.Sider, Content = A.Layout.Content;
  var Menu = A.Menu, Typography = A.Typography, Card = A.Card, Tag = A.Tag;
  var Button = A.Button, Input = A.Input, Rate = A.Rate, List = A.List;
  var Statistic = A.Statistic, Progress = A.Progress, Alert = A.Alert;
  var Segmented = A.Segmented, Row = A.Row, Col = A.Col, Form = A.Form;
  var message = A.message;
  var Title = Typography.Title, Text = Typography.Text;
  var CheckableTag = Tag.CheckableTag;
  var TextArea = Input.TextArea, Search = Input.Search;
  var ListItem = List.Item;

  /* ================= 常量（业务数据，与旧版一致） ================= */
  var WORD = { '独立向导': '向导', '包车司机': '司机', '小众定制社': '定制社' };
  var ICONS = { '独立向导': '🧭', '包车司机': '🚗', '小众定制社': '🎯' };
  var STATS = {
    '独立向导': { fans: '2.8万', likes: '186', collect: '120' },
    '包车司机': { fans: '1.6万', likes: '98', collect: '64' },
    '小众定制社': { fans: '3.1万', likes: '243', collect: '198' }
  };
  var NAV = [
    { id: 'hero', ic: '🏠', label: '首页概览' },
    { id: 'card-builder', ic: '📇', label: '信任名片' },
    { id: 'profile-preview', ic: '👤', label: '主页预览' },
    { id: 'reputation', ic: '📊', label: '口碑面板' },
    { id: 'notes', ic: '✍️', label: '种草笔记' },
    { id: 'scripts', ic: '💬', label: '咨询话术' }
  ];
  var FEATURES = [
    { ic: '📇', name: '信任名片', desc: '30秒生成游客敢私信的专业名片' },
    { ic: '👤', name: '主页预览', desc: '模拟主页第一眼 + 点开「查看名片」后的打开态' },
    { ic: '📊', name: '口碑面板', desc: '好评差评可视化，数据驱动改进' },
    { ic: '✍️', name: '种草笔记', desc: 'AI生成小红书爆款笔记，直接复制发布' },
    { ic: '💬', name: '咨询话术', desc: '评论区私信常见问题，一键生成回复' }
  ];
  var CHIPS = ['无人机航拍', '会拍照出片', '不进购物店', '小众路线', '地道美食', '回头客多', '路线定制', '不赶路'];
  var SAMPLES = [
    { type: '包车司机', name: '老张带你游四川', region: '四川',
      desc: '开了十几年山路，车况好，不进购物店，带游客去游客找不到的白族村子，会推荐当地人吃的馆子，帮搬行李，老客户都介绍朋友来。',
      quote: '老张不仅开车稳，还带我们去了游客找不到的白族村子，吃了一顿地道家常菜，回来一直回味！',
      quote2: '第一次来四川就找的老张，出发前把行程、天气、要带的东西全发给我们，老人晕车还提前备好药，这服务没得挑。' },
    { type: '独立向导', name: '阿杰', region: '川西',
      desc: '会带无人机航拍，能拍雪山大片，路线都是自己踩过的小众点，不赶路，不购物，照片比专业旅拍还出片，档期要提前两周约。',
      quote: '阿杰拍的照片比我自己花2000块找的旅拍还好，全程不赶路，雪山星空都看到了，值！',
      quote2: '本来只想拍几张打卡照，结果朋友圈直接被问爆，姐妹们都来要他联系方式，档期真的要提前约！' },
    { type: '小众定制社', name: '山海定制', region: '西藏',
      desc: '一人成团、路线自由定制，车和吃住全安排得明明白白，报价透明实在，全程零操心，老客户口碑好。',
      quote: '价格比普通向导贵一点，但值——路线、车、吃住全安排得明明白白，全程零操心。',
      quote2: '一个人进藏本来心里没底，高反了他们马上调整路线降低海拔，全程安全感满分，已经推荐给同事了。' }
  ];

  /* ================= 业务逻辑（与旧版 app-classic.js 完全一致） ================= */
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

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

  function buildQuote2(name, has) {
    if (has.photo || has.drone) return '“本来只是想拍几张打卡照，结果朋友圈被问爆了，都在要' + name + '的联系方式！”';
    if (has.refer) return '“朋友推荐第一次找' + name + '，行程临时有变也爽快帮改，细节全都提前想到，省心！”';
    return '“朋友推荐来的，' + name + '全程没让我们操一点心，回来想都没想就推荐给了同事。”';
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
    if (type === '包车司机') neg.push('拼车拥挤', '山路颠簸');
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

  function buildBio(tag, region, has, type) {
    var seg = [];
    if (has.photo || has.drone) seg.push('会拍照能出片');
    if (has.small || has.village) seg.push('专走小众路线');
    if (has.noShop) seg.push('纯玩无购物');
    if (has.refer) seg.push('回头客多');
    if (seg.length === 0) seg.push('靠谱省心');
    return '「' + tag + '」' + region + '本地宝藏' + WORD[type] + '。' + seg.join('，') + '。欢迎私信约档期～';
  }

  var NOTE_IMGS = [
    'assets/note-1.jpg?v=n1',
    'assets/note-2.jpg?v=n1',
    'assets/note-3.jpg?v=n1',
    'assets/note-4.jpg?v=n1',
    'assets/note-5.jpg?v=n1',
    'assets/note-6.jpg?v=n1'
  ];
  var RV_AVAS = ['🧑‍🎤', '🎒', '🐰', '☕', '🦝', '🦌'];
  var RV_GRADS = [
    'linear-gradient(135deg,#E8702F,#C2521E)',
    'linear-gradient(135deg,#C98B4B,#8F5A24)',
    'linear-gradient(135deg,#D98E4A,#A15C22)',
    'linear-gradient(135deg,#A96F3D,#6E4218)',
    'linear-gradient(135deg,#B76B45,#7C4520)',
    'linear-gradient(135deg,#C07A3A,#8A4E1D)'
  ];
  var RV_NICKS = ['爱吃酸奶的Lily', '背包客小王', 'Momo酱', '川西在逃咖啡师', '大狸子', '小鹿爱跑'];
  var RV_DATES = ['10月12日', '10月08日', '10月02日', '9月28日', '9月24日', '9月19日'];
  function buildReviews(name, type) {
    var texts, tags4, src;
    if (type === '包车司机') {
      src = '来自包车服务评价';
      texts = [
        name + '开车特别稳，还带我们去了游客找不到的原生态村子，菜很好吃！',
        '山路弯多也不晕车，全程帮我们拎行李拍照，情绪价值拉满。',
        '时间安排特别自由，想停就停，说好的纯玩真的一点购物都没有。',
        '对路线门儿清，避开人挤人的观景台，拍到的人生照片！',
        '整体很好，就是旺季等了半小时才发车，其他没得挑。',
        '第一次带爸妈出来玩选他准没错，老爷子现在还念叨。'
      ];
      tags4 = ['驾驶稳', '原生态村落', '纯玩无购物'];
    } else if (type === '小众定制社') {
      src = '来自定制行程评价';
      texts = [
        '行程单精确到小时，落地一秒都不用改，' + name + '太靠谱了。',
        '酒店和餐厅选得太对味了，都是我想找又找不到的那种。',
        '客服响应超快，行程中临时改需求当天就安排好。',
        '对当地玩法门儿清，每个点位都踩过点，不踩雷。',
        '整体很好，就是旺季档期太满，改行程等了半小时才确认，其他没得挑。',
        '全家人第一次定制游就选他们，都满意，明年还来。'
      ];
      tags4 = ['行程精细', '旺季档期紧', '响应及时'];
    } else {
      src = '来自向导服务评价';
      texts = [
        '跟着' + name + '走完全不用自己做攻略，讲解特别有意思，孩子都听入迷了。',
        '带我们躲开人潮走小路，行程灵活，临时想加个点也OK。',
        '超会拍照！知道哪个点位什么时间光线最好，出片率极高。',
        '对当地文化和历史门儿清，全程像朋友聊天，一点不商业化。',
        '整体很好，就是旺季他档期太满，集合时等了半小时，其他没得挑。',
        '爸妈走不动的路他都记得避开，细节控，很暖。'
      ];
      tags4 = ['讲解有趣', '旺季档期紧', '适合亲子'];
    }
    var tagsList = [
      type === '包车司机' ? ['驾驶稳', '原生态村落', '纯玩无购物'] :
        type === '小众定制社' ? ['行程精细', '选品在线', '无隐形消费'] :
        ['讲解有趣', '小众路线', '纯玩无购物'],
      type === '包车司机' ? ['服务贴心', '山路稳', '帮拍照片'] :
        type === '小众定制社' ? ['选品在线', '审美高级', '酒店控狂喜'] :
        ['行程灵活', '不赶路', '随叫随停'],
      type === '包车司机' ? ['行程自由', '纯玩无购物', '时间灵活'] :
        type === '小众定制社' ? ['响应快', '灵活调整', '管家式服务'] :
        ['出片率高', '摄影向导', '机位小众'],
      type === '包车司机' ? ['小众机位', '避开人流', '摄影友好'] :
        type === '小众定制社' ? ['踩点扎实', '不踩雷', '本地资源多'] :
        ['深度讲解', '不商业化', '像朋友一样'],
      tags4,
      type === '包车司机' ? ['适合老人', '家庭游', '有耐心'] :
        type === '小众定制社' ? ['全家满意', '回头客', '省心'] :
        ['细心周到', '适老路线', '有耐心']
    ];
    var starsList = [5, 5, 5, 5, 4, 5];
    var out = [];
    for (var i = 0; i < 6; i++) {
      out.push({
        nick: RV_NICKS[i], date: RV_DATES[i], stars: starsList[i],
        text: texts[i], tags: tagsList[i].map(function (t) { return '#' + t; }).join(' '),
        src: src, ava: RV_AVAS[i], grad: RV_GRADS[i]
      });
    }
    return out;
  }
  function buildGridNotes(region) {
    return [
      { emoji: '🏔️', grad: 'linear-gradient(135deg,#E8702F,#C2521E)', img: NOTE_IMGS[0], title: '「' + region + '」小众路线实测，避人潮', likes: '1688' },
      { emoji: '📷', grad: 'linear-gradient(135deg,#C98B4B,#8F5A24)', img: NOTE_IMGS[1], title: '手机也能拍的' + region + '大片机位', likes: '2431' },
      { emoji: '🍜', grad: 'linear-gradient(135deg,#A96F3D,#6E4218)', img: NOTE_IMGS[2], title: region + '本地人私藏馆子合集', likes: '992' },
      { emoji: '🗺️', grad: 'linear-gradient(135deg,#D98E4A,#A15C22)', img: NOTE_IMGS[3], title: '第一次去' + region + '看这篇就够了', likes: '3105' },
      { emoji: '⚠️', grad: 'linear-gradient(135deg,#B76B45,#7C4520)', img: NOTE_IMGS[4], title: region + '避坑指南，看完少花冤枉钱', likes: '1867' },
      { emoji: '🚐', grad: 'linear-gradient(135deg,#C07A3A,#8A4E1D)', img: NOTE_IMGS[5], title: '跟本地向导玩' + region + '是什么体验', likes: '1544' }
    ];
  }

  function buildData(f) {
    var name = f.name.trim();
    var region = f.region.trim();
    var desc = f.desc || '';
    var type = f.type;
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
      quote: f.sampleQuote || buildQuote(name, has),
      quote2: f.sampleQuote2 || buildQuote2(name, has),
      posWords: buildPosWords(has),
      negWords: buildNegWords(has, type),
      scores: buildScores(has, type),
      sentiment: buildSentiment(has),
      advice: buildAdvice(has),
      bio: buildBio(buildTag(type, name, region, has), region, has, type),
      stats: STATS[type],
      gridNotes: buildGridNotes(region),
      reviews: buildReviews(name, type),
      noteHookText: noteHook(has)
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

  function buildDemoData() {
    var s = SAMPLES[0];
    return buildData({ type: s.type, name: s.name, region: s.region, desc: s.desc, sampleQuote: s.quote, sampleQuote2: s.quote2 });
  }

  function copyPayload(kind, d, variant, theme) {
    if (kind === 'card') {
      return '【小红书信任名片】\n\n' +
        '专属标签：' + d.tag + '\n\n' +
        '信任度：⭐⭐⭐⭐⭐\n基于：服务经验 · 口碑透明度 · 特色差异化\n\n' +
        '🌟 核心服务亮点\n· ' + d.h1 + '\n· ' + d.h2 + '\n· ' + d.h3 + '\n\n' +
        '💬 口碑背书（来自老客户）\n' + d.quote + '\n\n💬 口碑背书（来自新客户）\n' + d.quote2;
    }
    if (kind === 'note') {
      var n = makeNote(d, variant, theme);
      return n.title + '\n\n' + n.body + '\n\n' + n.tags;
    }
    return '';
  }

  /* ============ 咨询话术助手（新增模块，与原四模块逻辑零耦合） ============ */
  var PRESET_Q = ['怎么联系？', '价格多少？', '一天几个点？', '提前多久约？', '包含拍照吗？'];
  var SCRIPTS = {
    contact: [
      '姐妹你好呀～具体路线和档期我私信你啦，看下消息哦😊',
      '看到啦～平台上直接私信我就行，基本秒回，放心冲😆'
    ],
    price: [
      '价格要看路线天数和人数哦～私信我你的想法，给你发一份明明白白的报价，绝不玩虚的🫡',
      '你好呀～不同玩法价格不一样，私信聊聊预算和天数，我帮你搭配性价比最高的方案💰'
    ],
    booking: [
      '建议提前1-2周约哦，旺季档期特别紧张～私信我看下日子，早点锁定档期📅',
      '越早越好呀～好档期手快有！私信报个大概时间，我先帮你查档期⏰'
    ],
    photo: [
      '拍的拍的～全程跟拍不额外收费，出片率超高，回来直接发九宫格📸',
      '带拍！机位都是提前踩好的，随手一拍就是大片，样片看我主页📷'
    ],
    itinerary: [
      '一天2-3个点是最舒服的节奏，不赶路不打卡，慢慢玩才叫度假～想怎么安排私我😌',
      '点位完全按你的节奏来～私我说说喜好，帮你排一条不走冤枉路的路线🗺️'
    ],
    generic: [
      '谢谢关注呀～具体我私信你详聊，看到就回，不让你久等❤️',
      '好问题！私信说说你的想法，给你出一份专属方案，包满意～✨'
    ]
  };
  function matchScriptCat(q) {
    if (/联系|微信|电话|手机|找你|加你|私信/.test(q)) return 'contact';
    if (/价格|多少钱|费用|收费|报价|预算|贵|便宜|优惠/.test(q)) return 'price';
    if (/提前|多久|预约|预定|预订|档期|约/.test(q)) return 'booking';
    if (/拍照|照片|跟拍|旅拍|出片|无人机|航拍|视频|修图/.test(q)) return 'photo';
    if (/几个点|点位|景点|行程|路线|玩法|安排|玩什么/.test(q)) return 'itinerary';
    return 'generic';
  }

  /* ================= 工具 ================= */
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  function copyText(text) {
    var done = function () { message.success('已复制到剪贴板'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ================= antd 组件拼装 ================= */

  function DemoTip(props) {
    return html`<${Alert} className="demo-tip" type="info" showIcon message=${props.text} />`;
  }

  function TopBar() {
    return html`<${Header} className="wb-header">
      <div className="wb-header-inner">
        <span className="logo" aria-label="种草 logo"><svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 2.5) rotate(-7 17 15)"><path d="M17 14.5 C12.3 14.2 8.8 11.2 8.9 7.5 C9 4.8 11.4 3.5 13.5 4.8 C15.8 6.2 16.9 10 17 14.5 Z" fill="#52C9A0" /><path d="M17 14.5 C22.2 14.2 25.9 11.4 25.8 7.3 C25.7 4.4 23 3 20.5 4.5 C17.9 6 17.1 10 17 14.5 Z" fill="#52C9A0" /><rect x="15.8" y="13.8" width="2.4" height="11.5" rx="1.2" fill="#52C9A0" /></g></svg></span>
        <span className="brand-name">本地旅行主理人 · 一站式小红书账号运营工作台</span>
      </div>
    </${Header}>`;
  }

  function SideMenu(props) {
    var items = NAV.map(function (n) {
      return { key: n.id, label: n.ic + ' ' + n.label };
    });
    return html`<${Menu}
      className="wb-menu"
      mode=${props.mode}
      items=${items}
      selectedKeys=${[props.activeId]}
      onClick=${function (e) { props.onNav(e.key); }}
    />`;
  }

  function HeroSection(props) {
    return html`<section className="sec hero" id="hero">
      <div className="hero-inner">
        <span className="hero-overline">AI Builder · 本地旅行主理人获客神器</span>
        <${Title} level=${1} className="hero-title">本地旅行主理人<span className="hero-title-accent">一站式小红书账号运营工作台</span></${Title}>
        <p className="hero-sub">给会玩但不会运营的优质司/导/社——AI帮你搞定小红书账号经营全流程</p>
        <div className="hero-collage">
          <div className="tile big">
            <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=700&h=700&fit=crop&q=75&auto=format" alt="" onerror=${function (e) { e.target.style.display = 'none'; }} />
          </div>
          <div className="tile">
            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=360&h=360&fit=crop&q=75&auto=format" alt="" onerror=${function (e) { e.target.style.display = 'none'; }} />
          </div>
          <div className="tile">
            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=360&h=360&fit=crop&q=75&auto=format" alt="" onerror=${function (e) { e.target.style.display = 'none'; }} />
          </div>
          <div className="tile">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=360&h=360&fit=crop&q=75&auto=format" alt="" onerror=${function (e) { e.target.style.display = 'none'; }} />
          </div>
          <div className="tile">
            <img src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=360&h=360&fit=crop&q=75&auto=format" alt="" onerror=${function (e) { e.target.style.display = 'none'; }} />
          </div>
        </div>
        <div className="feature-grid">
          ${FEATURES.map(function (f) {
            return html`<${Card} className="feature-card" hoverable key=${f.name}>
              <div className="feature-ic">${f.ic}</div>
              <div className="feature-name">${f.name}</div>
              <div className="feature-desc">${f.desc}</div>
            </${Card}>`;
          })}
        </div>
      </div>
    </section>`;
  }

  function buildRoutes(type) {
    if (type === '独立向导') {
      return [
        { emoji: '🏔', name: '四姑娘山徒步 2日', sub: '猫鼻梁日照金山 · 双桥沟栈道', days: '2日' },
        { emoji: '❄️', name: '达古冰川+毕棚沟 3日', sub: '冰川索道 · 红石滩 · 米亚罗', days: '3日' },
        { emoji: '📷', name: '折多山-新都桥机位 2日', sub: '云海星空 · 藏式村落', days: '2日' }
      ];
    }
    if (type === '小众定制社') {
      return [
        { emoji: '🏔', name: '林芝-索松村 3日', sub: '南迦巴瓦日照金山 · 佛掌沙丘', days: '3日' },
        { emoji: '⛰', name: '珠峰大本营 5日环线', sub: '加乌拉山口 · 108拐 · 星空', days: '5日' },
        { emoji: '🌌', name: '纳木错-圣象天门 2日', sub: '星空银河 · 三生石', days: '2日' }
      ];
    }
    return [
      { emoji: '🏞', name: '黄龙-九寨沟 3日游', sub: '五花海 · 长海 · 诺日朗瀑布', days: '3日' },
      { emoji: '🏔', name: '川西-四姑娘山包车 5日游', sub: '猫鼻梁看日照金山 · 双桥沟', days: '5日' },
      { emoji: '🌃', name: '都江堰夜游', sub: '南桥夜景 · 蓝眼泪 · 夜游水利', days: '1日' }
    ];
  }

  function TrustMini(props) {
    var d = props.d;
    var good = d.sentiment ? d.sentiment.good : 96;
    return html`<div className="trust-mini">
      <span className="tm-icon" aria-label="小红书种草表情包">
            <svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(0 2.5) rotate(-7 17 15)">
                <path d="M17 14.5 C12.3 14.2 8.8 11.2 8.9 7.5 C9 4.8 11.4 3.5 13.5 4.8 C15.8 6.2 16.9 10 17 14.5 Z" fill="#52C9A0" />
                <path d="M17 14.5 C22.2 14.2 25.9 11.4 25.8 7.3 C25.7 4.4 23 3 20.5 4.5 C17.9 6 17.1 10 17 14.5 Z" fill="#52C9A0" />
                <rect x="15.8" y="13.8" width="2.4" height="11.5" rx="1.2" fill="#52C9A0" />
              </g>
            </svg>
          </span>
      <div className="tm-main">
        <div className="tm-row1">
          <span className="tm-title">官方信任名片</span>
          <span className="tm-vip">已核验</span>
        </div>
        <div className="tm-row2">
          <span className="tm-stars">★ 4.5 信任度</span>
          <span className="tm-dot">·</span>
          <span>好评 ${good}%</span>
          <span className="tm-dot">·</span>
          <span>完单 326</span>
        </div>
      </div>
      <span className="tm-cta">查看名片 ›</span>
    </div>`;
  }

  function TrustCard(props) {
    var d = props.d;
    var highlights = [['亮点1', d.h1], ['亮点2', d.h2], ['亮点3', d.h3]];
    var routes = buildRoutes(d.type).map(function (rt) {
      return html`<div className="route-item" key=${rt.name}>
        <span className="rt-emoji">${rt.emoji}</span>
        <div className="rt-main">
          <div className="rt-name">${rt.name}</div>
          <div className="rt-sub">${rt.sub}</div>
        </div>
        <span className="rt-days">${rt.days}</span>
      </div>`;
    });
    return html`<${Card} className="trust-card">
      <div className="trust-head">
        <div className="avatar trust-av"><img src="assets/guide-avatar.jpg?v=av4" alt="向导头像" /></div>
        <div className="trust-head-l">
          <span className="trust-badge">小红书 · 官方信任名片</span>
          <div className="trust-title">${d.tag}</div>
        </div>
      </div>
      <div className="trust-body">
        <div className="trust-main">
        <div className="trust-stars">
          <${Rate} className="trust-rate" disabled allowHalf defaultValue=${4.5} />
          <span className="stars-sub">信任度 4.5 / 5.0</span>
        </div>
        <div className="hl-head">🌟 核心服务亮点</div>
        <${List} className="hl" size="small" split=${false} dataSource=${highlights}
          renderItem=${function (item) {
            return html`<${ListItem} key=${item[0]}>
              <${Tag} className="hl-lab">${item[0]}</${Tag}>
              <span>${item[1]}</span>
            </${ListItem}>`;
          }}
        />
        <div className="hl-head">🗺️ 金牌路线</div>
        <div className="route-list">${routes}</div>
        <div className="hl-head">💬 口碑背书</div>
        <div className="quote q1">
          <div className="q-tag">老客户</div>
          <div className="q-text">${d.quote}</div>
          <div className="q-author">—— @李女士 · 九寨沟 3 日跟团</div>
        </div>
        <div className="quote q2">
          <div className="q-tag">新客户</div>
          <div className="q-text">${d.quote2}</div>
          <div className="q-author">—— @周先生 · 上月包车</div>
        </div>
        </div>
        <div className="trust-photo">
          <div className="tp-grid">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) {
              return html`<img src="assets/sq-${i}.jpg?v=s1" alt="带团实拍 ${i}"
                onError=${function (e) { e.currentTarget.style.display = 'none'; }} />`;
            })}
          </div>
          <span className="tp-cap">📷 带团实拍 · 九寨沟 / 新都桥 / 稻城 / 川西</span>
        </div>
      </div>
    </${Card}>`;
  }

  function CardBuilderSection(props) {
    var form = props.form;
    var chips = CHIPS.map(function (c) {
      var on = (form.desc || '').indexOf(c) !== -1;
      return html`<${CheckableTag} key=${c} checked=${on} onChange=${function () { props.toggleChip(c); }}>${c}</${CheckableTag}>`;
    });
    var samples = SAMPLES.map(function (s, i) {
      return html`<${Button} key=${i} size="small" onClick=${function () { props.applySample(s); }}>
        📌 ${s.name}（${s.region}）
      </${Button}>`;
    });
    return html`<section className="sec" id="card-builder">
      <div className="sec-head">
        <${Title} level=${3} className="sec-title">📇 信任名片</${Title}>
        <${Text} type="secondary" className="sec-sub">填写基础资料，一键生成小红书官方信任名片</${Text}>
      </div>
      <div className="card-layout">
        <${Card} className="panel form-panel" title="填写基础资料">
          <${Form} className="wb-form" layout="vertical" onFinish=${props.onGenerate}>
            <${Form.Item} label="怎么称呼（如：老张带你游四川 / 阿杰 / 山海定制）">
              <${Input} placeholder="如：老张带你游四川 / 阿杰 / 山海定制" value=${form.name}
                onChange=${function (e) { props.setForm(function (f) { return Object.assign({}, f, { name: e.target.value }); }); }} />
            </${Form.Item}>
            <${Form.Item} label="主营地区（如：大理 / 川西）">
              <${Input} placeholder="如：川西 / 大理" value=${form.region}
                onChange=${function (e) { props.setForm(function (f) { return Object.assign({}, f, { region: e.target.value }); }); }} />
            </${Form.Item}>
            <${Form.Item} label="一句话介绍你的服务 / 粘贴老客户好评">
              <${TextArea} rows=${4} placeholder="例：会带无人机航拍，能拍雪山大片，路线都是自己踩过的小众点…"
                value=${form.desc}
                onChange=${function (e) { props.setForm(function (f) { return Object.assign({}, f, { desc: e.target.value }); }); }} />
            </${Form.Item}>
            <${Form.Item} label="快捷标签（点击添加/取消）">
              <div className="chip-row">${chips}</div>
            </${Form.Item}>
            <${Form.Item} label="试试示例">
              <div className="sample-row">${samples}</div>
            </${Form.Item}>
            <${Button} type="primary" block className="gen-btn" htmlType="submit">🚀 一键生成全部内容</${Button}>
            <div className="gen-hint">生成后，口碑面板 / 种草笔记 / 主页预览 同步产出</div>
          </${Form}>
        </${Card}>
        <div className="card-right">
          ${props.isDemo && html`<${DemoTip} text="示例名片 · 填写信息生成后替换为你的专属名片" />`}
          <div className="ver-label">精简版 · 适合挂在小红书主页简介下方，消费者点开主页直接可见</div>
          <${TrustMini} d=${props.data} />
          <div className="ver-label ver-label-2">详情版 · 游客点开「查看名片」后展开的完整信任背书</div>
          <${TrustCard} d=${props.data} />
        </div>
      </div>
    </section>`;
  }

  function TrendChart(props) {
    var vals = [88.0, 88.5, 89.1, 89.0, 90.2, 90.9, 91.5, 92.3, 93.0];
    var W = 560, H = 160, PL = 40, PR = 14, T = 20, B = 132;
    var lo = 85, hi = 95;
    var n = vals.length;
    var xs = vals.map(function (_, i) { return PL + (W - PL - PR) * i / (n - 1); });
    var ys = vals.map(function (v) { return T + (hi - v) * (B - T) / (hi - lo); });
    var pts = xs.map(function (x, i) { return x.toFixed(1) + ',' + ys[i].toFixed(1); });
    var line = 'M' + pts.join(' L');
    var area = line + ' L' + xs[n - 1].toFixed(1) + ',' + B + ' L' + PL + ',' + B + ' Z';
    var grid = [95, 90, 85].map(function (v) {
      var y = T + (hi - v) * (B - T) / (hi - lo);
      return html`<line key=${v} x1=${PL} y1=${y.toFixed(1)} x2=${W - PR} y2=${y.toFixed(1)} stroke="#EFE3CE" strokeDasharray="3 4" strokeWidth="1" />`;
    });
    var dots = xs.map(function (x, i) {
      return html`<circle key=${i} cx=${x.toFixed(1)} cy=${ys[i].toFixed(1)} r="3" fill="#D96429" stroke="#fff" strokeWidth="1.5" />`;
    });
    var midX = ((PL + (W - PR - PL) * 4 / (n - 1))).toFixed(1);
    return html`<div className="trend-box">
      <div className="trend-head">
        <span className="trend-title">近30天好评率趋势</span>
        <span className="trend-val">93%<i>↗ 持续走高</i></span>
      </div>
      <svg className="trend-svg" viewBox="0 0 560 160" role="img" aria-label="好评率趋势图">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D96429" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#D96429" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        ${grid}
        <path d=${area} fill="url(#tg)" />
        <path d=${line} fill="none" stroke="#D96429" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        ${dots}
        <circle cx=${xs[n - 1].toFixed(1)} cy=${ys[n - 1].toFixed(1)} r="5" fill="#D96429" stroke="#fff" strokeWidth="2" />
        <text x=${(xs[n - 1] - 10).toFixed(1)} y=${(ys[n - 1] - 11).toFixed(1)} className="tv" textAnchor="end">93%</text>
        <text x="4" y="24" className="ty">95%</text>
        <text x="4" y="80" className="ty">90%</text>
        <text x="4" y="136" className="ty">85%</text>
        <text x=${PL} y="154" className="tx" textAnchor="start">9月15日</text>
        <text x=${midX} y="154" className="tx" textAnchor="middle">9月29日</text>
        <text x=${W - PR} y="154" className="tx" textAnchor="end">10月12日</text>
      </svg>
    </div>`;
  }

  function buildReply(r, type, region) {
    if (r.stars === 5) {
      if (type === '包车司机') return '@' + r.nick + ' 谢谢认可！下次来' + region + '提前说，给你留车安排新路线，老客户有惊喜～';
      if (type === '小众定制社') return '@' + r.nick + ' 谢谢认可！下次行程提前两周定，给你升级一版新玩法～';
      return '@' + r.nick + ' 谢谢认可！下次来' + region + '带你走一条新开发的小众线～';
    }
    if (type === '包车司机') return '@' + r.nick + ' 抱歉让你久等了！旺季车档确实紧张，下次提前三天约车，给你留好位置～';
    return '@' + r.nick + ' 抱歉让你久等了！旺季档期确实紧张，下次提前一周约，给你优先排期～';
  }

  function ReputationSection(props) {
    var d = props.data;
    var posTags = d.posWords.map(function (w) {
      return html`<${Tag} key=${w} className="kw-tag pos">${w}</${Tag}>`;
    });
    var negTags = d.negWords.map(function (w) {
      return html`<${Tag} key=${w} className="kw-tag neg">${w}</${Tag}>`;
    });
    var scoreRows = d.scores.map(function (s) {
      return html`<div className="score-row" key=${s.dim}>
        <span className="score-dim">${s.dim}</span>
        <${Progress} percent=${s.val} showInfo=${false} strokeColor="#D96429" />
        <span className="score-val">${s.val}</span>
      </div>`;
    });
    var sen = d.sentiment;
    var reviewCards = d.reviews.map(function (r) {
      var stars = [];
      for (var i = 0; i < 5; i++) {
        stars.push(i < r.stars
          ? html`<b key=${i}>★</b>`
          : html`<i key=${i}>★</i>`);
      }
      return html`<div className="rv-card" key=${r.nick}>
        <div className="rv-ava" style=${{ background: r.grad }}>${r.ava}</div>
        <div className="rv-body">
          <div className="rv-head">
            <span className="rv-nick">${r.nick}</span>
            <span className="rv-date">${r.date}</span>
            <span className="rv-stars">${stars}</span>
            <${Button} size="small" className="rv-reply" onClick=${function () { copyText(buildReply(r, d.type, d.region)); }}>回复</${Button}>
          </div>
          <div className="rv-text">${r.text}</div>
          <div className="rv-tags">${r.tags}</div>
          <div className="rv-src">${r.src}</div>
        </div>
      </div>`;
    });
    return html`<section className="sec" id="reputation">
      <div className="sec-head">
        <${Title} level=${3} className="sec-title">📊 口碑面板</${Title}>
        <${Text} type="secondary" className="sec-sub">好评差评可视化，数据驱动体验改进</${Text}>
      </div>
      ${props.isDemo && html`<${DemoTip} text="口碑诊断仪表盘 · 当前为示例数据，生成后自动切换为你的真实诊断" />`}
      <${Card} className="panel">
        <div className="metrics-grid">
          <${Card} className="metric m3">
            <${Statistic} title="用户满意度" value="98" suffix="%" />
            <div className="yoy pos">↑ 0.6%<span>周同比</span></div>
          </${Card}>
          <${Card} className="metric m3">
            <${Statistic} title="好评占比" value=${sen.good} suffix="%" />
            <div className="yoy pos">↑ 1.2%<span>周同比</span></div>
          </${Card}>
          <${Card} className="metric m3">
            <${Statistic} title="待改进要点" value=${d.negWords.length} />
            <div className="yoy neg">↑ 1<span>周同比</span></div>
          </${Card}>
          <${Card} className="metric m2">
            <${Statistic} title="完单量" value="326" suffix="单" />
            <div className="yoy pos">↑ 12%<span>周同比</span></div>
          </${Card}>
          <${Card} className="metric m2">
            <${Statistic} title="询单量" value="418" suffix="次" />
            <div className="yoy pos">↑ 8%<span>周同比</span></div>
          </${Card}>
        </div>
        <${Card} className="metric trend-metric"><${TrendChart} /></${Card}>
        <div className="repo-block">
          <div className="repo-label">👍 高频好评词 <${Tag} className="badge-pos">关键词云</${Tag}></div>
          <div className="kw-cloud">${posTags}</div>
        </div>
        <div className="repo-block">
          <div className="repo-label">⚠️ 风险 / 差评词 <${Tag} className="badge-neg">需留意</${Tag}></div>
          <div className="kw-cloud">${negTags}</div>
        </div>
        <div className="repo-block">
          <div className="repo-label">📈 五维评分</div>
          ${scoreRows}
        </div>
        <div className="repo-block">
          <div className="repo-label">😊 口碑情感分布</div>
          <div className="sentiment">
            <div className="sentiment-bar">
              <span className="sent-seg good" style=${{ width: sen.good + '%' }}></span>
              <span className="sent-seg mid" style=${{ width: sen.mid + '%' }}></span>
              <span className="sent-seg bad" style=${{ width: sen.bad + '%' }}></span>
            </div>
            <div className="sent-legend">
              <span><i className="g"></i>好评 ${sen.good}%</span>
              <span><i className="m"></i>中评 ${sen.mid}%</span>
              <span><i className="b"></i>差评 ${sen.bad}%</span>
            </div>
          </div>
        </div>
        <div className="repo-block">
          <${Alert} type="warning" showIcon message=${d.advice} />
        </div>
        <div className="repo-block">
          <div className="repo-label">💬 客户评价明细 <${Tag} className="badge-pos">新增6条</${Tag}></div>
          <div className="rv-list">${reviewCards}</div>
          <div className="rv-more-wrap">
            <${Button} type="link" className="rv-more" onClick=${function () { message.info('完整评价列表整理中，敬请期待～'); }}>查看全部评价 →</${Button}>
          </div>
        </div>
      </${Card}>
    </section>`;
  }

  function NotesSection(props) {
    var d = props.data;
    var note = makeNote(d, props.variant, props.theme);
    return html`<section className="sec" id="notes">
      <div className="sec-head">
        <${Title} level=${3} className="sec-title">✍️ 种草笔记</${Title}>
        <${Text} type="secondary" className="sec-sub">AI 自动生成小红书网感文案，直接复制发布</${Text}>
      </div>
      ${props.isDemo && html`<${DemoTip} text="爆款笔记 · 当前为示例文案，生成后自动切换" />`}
      <${Card} className="panel">
        <${Search} className="note-search"
          placeholder="想突出的主题，如：亲子游 / 摄影 / 美食"
          value=${props.theme}
          onChange=${function (e) { props.setTheme(e.target.value); }}
          enterButton="✦ 应用主题"
          onSearch=${props.onApplyTheme}
        />
        <${Card} className="note-card">
          <div className="note-top">
            <span className="note-flag">📝 小红书笔记</span>
            <${Button} className="copy-btn" onClick=${function () { props.onCopy('note'); }}>📋 复制</${Button}>
          </div>
          <div className="note-media">
            <div className="note-texts">
              <div className="note-title">${note.title}</div>
              <div className="note-body">${note.body}</div>
              <div className="note-tags">${note.tags}</div>
            </div>
            <img className="note-pic" src="assets/sq-${(props.variant * 7 + 3) % 10 + 1}.jpg?v=s1"
              alt="四川实景配图"
              onError=${function (e) { e.target.style.display = 'none'; }} />
          </div>
          <div className="note-actions">
            <${Button} className="swap-btn" onClick=${props.onSwap}>🎲 换一篇</${Button}>
          </div>
        </${Card}>
      </${Card}>
    </section>`;
  }

  function ProfileSection(props) {
    var d = props.data;
    var times = ['3天前', '10-02', '09-26', '1周前', '09-18', '09-01'];
    var grid = d.gridNotes.map(function (n, i) {
      return html`<div className="p-note" key=${n.title}>
        <div className="p-cover" style=${{ background: n.grad }}>
          <span className="p-cov-emoji">${n.emoji}</span>
          <img src=${n.img} alt="" onerror=${function (e) { e.target.style.display = 'none'; }} />
        </div>
        <div className="p-title">${n.title}</div>
        <div className="p-nmeta">
          <span className="p-nnick">${d.tag} · ${times[i % times.length]}</span>
          <span className="p-nlike"><i>♥</i> ${n.likes}</span>
        </div>
      </div>`;
    });
    return html`<section className="sec" id="profile-preview">
      <div className="sec-head">
        <${Title} level=${3} className="sec-title">👤 主页预览</${Title}>
        <${Text} type="secondary" className="sec-sub">模拟主页第一眼 + 点开「查看名片」后的打开态</${Text}>
      </div>
      ${props.isDemo && html`<${DemoTip} text="主页预览 · 当前为示例数据，生成后自动切换为你的主页" />`}
      <div className="profile-wrap">
        <div className="mock">
        <div className="phone">
          <div className="phone-notch"></div>
          <div className="phone-screen">
            <div className="p-statusbar"><span>9:41</span><span>📶 🔋</span></div>
            <div className="p-topbar"><span>⤴</span><span>⋯</span></div>
            <div className="p-profile">
              <div className="avatar"><img src="assets/guide-avatar.jpg?v=av4" alt="" /></div>
              <div className="p-meta">
                <div className="nick">${d.tag}</div>
                <div className="p-uid">小红书号：guide_8888</div>
                <div className="p-loc">📍 ${d.region} · 本地向导</div>
              </div>
            </div>
            <div className="p-bio">${d.bio}</div>
            <${TrustMini} d=${d} />
            <div className="p-btns">
              <span className="p-follow">+ 关注</span>
              <span className="p-dm">发私信</span>
            </div>
            <div className="p-statsrow">
              <span><b>${d.stats.fans}</b>粉丝</span>
              <span><b>${d.stats.likes}</b>获赞与收藏</span>
              <span><b>${d.stats.collect}</b>收藏</span>
            </div>
            <div className="p-tabs">
              <span className="p-tab on">笔记 ${grid.length}</span>
              <span className="p-tab">收藏 ${d.stats.collect}</span>
              <span className="p-tab">赞过</span>
            </div>
            <div className="p-feed">${grid}</div>
          </div>
        </div>
        <div className="mock-cap">📱 小红书主页 · 第一眼</div>
        </div>
        <div className="mock">
        <div className="phone card-phone">
          <div className="phone-notch"></div>
          <div className="phone-screen">
            <div className="p-statusbar"><span>9:41</span><span>📶 🔋</span></div>
            <div className="cp-topbar"><span className="cp-back">‹ 返回</span><span className="cp-title">信任名片</span><span>⋯</span></div>
            <${TrustCard} d=${d} />
            <div className="cp-foot">—— 名片底部 · 用户可一键复制亮点话术 ——</div>
          </div>
        </div>
        <div className="mock-cap">📇 点开「查看名片」后 · 打开态</div>
        </div>
      </div>
    </section>`;
  }

  function ScriptsSection(props) {
    var chips = PRESET_Q.map(function (q) {
      return html`<${Button} key=${q} size="small" className="q-chip" onClick=${function () { props.ask(q); }}>${q}</${Button}>`;
    });
    return html`<section className="sec" id="scripts">
      <div className="sec-head">
        <${Title} level=${3} className="sec-title">💬 评论区 & 私信 回复话术</${Title}>
        <${Text} type="secondary" className="sec-sub">有人评论问价/问联系方式？AI帮你回得专业又不违规</${Text}>
      </div>
      <${Card} className="panel">
        <div className="script-q-label">🔥 高频问题（点一下直接生成）</div>
        <div className="script-q-row">${chips}</div>
        <${Search} className="script-search"
          placeholder="或者输入你被问到的问题…"
          value=${props.q}
          onChange=${function (e) { props.setQ(e.target.value); }}
          enterButton="✦ 生成话术"
          onSearch=${function (v) { props.ask(v); }}
        />
        ${props.script
          ? html`<${Card} className="script-card">
              <div className="note-top">
                <span className="note-flag">💬 回复话术</span>
                <${Button} className="copy-btn" onClick=${props.onCopy}>📋 复制</${Button}>
              </div>
              <div className="script-q">问：${props.script.q}</div>
              <div className="script-a">${props.script.text}</div>
            </${Card}>`
          : html`<${DemoTip} text="👆 点一个高频问题或输入你的问题，马上生成一条能直接发的回复（不留联系方式、不报具体价格、引导私信）" />`}
      </${Card}>
    </section>`;
  }

  /* ================= 应用根组件 ================= */
  function App() {
    var formState = useState({ type: '独立向导', name: '', region: '', desc: '', sampleQuote: '', sampleQuote2: '' });
    var form = formState[0], setForm = formState[1];
    var genState = useState(false);
    var generated = genState[0], setGenerated = genState[1];
    var dataState = useState(null);
    var genData = dataState[0], setGenData = dataState[1];
    var variantState = useState(0);
    var variant = variantState[0], setVariant = variantState[1];
    var themeState = useState('');
    var theme = themeState[0], setTheme = themeState[1];
    var scriptQState = useState('');
    var scriptQ = scriptQState[0], setScriptQ = scriptQState[1];
    var scriptOutState = useState(null);
    var scriptOut = scriptOutState[0], setScriptOut = scriptOutState[1];
    var activeState = useState('hero');
    var activeId = activeState[0], setActiveId = activeState[1];
    var demoRef = useRef(null);

    var isDemo = !(generated && genData);
    var data = isDemo
      ? (demoRef.current || (demoRef.current = buildDemoData()))
      : genData;

    /* ---- 滚动高亮：实时视口位置 + 400ms 自愈（与 v3 行为一致） ---- */
    useEffect(function () {
      var HEADER = 90;
      function compute() {
        if (document.visibilityState !== 'visible' || window.innerHeight < 50) return;
        var first = document.getElementById(NAV[0].id);
        if (!first || first.getBoundingClientRect().height === 0) return;
        var id = 'hero';
        NAV.forEach(function (n) {
          var sec = document.getElementById(n.id);
          if (sec && sec.getBoundingClientRect().top <= HEADER) id = n.id;
        });
        var doc = document.documentElement;
        if (doc.scrollHeight - (window.innerHeight + window.scrollY) < 2) id = NAV[NAV.length - 1].id;
        setActiveId(id);
      }
      window.addEventListener('scroll', compute, { passive: true });
      window.addEventListener('resize', compute);
      document.addEventListener('visibilitychange', compute);
      var timer = setInterval(compute, 400);
      compute();
      return function () {
        window.removeEventListener('scroll', compute);
        window.removeEventListener('resize', compute);
        document.removeEventListener('visibilitychange', compute);
        clearInterval(timer);
      };
    }, []);

    function generate() {
      var name = (form.name || '').trim();
      var region = (form.region || '').trim();
      if (!name || !region) {
        message.warning('请先填写「主理人称呼」和「所在地区」～');
        return;
      }
      setGenData(buildData(form));
      setGenerated(true);
      setVariant(0);
      setTheme('');
      message.success('已生成 信任名片 / 口碑面板 / 种草笔记 / 主页预览');
    }

    function toggleChip(kw) {
      setForm(function (f) {
        var cur = (f.desc || '').trim();
        if (cur.indexOf(kw) !== -1) {
          cur = cur.split(kw).join('').replace(/，+/g, '，').replace(/^，|，$/g, '').trim();
        } else {
          cur = cur ? cur + '，' + kw : kw;
        }
        return Object.assign({}, f, { desc: cur });
      });
    }

    function applySample(s) {
      setForm({ type: s.type, name: s.name, region: s.region, desc: s.desc, sampleQuote: s.quote, sampleQuote2: s.quote2 });
    }

    function handleCopy(kind) {
      copyText(copyPayload(kind, data, variant, theme));
    }

    function swapNote() {
      setVariant(function (v) { return (v + 1) % 4; });
      message.success('换了一篇～');
    }

    function applyTheme() {
      setVariant(randInt(0, 3));
      message.success('已按主题重新生成笔记');
    }

    function askScript(question) {
      var q = (question || '').trim();
      if (!q) { message.warning('先点一个高频问题，或输入你被问到的问题～'); return; }
      setScriptQ(q);
      var list = SCRIPTS[matchScriptCat(q)];
      setScriptOut({ q: q, text: list[randInt(0, list.length - 1)] });
    }

    function copyScript() {
      if (scriptOut) copyText(scriptOut.text);
    }

    return html`<${Layout} className="wb">
      <${TopBar} />
      <${Layout} className="wb-body" hasSider>
        <${Sider} className="wb-sider" theme="light" width=${220}>
          <${SideMenu} mode="inline" activeId=${activeId} onNav=${scrollToId} />
        </${Sider}>
        <${Content} className="wb-main">
          <div className="side-h">
            <${SideMenu} mode="horizontal" activeId=${activeId} onNav=${scrollToId} />
          </div>
          <${HeroSection} onGo=${scrollToId} />
          <${CardBuilderSection}
            form=${form} setForm=${setForm}
            onGenerate=${generate}
            toggleChip=${toggleChip}
            applySample=${applySample}
            data=${data} isDemo=${isDemo}
            onCopy=${handleCopy}
          />
          <${ProfileSection} data=${data} isDemo=${isDemo} />
          <${ReputationSection} data=${data} isDemo=${isDemo} />
          <${NotesSection}
            data=${data} isDemo=${isDemo}
            variant=${variant} theme=${theme}
            setTheme=${setTheme}
            onApplyTheme=${applyTheme}
            onSwap=${swapNote}
            onCopy=${handleCopy}
          />
          <${ScriptsSection}
            q=${scriptQ} setQ=${setScriptQ}
            script=${scriptOut}
            ask=${askScript}
            onCopy=${copyScript}
          />
          <div className="wb-footer">
            <div className="footer-brand">
              <span className="logo" aria-label="种草 logo"><svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 2.5) rotate(-7 17 15)"><path d="M17 14.5 C12.3 14.2 8.8 11.2 8.9 7.5 C9 4.8 11.4 3.5 13.5 4.8 C15.8 6.2 16.9 10 17 14.5 Z" fill="#52C9A0" /><path d="M17 14.5 C22.2 14.2 25.9 11.4 25.8 7.3 C25.7 4.4 23 3 20.5 4.5 C17.9 6 17.1 10 17 14.5 Z" fill="#52C9A0" /><rect x="15.8" y="13.8" width="2.4" height="11.5" rx="1.2" fill="#52C9A0" /></g></svg></span>
              <span className="footer-name">本地旅行主理人 · 一站式小红书账号运营工作台</span>
            </div>
            <p className="footer-tag">AI 帮你搞定小红书获客 · 信任名片 / 口碑面板 / 种草笔记 / 主页预览 / 咨询话术</p>
            <div className="ver-mark">v73 · 16:17</div>
          </div>
        </${Content}>
      </${Layout}>
    </${Layout}>`;
  }

  /* ================= 挂载 + 打开即回顶 ================= */
  ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);

  try {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  } catch (e) {}

  function forceTop() {
    var h = document.documentElement;
    var prev = h.style.scrollBehavior;
    h.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    h.style.scrollBehavior = prev;
  }
  forceTop();
  window.addEventListener('load', function () {
    forceTop();
    requestAnimationFrame(forceTop);
    setTimeout(forceTop, 120);
    setTimeout(forceTop, 400);
  });
  window.addEventListener('pageshow', function () { forceTop(); });
})();
