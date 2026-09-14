// Array: values sit side by side in numbered boxes.
// We build a fixed-size array ourselves so you can see every shift happen.
// (In everyday JavaScript you would simply use a normal array.)

class FixedArray {
  // @snippet setup
  constructor(capacity) {
    this.items = new Array(capacity).fill(0); // a row of boxes, numbered from 0
    this.capacity = capacity;                 // how many boxes there are
    this.size = 0;                            // how many boxes are in use
  }
  // @end

  // @snippet get
  get(index) {
    if (index < 0 || index >= this.size) {
      throw new RangeError('index out of range');
    }
    return this.items[index];
  }
  // @end

  // @snippet insert
  insert(index, value) {
    if (this.size === this.capacity) {
      throw new Error('array is full');
    }
    if (index < 0 || index > this.size) {
      throw new RangeError('index out of range');
    }
    // Shift values one box to the right, starting from the end.
    for (let i = this.size; i > index; i--) {
      this.items[i] = this.items[i - 1];
    }
    this.items[index] = value;
    this.size++;
  }
  // @end

  // @snippet remove
  remove(index) {
    if (index < 0 || index >= this.size) {
      throw new RangeError('index out of range');
    }
    const value = this.items[index];
    // Shift values one box to the left to close the gap.
    for (let i = index; i < this.size - 1; i++) {
      this.items[i] = this.items[i + 1];
    }
    this.size--;
    return value;
  }
  // @end

  // @snippet search
  search(value) {
    for (let i = 0; i < this.size; i++) {
      if (this.items[i] === value) {
        return i;
      }
    }
    return -1; // not found
  }
  // @end

  toString() {
    return `[${this.items.slice(0, this.size).join(', ')}]`;
  }
}

function insertAndShow(array, index, value) {
  try {
    array.insert(index, value);
    console.log(`insert ${value} at ${index} -> ${array}`);
  } catch (error) {
    console.log(`insert ${value} at ${index} -> error: ${error.message}`);
  }
}

function main() {
  const array = new FixedArray(5);
  console.log('Array with room for 5 values');

  for (const [index, value] of [[0, 10], [1, 20], [2, 40], [2, 30], [0, 5], [5, 50]]) {
    insertAndShow(array, index, value);
  }

  for (const index of [2, 7]) {
    try {
      const value = array.get(index);
      console.log(`get ${index} -> ${value}`);
    } catch (error) {
      console.log(`get ${index} -> error: ${error.message}`);
    }
  }

  for (const value of [30, 99]) {
    console.log(`search ${value} -> ${array.search(value)}`);
  }

  for (const index of [0, 2, 3]) {
    try {
      const removed = array.remove(index);
      console.log(`remove ${index} -> ${removed}, array is now ${array}`);
    } catch (error) {
      console.log(`remove ${index} -> error: ${error.message}`);
    }
  }

  insertAndShow(array, 3, 60);
  insertAndShow(array, 9, 70);
  console.log(`size -> ${array.size}, capacity -> ${array.capacity}`);
}

main();
