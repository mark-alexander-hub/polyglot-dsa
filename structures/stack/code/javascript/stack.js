// Stack: last in, first out.
// We build it on a fixed-size array so you can see exactly what happens inside.
// (In everyday JavaScript you would simply use an array with push() and pop().)

class Stack {
  // @snippet setup
  constructor(capacity) {
    this.items = new Array(capacity).fill(0); // a row of boxes that hold our values
    this.capacity = capacity;                 // how many values fit
    this.top = -1;                            // index of the top value; -1 means empty
  }
  // @end

  // @snippet push
  push(value) {
    if (this.top === this.capacity - 1) {
      throw new Error('stack is full');
    }
    this.top++;
    this.items[this.top] = value;
  }
  // @end

  // @snippet pop
  pop() {
    if (this.top === -1) {
      throw new Error('stack is empty');
    }
    const value = this.items[this.top];
    this.top--; // the old value stays in its box until a push overwrites it
    return value;
  }
  // @end

  // @snippet peek
  peek() {
    if (this.top === -1) {
      throw new Error('stack is empty');
    }
    return this.items[this.top];
  }
  // @end

  isEmpty() {
    return this.top === -1;
  }

  size() {
    return this.top + 1;
  }

  toString() {
    return `[${this.items.slice(0, this.top + 1).join(', ')}]`;
  }
}

function main() {
  const stack = new Stack(5);
  console.log('Stack with room for 5 items (the top is on the right)');

  for (const value of [10, 20, 30]) {
    stack.push(value);
    console.log(`push ${value} -> ${stack}`);
  }

  console.log(`peek -> ${stack.peek()}`);
  let popped = stack.pop();
  console.log(`pop -> ${popped}, stack is now ${stack}`);
  console.log(`size -> ${stack.size()}`);

  for (const value of [40, 50, 60, 70]) {
    try {
      stack.push(value);
      console.log(`push ${value} -> ${stack}`);
    } catch (error) {
      console.log(`push ${value} -> error: ${error.message}`);
    }
  }

  while (!stack.isEmpty()) {
    popped = stack.pop();
    console.log(`pop -> ${popped}, stack is now ${stack}`);
  }

  console.log(`is empty? -> ${stack.isEmpty() ? 'yes' : 'no'}`);
  try {
    stack.pop();
  } catch (error) {
    console.log(`pop -> error: ${error.message}`);
  }
}

main();
