// Hash map playground: a rack of buckets, a key hashed letter by letter, chains that collide, a table that doubles.
VizKit.register('hash-map', (ctx) => {
  const { t, el } = ctx;
  const START = 4;
  const CAP = 8; // the playground stops doubling here so the picture fits
  const STEP = 420;
  const LETTER = 300;
  const WORDS = ['chai', 'puri', 'upma', 'poha', 'milk', 'cake', 'jalebi', 'lassi', 'juice', 'samosa', 'coffee', 'vada', 'tea', 'dosa', 'idli'];

  ctx.css(`
    .hm { display:flex; flex-direction:column; gap:12px; width:100%; min-width:0; }
    .hm-key { width:118px; text-align:left; font-size:17px; }
    .hm-key.bad { border-bottom-color:var(--red); color:var(--red); }
    .hm-strip { min-height:52px; text-align:center; font-family:var(--mono); font-size:15px; line-height:1.5; color:var(--text); opacity:.5; overflow-wrap:anywhere; transition:opacity .2s; }
    .hm-strip.on { opacity:1; }
    .hm-strip .hm-h2 { font-weight:600; }
    .hm-rows { display:flex; flex-direction:column; gap:6px; width:100%; }
    .hm-row { display:flex; align-items:center; gap:8px; padding:3px 6px; min-height:58px; border-radius:10px; transition:background .25s; }
    .hm-row.on { background:color-mix(in srgb, var(--accent) 25%, transparent); }
    .hm-ptr { width:22px; flex:none; font-size:22px; opacity:0; transition:opacity .2s; }
    .hm-row.on .hm-ptr { opacity:1; }
    .hm-lbl { width:72px; flex:none; text-align:left; white-space:nowrap; }
    .hm-chain { display:flex; align-items:center; gap:6px; flex-wrap:nowrap; }
    .hm-arrow { font-family:var(--mono); font-size:20px; color:var(--subtle); }
    .hm-cell { width:auto; min-width:64px; height:auto; min-height:50px; padding:4px 10px; flex-direction:column; gap:1px; line-height:1.1; }
    .hm-cell .hm-k { font-size:17px; }
    .hm-cell .hm-v { font-family:var(--mono); font-size:13px; font-weight:600; opacity:.85; }
    .hm-empty { min-width:64px; }
    .hm-cap { text-align:center; }
    .hm-cap span { white-space:nowrap; }
    @media (max-width: 640px) {
      .hm-key { width:96px; font-size:15px; }
      .hm-strip { font-size:13px; }
      .hm-lbl { width:60px; font-size:12px; }
      .hm-cell { min-width:54px; min-height:44px; padding:3px 7px; }
      .hm-cell .hm-k { font-size:15px; }
      .hm-cell .hm-v { font-size:12px; }
      .hm-empty { min-width:54px; }
      .hm-arrow { font-size:17px; }
    }
  `);

  let bucketCount = START;
  let buckets = Array.from({ length: START }, () => []); // each bucket is a chain; index 0 is the FRONT
  let count = 0;
  let nextId = 0;
  let active = -1;
  let grewOnce = false;
  let capSaid = false;
  let rowEls = [];

  const hashOf = (key) => {
    let total = 0;
    for (const ch of key) total += ch.charCodeAt(0);
    return total;
  };
  const indexOf = (key) => hashOf(key) % bucketCount;
  const allKeys = () => buckets.flat().map((e) => e.key);

  // Controls: a word for the key, a number for the value.
  const valueBox = ctx.input(t('valuePlaceholder'));
  const keyBox = el('input', { type: 'text', class: 'viz-input hm-key', maxlength: '8', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', placeholder: t('keyPlaceholder'), 'aria-label': t('keyPlaceholder') });
  valueBox.before(keyBox);
  ctx.button(t('put'), put, { kind: 'primary' });
  ctx.button(t('get'), get);
  ctx.button(t('remove'), remove);
  ctx.button(t('reset'), reset, { kind: 'danger' });

  const wrap = el('div', { class: 'hm' });
  const strip = el('div', { class: 'hm-strip', 'aria-live': 'polite' });
  const line1 = el('div', { class: 'hm-h1' });
  const line2 = el('div', { class: 'hm-h2' });
  strip.append(line1, line2);
  const rows = el('div', { class: 'hm-rows' });
  const caption = el('div', { class: 'idx hm-cap' });
  wrap.append(strip, rows, caption);
  ctx.stage.append(wrap);

  const cellOf = (id) => rows.querySelector(`[data-key="e${id}"]`);
  const rowOf = (i) => rowEls[i];
  const emptyCellOf = (i) => rowEls[i].querySelector('.hm-empty');

  // Draws every bucket row from the model. hot: entry ids whose boxes glow.
  function render(hot = []) {
    rowEls = [];
    for (let i = 0; i < bucketCount; i++) {
      const chain = el('div', { class: 'hm-chain' });
      if (!buckets[i].length) chain.append(el('div', { class: 'cell empty hm-cell hm-empty', 'aria-hidden': 'true' }));
      buckets[i].forEach((e, pos) => {
        if (pos) chain.append(el('span', { class: 'hm-arrow', 'aria-hidden': 'true', text: '→' }));
        chain.append(el('div', { class: `cell hm-cell${hot.includes(e.id) ? ' hit' : ''}`, 'data-key': `e${e.id}` },
          el('span', { class: 'hm-k', text: e.key }),
          el('small', { class: 'hm-v', text: String(e.value) })));
      });
      rowEls.push(el('div', { class: `hm-row${i === active ? ' on' : ''}`, 'data-i': String(i) },
        el('span', { class: 'pointer hm-ptr', 'aria-hidden': 'true', text: '→' }),
        el('span', { class: 'idx hm-lbl', text: `${t('bucket')} ${i}` }),
        chain));
    }
    rows.replaceChildren(...rowEls);
    caption.replaceChildren(el('span', { text: t('count', { count }) }), ' · ', el('span', { text: t('buckets', { n: bucketCount }) }));
  }

  function setActive(i) {
    active = i;
    rowEls.forEach((row, j) => row.classList.toggle('on', j === i));
  }

  function finish() {
    active = -1;
    render();
    strip.classList.remove('on');
  }

  async function shake(target) {
    wrap.classList.add('shake');
    if (target) target.classList.add('bad');
    await ctx.wait(450);
    wrap.classList.remove('shake');
    if (target) target.classList.remove('bad');
  }

  // Reads the key box: a random canteen word when empty, null when it is not 1-8 letters a-z.
  function readKey() {
    const raw = keyBox.value.trim().toLowerCase();
    keyBox.value = '';
    if (!raw) {
      const have = new Set(allKeys());
      const fresh = WORDS.filter((w) => !have.has(w));
      const pool = fresh.length ? fresh : WORDS;
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return /^[a-z]{1,8}$/.test(raw) ? raw : null;
  }

  async function rejectKey() {
    ctx.say(t('badKey'), 'warn');
    keyBox.classList.add('bad');
    await shake();
    keyBox.classList.remove('bad');
  }

  // Adds up the letter codes on the strip, one letter at a time, then shows the % line.
  async function showHash(key) {
    const terms = [];
    let total = 0;
    line1.textContent = '';
    line2.textContent = '';
    strip.classList.add('on');
    ctx.spot('hash-sum');
    for (const ch of key) {
      const code = ch.charCodeAt(0);
      total += code;
      terms.push(`${ch}(${code})`);
      line1.textContent = t('hashLine', { letters: terms.join(' + '), hash: total });
      await ctx.wait(LETTER);
    }
    const hash = total;
    const index = hash % bucketCount;
    ctx.spot('hash-index');
    line2.textContent = t('modLine', { hash, n: bucketCount, index });
    await ctx.wait(STEP);
    ctx.say(t('hashed', { key, hash, n: bucketCount, index }), 'info');
    setActive(index);
    await ctx.wait(STEP);
    return { hash, index };
  }

  // Walks one chain comparing keys (op = put, get or remove, for the lit code). Leaves the match glowing.
  async function walk(key, index, op) {
    let steps = 0;
    for (const entry of buckets[index]) {
      steps++;
      const cell = cellOf(entry.id);
      cell.classList.add('hit');
      ctx.spot(`${op}-compare`);
      await ctx.wait(STEP);
      if (entry.key === key) return { entry, steps };
      ctx.spot(`${op}-next`);
      ctx.say(t('compare', { key, other: entry.key }), 'info');
      cell.classList.remove('hit');
    }
    return { entry: null, steps };
  }

  // Doubles the buckets: new empty rows appear, then every entry hops to its new bucket, front to back.
  async function grow() {
    const old = buckets;
    const n = bucketCount;
    const m = n * 2;
    ctx.spot('grow-double');
    ctx.say(t('growing', { count, n, m }), 'info');
    bucketCount = m;
    buckets = Array.from({ length: m }, () => []);
    for (let i = 0; i < n; i++) buckets[i] = old[i].slice(); // keep the old rows as they are for a moment
    render();
    await Promise.all(rowEls.slice(n).map((row) => ctx.enter(row, 0, -16)));
    await ctx.wait(STEP);
    for (let i = 0; i < n; i++) {
      for (const entry of old[i]) {
        const hash = hashOf(entry.key);
        const index = hash % m;
        buckets[i] = buckets[i].filter((e) => e !== entry);
        buckets[index].unshift(entry);
        ctx.spot('grow-move');
        ctx.say(t('rehashed', { key: entry.key, hash, m, index }), 'info');
        active = index;
        await ctx.flip(rows, () => render([entry.id]));
        await ctx.wait(STEP);
      }
    }
    if (!grewOnce) {
      grewOnce = true;
      ctx.say(t('loadNote'), 'info');
    }
  }

  async function put() {
    const key = readKey();
    if (key === null) return rejectKey();
    const value = valueBox.read();
    const { hash } = await showHash(key);
    let index = active;
    ctx.spot('put-bucket');
    await ctx.wait(STEP / 2);

    const hit = await walk(key, index, 'put');
    if (hit.entry) {
      ctx.spot('put-update');
      const old = hit.entry.value;
      hit.entry.value = value;
      render([hit.entry.id]);
      ctx.say(t('putUpdate', { key, value, index, old }), 'ok');
      await ctx.pulse(cellOf(hit.entry.id), 'hit', 800);
      finish();
      return;
    }

    if (count === bucketCount) {
      ctx.spot('put-grow');
      await ctx.wait(STEP);
      if (bucketCount < CAP) {
        await grow();
        ctx.mission('grow');
        index = indexOf(key);
        line2.textContent = t('modLine', { hash, n: bucketCount, index });
        setActive(index);
        await ctx.wait(STEP);
      } else if (!capSaid) {
        capSaid = true;
        ctx.say(t('growCap', { n: CAP }), 'warn');
        await ctx.wait(STEP);
      }
    }

    ctx.spot('put-insert');
    const others = buckets[index].map((e) => e.key);
    const entry = { id: nextId++, key, value };
    buckets[index].unshift(entry);
    count++;
    await ctx.flip(rows, () => render([entry.id]));
    ctx.say(others.length ? t('putCollision', { key, value, index, others: others.join(', ') }) : t('putEmpty', { key, value, index }), 'ok');
    if (others.length) ctx.mission('collision');
    await ctx.wait(500);
    finish();
  }

  async function get() {
    const key = readKey();
    if (key === null) return rejectKey();
    const { index } = await showHash(key);
    ctx.spot('get-bucket');
    await ctx.wait(STEP / 2);

    if (!buckets[index].length) {
      ctx.spot('get-missing');
      ctx.say(t('notFoundEmpty', { key, index }), 'info');
      await ctx.pulse(emptyCellOf(index), 'hit', 800);
      finish();
      return;
    }
    const hit = await walk(key, index, 'get');
    if (hit.entry) {
      ctx.spot('get-found');
      ctx.say(t('found', { key, index, value: hit.entry.value, steps: hit.steps }), 'ok');
      if (hit.steps >= 2) ctx.mission('chain');
      await ctx.wait(800);
    } else {
      ctx.spot('get-missing');
      ctx.say(t('notFound', { key, index, steps: hit.steps }), 'warn');
      await shake(rowOf(index));
    }
    finish();
  }

  async function remove() {
    const key = readKey();
    if (key === null) return rejectKey();
    const { index } = await showHash(key);
    ctx.spot('remove-bucket');
    await ctx.wait(STEP / 2);

    const hit = buckets[index].length ? await walk(key, index, 'remove') : { entry: null };
    if (!hit.entry) {
      ctx.spot('remove-missing');
      ctx.say(t('removeMissing', { key, index }), 'warn');
      await shake(rowOf(index));
      finish();
      return;
    }
    ctx.spot('remove-unlink');
    const cell = cellOf(hit.entry.id);
    buckets[index] = buckets[index].filter((e) => e !== hit.entry);
    count--;
    ctx.say(t('removed', { key, index }), 'ok');
    await ctx.leave(cell, 0, -40);
    await ctx.flip(rows, () => render());
    await ctx.wait(300);
    finish();
  }

  async function reset() {
    bucketCount = START;
    buckets = Array.from({ length: START }, () => []);
    count = 0;
    capSaid = false;
    line1.textContent = '';
    line2.textContent = '';
    finish();
    ctx.say(t('resetDone', { n: START }), 'info');
  }

  // Start with three keys so there is a chain to search: tea and idli share bucket 2.
  for (const [key, value] of [['tea', 10], ['dosa', 40], ['idli', 30]]) {
    buckets[indexOf(key)].unshift({ id: nextId++, key, value });
    count++;
  }
  render();
  ctx.say(t('hello', { n: bucketCount, count }), 'info');
});
