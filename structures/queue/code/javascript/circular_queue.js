// Queue: first in, first out.
// We build a circular queue on a fixed-size array so you can see exactly what happens inside.
// (In everyday JavaScript you might use push() and shift(), but shift() is slow for long queues.)

class CircularQueue {
  // @snippet setup
  constructor(capacity) {
    this.items = new Array(capacity).fill(0); // a row of boxes that hold our values
    this.capacity = capacity;                 // how many values fit
    this.front = 0;                           // index of the box holding the oldest value
    this.count = 0;                           // how many values are in the queue right now
  }
  // @end

  // @snippet enqueue
  enqueue(value) {
    if (this.count === this.capacity) {
      throw new Error('queue is full');
    }
    const rear = (this.front + this.count) % this.capacity; // next free box
    this.items[rear] = value;
    this.count++;
  }
  // @end

  // @snippet dequeue
  dequeue() {
    if (this.count === 0) {
      throw new Error('queue is empty');
    }
    const value = this.items[this.front];
    this.front = (this.front + 1) % this.capacity; // wraps around to box 0
    this.count--;
    return value;
  }
  // @end

  // @snippet peek
  peek() {
    if (this.count === 0) {
      throw new Error('queue is empty');
    }
    return this.items[this.front];
  }
  // @end

  isEmpty() {
    return this.count === 0;
  }

  size() {
    return this.count;
  }

  toString() {
    const values = [];
    for (let i = 0; i < this.count; i++) {
      values.push(this.items[(this.front + i) % this.capacity]);
    }
    let text = `[${values.join(', ')}] (front at box ${this.front}`;
    if (this.count > 0) {
      text += `, rear at box ${(this.front + this.count - 1) % this.capacity}`;
    }
    return `${text})`;
  }
}

function main() {
  const queue = new CircularQueue(5);
  console.log('Queue with room for 5 items (join at the rear, leave from the front)');

  for (const value of [10, 20, 30, 40, 50, 60]) {
    try {
      queue.enqueue(value);
      console.log(`enqueue ${value} -> ${queue}`);
    } catch (error) {
      console.log(`enqueue ${value} -> error: ${error.message}`);
    }
  }

  console.log(`peek -> ${queue.peek()}`);
  for (let i = 0; i < 2; i++) {
    const removed = queue.dequeue();
    console.log(`dequeue -> ${removed}, queue is now ${queue}`);
  }

  for (const value of [60, 70]) {
    queue.enqueue(value);
    console.log(`enqueue ${value} -> ${queue}`);
  }
  console.log(`size -> ${queue.size()}`);

  while (!queue.isEmpty()) {
    const removed = queue.dequeue();
    console.log(`dequeue -> ${removed}, queue is now ${queue}`);
  }

  console.log(`is empty? -> ${queue.isEmpty() ? 'yes' : 'no'}`);
  try {
    queue.dequeue();
  } catch (error) {
    console.log(`dequeue -> error: ${error.message}`);
  }
}

main();
