// Linked list playground: nodes joined by arrows, a head label, and a walking "current" pointer.
VizKit.register('linked-list', (ctx) => {
  const { t, el } = ctx;
  const MAX = 7;

  ctx.css(`
    .ll { display:flex; flex-wrap:wrap; justify-content:center; align-items:flex-end; row-gap:16px; min-width:0; max-width:100%; }
    .ll-item { display:flex; flex-direction:column; align-items:flex-start; }
    .ll-tag { height:20px; padding-left:4px; white-space:nowrap; }
    .ll-box { display:flex; align-items:center; }
    .ll-arrow { width:30px; text-align:center; font-family:var(--mono); font-size:20px; color:var(--subtle); transition:color .25s, transform .25s; }
    .ll-arrow.on { color:var(--gold); transform:scale(1.35); }
    .ll-null { display:flex; align-items:center; height:48px; padding:0 8px; border-radius:10px; border:2px dashed var(--border); font-family:var(--mono); color:var(--subtle); }
    .ll-null.bad { border-color:var(--red); color:var(--red); }
    .ll-item.ll-out { opacity:.45; transform:translateY(14px); transition:opacity .3s, transform .3s; }
    @media (max-width: 640px) { .ll-arrow { width:22px; font-size:17px; } .ll-null { height:42px; } }
  `);

  let nodes = [];
  let nextKey = 0;
  const makeNode = (value) => ({ key: `n${nextKey++}`, value });

  const input = ctx.input(t('valuePlaceholder'));
  ctx.button(t('addFirst'), addFirst, { kind: 'primary' });
  ctx.button(t('addLast'), addLast);
  ctx.button(t('find'), find);
  ctx.button(t('remove'), remove);
  ctx.button(t('reset'), reset, { kind: 'danger' });

  const chain = el('div', { class: 'll' });
  ctx.stage.append(chain);
  let items = [];
  let endItem = null;

  // Draws the chain. tags: extra labels by node index; head: index the head label sits on.
  function render({ tags = {}, head = 0 } = {}) {
    items = nodes.map((node, i) => {
      const words = [];
      if (i === head) words.push(t('head'));
      if (tags[i]) words.push(tags[i]);
      return el('div', { class: 'll-item', 'data-key': node.key },
        el('div', { class: 'pointer ll-tag', text: words.length ? `${words.join(', ')} ↓` : '' }),
        el('div', { class: 'll-box' }, el('div', { class: 'cell', text: String(node.value) }), el('span', { class: 'll-arrow', 'aria-hidden': 'true', text: '→' })));
    });
    endItem = el('div', { class: 'll-item', 'data-key': 'null' },
      el('div', { class: 'pointer ll-tag', text: nodes.length === 0 ? `${t('head')} ↓` : '' }),
      el('div', { class: 'll-box' }, el('span', { class: 'll-null', text: t('null') })));
    chain.replaceChildren(...items, endItem);
  }

  const cellAt = (i) => items[i].querySelector('.cell');
  const arrowAt = (i) => items[i].querySelector('.ll-arrow');

  async function shake(target) {
    chain.classList.add('shake');
    if (target) target.classList.add('bad');
    await ctx.wait(450);
    chain.classList.remove('shake');
    if (target) target.classList.remove('bad');
  }

  // Highlights node i with a label, as if a pointer variable were standing on it.
  async function visit(i, label, ms = 480) {
    render({ tags: { [i]: label } });
    await ctx.pulse(cellAt(i), 'hit', ms);
  }

  async function addFirst() {
    const value = input.read();
    if (nodes.length >= MAX) {
      ctx.say(t('full', { max: MAX }), 'warn');
      await shake();
      return;
    }
    if (nodes.length === 0) {
      nodes.unshift(makeNode(value));
      await ctx.flip(chain, () => render());
      ctx.say(t('addedEmpty', { value }), 'ok');
      return;
    }
    // Step 1: the new node appears in front and points at the old head.
    nodes.unshift(makeNode(value));
    await ctx.flip(chain, () => render({ tags: { 0: t('newNode') }, head: 1 }));
    arrowAt(0).classList.add('on');
    await ctx.wait(650);
    // Step 2: head moves to the new node.
    render();
    await ctx.pulse(cellAt(0), 'hit', 500);
    ctx.say(t('addedFirst', { value }), 'ok');
  }

  async function addLast() {
    const value = input.read();
    if (nodes.length >= MAX) {
      ctx.say(t('full', { max: MAX }), 'warn');
      await shake();
      return;
    }
    if (nodes.length === 0) {
      nodes.push(makeNode(value));
      await ctx.flip(chain, () => render());
      ctx.say(t('addedEmpty', { value }), 'ok');
      return;
    }
    for (let i = 0; i < nodes.length; i++) await visit(i, t('current'));
    const last = nodes.length - 1;
    nodes.push(makeNode(value));
    await ctx.flip(chain, () => render({ tags: { [last]: t('current'), [last + 1]: t('newNode') } }));
    arrowAt(last).classList.add('on');
    await ctx.pulse(cellAt(last + 1), 'hit', 500);
    render();
    ctx.say(t('addedLast', { value, steps: last }), 'ok');
  }

  async function find() {
    const value = input.read();
    if (nodes.length === 0) {
      ctx.say(t('emptyList'), 'warn');
      await shake(endItem.querySelector('.ll-null'));
      return;
    }
    for (let i = 0; i < nodes.length; i++) {
      await visit(i, t('current'));
      if (nodes[i].value === value) {
        render({ tags: { [i]: t('current') } });
        ctx.say(t('found', { value, steps: i + 1 }), 'ok');
        await ctx.pulse(cellAt(i), 'hit', 900);
        render();
        return;
      }
    }
    render();
    ctx.say(t('notFound', { value, steps: nodes.length }), 'warn');
    await shake(endItem.querySelector('.ll-null'));
  }

  async function remove() {
    const value = input.read();
    if (nodes.length === 0) {
      ctx.say(t('emptyList'), 'warn');
      await shake(endItem.querySelector('.ll-null'));
      return;
    }
    if (nodes[0].value === value) {
      cellAt(0).classList.add('bad');
      await ctx.wait(450);
      render({ head: 1 });
      cellAt(0).classList.add('bad');
      items[0].classList.add('ll-out');
      await ctx.wait(550);
      await ctx.leave(items[0], 0, 40);
      nodes.shift();
      await ctx.flip(chain, () => render());
      ctx.say(t('removedHead', { value }), 'ok');
      return;
    }
    let previous = 0;
    await visit(previous, t('previous'));
    while (previous + 1 < nodes.length && nodes[previous + 1].value !== value) {
      previous++;
      await visit(previous, t('previous'));
    }
    if (previous + 1 === nodes.length) {
      render();
      ctx.say(t('removeMissing', { value }), 'warn');
      await shake(endItem.querySelector('.ll-null'));
      return;
    }
    const target = previous + 1;
    const after = nodes[target + 1];
    render({ tags: { [previous]: t('previous') } });
    cellAt(target).classList.add('bad');
    await ctx.wait(400);
    // The relink: previous.next now skips the target node.
    arrowAt(previous).classList.add('on');
    items[target].classList.add('ll-out');
    await ctx.wait(650);
    await ctx.leave(items[target], 0, 40);
    nodes.splice(target, 1);
    await ctx.flip(chain, () => render());
    ctx.say(t('removed', { value, next: after ? after.value : t('null') }), 'ok');
  }

  async function reset() {
    nodes = [];
    await ctx.flip(chain, () => render());
    ctx.say(t('resetDone'), 'info');
  }

  nodes = [8, 15, 23].map(makeNode);
  render();
  ctx.say(t('hello', { n: nodes.length, value: nodes[0].value }), 'info');
});
