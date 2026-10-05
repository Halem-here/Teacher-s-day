// Teachers' Day
(() => {
  'use strict';

  console.log('☕ 850101');

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const teachers = Array.isArray(window.TEACHERS) ? window.TEACHERS : [];
  const byId = Object.fromEntries(teachers.map((t) => [t.id, t]));

  const DATE = "Happy Teachers' Day — 5 October";

  let skip = false;
  const sleep = (ms) => new Promise((r) => setTimeout(r, skip || reduce ? 0 : ms));
  addEventListener('pointerdown', () => { skip = true; });
  addEventListener('keydown', () => { skip = true; });


  //Hash password sys 
  function sha256Fallback(str) {
    const rotr = (v, n) => (v >>> n) | (v << (32 - n));
    const K = [], H = [];
    for (let n = 2, c = 0; c < 64; n++) {
      let prime = true;
      for (let i = 2; i * i <= n; i++) if (n % i === 0) { prime = false; break; }
      if (!prime) continue;
      if (c < 8) H[c] = (Math.pow(n, 1 / 2) % 1) * 4294967296 | 0;
      K[c++] = (Math.pow(n, 1 / 3) % 1) * 4294967296 | 0;
    }
    const bytes = Array.from(new TextEncoder().encode(str));
    const bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    const hi = Math.floor(bitLen / 4294967296), lo = bitLen >>> 0;
    for (let i = 3; i >= 0; i--) bytes.push((hi >>> (i * 8)) & 255);
    for (let i = 3; i >= 0; i--) bytes.push((lo >>> (i * 8)) & 255);
    const w = new Array(64);
    for (let off = 0; off < bytes.length; off += 64) {
      for (let i = 0; i < 16; i++) {
        w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
      }
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
  // </sha256-fallback> hash 

  async function sha256(text) {
    if (window.crypto && window.crypto.subtle) {
      try {
        const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch (_) { /* use the fallback below */ }
    }
    return sha256Fallback(text);
  }


  const canvas = $('#fx');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, effect = null, raf = 0, last = 0;
  const rand = (a, b) => a + Math.random() * (b - a);

  const embers = (() => {
    let list = [];
    const make = (anywhere) => ({
      x: rand(0, W), y: anywhere ? rand(0, H) : H + 10,
      r: rand(.6, 1.7), vy: rand(14, 40), sway: rand(.4, 1.3), p: rand(0, 6.28)
    });
    return {
      init() { list = Array.from({ length: Math.min(45, Math.round(W / 24)) }, () => make(true)); },
      frame(dt, t) {
        ctx.clearRect(0, 0, W, H);
        list.forEach((p, i) => {
          p.y -= p.vy * dt;
          p.x += Math.sin(t * p.sway + p.p) * 10 * dt;
          if (p.y < -10) list[i] = make(false);
          const a = Math.min(1, p.y / H * 1.3) * (.25 + .3 * Math.abs(Math.sin(t + p.p)));
          ctx.fillStyle = `rgba(211,24,47,${Math.max(a, 0).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        });
      }
    };
  })();

  const rain = (() => {
    const chars = '0123456789abcdef{}[]<>/$#=+'.split('');
    const size = 16;
    let cols = [], acc = 0;
    return {
      init() { cols = Array.from({ length: Math.ceil(W / size) }, () => rand(-50, 0)); },
      frame(dt) {
        acc += dt;
        if (acc < .07) return;
        acc = 0;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,.12)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = size + 'px monospace';
        ctx.fillStyle = 'rgba(47,208,114,.8)';
        cols.forEach((y, i) => {
          if (y > 0) ctx.fillText(chars[(Math.random() * chars.length) | 0], i * size, y * size);
          cols[i] = y * size > H && Math.random() > .975 ? rand(-20, 0) : y + 1;
        });
      }
    };
  })();

  const effects = { naqaab: embers, solo: rain };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (effect) effect.init();
  }
  function tick(ms) {
    raf = requestAnimationFrame(tick);
    const t = ms / 1000;
    effect.frame(Math.min(t - last, .05), t);
    last = t;
  }
  function setEffect(name) {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, W, H);
    effect = effects[name] || null;
    if (!effect || reduce) return;
    effect.init();
    last = performance.now() / 1000;
    raf = requestAnimationFrame(tick);
  }
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (effect && !reduce) { last = performance.now() / 1000; raf = requestAnimationFrame(tick); }
  });


//3 screen switchable 

  const screens = { landing: $('#landing'), gate: $('#gate'), page: $('#page') };
  let current = screens.landing;
  let switching = false;

  async function show(name, theme) {
    if (switching) return;
    switching = true;
    const from = current, to = screens[name];
    from.classList.remove('on');
    await new Promise((r) => setTimeout(r, reduce ? 0 : 350));
    from.hidden = true;
    document.body.dataset.theme = theme;
    setEffect(theme);
    to.hidden = false;
    scrollTo(0, 0);
    current = to;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    to.classList.add('on');
    switching = false;
  }


 //start the pgs

  const SKULL = `
    <svg class="nq-skull" viewBox="0 0 200 236" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M100 12C52 12 22 48 22 94c0 30 12 46 26 58v24c0 8 6 14 14 14h76c8 0 14-6 14-14v-24c14-12 26-28 26-58 0-46-30-82-78-82Z"/>
      <path d="M121 14l-9 27 11 17-13 24" opacity=".7"/>
      <path d="M64 96c0-14 16-20 26-8 6 8 4 24-8 28-12 2-18-8-18-20Z" fill="currentColor" fill-opacity=".55"/>
      <path d="M136 96c0-14-16-20-26-8-6 8-4 24 8 28 12 2 18-8 18-20Z" fill="currentColor" fill-opacity=".55"/>
      <path d="M100 121l-10 22 7-2 3 4 3-4 7 2-10-22Z"/>
      <path d="M62 190v18c0 8 6 14 14 14h48c8 0 14-6 14-14v-18"/>
      <path d="M62 190h76M71.5 190v32M81 190v32M90.5 190v32M100 190v32M109.5 190v32M119 190v32M128.5 190v32"/>
    </svg>`;

  const paragraphs = (t) => t.message.map((p) => `<p>${esc(p)}</p>`).join('');
  const isCmd = (line) => line.startsWith('$ ');
  const staticLog = (lines) => lines.map((l) => (isCmd(l) ? `<span class="cmd">${esc(l)}</span>` : esc(l))).join('\n');
  const plain = (t) => `<span class="sr-only">${esc(t.terminal.join('\n'))}</span>`;

  const pages = {
    naqaab: (t) => `
      <article class="nq">
        ${SKULL}
        <div class="nq-col">
          <h1 class="nq-name glitch fade" data-text="${esc(t.name)}">${esc(t.name)}</h1>
          <p class="nq-role fade">${esc(t.role)}</p>
          ${plain(t)}
          <pre class="nq-term fade" id="typed" aria-hidden="true"></pre>
          <h2 class="nq-h fade">${esc(t.messageTitle)}</h2>
          <div class="nq-msg fade">${paragraphs(t)}</div>
          ${riddleHTML(t)}
          <p class="nq-thanks fade">${esc(t.thanks)}</p>
          <p class="nq-sign fade">— ${esc(t.signoff)}</p>
          <footer class="nq-foot fade">
            <span class="date">${DATE}</span>
            <button class="link" type="button" data-leave>← return</button>
          </footer>
        </div>
      </article>`,

    asfandyar: (t) => `
      <article class="as">
        <aside class="as-side fade">
          <h1 class="as-name">${esc(t.name)}</h1>
          <p class="as-role">${esc(t.role)}</p>
          <dl class="as-meta">
            <dt>event</dt><dd>Teachers' Day</dd>
            <dt>from</dt><dd>${esc(t.signoff.toLowerCase())}</dd>
          </dl>
          <p class="date">${DATE}</p>
          <button class="link" type="button" data-leave style="text-align:left">← return</button>
        </aside>
        <div class="as-body">
          <section class="fade">
            <h2><span>01</span>Overview</h2>
            <pre class="as-term">${staticLog(t.terminal)}</pre>
          </section>
          <section class="fade">
            <h2><span>02</span>${esc(t.messageTitle)}</h2>
            ${paragraphs(t)}
          </section>
          ${riddleHTML(t)}
          <section class="fade">
            <h2><span>03</span>Closing</h2>
            <p class="thanks">${esc(t.thanks)}</p>
            <p class="sign">— ${esc(t.signoff)}</p>
          </section>
        </div>
      </article>`,

    solo: (t) => `
      <article class="so">
        <h1 class="so-name glitch fade" data-text="${esc(t.name)}">${esc(t.name)}</h1>
        ${plain(t)}
        <div class="so-out" id="session" aria-hidden="true"></div>
        <div id="so-riddle"></div>
      </article>`,

    unknown: (t) => `
      <article class="un">
        <i class="un-mark tl"></i><i class="un-mark tr"></i><i class="un-mark bl"></i><i class="un-mark br"></i>
        <header class="fade">
          <h1 class="un-name">${esc(t.name)}</h1>
          <p class="un-role">${esc(t.role)}</p>
        </header>
        <section class="fade">
          <h2><span>01</span>Briefing</h2>
          <pre class="un-log">${staticLog(t.terminal)}</pre>
        </section>
        <section class="fade">
          <h2><span>02</span>${esc(t.messageTitle)}</h2>
          ${paragraphs(t)}
        </section>
        ${riddleHTML(t)}
        <section class="fade">
          <h2><span>03</span>Close</h2>
          <p class="thanks">${esc(t.thanks)}</p>
          <p class="sign">— ${esc(t.signoff)}</p>
        </section>
        <footer class="un-foot fade">
          <span class="date">${DATE}</span>
          <button class="link" type="button" data-leave>← return</button>
        </footer>
      </article>`
  };

  let runId = 0;  

  async function typeLines(el, lines, id) {
    const caret = document.createElement('span');
    caret.className = 'caret';
    el.appendChild(caret);
    for (const line of lines) {
      if (id !== runId) return;
      const row = document.createElement('span');
      row.className = isCmd(line) ? 'cmd' : 'out';
      el.insertBefore(row, caret);
      for (const ch of line) {
        if (id !== runId) return;
        row.textContent += ch;
        await sleep(isCmd(line) ? 28 + Math.random() * 30 : 10);
      }
      el.insertBefore(document.createTextNode('\n'), caret);
      await sleep(isCmd(line) ? 280 : 140);
    }
  }

  // Solo
  async function runSession(el, t, id) {
    const prompt = t.prompt || 'solo@kali:~$';
    const steps = [];
    t.terminal.forEach((l) => steps.push(isCmd(l) ? { cmd: l.slice(2) } : { out: l }));
    steps.push({ cmd: t.messageTitle.replace(/^\$ /, '') });
    t.message.forEach((p) => steps.push({ out: p, gap: true }));
    steps.push({ cmd: `echo "${DATE}"` });
    steps.push({ out: DATE });
    steps.push({ cmd: './thanks.sh' });
    steps.push({ out: t.thanks, ok: true });
    steps.push({ out: '  ' + t.signoff });

    for (const s of steps) {
      if (id !== runId) return;
      const line = document.createElement('span');
      line.className = 'line';
      el.appendChild(line);
      if (s.cmd !== undefined) {
        line.innerHTML = `<span class="ps">${esc(prompt)}</span><span class="typed"></span>`;
        const target = $('.typed', line);
        for (const ch of s.cmd) {
          if (id !== runId) return;
          target.textContent += ch;
          await sleep(26 + Math.random() * 32);
        }
        await sleep(240);
      } else {
        line.className = 'line out' + (s.gap ? ' gap' : '');
        line.innerHTML = (s.ok ? '<span class="ok">[+]</span> ' : '') + esc(s.out);
        await sleep(s.gap ? 420 : 120);
      }
      scrollTo({ top: document.documentElement.scrollHeight });
    }
    if (id !== runId) return;
    const end = document.createElement('span');
    end.className = 'line';
    end.innerHTML = `<span class="ps">${esc(prompt)}</span><button class="exit" type="button" data-leave>exit</button><span class="caret"></span>`;
    el.appendChild(end);
    $('[data-leave]', end).addEventListener('click', leave);
    const slot = $('#so-riddle');
    if (slot) { slot.innerHTML = riddleHTML(t); initRiddle(t); }
    scrollTo({ top: document.documentElement.scrollHeight });
  }

  function openPage(t) {
    screens.page.innerHTML = pages[t.id](t);
    screens.page.querySelectorAll('.fade').forEach((el, i) => el.style.setProperty('--n', i));
    const btn = $('[data-leave]', screens.page);
    if (btn) btn.addEventListener('click', leave);
    initRiddle(t);

    skip = false;
    const id = ++runId;
    if (t.id === 'naqaab') setTimeout(() => typeLines($('#typed'), t.terminal, id), reduce ? 0 : 900);
    if (t.id === 'solo') setTimeout(() => runSession($('#session'), t, id), reduce ? 0 : 700);
  }

  async function leave() {
    runId++;
    await show('landing', 'landing');
    screens.page.innerHTML = '';
  }


//riddle lock (independent state per teacher)

  const LOCK_MAX = 5;
  const LOCK_ROUNDS = 10000;
  const LOCK_H = {
    naqaab:    'babb65cb4dbe8e6525fb69b94ccd176c44f4dea7a0e16be11532c76910766143',
    asfandyar: 'afbe231754e7ac6e1ba54dc5ea946041118c2ff62656120b2e5dd91c791f3546',
    solo:      '912653588f3e0bbf5988519135130d9eef739f9eef948a36010365ef48623096',
    unknown:   'b27ae30a36885c09e454d6ab5f08240deb1ed71c0ef6d33af83559fd4126b343'
  };

  const lockKey = (id) => 'td_lock_v1_' + id;
  const lockMem = {};

  function lockRead(id) {
    let raw = null;
    try { raw = localStorage.getItem(lockKey(id)); } catch (_) { /* storage unavailable */ }
    if (raw === null) return Object.assign({ used: 0, solved: false }, lockMem[id]);
    try {
      const o = JSON.parse(raw);
      return { used: Math.min(LOCK_MAX, Math.max(0, Number(o.u) | 0)), solved: o.s === 1 };
    } catch (_) {
      return { used: LOCK_MAX, solved: false };
    }
  }
  function lockWrite(id, st) {
    lockMem[id] = { used: st.used, solved: st.solved };
    try { localStorage.setItem(lockKey(id), JSON.stringify({ u: st.used, s: st.solved ? 1 : 0 })); } catch (_) { /* ignore */ }
  }
  async function lockHash(id, pin) {
    let h = await sha256(`${id}:lock:${pin}`);
    for (let i = 0; i < LOCK_ROUNDS; i++) h = await sha256(h);
    return h;
  }

  const riddleHTML = (t) => `
    <div class="rd" data-teacher="${esc(t.id)}">
      <h2 class="rd-h">The Riddle <small>Don't use AI please!</small></h2>
      <div class="rd-box">
        <p class="rd-lock">🔐 THE LOCK HAS 5 DIGITS</p>
        <p class="rd-digits">0 1 2 3 4 5 6 7 8 9</p>
        <p class="rd-once">Each digit may be used only once.</p>
        <ol class="rd-rules">
          <li>The second digit is exactly twice the first digit.</li>
          <li>The fifth digit is the sum of the first and third digits.</li>
          <li>The fourth digit is greater than the second digit but smaller than the fifth digit.</li>
          <li>The sum of all five digits is 28.</li>
          <li>The code contains exactly two odd digits.</li>
        </ol>
      </div>
      <div class="rd-play">
        <p class="rd-info">You have 5 attempts to unlock the PIN and reveal the hidden message.</p>
        <p class="rd-count" aria-live="polite">Attempts remaining: <span class="rd-n">5</span></p>
        <form class="rd-form" autocomplete="off" novalidate>
          <label class="sr-only" for="rd-pin">5-digit PIN</label>
          <div class="row">
            <input id="rd-pin" class="rd-pin" type="text" inputmode="numeric" maxlength="5"
                   placeholder="_ _ _ _ _" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
            <button class="rd-btn" type="submit">UNLOCK</button>
          </div>
          <p class="rd-msg" role="alert"></p>
        </form>
        <p class="rd-deny" hidden>ACCESS DENIED — No attempts remaining.</p>
      </div>
      <div class="rd-done" hidden>
        <p class="rd-granted">ACCESS GRANTED</p>
        <button class="rd-open" type="button">Open unlocked page</button>
      </div>
    </div>`;

  function openUnlocked(returnTo) {
    const el = document.createElement('div');
    el.className = 'ul';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'ul-title');
    el.innerHTML = `
      <button class="ul-back" type="button">← back</button>
      <div class="ul-main">
        <h2 id="ul-title" class="ul-msg">Congratulations, you successfully unlocked the lock.</h2>
        <p class="ul-morse">.-- .... -.-- / .. ... / - .... . .-. . / ... --- -- . - .... .. -. --. / .-. .- - .... . .-. / - .... .- -. / -. --- - .... .. -. --. ..--..</p>
        <div class="ul-riddle">
          <h3 class="ul-rh">RIDDLE 2 — THE GAPS</h3>
          <p class="ul-rt">Delete every space and every slash from the line above.<br>Now decode what remains.</p>
          <p class="ul-rt">If it cannot be decoded, ask yourself:<br>What slash and space was supposed to be removed?</p>
          <p class="ul-rt">Then answer one final question:<br>Was it really "NOTHING"?</p>
          <p class="ul-rt">Whatever your answer is, send it in the general chat like this>> #sudo(your answer). Did you know riddles are the best way to know someone!?</p>
          <p class="ul-rt ul-rq">*
  The lock confirmed one thing: the five digits you entered are correct.
  It cannot tell whether you solved the riddle, were given the answer,
  or simply used AI.
  The result is identical.
  So what, exactly, was being tested???
*

  ~THANKS~</p>
        </div>
      </div>
      <footer class="ul-foot">if you want more webpages like this....contact on بارہ ارب تین سو پینتالیس ملین چھ سو اٹھتر ہزار نو سو دس</footer>`;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const close = () => {
      el.remove();
      removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (returnTo && document.contains(returnTo)) returnTo.focus();
    };
    document.body.appendChild(el);
    document.body.style.overflow = 'hidden';
    addEventListener('keydown', onKey);
    const back = $('.ul-back', el);
    back.addEventListener('click', close);
    back.focus();
  }

  function initRiddle(t) {
    const root = $('.rd', screens.page);
    if (!root) return;
    const countEl = $('.rd-n', root), countP = $('.rd-count', root);
    const play = $('.rd-play', root), done = $('.rd-done', root);
    const form = $('.rd-form', root), pin = $('.rd-pin', root), btn = $('.rd-btn', root);
    const msg = $('.rd-msg', root), deny = $('.rd-deny', root), openBtn = $('.rd-open', root);
    const rowEl = $('.row', root);
    let busy = false;

    function paint() {
      const st = lockRead(t.id);
      const left = LOCK_MAX - st.used;
      const out = left <= 0;
      countEl.textContent = left;
      countP.classList.toggle('low', left <= 1);
      play.hidden = st.solved;
      done.hidden = !st.solved;
      deny.hidden = !out;
      pin.disabled = out || busy;
      btn.disabled = out || busy;
    }

    pin.addEventListener('input', () => {
      pin.value = pin.value.replace(/\D/g, '').slice(0, 5);
      msg.classList.remove('on');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy) return;
      let st = lockRead(t.id);
      if (st.solved || st.used >= LOCK_MAX) { paint(); return; }
      const v = pin.value.trim();
      if (!/^\d{5}$/.test(v)) {
        msg.textContent = 'Enter exactly 5 digits.';
        msg.classList.add('on');
        return;
      }
      busy = true;
      paint();
      const h = await lockHash(t.id, v);
      st = lockRead(t.id);                       // re-read: another tab may have used attempts
      busy = false;
      if (st.solved || st.used >= LOCK_MAX) { paint(); return; }
      if (h === LOCK_H[t.id]) {
        st.solved = true;
        lockWrite(t.id, st);
        pin.value = '';
        msg.classList.remove('on');
        paint();
        openUnlocked(openBtn);
      } else {
        st.used += 1;
        lockWrite(t.id, st);
        pin.value = '';
        msg.textContent = 'Wrong PIN';
        msg.classList.add('on');
        rowEl.classList.remove('shake');
        void rowEl.offsetWidth;
        rowEl.classList.add('shake');
        paint();
        if (!pin.disabled) pin.focus();
      }
    });

    openBtn.addEventListener('click', () => openUnlocked(openBtn));
    paint();
  }


//wiring

  const roster = $('#roster');
  const form = $('#gate-form');
  const input = $('#gate-pass');
  const button = $('#gate-btn');
  const errorEl = $('#gate-error');
  const row = $('.row', form);
  let selected = null;
  let checking = false;

  // msg will stay outta DOM 
  teachers.forEach((t, i) => {
    const li = document.createElement('li');
    li.style.setProperty('--i', i);
    li.innerHTML = `<button type="button" data-teacher="${esc(t.id)}">
      <span class="n">${i + 1}</span><span class="nm">${esc(t.name)}</span><span class="go">enter →</span>
    </button>`;
    roster.appendChild(li);
  });

  roster.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-teacher]');
    if (!btn || switching) return;
    selected = byId[btn.dataset.teacher];
    input.value = '';
    errorEl.classList.remove('on');
    button.disabled = false;
    button.textContent = 'ACCESS';
    $('#gate-who').textContent = '> ' + selected.name;
    show('gate', selected.id).then(() => setTimeout(() => input.focus(), 100));
  });

  function backToList() {
    selected = null;
    input.value = '';
    show('landing', 'landing');
  }
  $('#gate-back').addEventListener('click', backToList);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && current === screens.gate) backToList(); });
  input.addEventListener('input', () => errorEl.classList.remove('on'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (checking || !selected || !input.value) return;
    checking = true;
    button.disabled = true;

    const hash = await sha256(`${selected.id}:${input.value.trim()}`);

    if (hash === selected.hash) {
      const teacher = selected;
      button.textContent = 'GRANTED';
      await new Promise((r) => setTimeout(r, reduce ? 0 : 500));
      input.value = '';
      openPage(teacher);
      await show('page', teacher.id);
    } else {
      errorEl.textContent = 'Access denied. Invalid credentials.';
      errorEl.classList.add('on');
      row.classList.remove('shake');
      void row.offsetWidth;          // restart the animation
      row.classList.add('shake');
      input.select();
      await new Promise((r) => setTimeout(r, 600));
      button.disabled = false;
    }
    checking = false;
  });

  resize();
  setEffect('landing');
})();

//endedd
