// Stack playground: a column of boxes, a moving "top" pointer, and faded old values.
VizKit.register('stack', (ctx) => {
  const { t, el } = ctx;
  const CAPACITY = 6;

  ctx.css(`
    .stk { position:relative; display:flex; flex-direction:column; align-items:flex-start; gap:10px; padding:0 110px 34px 0; }
    .stk-col { display:flex; flex-direction:column-reverse; gap:6px; }
    .stk-row { display:flex; align-items:center; gap:10px; }
    .stk-row .idx { width:16px; text-align:right; }
    .stk .cell { width:88px; }
    .stk-ptr { position:absolute; left:124px; top:0; transition:transform .42s cubic-bezier(.2,.8,.2,1); }
    .stk-cap { padding-left:26px; }
    .stk-fly { position:absolute; margin:0; pointer-events:none; z-index:2; }
  `);

  const items = new Array(CAPACITY).fill(null);
  let top = -1;
  let ghostExplained = false;

  const input = ctx.input(t('valuePlaceholder'));
  ctx.button(t('push'), push, { kind: 'primary' });
  ctx.button(t('pop'), pop);
  ctx.button(t('peek'), peek);
  ctx.button(t('reset'), reset, { kind: 'danger' });

  const wrap = el('div', { class: 'stk' });
  const column = el('div', { class: 'stk-col' });
  const cells = [];
  for (let i = 0; i < CAPACITY; i++) {
    const cell = el('div', { class: 'cell empty' });
    cells.push(cell);
    column.append(el('div', { class: 'stk-row' }, el('span', { class: 'idx', text: String(i) }), cell));
  }
  const pointer = el('div', { class: 'pointer stk-ptr' });
  wrap.append(el('div', { class: 'idx stk-cap', text: t('capacity', { n: CAPACITY }) }), column, pointer);
  ctx.stage.append(wrap);

  function paint() {
    cells.forEach((cell, i) => {
      const v = items[i];
      cell.textContent = v == null ? '' : String(v);
      cell.className = `cell${v == null ? ' empty' : i > top ? ' ghost' : ''}`;
    });
    pointer.textContent = `← ${t('top')} = ${top}`;
    const ref = cells[Math.max(top, 0)];
    const y = top >= 0 ? ref.offsetTop + ref.offsetHeight / 2 : ref.offsetTop + ref.offsetHeight + 16;
    pointer.style.transform = `translateY(${y - pointer.offsetHeight / 2}px)`;
  }

  async function shake(cell) {
    wrap.classList.add('shake');
    if (cell) cell.classList.add('bad');
    await ctx.wait(450);
    wrap.classList.remove('shake');
    if (cell) cell.classList.remove('bad');
  }

  async function push() {
    const value = input.read();
    if (top === CAPACITY - 1) {
      ctx.say(t('overflow', { value, index: top }), 'warn');
      await shake(cells[top]);
      return;
    }
    top++;
    items[top] = value;
    paint();
    ctx.say(t('pushed', { value, index: top }), 'ok');
    await ctx.enter(cells[top], 0, -70);
  }

  async function pop() {
    if (top === -1) {
      ctx.say(t('underflow'), 'warn');
      await shake();
      return;
    }
    const index = top;
    const value = items[index];
    const cell = cells[index];
    const flying = el('div', {
      class: 'cell stk-fly',
      text: String(value),
      style: { left: `${cell.offsetLeft}px`, top: `${cell.offsetTop}px`, width: `${cell.offsetWidth}px`, height: `${cell.offsetHeight}px` },
    });
    wrap.append(flying);
    top--;
    paint();
    ctx.say(t('popped', { value, index, top }), 'ok');
    if (!ghostExplained) {
      ghostExplained = true;
      ctx.say(t('ghost'), 'info');
    }
    await ctx.leave(flying, 70, -50);
  }

  async function peek() {
    if (top === -1) {
      ctx.say(t('underflow'), 'warn');
      await shake();
      return;
    }
    ctx.say(t('peeked', { value: items[top] }), 'info');
    await ctx.pulse(cells[top], 'hit', 700);
  }

  async function reset() {
    items.fill(null);
    top = -1;
    paint();
    ctx.say(t('resetDone'), 'info');
  }

  [5, 12, 8].forEach((v) => (items[++top] = v));
  paint();
  ctx.say(t('hello', { n: CAPACITY, top }), 'info');
  window.addEventListener('resize', paint);
});
