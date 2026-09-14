// Array playground: a row of numbered boxes, a size marker, and values that shift one box at a time.
VizKit.register('array', (ctx) => {
  const { t, el } = ctx;
  const CAPACITY = 8;

  ctx.css(`
    .arr { position:relative; display:flex; flex-direction:column; align-items:flex-start; gap:8px; padding-bottom:30px; }
    .arr-row { display:flex; gap:6px; }
    .arr-slot { display:flex; flex-direction:column; align-items:center; gap:4px; }
    .arr .cell { width:52px; }
    .arr-size { position:absolute; left:0; bottom:0; transition:transform .42s cubic-bezier(.2,.8,.2,1); }
    .arr-fly { position:absolute; margin:0; pointer-events:none; z-index:2; }
    @media (max-width: 640px) {
      .arr-row { gap:4px; }
      .arr .cell { width:34px; height:40px; font-size:14px; border-radius:8px; }
    }
  `);

  // One entry per box: null (never used) or { value, key, ghost }.
  const mem = new Array(CAPACITY).fill(null);
  let size = 0;
  let nextKey = 1;
  let ghostExplained = false;

  const indexBox = ctx.input(t('indexPlaceholder'));
  indexBox.value = '1';
  const valueBox = ctx.input(t('valuePlaceholder'));
  ctx.button(t('insert'), insert, { kind: 'primary' });
  ctx.button(t('remove'), remove);
  ctx.button(t('get'), get);
  ctx.button(t('search'), search);
  ctx.button(t('reset'), reset, { kind: 'danger' });

  const wrap = el('div', { class: 'arr' });
  const row = el('div', { class: 'arr-row' });
  const marker = el('div', { class: 'pointer arr-size' });
  wrap.append(el('div', { class: 'idx', text: t('capacity', { n: CAPACITY }) }), row, marker);
  ctx.stage.append(wrap);
  let cells = [];

  function render() {
    row.replaceChildren(
      ...mem.map((m, i) => {
        const cls = m == null ? ' empty' : m.ghost ? ' ghost' : '';
        const cell = el('div', { class: `cell${cls}`, 'data-key': m && !m.ghost ? m.key : null, text: m == null ? '' : String(m.value) });
        return el('div', { class: 'arr-slot' }, cell, el('span', { class: 'idx', text: String(i) }));
      }),
    );
    cells = [...row.querySelectorAll('.cell')];
    placeMarker();
  }

  function placeMarker() {
    marker.textContent = `▲ ${t('size')} = ${size}`;
    const slot = row.children[Math.min(size, CAPACITY - 1)];
    const centre = size < CAPACITY ? slot.offsetLeft + slot.offsetWidth / 2 : slot.offsetLeft + slot.offsetWidth;
    const x = Math.max(0, Math.min(centre - marker.offsetWidth / 2, wrap.offsetWidth - marker.offsetWidth));
    marker.style.transform = `translateX(${x}px)`;
  }

  function readIndex() {
    const n = parseInt(indexBox.value, 10);
    return Number.isFinite(n) ? n : null;
  }

  async function shake(badCells = []) {
    wrap.classList.add('shake');
    badCells.forEach((c) => c.classList.add('bad'));
    await ctx.wait(450);
    wrap.classList.remove('shake');
    badCells.forEach((c) => c.classList.remove('bad'));
  }

  async function rangeError(op, index, max) {
    if (max < 0) ctx.say(t('errEmpty', { op, index }), 'warn');
    else ctx.say(t('errRange', { op, index, max }), 'warn');
    await shake(index >= 0 && index < CAPACITY ? [cells[index]] : []);
  }

  async function insert() {
    const index = readIndex();
    if (index === null) {
      ctx.say(t('needIndex'), 'warn');
      return;
    }
    const value = valueBox.read();
    if (size === CAPACITY) {
      ctx.say(t('errFull', { index, value, n: CAPACITY }), 'warn');
      await shake(cells);
      return;
    }
    if (index < 0 || index > size) {
      await rangeError('insert', index, size);
      return;
    }
    const count = size - index;
    ctx.say(count ? t('shiftRight', { index, value, count }) : t('noShift', { index, value }), 'info');
    for (let i = size; i > index; i--) {
      await ctx.flip(row, () => {
        mem[i] = { ...mem[i - 1] };
        mem[i - 1] = { value: mem[i - 1].value, key: null, ghost: true };
        render();
      }, 300);
      await ctx.wait(80);
    }
    await ctx.flip(row, () => {
      mem[index] = { value, key: `k${nextKey++}`, ghost: false };
      size++;
      render();
    });
    ctx.say(t('inserted', { value, index, size }), 'ok');
    await ctx.pulse(cells[index], 'hit', 500);
  }

  async function remove() {
    const index = readIndex();
    if (index === null) {
      ctx.say(t('needIndex'), 'warn');
      return;
    }
    if (index < 0 || index >= size) {
      await rangeError('remove', index, size - 1);
      return;
    }
    const value = mem[index].value;
    const cell = cells[index];
    const flying = el('div', {
      class: 'cell arr-fly',
      text: String(value),
      style: { left: `${cell.offsetLeft}px`, top: `${cell.offsetTop}px`, width: `${cell.offsetWidth}px`, height: `${cell.offsetHeight}px` },
    });
    wrap.append(flying);
    mem[index] = { value, key: null, ghost: true };
    render();
    await ctx.leave(flying, 0, -50);
    const count = size - 1 - index;
    for (let i = index; i < size - 1; i++) {
      await ctx.flip(row, () => {
        mem[i] = { ...mem[i + 1] };
        mem[i + 1] = { value: mem[i + 1].value, key: null, ghost: true };
        render();
      }, 300);
      await ctx.wait(80);
    }
    size--;
    render();
    ctx.say(count ? t('removed', { index, value, count, size }) : t('removedLast', { index, value, size }), 'ok');
    if (!ghostExplained) {
      ghostExplained = true;
      ctx.say(t('ghost'), 'info');
    }
  }

  async function get() {
    const index = readIndex();
    if (index === null) {
      ctx.say(t('needIndex'), 'warn');
      return;
    }
    if (index < 0 || index >= size) {
      await rangeError('get', index, size - 1);
      return;
    }
    ctx.say(t('got', { index, value: mem[index].value }), 'ok');
    await ctx.pulse(cells[index], 'hit', 700);
  }

  async function search() {
    // An empty value box searches for something that is really there, so the scan has a happy ending.
    const value = valueBox.value === '' && size ? mem[Math.floor(Math.random() * size)].value : valueBox.read();
    valueBox.value = '';
    for (let i = 0; i < size; i++) {
      cells[i].classList.add('hit');
      await ctx.wait(260);
      if (mem[i].value === value) {
        ctx.say(i ? t('found', { value, checked: i + 1, index: i }) : t('foundFirst', { value, index: i }), 'ok');
        await ctx.wait(700);
        cells[i].classList.remove('hit');
        return;
      }
      cells[i].classList.remove('hit');
    }
    ctx.say(t('notFound', { value, checked: size }), 'info');
    await shake();
  }

  async function reset() {
    mem.fill(null);
    size = 0;
    render();
    ctx.say(t('resetDone'), 'info');
  }

  [14, 3, 27, 9].forEach((v) => {
    mem[size++] = { value: v, key: `k${nextKey++}`, ghost: false };
  });
  render();
  ctx.say(t('hello', { n: CAPACITY, size }), 'info');
  window.addEventListener('resize', placeMarker);
});
