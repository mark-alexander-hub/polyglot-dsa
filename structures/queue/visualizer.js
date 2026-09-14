// Queue playground: a circle drawn as a row of boxes, with front and rear pointers that wrap around.
VizKit.register('queue', (ctx) => {
  const { t, el } = ctx;
  const CAPACITY = 6;

  ctx.css(`
    .q { position:relative; margin:auto; padding:30px 6px 84px; }
    .q-row { display:flex; gap:8px; }
    .q-col { display:flex; flex-direction:column; align-items:center; gap:4px; }
    .q-ptr { position:absolute; left:0; top:6px; transition:transform .42s cubic-bezier(.2,.8,.2,1), opacity .3s; }
    .q-ptr.q-rear { color:var(--coral); }
    .q-loop { position:absolute; height:18px; border:2px dashed var(--border); border-top:0; border-radius:0 0 14px 14px; transition:border-color .3s; }
    .q-loop::before { content:""; position:absolute; left:-8px; top:-9px; border-left:6px solid transparent; border-right:6px solid transparent; border-bottom:9px solid var(--border); transition:border-color .3s; }
    .q-loop span { position:absolute; left:50%; top:100%; transform:translate(-50%, 2px); white-space:nowrap; }
    .q-loop.q-lit { border-color:var(--accent); }
    .q-loop.q-lit::before { border-bottom-color:var(--accent); }
    .q-loop.q-lit span { color:var(--accent); }
    .q-stats { position:absolute; left:0; right:0; bottom:0; text-align:center; white-space:nowrap; }
    .q-fly { position:absolute; margin:0; pointer-events:none; z-index:2; }
    @media (max-width: 640px) {
      .q .cell { width:40px; height:40px; font-size:15px; }
      .q-row { gap:5px; }
    }
  `);

  const items = new Array(CAPACITY).fill(null);
  let front = 0;
  let count = 0;
  let ghostExplained = false;

  const input = ctx.input(t('valuePlaceholder'));
  ctx.button(t('enqueue'), enqueue, { kind: 'primary' });
  ctx.button(t('dequeue'), dequeue);
  ctx.button(t('peek'), peek);
  ctx.button(t('reset'), reset, { kind: 'danger' });

  const board = el('div', { class: 'q' });
  const row = el('div', { class: 'q-row' });
  const cells = [];
  for (let i = 0; i < CAPACITY; i++) {
    const cell = el('div', { class: 'cell empty' });
    cells.push(cell);
    row.append(el('div', { class: 'q-col' }, cell, el('span', { class: 'idx', text: String(i) })));
  }
  const frontPtr = el('div', { class: 'pointer q-ptr q-front', text: `▼ ${t('front')}` });
  const rearPtr = el('div', { class: 'pointer q-ptr q-rear', text: `▲ ${t('rear')}` });
  const loop = el('div', { class: 'q-loop', 'aria-hidden': 'true' }, el('span', { class: 'idx', text: `% ${CAPACITY}` }));
  const stats = el('div', { class: 'idx q-stats' });
  board.append(frontPtr, row, rearPtr, loop, stats);
  ctx.stage.append(board);

  const rearIndex = () => (front + count - 1 + CAPACITY) % CAPACITY;
  const inQueue = (i) => count > 0 && (i - front + CAPACITY) % CAPACITY < count;
  const xFor = (i) => cells[i].offsetLeft + cells[i].offsetWidth / 2;
  const setX = (ptr, i) => {
    ptr.style.transform = `translateX(${xFor(i) - ptr.offsetWidth / 2}px)`;
  };

  function paint() {
    cells.forEach((cell, i) => {
      const v = items[i];
      cell.textContent = v == null ? '' : String(v);
      cell.className = `cell${v == null ? ' empty' : inQueue(i) ? '' : ' ghost'}`;
    });
    stats.textContent = `front = ${front} · count = ${count} · rear = ${count ? rearIndex() : '-'}`;
  }

  // Place everything without animation (first draw and window resizes).
  function layout() {
    const below = row.offsetTop + row.offsetHeight;
    rearPtr.style.top = `${below + 2}px`;
    loop.style.top = `${below + 26}px`;
    loop.style.left = `${xFor(0)}px`;
    loop.style.width = `${xFor(CAPACITY - 1) - xFor(0)}px`;
    for (const ptr of [frontPtr, rearPtr]) ptr.style.transition = 'none';
    setX(frontPtr, front);
    if (count) setX(rearPtr, rearIndex());
    rearPtr.style.opacity = count ? '1' : '0';
    void frontPtr.offsetWidth;
    for (const ptr of [frontPtr, rearPtr]) ptr.style.transition = '';
  }

  async function move(ptr, from, to) {
    if (from === to) return;
    const wraps = from === CAPACITY - 1 && to === 0;
    if (!wraps || ctx.reducedMotion) {
      setX(ptr, to);
      if (wraps) await ctx.pulse(loop, 'q-lit', 700);
      else await ctx.wait(420);
      return;
    }
    // Slide off the right edge, then come back in from the left: the circle, made visible.
    const step = cells[1].offsetLeft - cells[0].offsetLeft;
    const x0 = xFor(from) - ptr.offsetWidth / 2;
    const x1 = xFor(to) - ptr.offsetWidth / 2;
    ptr.style.transition = 'none';
    setX(ptr, to);
    loop.classList.add('q-lit');
    await ptr.animate(
      [
        { transform: `translateX(${x0}px)`, opacity: 1 },
        { transform: `translateX(${x0 + step}px)`, opacity: 0, offset: 0.45 },
        { transform: `translateX(${x1 - step}px)`, opacity: 0, offset: 0.55 },
        { transform: `translateX(${x1}px)`, opacity: 1 },
      ],
      { duration: 760, easing: 'ease-in-out' },
    ).finished;
    ptr.style.transition = '';
    await ctx.wait(250);
    loop.classList.remove('q-lit');
  }

  async function movePointers(oldFront, oldRear, oldCount) {
    const jobs = [move(frontPtr, oldFront, front)];
    if (count === 0) {
      rearPtr.style.opacity = '0';
    } else if (oldCount === 0) {
      rearPtr.style.transition = 'none';
      setX(rearPtr, rearIndex());
      void rearPtr.offsetWidth;
      rearPtr.style.transition = '';
      rearPtr.style.opacity = '1';
    } else {
      jobs.push(move(rearPtr, oldRear, rearIndex()));
    }
    await Promise.all(jobs);
  }

  async function shake(cell) {
    board.classList.add('shake');
    if (cell) cell.classList.add('bad');
    await ctx.wait(450);
    board.classList.remove('shake');
    if (cell) cell.classList.remove('bad');
  }

  async function enqueue() {
    const value = input.read();
    if (count === CAPACITY) {
      ctx.say(t('full', { value, n: CAPACITY }), 'warn');
      await shake(cells[rearIndex()]);
      return;
    }
    const oldFront = front;
    const oldCount = count;
    const oldRear = rearIndex();
    const index = (front + count) % CAPACITY;
    items[index] = value;
    count++;
    paint();
    ctx.say(t('enqueued', { value, front, count: oldCount, n: CAPACITY, index, newCount: count }), 'ok');
    if (front + oldCount === CAPACITY) ctx.say(t('enqueueWrapped', { index }), 'info');
    await Promise.all([ctx.enter(cells[index], 0, -50), movePointers(oldFront, oldRear, oldCount)]);
  }

  async function dequeue() {
    if (count === 0) {
      ctx.say(t('empty'), 'warn');
      await shake();
      return;
    }
    const oldFront = front;
    const oldCount = count;
    const oldRear = rearIndex();
    const index = front;
    const value = items[index];
    const cell = cells[index];
    const flying = el('div', {
      class: 'cell q-fly',
      text: String(value),
      style: { left: `${cell.offsetLeft}px`, top: `${cell.offsetTop}px`, width: `${cell.offsetWidth}px`, height: `${cell.offsetHeight}px` },
    });
    board.append(flying);
    front = (front + 1) % CAPACITY;
    count--;
    paint();
    ctx.say(t('dequeued', { value, index, front, count }), 'ok');
    if (index === CAPACITY - 1) ctx.say(t('dequeueWrapped'), 'info');
    if (!ghostExplained) {
      ghostExplained = true;
      ctx.say(t('ghost'), 'info');
    }
    await Promise.all([ctx.leave(flying, -40, -50), movePointers(oldFront, oldRear, oldCount)]);
  }

  async function peek() {
    if (count === 0) {
      ctx.say(t('empty'), 'warn');
      await shake();
      return;
    }
    ctx.say(t('peeked', { value: items[front], index: front }), 'info');
    await ctx.pulse(cells[front], 'hit', 700);
  }

  async function reset() {
    const oldFront = front;
    items.fill(null);
    front = 0;
    count = 0;
    paint();
    ctx.say(t('resetDone'), 'info');
    rearPtr.style.opacity = '0';
    if (oldFront !== 0) {
      setX(frontPtr, 0);
      await ctx.wait(420);
    }
  }

  // Start part-way through: two values have already left (faded), three are waiting.
  [3, 9, 14, 27, 8].forEach((v, i) => (items[i] = v));
  front = 2;
  count = 3;
  paint();
  layout();
  ghostExplained = true;
  ctx.say(t('ghost'), 'info');
  ctx.say(t('hello', { n: CAPACITY, front, count }), 'info');
  window.addEventListener('resize', layout);
});
