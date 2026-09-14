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

  function mount(root, id, data) {
    const labels = data.viz || {};
    const t = (key, vars = {}) => String(labels[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    const controls = el('div', { class: 'viz-controls' });
    const stage = el('div', { class: 'viz-stage' });
    const list = el('ol');
    const log = el('div', { class: 'viz-log', 'aria-live': 'polite' }, el('div', { class: 'lbl', text: data.text.stepLog }), list);
    root.replaceChildren(controls, stage, log);

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
        controls.append(btn);
        return btn;
      },
      input(placeholder) {
        const box = el('input', { type: 'number', min: '0', max: '99', inputmode: 'numeric', class: 'viz-input', placeholder, 'aria-label': placeholder });
        controls.append(box);
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
      },
      wait(ms) {
        return reduced() ? Promise.resolve() : new Promise((r) => setTimeout(r, ms));
      },
      async flip(container, change, duration = 420) {
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
        await node.animate([{ opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(.7)` }, { opacity: 1, transform: 'none' }], { duration: 380, easing: EASE }).finished.catch(() => {});
      },
      async leave(node, dx = 0, dy = -24) {
        if (!reduced()) {
          await node.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(.7)` }], { duration: 320, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
        }
        node.remove();
      },
      async pulse(node, className = 'hit', ms = 650) {
        node.classList.add(className);
        await ctx.wait(ms);
        node.classList.remove(className);
      },
    };

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
