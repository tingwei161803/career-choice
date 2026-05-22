/* Career Compass — 測驗流程 */
(function () {
  'use strict';
  if (!window.CC) return;

  var Q = CC.QUESTIONS;
  var STAGES = CC.STAGES;
  var TOTAL = Q.length + 1; // 含最後的職涯階段題

  var answers = new Array(Q.length).fill(null);
  var stage = null;
  var idx = 0;

  var elNum = document.getElementById('q-num');
  var elTitle = document.getElementById('q-title');
  var elOpts = document.getElementById('q-opts');
  var elBar = document.getElementById('q-bar');
  var elStep = document.getElementById('q-step');
  var elBack = document.getElementById('q-back');

  function isStage() { return idx === Q.length; }

  function render() {
    var pct = Math.round((idx / TOTAL) * 100);
    elBar.style.width = pct + '%';
    elStep.textContent = (idx + 1).toString().padStart(2, '0') + ' / ' + TOTAL.toString().padStart(2, '0');
    elBack.disabled = idx === 0;

    var card = document.getElementById('q-card');
    card.style.animation = 'none';
    void card.offsetWidth; // reflow 重播動畫
    card.style.animation = '';

    if (isStage()) {
      elNum.textContent = 'Final';
      elTitle.textContent = '你目前處於哪個職涯階段？';
      elOpts.innerHTML = '';
      STAGES.forEach(function (s) {
        elOpts.appendChild(makeOpt(s.label + '　' + s.sub, stage === s.key, function () {
          stage = s.key; render(); setTimeout(finish, 260);
        }));
      });
      return;
    }

    var qu = Q[idx];
    elNum.textContent = 'Q' + (idx + 1);
    elTitle.textContent = qu.q;
    elOpts.innerHTML = '';
    qu.opts.forEach(function (o, oi) {
      var letter = ['A', 'B', 'C', 'D'][oi];
      elOpts.appendChild(makeOpt(o.t, answers[idx] === oi, function () {
        answers[idx] = oi;
        // 視覺回饋後前進
        Array.prototype.forEach.call(elOpts.children, function (c) { c.classList.remove('sel'); });
        elOpts.children[oi].classList.add('sel');
        setTimeout(next, 240);
      }, letter));
    });
  }

  function makeOpt(text, selected, onClick, letter) {
    var b = document.createElement('button');
    b.className = 'opt' + (selected ? ' sel' : '');
    b.type = 'button';
    var mk = document.createElement('span');
    mk.className = 'mk';
    mk.textContent = letter || '◆';
    var sp = document.createElement('span');
    sp.textContent = text;
    b.appendChild(mk); b.appendChild(sp);
    b.addEventListener('click', onClick);
    return b;
  }

  function next() {
    if (idx < TOTAL - 1) { idx++; render(); }
  }
  function back() {
    if (idx > 0) { idx--; render(); }
  }

  function finish() {
    if (answers.some(function (a) { return a === null; }) || !stage) return;
    var result = CC.score(answers);
    var payload = { x: result.x, y: result.y, matches: result.matches, primary: result.primary, ranked: result.ranked, stage: stage, ts: Date.now() };
    try { localStorage.setItem('cc_result', JSON.stringify(payload)); } catch (e) {}
    // 也用 URL 傳遞，確保 file:// 下也可直接帶入
    var qs = 'p=' + payload.primary + '&x=' + payload.x.toFixed(3) + '&y=' + payload.y.toFixed(3) + '&s=' + stage +
      '&m=' + result.matches.map(function (m) { return m.key + ':' + m.match; }).join(',');
    location.href = 'result.html?' + qs;
  }

  if (elBack) elBack.addEventListener('click', back);
  render();
})();
