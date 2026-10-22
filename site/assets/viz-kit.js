// VizKit: the small toolbox every visualizer uses, so each structure only describes its own picture.
//
//   VizKit.register('stack', (ctx) => { ... });
//
// ctx gives you:
//   ctx.stage              element to draw in
//   ctx.t(key, vars)       text from structures/<id>/labels/<lang>.json -> "viz", with {placeholders}
//   ctx.el(tag, attrs, ...children)
//   ctx.css(text)          add structure-specific CSS once (shared classes live in site/assets/style.css)
//   ctx.button(label, onClick, { kind })   adds a control button; onClick may be async
//   ctx.input(placeholder)                 adds a number box; .read() gives a number (random if empty)
//   ctx.say(text, tone)    adds a line to the "what just happened" log; tone = 'ok' | 'warn' | 'info'
//   ctx.flip(container, change)            animate children with data-key from old to new positions
//   ctx.enter(node) / ctx.leave(node, dx, dy) / ctx.pulse(node, className)
//   ctx.wait(ms)           pause (skipped when the reader prefers reduced motion)
//   ctx.spot(step)         light up the lines marked `@step step` ... `@end` in the reader's code language,
//                          in "The code, step by step" under the picture; ctx.spot(null) clears it
//   ctx.mission(id)        the reader just did mission `id` from labels/<lang>.json -> "missions";
//                          all of them done = the lesson's sticker. Safe to call again and again.
//   ctx.speed              1 normally, 2.2 in slow motion (wait, flip, enter and leave already use it)
(function () {
  const registry = {};
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) if (c != null) node.append(c.nodeType ? c : document.createTextNode(String(c)));
    return node;
  }

  const fx = () => window.PDSAfx || {};
  const store = {
    get: (k) => (fx().store ? fx().store.get(k) : null),
    set: (k, v) => fx().store && fx().store.set(k, v),
  };

  // Tiny pencil-and-paper sounds made on the fly (no sound files). Off unless the reader turns them on.
  let audio = null;
  function tone(freq, start, length, { type = 'triangle', gain = 0.05, slide = 0 } = {}) {
    const t0 = audio.currentTime + start;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(freq * slide, t0 + length);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
    osc.connect(amp).connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + length + 0.02);
  }
  function sound(kind) {
    if (store.get('sound') !== '1') return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      if (kind === 'ok') tone(740, 0, 0.07, { slide: 1.25 });
      else if (kind === 'warn') {
        tone(180, 0, 0.16, { type: 'square', gain: 0.035, slide: 0.7 });
        tone(150, 0.09, 0.16, { type: 'square', gain: 0.03, slide: 0.7 });
      } else if (kind === 'info') tone(520, 0, 0.05, { type: 'sine', gain: 0.03 });
      else if (kind === 'mission') [784, 988, 1175].forEach((f, i) => tone(f, i * 0.09, 0.22));
      else if (kind === 'sticker') [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.3));
    } catch (e) {
      /* no audio on this device: stay quiet */
    }
  }

  const SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ico" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path class="ico on-only" d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/><path class="ico off-only" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
  const SNAIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ico" d="M3 18.5h15.5c1.6 0 2.5-1 2.5-2.2V12"/><circle class="ico" cx="11" cy="12.5" r="5"/><path class="ico" d="M11 12.5a2 2 0 1 1 2 2M19.5 12V8.5M21.5 12V9"/></svg>';

  function mount(root, id, data) {
    const labels = data.viz || {};
    const t = (key, vars = {}) => String(labels[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    const controls = el('div', { class: 'viz-controls' });
    const stage = el('div', { class: 'viz-stage' });
    const list = el('ol');
    const log = el('div', { class: 'viz-log', 'aria-live': 'polite' }, el('div', { class: 'lbl', text: data.text.stepLog }), list);
    const text = data.text;
    const fill = (str, vars) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

    // Slow motion and sound: two small switches at the end of the controls, remembered between visits.
    const tools = el('div', { class: 'viz-tools' });
    const toggle = (key, label, icon, after) => {
      const btn = el('button', { type: 'button', class: 'viz-toggle', title: label, 'aria-label': label, 'aria-pressed': String(store.get(key) === '1') });
      btn.innerHTML = icon;
      btn.addEventListener('click', () => {
        const on = store.get(key) !== '1';
        store.set(key, on ? '1' : '0');
        btn.setAttribute('aria-pressed', String(on));
        if (after) after(on);
      });
      tools.append(btn);
    };

    // "The code, step by step": the reader's code language, with the lines of the current step lit up.
    const followBox = el('div', { class: 'viz-follow', hidden: true }, el('div', { class: 'lbl', text: text.codeFollow }));
    const followPanels = {};
    for (const [lang, f] of Object.entries(data.follow || {})) {
      const code = el('code', { class: `hljs language-${lang}` });
      const pre = el('pre', { class: 'follow-pre' }, code);
      followPanels[lang] = { code, pre, shown: null, f };
      followBox.append(el('div', { class: 'code-panel', 'data-code': lang }, pre));
    }

    // Missions: three small goals per playground, ticked as the reader does them.
    const missions = data.missions || {};
    const missionIds = Object.keys(missions);
    const doneKey = (m) => `m.${id}.${m}`;
    const missionItems = {};
    let missionBox = null;
    if (missionIds.length) {
      const ul = el('ul');
      for (const m of missionIds) {
        const li = el('li', { class: `mission${store.get(doneKey(m)) ? ' done' : ''}` }, el('span', { class: 'tick', 'aria-hidden': 'true' }), el('span', { text: missions[m] }));
        missionItems[m] = li;
        ul.append(li);
      }
      const badge = el('span', { class: 'viz-sticker', 'aria-hidden': 'true' });
      if (data.sticker) badge.innerHTML = data.sticker;
      missionBox = el('div', { class: `viz-missions note${store.get(`sticker.${id}`) ? ' earned' : ''}` },
        el('span', { class: 'tape' }), badge,
        el('div', { class: 'head', text: text.missions }), el('p', { class: 'hint', text: text.missionsHint }), ul);
    }

    root.replaceChildren(...[controls, stage, followBox, log, missionBox].filter(Boolean));
    // Enter in any box of the controls presses the main button.
    controls.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !e.target.matches('input')) return;
      e.preventDefault();
      const main = controls.querySelector('.viz-btn.primary');
      if (main) main.click();
    });

    let busy = false;
    const buttons = [];
    const setBusy = (b) => {
      busy = b;
      buttons.forEach((btn) => (btn.disabled = b));
    };

    const ctx = {
      stage,
      t,
      el,
      speed: store.get('slow') === '1' ? 2.2 : 1,
      reducedMotion: reduced(),
      css(text) {
        const idAttr = `viz-css-${id}`;
        if (!document.getElementById(idAttr)) document.head.append(el('style', { id: idAttr, text }));
      },
      button(label, onClick, { kind } = {}) {
        const btn = el('button', { type: 'button', class: `viz-btn${kind ? ` ${kind}` : ''}`, text: label });
        btn.addEventListener('click', async () => {
          if (busy) return;
          setBusy(true);
          try {
            await onClick();
          } finally {
            setBusy(false);
          }
        });
        buttons.push(btn);
        controls.insertBefore(btn, tools);
        return btn;
      },
      input(placeholder) {
        const box = el('input', { type: 'number', min: '0', max: '99', inputmode: 'numeric', class: 'viz-input', placeholder, 'aria-label': placeholder });
        controls.insertBefore(box, tools);
        box.read = () => {
          const n = parseInt(box.value, 10);
          box.value = '';
          return Number.isFinite(n) ? Math.max(0, Math.min(99, n)) : Math.floor(Math.random() * 90) + 10;
        };
        return box;
      },
      say(text, tone = 'info') {
        const item = el('li', { class: `tone-${tone}`, text });
        list.prepend(item);
        while (list.children.length > 6) list.lastChild.remove();
        if (!reduced()) item.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: EASE });
        sound(tone);
        return item;
      },
      wait(ms) {
        return reduced() ? Promise.resolve() : new Promise((r) => setTimeout(r, ms * ctx.speed));
      },
      spot(step) {
        let any = false;
        for (const p of Object.values(followPanels)) {
          const where = step && p.f.steps[step];
          if (!where) {
            p.code.querySelectorAll('.ln.on').forEach((n) => n.classList.remove('on'));
            continue;
          }
          any = true;
          if (p.shown !== where.snippet) {
            p.code.innerHTML = p.f.snippets[where.snippet].map((html) => `<span class="ln">${html || ' '}</span>`).join('');
            p.shown = where.snippet;
          }
          const lines = [...p.code.children];
          lines.forEach((n, i) => n.classList.toggle('on', i >= where.from && i <= where.to));
          // Keep the lit lines in view inside the little code box; never scroll the page.
          const first = lines[where.from];
          const last = lines[where.to];
          if (first && p.pre.offsetParent) {
            // Line positions inside the scrolling box; snap so a whole line sits at the top edge.
            const y = (n) => n.offsetTop - lines[0].offsetTop;
            const top = y(first);
            const bottom = y(last) + last.offsetHeight;
            if (top < p.pre.scrollTop || bottom > p.pre.scrollTop + p.pre.clientHeight - 12) {
              p.pre.scrollTop = where.from > 0 ? y(lines[where.from - 1]) + 12 : 0;
            }
          }
        }
        if (any && followBox.hidden) {
          followBox.hidden = false;
          if (!reduced()) followBox.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: EASE });
        }
      },
      mission(m) {
        if (!missionItems[m]) {
          console.warn(`VizKit: unknown mission "${m}" in ${id}`);
          return;
        }
        if (store.get(doneKey(m))) return;
        store.set(doneKey(m), '1');
        const li = missionItems[m];
        li.classList.add('done');
        if (!reduced()) li.animate([{ transform: 'none' }, { transform: 'scale(1.06) rotate(-1deg)' }, { transform: 'none' }], { duration: 450, easing: EASE });
        ctx.say(fill(text.missionDone, { text: missions[m] }), 'ok').classList.add('tone-mission');
        sound('mission');
        if (missionIds.every((x) => store.get(doneKey(x))) && !store.get(`sticker.${id}`)) {
          store.set(`sticker.${id}`, '1');
          setTimeout(earnSticker, 500);
        }
      },
      async flip(container, change, duration = 420) {
        duration *= ctx.speed;
        const before = new Map([...container.querySelectorAll('[data-key]')].map((n) => [n.dataset.key, n.getBoundingClientRect()]));
        change();
        if (reduced()) return;
        const moves = [...container.querySelectorAll('[data-key]')].map((n) => {
          const a = before.get(n.dataset.key);
          if (!a) return n.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'none' }], { duration, easing: EASE }).finished.catch(() => {});
          const b = n.getBoundingClientRect();
          const dx = a.left - b.left;
          const dy = a.top - b.top;
          if (!dx && !dy) return null;
          return n.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration, easing: EASE }).finished.catch(() => {});
        });
        await Promise.all(moves.filter(Boolean));
      },
      async enter(node, dx = 0, dy = -24) {
        if (reduced()) return;
        await node.animate([{ opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(.7)` }, { opacity: 1, transform: 'none' }], { duration: 380 * ctx.speed, easing: EASE }).finished.catch(() => {});
      },
      async leave(node, dx = 0, dy = -24) {
        if (!reduced()) {
          await node.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(.7)` }], { duration: 320 * ctx.speed, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
        }
        node.remove();
      },
      async pulse(node, className = 'hit', ms = 650) {
        node.classList.add(className);
        await ctx.wait(ms);
        node.classList.remove(className);
      },
    };

    function earnSticker() {
      if (missionBox) missionBox.classList.add('earned');
      ctx.say(fill(text.stickerEarned, { title: data.title }), 'ok').classList.add('tone-mission');
      sound('sticker');
      if (!data.sticker) return;
      const pop = el('div', { class: 'sticker-pop', 'aria-hidden': 'true' });
      pop.innerHTML = data.sticker;
      stage.append(pop);
      if (fx().confetti) fx().confetti(pop);
      const done = () => pop.remove();
      if (reduced()) {
        setTimeout(done, 1600);
        return;
      }
      pop.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) scale(.2) rotate(-40deg)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1.15) rotate(8deg)', offset: 0.3 },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1) rotate(-4deg)', offset: 0.8 },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(.9) rotate(-4deg)' },
      ], { duration: 2600, easing: EASE }).finished.then(done, done);
    }

    toggle('slow', text.slow, SNAIL, (on) => (ctx.speed = on ? 2.2 : 1));
    toggle('sound', text.sound, SPEAKER, (on) => on && sound('ok'));
    controls.append(tools);
    registry[id](ctx);
  }

  window.VizKit = {
    register(id, fn) {
      registry[id] = fn;
      const data = window.PDSA;
      if (!data || data.structure !== id) return;
      document.querySelectorAll(`.viz[data-structure="${id}"]`).forEach((root) => mount(root, id, data));
    },
  };
})();
