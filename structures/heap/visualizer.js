// Heap playground: a small tree of boxes with its array twin underneath, values climbing and sinking.
VizKit.register('heap', (ctx) => {
  const { t, el } = ctx;
  const CAPACITY = 7;
  const STEP = 500;

  ctx.css(`
    .hp { position:relative; display:flex; flex-direction:column; align-items:center; gap:16px; width:100%; }
    .hp-tree { position:relative; width:100%; max-width:340px; height:232px; }
    .hp-edges { position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
    .hp-edges line { stroke:var(--ink); stroke-width:2.5; stroke-linecap:round; transition:stroke .25s; }
    .hp-edges line.off { stroke:var(--subtle); stroke-width:2; stroke-dasharray:5 6; }
    .hp-slot { position:absolute; display:flex; flex-direction:column; align-items:center; gap:3px; transform:translateX(-50%); }
    .hp-root { position:absolute; white-space:nowrap; }
    .hp-arr { position:relative; display:flex; gap:6px; padding-bottom:30px; }
    .hp-acol { display:flex; flex-direction:column; align-items:center; gap:3px; }
    .hp-cnt { position:absolute; left:0; bottom:0; white-space:nowrap; transition:transform .42s cubic-bezier(.2,.8,.2,1); }
    .hp-cap { margin-top:-10px; text-align:center; }
    .hp-cap span { white-space:nowrap; }
    .hp-fly { position:absolute; margin:0; pointer-events:none; z-index:2; }
    @media (max-width: 640px) {
      .hp-tree { height:222px; }
      .hp-arr { gap:4px; }
      .hp-arr .cell { width:36px; height:36px; font-size:15px; }
    }
  `);

  // Where each of the seven slots sits in the tree: level by level, left to right.
  const SLOT_X = [50, 25, 75, 12.5, 37.5, 62.5, 87.5];
  const SLOT_Y = [0, 78, 78, 156, 156, 156, 156];
  const parentOf = (i) => (i - 1) >> 1;
  const leftOf = (i) => 2 * i + 1;
  const rightOf = (i) => 2 * i + 2;

  const items = new Array(CAPACITY).fill(null); // { id, value }
  let count = 0;
  let nextId = 0;
  let arrayExplained = false;

  const input = ctx.input(t('valuePlaceholder'));
  ctx.button(t('insert'), insert, { kind: 'primary' });
  ctx.button(t('removeMin'), removeMin);
  ctx.button(t('peek'), peek);
  ctx.button(t('reset'), reset, { kind: 'danger' });

  const wrap = el('div', { class: 'hp' });
  const tree = el('div', { class: 'hp-tree' });
  const edges = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  edges.setAttribute('class', 'hp-edges');
  edges.setAttribute('aria-hidden', 'true');
  const lines = [];
  for (let i = 1; i < CAPACITY; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    edges.append(line);
    lines[i] = line;
  }
  tree.append(edges);
  const slots = [];
  for (let i = 0; i < CAPACITY; i++) {
    const slot = el('div', { class: 'hp-slot', style: { left: `${SLOT_X[i]}%`, top: `${SLOT_Y[i]}px` } });
    slots.push(slot);
    tree.append(slot);
  }
  const rootPtr = el('div', { class: 'pointer hp-root', text: `← ${t('root')}` });
  tree.append(rootPtr);

  const arr = el('div', { class: 'hp-arr' });
  const acols = [];
  for (let i = 0; i < CAPACITY; i++) {
    const col = el('div', { class: 'hp-acol' });
    acols.push(col);
    arr.append(col);
  }
  const cntPtr = el('div', { class: 'pointer hp-cnt' });
  arr.append(cntPtr);
  const caption = el('div', { class: 'idx hp-cap' });
  wrap.append(tree, arr, caption);
  ctx.stage.append(wrap);

  const treeCell = (i) => slots[i].firstChild;
  const arrCell = (i) => acols[i].firstChild;

  // Draws the tree and the array from the model. hot: ids whose boxes glow (the values being compared).
  function render(hot = []) {
    for (let i = 0; i < CAPACITY; i++) {
      const item = i < count ? items[i] : null;
      const cls = `cell${item ? (hot.includes(item.id) ? ' hit' : '') : ' empty'}`;
      const box = (prefix) => el('div', { class: cls, 'data-key': item ? `${prefix}${item.id}` : null, text: item ? String(item.value) : '' });
      slots[i].replaceChildren(box('t'), el('span', { class: 'idx', text: String(i) }));
      acols[i].replaceChildren(box('a'), el('span', { class: 'idx', text: String(i) }));
    }
    cntPtr.textContent = `▲ ${t('count', { count })}`;
    caption.replaceChildren(el('span', { text: t('asArray') }), ' · ', el('span', { text: t('capacity', { n: CAPACITY }) }));
    layout();
  }

  // Measures the real boxes and draws the strings between parents and children.
  function layout() {
    const base = tree.getBoundingClientRect();
    const rect = (i) => {
      const r = treeCell(i).getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, top: r.top - base.top, bottom: r.bottom - base.top, h: r.height };
    };
    edges.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);
    for (let i = 1; i < CAPACITY; i++) {
      const p = rect(parentOf(i));
      const c = rect(i);
      const line = lines[i];
      line.setAttribute('x1', p.x);
      line.setAttribute('y1', p.bottom);
      line.setAttribute('x2', c.x);
      line.setAttribute('y2', c.top);
      line.setAttribute('class', i < count ? '' : 'off');
    }
    const root = rect(0);
    rootPtr.style.left = `${root.x + treeCell(0).offsetWidth / 2 + 8}px`;
    rootPtr.style.top = `${root.top + root.h / 2 - rootPtr.offsetHeight / 2}px`;
    const arrBase = arr.getBoundingClientRect();
    const target = count < CAPACITY ? arrCell(count).getBoundingClientRect() : arrCell(CAPACITY - 1).getBoundingClientRect();
    const x = count < CAPACITY ? target.left - arrBase.left + target.width / 2 : target.right - arrBase.left + 8;
    cntPtr.style.transform = `translateX(${x - cntPtr.offsetWidth / 2}px)`;
  }

  async function shake(cell) {
    wrap.classList.add('shake');
    if (cell) cell.classList.add('bad');
    await ctx.wait(450);
    wrap.classList.remove('shake');
    if (cell) cell.classList.remove('bad');
  }

  function swap(i, j) {
    [items[i], items[j]] = [items[j], items[i]];
  }

  async function explainArrayOnce() {
    if (arrayExplained) return;
    arrayExplained = true;
    ctx.say(t('arrayNote'), 'info');
  }

  async function insert() {
    const value = input.read();
    if (count === CAPACITY) {
      ctx.say(t('overflow', { value, n: CAPACITY }), 'warn');
      await shake(treeCell(CAPACITY - 1));
      return;
    }
    const item = { id: nextId++, value };
    let i = count;
    items[i] = item;
    count++;
    render([item.id]);
    ctx.say(i === 0 ? t('insertedRoot', { value }) : t('inserted', { value, index: i }), 'ok');
    await Promise.all([ctx.enter(treeCell(i), 0, -40), ctx.enter(arrCell(i), 0, -30)]);

    // Sift up: compare with the parent, swap while smaller.
    let swaps = 0;
    while (i > 0) {
      const p = parentOf(i);
      const parent = items[p].value;
      render([item.id, items[p].id]);
      await ctx.wait(STEP);
      if (value < parent) {
        swap(i, p);
        i = p;
        swaps++;
        await ctx.flip(wrap, () => render([item.id]));
        ctx.say(t('siftUpSwap', { value, parent, index: i }), 'ok');
        await ctx.wait(STEP);
      } else {
        ctx.say(t('siftUpStay', { value, index: i, parent }), 'info');
        break;
      }
    }
    if (i === 0 && swaps > 0) ctx.say(t('siftUpRoot', { value }), 'info');
    await ctx.wait(300);
    render();
    await explainArrayOnce();
  }

  async function removeMin() {
    if (count === 0) {
      ctx.say(t('underflow'), 'warn');
      await shake();
      return;
    }
    const value = items[0].value;
    const cell = treeCell(0);
    const flying = el('div', {
      class: 'cell hp-fly',
      text: String(value),
      style: { left: `${tree.offsetLeft + cell.offsetLeft + slots[0].offsetLeft - slots[0].offsetWidth / 2}px`, top: `${tree.offsetTop + slots[0].offsetTop}px`, width: `${cell.offsetWidth}px`, height: `${cell.offsetHeight}px` },
    });
    wrap.append(flying);

    if (count === 1) {
      count = 0;
      items[0] = null;
      render();
      ctx.say(t('removedLast', { value }), 'ok');
      await ctx.leave(flying, 70, -50);
      await explainArrayOnce();
      return;
    }

    const last = items[count - 1];
    const moved = last.value;
    items[0] = last;
    count--;
    items[count] = null;
    ctx.say(t('removed', { value, moved }), 'ok');
    await Promise.all([ctx.leave(flying, 70, -50), ctx.flip(wrap, () => render([last.id]))]);
    await ctx.wait(STEP);

    // Sift down: swap with the smaller child while it is smaller.
    let i = 0;
    while (true) {
      const l = leftOf(i);
      const r = rightOf(i);
      if (l >= count) {
        ctx.say(t('siftDownLeaf', { value: moved, index: i }), 'info');
        break;
      }
      let smallest = l;
      if (r < count && items[r].value < items[l].value) smallest = r;
      render([last.id, items[l].id, ...(r < count ? [items[r].id] : [])]);
      await ctx.wait(STEP);
      if (items[smallest].value < moved) {
        const child = items[smallest].value;
        swap(i, smallest);
        i = smallest;
        await ctx.flip(wrap, () => render([last.id]));
        ctx.say(t('siftDownSwap', { value: moved, child, index: i }), 'ok');
        await ctx.wait(STEP);
      } else {
        ctx.say(t('siftDownStay', { value: moved, index: i }), 'info');
        break;
      }
    }
    await ctx.wait(300);
    render();
    await explainArrayOnce();
  }

  async function peek() {
    if (count === 0) {
      ctx.say(t('underflow'), 'warn');
      await shake();
      return;
    }
    ctx.say(t('peeked', { value: items[0].value }), 'info');
    treeCell(0).classList.add('hit');
    await ctx.pulse(arrCell(0), 'hit', 700);
    treeCell(0).classList.remove('hit');
  }

  async function reset() {
    items.fill(null);
    count = 0;
    render();
    ctx.say(t('resetDone'), 'info');
  }

  // Start with a small valid heap so there is something to take out and something to compare with.
  [8, 17, 13, 42].forEach((v) => (items[count++] = { id: nextId++, value: v }));
  render();
  ctx.say(t('hello', { n: CAPACITY, count, min: items[0].value }), 'info');
  window.addEventListener('resize', layout);
});
