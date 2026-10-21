// Hash map: find any value by its key in one jump, without searching through everything.
// We build it on a small array of buckets so you can see exactly what happens inside.
// (In everyday JavaScript you would simply use a Map or a plain object.)

class Entry {
  constructor(key, value, next) {
    this.key = key;
    this.value = value;
    this.next = next; // the next entry in the same bucket, or null
  }
}

class HashMap {
  // @snippet setup
  constructor(bucketCount) {
    this.buckets = new Array(bucketCount).fill(null); // each bucket holds a chain of entries
    this.bucketCount = bucketCount;
    this.count = 0;                                   // how many keys are stored right now
  }

  hashOf(key) {
    let total = 0;
    // @step hash-sum
    for (let i = 0; i < key.length; i++) {
      total += key.charCodeAt(i); // add up the character codes of the key
    // @end
    }
    return total;
  }

  indexOf(key) {
    // @step hash-index
    return this.hashOf(key) % this.bucketCount; // which bucket this key belongs to
    // @end
  }
  // @end

  // @snippet put
  put(key, value) {
    // @step put-bucket
    let entry = this.buckets[this.indexOf(key)];
    // @end
    // @step put-compare
    while (entry !== null) {
      if (entry.key === key) {
    // @end
        // @step put-update
        entry.value = value; // the key is already here: just replace its value
        return false;
        // @end
      }
      // @step put-next
      entry = entry.next;
      // @end
    }
    // @step put-grow
    if (this.count === this.bucketCount) {
      this.grow(); // already one key per bucket on average: make room first
    // @end
    }
    // @step put-insert
    const index = this.indexOf(key);
    this.buckets[index] = new Entry(key, value, this.buckets[index]); // new entry at the front of the chain
    this.count++;
    return true;
    // @end
  }
  // @end

  // @snippet grow
  grow() {
    // @step grow-double
    const oldBuckets = this.buckets;
    this.bucketCount *= 2;
    this.buckets = new Array(this.bucketCount).fill(null);
    // @end
    for (let entry of oldBuckets) {
      // @step grow-move
      while (entry !== null) { // every key gets a new bucket, because % changed
        const next = entry.next;
        const index = this.indexOf(entry.key);
        entry.next = this.buckets[index];
        this.buckets[index] = entry;
        entry = next;
      // @end
      }
    }
  }
  // @end

  // @snippet get
  get(key) {
    // @step get-bucket
    let entry = this.buckets[this.indexOf(key)];
    // @end
    // @step get-compare
    while (entry !== null) { // only this one chain is searched, never the whole map
      if (entry.key === key) {
    // @end
        // @step get-found
        return entry.value;
        // @end
      }
      // @step get-next
      entry = entry.next;
      // @end
    }
    // @step get-missing
    return null;
    // @end
  }
  // @end

  contains(key) {
    return this.get(key) !== null;
  }

  // @snippet remove
  remove(key) {
    // @step remove-bucket
    const index = this.indexOf(key);
    let entry = this.buckets[index];
    let previous = null;
    // @end
    // @step remove-compare
    while (entry !== null) {
      if (entry.key === key) {
    // @end
        // @step remove-unlink
        if (previous === null) {
          this.buckets[index] = entry.next; // it was the first in the chain
        } else {
          previous.next = entry.next;       // unlink it from the middle
        }
        this.count--;
        return true;
        // @end
      }
      // @step remove-next
      previous = entry;
      entry = entry.next;
      // @end
    }
    // @step remove-missing
    return false;
    // @end
  }
  // @end

  size() {
    return this.count;
  }

  keys() {
    const result = [];
    for (let entry of this.buckets) {
      while (entry !== null) {
        result.push(entry.key);
        entry = entry.next;
      }
    }
    return result;
  }

  bucketToString(index) {
    const parts = [];
    let entry = this.buckets[index];
    while (entry !== null) {
      parts.push(`${entry.key}=${entry.value}`);
      entry = entry.next;
    }
    return parts.length > 0 ? parts.join(' -> ') : '(empty)';
  }
}

function showPut(m, key, value) {
  const bucketsBefore = m.bucketCount;
  const added = m.put(key, value);
  if (m.bucketCount !== bucketsBefore) {
    console.log(`${m.size() - 1} keys in ${bucketsBefore} buckets, one more would crowd it -> grew to ${m.bucketCount} buckets and re-hashed every key`);
  }
  const index = m.indexOf(key);
  console.log(`put ${key}=${value} -> hash ${m.hashOf(key)} % ${m.bucketCount} = bucket ${index}, ${added ? 'new key' : 'value replaced'}`);
  console.log(`  bucket ${index}: ${m.bucketToString(index)}`);
}

function showGet(m, key) {
  const value = m.get(key);
  console.log(`get ${key} -> ${value === null ? 'not found' : value}`);
}

function showTable(m) {
  console.log(`the whole table (${m.size()} keys in ${m.bucketCount} buckets):`);
  for (let i = 0; i < m.bucketCount; i++) {
    console.log(`  bucket ${i}: ${m.bucketToString(i)}`);
  }
}

function main() {
  const m = new HashMap(4);
  console.log("Hash map with 4 buckets (a key's bucket = sum of its letter codes % 4)");

  for (const [key, value] of [['tea', 10], ['dosa', 40], ['idli', 30], ['vada', 25]]) {
    showPut(m, key, value);
  }
  showTable(m);

  for (const key of ['tea', 'idli', 'puri']) {
    showGet(m, key);
  }

  showPut(m, 'tea', 12);
  console.log(`size -> ${m.size()}`);

  showPut(m, 'coffee', 15);
  showTable(m);
  showGet(m, 'vada');

  for (const key of ['idli', 'idli']) {
    const index = m.indexOf(key);
    const removed = m.remove(key);
    console.log(`remove ${key} -> ${removed ? `removed from bucket ${index}` : 'not found'}`);
  }
  showGet(m, 'idli');

  for (const key of ['dosa', 'puri']) {
    console.log(`contains ${key} -> ${m.contains(key) ? 'yes' : 'no'}`);
  }
  console.log(`size -> ${m.size()}`);
  console.log(`keys in bucket order -> ${m.keys().join(', ')}`);
}

main();
