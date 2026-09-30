// Min-heap: the smallest value is always on top.
// We build it on a fixed-size array so you can see exactly what happens inside.
// (JavaScript has no built-in heap, so this is the class people write.)

class MinHeap {
  // @snippet setup
  constructor(capacity) {
    this.items = new Array(capacity).fill(0); // the tree, stored level by level
    this.capacity = capacity;                 // how many values fit
    this.count = 0;                           // how many values are in the heap right now
  }

  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  left(i) {
    return 2 * i + 1;
  }

  right(i) {
    return 2 * i + 2;
  }
  // @end

  // @snippet insert
  insert(value) {
    if (this.count === this.capacity) {
      throw new Error('heap is full');
    }
    this.items[this.count] = value; // put it in the first free spot, at the end
    this.count++;
    return this.siftUp(this.count - 1); // how many steps it climbed (for the demo)
  }

  siftUp(i) {
    let swaps = 0;
    while (i > 0 && this.items[i] < this.items[this.parent(i)]) {
      const p = this.parent(i);
      [this.items[i], this.items[p]] = [this.items[p], this.items[i]];
      i = p;
      swaps++;
    }
    return swaps;
  }
  // @end

  // @snippet removeMin
  removeMin() {
    if (this.count === 0) {
      throw new Error('heap is empty');
    }
    const smallest = this.items[0];
    this.count--;
    this.items[0] = this.items[this.count]; // the last value moves to the top...
    this.siftDown(0);                       // ...and sinks to where it belongs
    return smallest;
  }

  siftDown(i) {
    while (true) {
      const l = this.left(i);
      const r = this.right(i);
      let smallest = i;
      if (l < this.count && this.items[l] < this.items[smallest]) {
        smallest = l;
      }
      if (r < this.count && this.items[r] < this.items[smallest]) {
        smallest = r;
      }
      if (smallest === i) {
        return;
      }
      [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
      i = smallest;
    }
  }
  // @end

  // @snippet peek
  peek() {
    if (this.count === 0) {
      throw new Error('heap is empty');
    }
    return this.items[0];
  }
  // @end

  isEmpty() {
    return this.count === 0;
  }

  size() {
    return this.count;
  }

  toString() {
    return `[${this.items.slice(0, this.count).join(', ')}]`;
  }
}

function swapsText(swaps) {
  return `${swaps} ${swaps === 1 ? 'swap' : 'swaps'}`;
}

function main() {
  const heap = new MinHeap(7);
  console.log('Min-heap with room for 7 values (the smallest is always on top)');

  for (const value of [42, 17, 30, 8]) {
    const swaps = heap.insert(value);
    console.log(`insert ${value} -> ${heap} (${swapsText(swaps)})`);
  }

  console.log(`peek -> ${heap.peek()}`);
  console.log(`size -> ${heap.size()}`);
  let smallest = heap.removeMin();
  console.log(`removeMin -> ${smallest}, heap is now ${heap}`);

  for (const value of [25, 5, 13, 60, 3]) {
    try {
      const swaps = heap.insert(value);
      console.log(`insert ${value} -> ${heap} (${swapsText(swaps)})`);
    } catch (error) {
      console.log(`insert ${value} -> error: ${error.message}`);
    }
  }

  const taken = [];
  while (!heap.isEmpty()) {
    smallest = heap.removeMin();
    taken.push(smallest);
    console.log(`removeMin -> ${smallest}, heap is now ${heap}`);
  }

  console.log(`taken out in order -> ${taken.join(', ')}`);
  console.log(`is empty? -> ${heap.isEmpty() ? 'yes' : 'no'}`);
  try {
    heap.removeMin();
  } catch (error) {
    console.log(`removeMin -> error: ${error.message}`);
  }
}

main();
