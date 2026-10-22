// Linked list: a chain of nodes, each one pointing to the next.
// We build it from scratch so you can see exactly how the links change.
// (In everyday JavaScript you would usually just use an array.)

// @snippet node
class Node {
  constructor(value) {
    this.value = value; // the data this node holds
    this.next = null;   // the next node in the chain; null means "no next node"
  }
}
// @end

class LinkedList {
  // @snippet setup
  constructor() {
    this.head = null; // the first node; null means the list is empty
    this.count = 0;   // how many nodes the list has
  }
  // @end

  // @snippet add-first
  addFirst(value) {
    // @step add-first-new
    const node = new Node(value);
    // @end
    // @step add-first-link
    node.next = this.head; // 1. the new node points at the old first node
    // @end
    // @step add-first-head
    this.head = node;      // 2. head moves to the new node
    this.count++;
    // @end
  }
  // @end

  // @snippet add-last
  addLast(value) {
    const node = new Node(value);
    // @step add-last-empty
    if (this.head === null) { // empty list: the new node becomes the head
      this.head = node;
    // @end
    } else {
      // @step add-last-walk
      let current = this.head;
      while (current.next !== null) { // walk until the last node
        current = current.next;
      }
      // @end
      // @step add-last-link
      current.next = node;
      // @end
    }
    this.count++;
  }
  // @end

  // @snippet find
  find(value) {
    // @step find-start
    let current = this.head;
    // @end
    while (current !== null) {
      // @step find-check
      if (current.value === value) {
        return true;
      // @end
      }
      // @step find-next
      current = current.next;
      // @end
    }
    // @step find-none
    return false;
    // @end
  }
  // @end

  // @snippet remove
  remove(value) {
    // @step remove-empty
    if (this.head === null) {
      throw new Error('value not found');
    // @end
    }
    // @step remove-head
    if (this.head.value === value) { // removing the first node: just move head
      this.head = this.head.next;
      this.count--;
      return;
    // @end
    }
    // @step remove-walk
    let previous = this.head;
    while (previous.next !== null && previous.next.value !== value) {
      previous = previous.next;
    }
    // @end
    // @step remove-missing
    if (previous.next === null) {
      throw new Error('value not found');
    // @end
    }
    // @step remove-skip
    previous.next = previous.next.next; // skip over the removed node
    this.count--;
    // @end
  }
  // @end

  size() {
    return this.count;
  }

  toString() {
    const parts = [];
    for (let current = this.head; current !== null; current = current.next) {
      parts.push(String(current.value));
    }
    parts.push('null');
    return parts.join(' -> ');
  }
}

function main() {
  const numbers = new LinkedList();
  console.log(`Linked list, starting empty: ${numbers}`);

  for (const value of [20, 10]) {
    numbers.addFirst(value);
    console.log(`add first ${value}: ${numbers}`);
  }

  for (const value of [30, 40]) {
    numbers.addLast(value);
    console.log(`add last ${value}: ${numbers}`);
  }

  console.log(`size: ${numbers.size()}`);

  for (const value of [30, 99]) {
    console.log(`find ${value}: ${numbers.find(value) ? 'yes' : 'no'}`);
  }

  for (const value of [10, 30, 99, 40, 20]) {
    try {
      numbers.remove(value);
      console.log(`remove ${value}: ${numbers}`);
    } catch (error) {
      console.log(`remove ${value}: error: ${error.message}`);
    }
  }

  console.log(`size: ${numbers.size()}`);
}

main();
