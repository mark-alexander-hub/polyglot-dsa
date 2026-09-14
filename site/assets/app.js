// Page behaviour: theme, code-language choice, copy buttons and running code in the browser.
(function () {
  const root = document.documentElement;
  const base = new URL('.', document.currentScript.src);
  const store = {
    get: (k) => {
      try {
        return localStorage.getItem(`pdsa.${k}`);
      } catch (e) {
        return null;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(`pdsa.${k}`, v);
      } catch (e) {
        /* private window: keep going without saving */
      }
    },
    remove: (k) => {
      try {
        localStorage.removeItem(`pdsa.${k}`);
      } catch (e) {
        /* nothing saved, nothing to remove */
      }
    },
  };

  // Theme -------------------------------------------------------------------
  const themeButton = document.querySelector('.theme-toggle');
  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('theme', next);
    });
  }

  // Code language -----------------------------------------------------------
  const setCode = (id) => {
    root.setAttribute('data-code', id);
    store.set('code', id);
  };
  const fromUrl = new URLSearchParams(location.search).get('code');
  if (fromUrl && document.querySelector(`[data-code="${CSS.escape(fromUrl)}"]`)) setCode(fromUrl);
  document.addEventListener('click', (e) => {
    const pick = e.target.closest('.code-pick, .tab');
    if (pick) {
      const top = pick.getBoundingClientRect().top;
      setCode(pick.dataset.code);
      // Keep the button under the reader's finger even if panels above changed height.
      window.scrollBy(0, pick.getBoundingClientRect().top - top);
    }
  });

  // Language memory ---------------------------------------------------------
  document.querySelectorAll('.lang-pick, .pick-card').forEach((a) => {
    a.addEventListener('click', () => store.set('lang', a.getAttribute('lang')));
  });
  const last = store.get('lang');
  if (last) document.querySelector(`.pick-card[lang="${CSS.escape(last)}"]`)?.classList.add('last');

  // Copy --------------------------------------------------------------------
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy');
    if (!btn) return;
    const text = btn.closest('.code-panel').querySelector('pre code').textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const area = Object.assign(document.createElement('textarea'), { value: text });
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    const old = btn.textContent;
    btn.textContent = btn.dataset.copied;
    setTimeout(() => (btn.textContent = old), 1400);
  });

  // Progress: "I finished this lesson" --------------------------------------
  const doneKey = (id) => `done.${id}`;
  document.querySelectorAll('.lesson-card[data-lesson]').forEach((card) => {
    if (store.get(doneKey(card.dataset.lesson))) card.classList.add('is-done');
  });
  const doneButton = document.querySelector('.mark-done');
  if (doneButton) {
    const id = doneButton.dataset.lesson;
    const paint = () => {
      const done = !!store.get(doneKey(id));
      doneButton.classList.toggle('is-done', done);
      doneButton.setAttribute('aria-pressed', String(done));
    };
    paint();
    doneButton.addEventListener('click', () => {
      if (store.get(doneKey(id))) {
        store.remove(doneKey(id));
      } else {
        store.set(doneKey(id), '1');
        confetti(doneButton);
      }
      paint();
    });
  }

  function confetti(origin) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = origin.getBoundingClientRect();
    const colors = ['var(--gold)', 'var(--rose)', 'var(--sky)', 'var(--sage)', 'var(--coral)', 'var(--purple)'];
    for (let i = 0; i < 70; i++) {
      const bit = document.createElement('i');
      bit.className = 'confetti';
      bit.style.left = `${box.left + box.width / 2}px`;
      bit.style.top = `${box.top + box.height / 2}px`;
      bit.style.background = colors[i % colors.length];
      document.body.append(bit);
      const angle = Math.random() * Math.PI * 2;
      const distance = 70 + Math.random() * 170;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      bit
        .animate(
          [
            { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
            { transform: `translate(${x}px, ${y - 70}px) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: 0.65 },
            { transform: `translate(${x * 1.1}px, ${y + 90}px) rotate(${Math.random() * 900}deg)`, opacity: 0 },
          ],
          { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' },
        )
        .finished.then(() => bit.remove(), () => bit.remove());
    }
  }

  // Run ---------------------------------------------------------------------
  const data = window.PDSA;
  if (!data) return;
  const outBox = document.querySelector('.run-output');
  const outPre = outBox && outBox.querySelector('.live');
  let pythonWorker = null;

  function runIn(worker, source, btn, { timeoutMs, onEnd } = {}) {
    return new Promise((resolve) => {
      let timer = null;
      const finish = () => {
        clearTimeout(timer);
        worker.onmessage = null;
        btn.disabled = false;
        btn.textContent = `▶ ${data.text.run}`;
        if (onEnd) onEnd();
        resolve();
      };
      worker.onmessage = (msg) => {
        const m = msg.data;
        if (m.type === 'status') outPre.textContent = m.text;
        if (m.type === 'ready') outPre.textContent = '';
        if (m.type === 'out') outPre.textContent += m.text;
        if (m.type === 'error') {
          outPre.textContent += `\n${m.text}`;
          outPre.classList.add('bad');
        }
        if (m.type === 'done' || m.type === 'error') finish();
      };
      if (timeoutMs) {
        timer = setTimeout(() => {
          outPre.textContent += '\n(stopped after 5 seconds)';
          worker.terminate();
          finish();
        }, timeoutMs);
      }
      worker.postMessage({ source, loading: data.text.loadingPython });
    });
  }

  document.querySelectorAll('.run').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.run;
      const source = data.sources[lang];
      if (!source || btn.disabled) return;
      btn.disabled = true;
      btn.textContent = data.text.running;
      outBox.hidden = false;
      outPre.textContent = '';
      outPre.classList.remove('bad');
      if (lang === 'javascript') {
        const worker = new Worker(new URL('worker-js.js', base));
        await runIn(worker, source, btn, { timeoutMs: 5000, onEnd: () => worker.terminate() });
      } else if (lang === 'python') {
        pythonWorker = pythonWorker || new Worker(new URL('worker-python.js', base), { type: 'module' });
        await runIn(pythonWorker, source, btn);
      }
    });
  });
})();
