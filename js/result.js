/* Career Compass — 結果頁：讀取作答、計算、繪製 SVG 雷達圖與 2D 定位地圖 */
(function () {
  'use strict';
  if (!window.CC) return;

  var C = CC.COMPANIES, ORDER = CC.ORDER;

  // ---- 讀取結果：優先 localStorage，其次 URL 參數 ----
  function load() {
    var data = null;
    try { data = JSON.parse(localStorage.getItem('cc_result') || 'null'); } catch (e) {}
    var p = new URLSearchParams(location.search);
    if (p.get('p')) {
      var matches = (p.get('m') || '').split(',').filter(Boolean).map(function (s) {
        var kv = s.split(':'); return { key: kv[0], match: parseInt(kv[1], 10) };
      });
      data = {
        primary: p.get('p'),
        x: parseFloat(p.get('x')) || 0,
        y: parseFloat(p.get('y')) || 0,
        stage: p.get('s') || 's2',
        matches: matches.length ? matches : null
      };
    }
    return data;
  }

  var data = load();
  if (!data || !data.primary) {
    location.replace('quiz.html');
    return;
  }
  if (!data.matches) {
    // 後備：用座標重算契合度
    var maxDist = 2 * Math.SQRT2;
    data.matches = ORDER.map(function (k) {
      var c = C[k].center;
      var d = Math.sqrt(Math.pow(data.x - c.x, 2) + Math.pow(data.y - c.y, 2));
      return { key: k, match: Math.round((1 - d / maxDist) * 100) };
    });
  }
  var matchMap = {}; data.matches.forEach(function (m) { matchMap[m.key] = m.match; });

  var primary = C[data.primary];
  var root = document.documentElement;
  root.style.setProperty('--co', primary.color);
  root.style.setProperty('--co-soft', primary.colorSoft);

  // ---- 主推薦文案 ----
  setText('r-quadrant', primary.quadrant);
  setText('r-name', primary.name);
  setText('r-ability', '你的核心修煉：' + primary.abilityFull);
  setText('r-oneliner', primary.oneLiner);

  // ---- 契合度排行 + 雷達 ----
  var ranked = data.matches.slice().sort(function (a, b) { return b.match - a.match; });
  var rows = document.getElementById('r-matches');
  if (rows) {
    ranked.forEach(function (m, i) {
      var co = C[m.key];
      var row = document.createElement('div');
      row.className = 'match-row';
      row.innerHTML =
        '<span class="nm">' + co.name + '</span>' +
        '<span class="bar"><i style="background:' + co.color + '"></i></span>' +
        '<span class="pct">' + m.match + '%</span>';
      rows.appendChild(row);
      // 動畫長條
      var bar = row.querySelector('i');
      setTimeout(function () { bar.style.width = m.match + '%'; }, 120 + i * 110);
    });
  }

  drawRadar(matchMap);
  drawMap(data.x, data.y, data.primary);

  // ---- 修煉建議 ----
  setText('advice-ability', primary.ability);
  setText('advice-text', adviceFor(primary));

  // ---- 職涯階段導航 ----
  var stage = CC.STAGES.filter(function (s) { return s.key === data.stage; })[0] || CC.STAGES[1];
  setText('stage-label', stage.label + '・' + stage.sub);
  setText('stage-advice', stage.advice);
  var recoWrap = document.getElementById('stage-recos');
  if (recoWrap) {
    var note = document.createElement('p');
    note.style.color = 'var(--paper-dim)';
    note.style.fontSize = '0.92rem';
    note.style.margin = '14px 0 10px';
    note.innerHTML = '此階段，Alex 建議的舞台是：';
    recoWrap.appendChild(note);
    var line = document.createElement('div');
    line.className = 'tags';
    stage.recommend.forEach(function (k) {
      var co = C[k];
      var s = document.createElement('span');
      s.textContent = co.name + '（' + co.ability + '）';
      s.style.color = co.color; s.style.borderColor = co.color; s.style.background = co.colorSoft;
      line.appendChild(s);
    });
    recoWrap.appendChild(line);
    if (stage.recommend.indexOf(data.primary) > -1) {
      var ok = document.createElement('p');
      ok.style.color = primary.color; ok.style.fontSize = '0.92rem'; ok.style.marginTop = '14px';
      ok.textContent = '✓ 你的測驗結果與此階段建議高度吻合——方向對了，放手去修煉。';
      recoWrap.appendChild(ok);
    } else {
      var diff = document.createElement('p');
      diff.style.color = 'var(--muted)'; diff.style.fontSize = '0.92rem'; diff.style.marginTop = '14px';
      diff.textContent = '你的傾向（' + primary.name + '）與此階段的典型路線略有差異——沒有對錯，重點是想清楚你正在拿什麼換取人生選擇權。';
      recoWrap.appendChild(diff);
    }
  }

  // ====================== SVG 雷達圖 ======================
  function drawRadar(mm) {
    var svg = document.getElementById('radar');
    if (!svg) return;
    var S = 320, cx = S / 2, cy = S / 2, R = 116;
    var keys = ORDER; // 上(中小) 右(上市櫃) 下(外商) 左(美商) → 用 4 軸
    var labels = keys.map(function (k) { return C[k].name; });
    // 4 軸方向：上、右、下、左
    var dirs = [
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
    ];
    var ns = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', '0 0 ' + S + ' ' + S);
    svg.innerHTML = '';

    // 同心格線
    [0.25, 0.5, 0.75, 1].forEach(function (r) {
      var pts = dirs.map(function (d) { return (cx + d.x * R * r) + ',' + (cy + d.y * R * r); }).join(' ');
      var poly = document.createElementNS(ns, 'polygon');
      poly.setAttribute('points', pts);
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', 'rgba(232,226,211,0.10)');
      poly.setAttribute('stroke-width', '1');
      svg.appendChild(poly);
    });
    // 軸線 + 標籤
    dirs.forEach(function (d, i) {
      var line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', cx + d.x * R); line.setAttribute('y2', cy + d.y * R);
      line.setAttribute('stroke', 'rgba(232,226,211,0.10)');
      svg.appendChild(line);
      var lx = cx + d.x * (R + 22), ly = cy + d.y * (R + 22);
      var tx = document.createElementNS(ns, 'text');
      tx.setAttribute('x', lx); tx.setAttribute('y', ly + 4);
      tx.setAttribute('text-anchor', d.x === 0 ? 'middle' : (d.x > 0 ? 'end' : 'start'));
      if (d.x > 0) tx.setAttribute('text-anchor', 'start');
      if (d.x < 0) tx.setAttribute('text-anchor', 'end');
      tx.setAttribute('fill', C[keys[i]].color);
      tx.setAttribute('font-size', '12');
      tx.setAttribute('font-family', 'Noto Sans TC, sans-serif');
      tx.textContent = labels[i];
      svg.appendChild(tx);
    });
    // 資料多邊形
    var dataPts = dirs.map(function (d, i) {
      var v = (mm[keys[i]] || 0) / 100;
      return (cx + d.x * R * v) + ',' + (cy + d.y * R * v);
    }).join(' ');
    var area = document.createElementNS(ns, 'polygon');
    area.setAttribute('points', dataPts);
    area.setAttribute('fill', hexA(primary.color, 0.28));
    area.setAttribute('stroke', primary.color);
    area.setAttribute('stroke-width', '2');
    area.setAttribute('stroke-linejoin', 'round');
    area.style.transformOrigin = cx + 'px ' + cy + 'px';
    area.style.animation = 'radarIn .9s cubic-bezier(.22,.61,.36,1) both';
    svg.appendChild(area);
    // 頂點圓點
    dirs.forEach(function (d, i) {
      var v = (mm[keys[i]] || 0) / 100;
      var dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', cx + d.x * R * v); dot.setAttribute('cy', cy + d.y * R * v);
      dot.setAttribute('r', '3.4'); dot.setAttribute('fill', C[keys[i]].color);
      svg.appendChild(dot);
    });
  }

  // ====================== SVG 2D 定位地圖 ======================
  function drawMap(x, y, pk) {
    var svg = document.getElementById('map');
    if (!svg) return;
    var S = 360, pad = 46, span = S - pad * 2, cx = S / 2, cy = S / 2;
    var ns = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', '0 0 ' + S + ' ' + S);
    svg.innerHTML = '';

    function px(v) { return cx + v * (span / 2); }   // v in [-1,1]
    function py(v) { return cy - v * (span / 2); }   // y 正向朝上(制度)

    // 象限底色
    var quad = [
      { k: 'listed', x: -1, y: 1 }, { k: 'mnc', x: 1, y: 1 },
      { k: 'sme', x: -1, y: -1 }, { k: 'us', x: 1, y: -1 }
    ];
    quad.forEach(function (q) {
      var rx = q.x < 0 ? pad : cx, ry = q.y > 0 ? pad : cy;
      var rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', rx); rect.setAttribute('y', ry);
      rect.setAttribute('width', span / 2); rect.setAttribute('height', span / 2);
      rect.setAttribute('fill', hexA(C[q.k].color, q.k === pk ? 0.16 : 0.05));
      svg.appendChild(rect);
      // 象限標籤
      var lx = px(q.x * 0.5), ly = py(q.y * 0.5);
      var t = document.createElementNS(ns, 'text');
      t.setAttribute('x', lx); t.setAttribute('y', ly);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', C[q.k].color);
      t.setAttribute('font-size', '13');
      t.setAttribute('font-family', 'Noto Serif TC, serif');
      t.setAttribute('font-weight', '700');
      t.setAttribute('opacity', q.k === pk ? '1' : '0.55');
      t.textContent = C[q.k].name;
      svg.appendChild(t);
    });

    // 外框 + 十字軸
    addLine(svg, ns, pad, cy, S - pad, cy, 'rgba(232,226,211,0.22)');
    addLine(svg, ns, cx, pad, cx, S - pad, 'rgba(232,226,211,0.22)');
    var frame = document.createElementNS(ns, 'rect');
    frame.setAttribute('x', pad); frame.setAttribute('y', pad);
    frame.setAttribute('width', span); frame.setAttribute('height', span);
    frame.setAttribute('fill', 'none'); frame.setAttribute('stroke', 'rgba(232,226,211,0.18)');
    svg.appendChild(frame);

    // 軸標籤
    axisLabel(svg, ns, cx, pad - 14, '制度厚重');
    axisLabel(svg, ns, cx, S - pad + 24, '扁平彈性');
    axisLabel(svg, ns, pad - 6, cy - 10, '本土', 'end');
    axisLabel(svg, ns, S - pad + 6, cy - 10, '國際化', 'start');

    // 使用者座標點
    var ux = px(x), uy = py(y);
    var halo = document.createElementNS(ns, 'circle');
    halo.setAttribute('cx', ux); halo.setAttribute('cy', uy); halo.setAttribute('r', '20');
    halo.setAttribute('fill', hexA(primary.color, 0.25));
    halo.style.transformOrigin = ux + 'px ' + uy + 'px';
    halo.style.animation = 'pulse 2.4s ease-in-out infinite';
    svg.appendChild(halo);
    var dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', ux); dot.setAttribute('cy', uy); dot.setAttribute('r', '7');
    dot.setAttribute('fill', primary.color);
    dot.setAttribute('stroke', '#0d1117'); dot.setAttribute('stroke-width', '2');
    svg.appendChild(dot);
    var you = document.createElementNS(ns, 'text');
    you.setAttribute('x', ux); you.setAttribute('y', uy - 16);
    you.setAttribute('text-anchor', 'middle'); you.setAttribute('fill', 'var(--paper)');
    you.setAttribute('font-size', '12'); you.setAttribute('font-family', 'Fraunces, serif');
    you.setAttribute('font-style', 'italic');
    you.textContent = 'YOU';
    svg.appendChild(you);

    // 入場：座標點縮放浮現
    [halo, dot, you].forEach(function (el) {
      el.style.transformOrigin = ux + 'px ' + uy + 'px';
      el.style.animation = 'dotIn .8s cubic-bezier(.22,.61,.36,1) both';
    });
  }

  // ---- helpers ----
  function addLine(svg, ns, x1, y1, x2, y2, stroke) {
    var l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', stroke); svg.appendChild(l);
  }
  function axisLabel(svg, ns, x, y, text, anchor) {
    var t = document.createElementNS(ns, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('text-anchor', anchor || 'middle');
    t.setAttribute('fill', 'var(--muted)'); t.setAttribute('font-size', '11');
    t.setAttribute('font-family', 'Noto Sans TC, sans-serif'); t.setAttribute('letter-spacing', '0.08em');
    t.textContent = text; svg.appendChild(t);
  }
  function hexA(hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function adviceFor(co) {
    var map = {
      sme: '不要抱怨制度亂。在這裡你要練的是從 0 到 1、無中生有的破局能力。把中小企業當試煉場——當你能一個人搞定一條龍，你才真正擁有不被市場淘汰的底氣。',
      listed: '在大系統裡，學會推動龐大科層體系的協調力與借力使力。看懂局、認清勢，把組織的資源變成你履歷上的戰果，而不是體系裡一顆面目模糊的螺絲釘。',
      mnc: '利用外商完善的 SOP 與國際資源，建立你專業的方法論與個人品牌。當你掌握了跨國溝通的底牌，你的舞台就不再局限於單一市場。',
      us: '純美商是高階將領的淘金地。把自己的時薪與產出價值最大化，賺取高回報的同時，時刻保持隨時能被市場檢驗的即戰力，把主動權牢牢握在手上。'
    };
    return map[co.key] || '';
  }
  function setText(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }
})();
