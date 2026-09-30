A **heap** is a tree that always keeps the smallest value on top. Every value in it is
smaller than (or equal to) the two values hanging below it, so the top, called the
**root**, is the minimum of the whole heap. This kind is a **min-heap**. Flip the rule and
the largest value sits on top: a **max-heap**.

Heaps are the usual way to build a **priority queue**: a queue where the most urgent thing
comes out first, whatever order things went in.

## In real life

Think of the emergency ward of a hospital. Patients are not treated in the order they
walked in. A nurse gives each one a number for how urgent they are, `1` for the most
serious, and the doctor always calls the patient with the smallest number next. New
patients keep arriving with new numbers, and "who is next?" must be answered instantly.

That is exactly what a heap does:

- **Insert** a new patient in a few steps.
- **Peek** at the most urgent one at once.
- **Remove** the most urgent one, and the next most urgent moves up.

You meet the same idea in an **airport boarding queue** (priority groups first), in the
**to-do list** that always shows your most urgent task at the top, and inside your
computer, where the operating system picks the most urgent job to run next.

## How it works

We draw a heap as a tree, but we store it in an ordinary array, level by level: first the
root, then its two children, then their four children, and so on. No pointers are
needed. A little arithmetic finds any value's family:

- The **parent** of the value at index `i` is at `(i - 1) / 2` (whole-number division).
- Its **left child** is at `2 * i + 1`, its **right child** at `2 * i + 2`.

So the array `[5, 17, 13, 42, 25, 30, 60]` is this tree: `5` on top, `17` and `13` under
it, then `42` and `25` under `17`, and `30` and `60` under `13`. Look at any parent and its
children: the parent is always the smaller one. This is the **heap rule**.

The tree is always filled from the top down and from left to right, with no gaps. Such a
tree is called **complete**. That is what lets us pack it into an array: the next free
index is always the next empty slot in the tree.

We keep `count`, the number of values in the heap, and a fixed **capacity**.

<!-- code: setup -->

> **Why build it ourselves?** Every language ships a heap or a priority queue: `heapq` in
> Python, `std::priority_queue` in C++, `PriorityQueue` in Java, `SplMinHeap` in PHP.
> JavaScript has none built in, so people write exactly this class. Building one shows
> you why those tools are fast, and interviewers love asking about it.

## Operations

A heap has three main operations. `peek` is trivial. `insert` and `removeMin` each fix the
heap rule with a short walk up or down the tree.

### insert: add a value

1. If `count` equals `capacity`, the heap is full. Stop with an error.
2. Put the new value in the first free slot, at index `count`, and add one to `count`.
   It is now the newest leaf, at the bottom right.
3. **Sift up:** while the value is smaller than its parent, swap the two. Each swap moves
   the value one level up. Stop when its parent is smaller, or when it reaches the root.

<!-- code: insert -->

Insert `8` into `[17, 42, 30]`: it lands at index `3`, under `42`. It is smaller than `42`,
so they swap. Now it is under `17`, still smaller, so they swap again. Result:
`[8, 17, 30, 42]`, two swaps. In the demo output every `insert` line shows how many swaps
it took.

### removeMin: take the smallest value out

1. If `count` is `0`, the heap is empty. Stop with an error.
2. Remember the root: that is the smallest value, the one we return.
3. Move the **last** value into the root's place and reduce `count` by one. The tree is
   still complete, but the new root is probably too big.
4. **Sift down:** compare the value with its two children. If either child is smaller,
   swap with the **smaller** child and continue from there. Stop when both children are
   bigger, or when there are no children left.

<!-- code: removeMin -->

Why the smaller child? Because after the swap that child becomes the parent of the other
one, and a parent must be smaller than both children.

### peek: look at the smallest value

The smallest value is always the root, at index `0`. `peek` returns it and changes
nothing.

<!-- code: peek -->

## How fast is it?

A complete tree with `n` values has only about `log₂ n` levels: `7` values need `3`
levels, `1,000` values need `10`, a million need `20`. Sifting up or down visits at most
one value per level, so `insert` and `removeMin` take `O(log n)` time. Compared with
scanning a plain list for the minimum every time (`O(n)`), that is a huge saving once the
heap is big.

| Operation | What it does | Time |
|---|---|---|
| `insert` | add a value and sift it up | `O(log n)` |
| `removeMin` | take the root, move the last value up, sift it down | `O(log n)` |
| `peek` | look at the root | `O(1)` |
| `isEmpty` | check whether `count` is `0` | `O(1)` |
| search for any other value | look at every value | `O(n)` |

A heap with room for `n` values uses one array of `n` slots, so it needs `O(n)` memory.

## Common mistakes

- **Expecting the array to be sorted.** `[5, 17, 13, 42, 25, 30, 60]` is a valid heap
  even though `17 > 13`. Only parents and children are ordered, not neighbours. Take
  values out one by one with `removeMin` if you want them sorted.
- **Sifting down to the wrong child.** Always swap with the *smaller* child. Swapping
  with the bigger one breaks the heap rule for the other child.
- **Forgetting a child may not exist.** Check `left < count` and `right < count` before
  reading them. The last few values in a heap have one child or none.
- **Off by one in the family formulas.** With the root at index `0`, the children of `i`
  are `2i + 1` and `2i + 2`. Some books start at index `1`, where they are `2i` and
  `2i + 1`. Pick one and stick to it.
- **Removing without checking.** Check `isEmpty()` (or catch the error) before `removeMin`
  or `peek`.

## Where is it used?

- **Priority queues** everywhere: printer jobs, hospital triage software, the tasks your
  operating system runs next.
- **Heap sort:** insert every value, then `removeMin` until empty. The values come out
  sorted, in `O(n log n)` time. The demo output ends with exactly that.
- **Shortest paths.** Dijkstra's algorithm, which map apps use to find the fastest route,
  keeps the cities still to visit in a heap so it can grab the nearest one instantly.
- **Top-k problems**, such as "the 10 most played songs" out of millions, using a small
  heap of size `k`.
- **Merging** many sorted lists into one, as search engines and databases do.
- **Timers and events:** the next alarm to ring is always the one with the earliest time.

## Try these

1. Insert `9, 4, 7, 1` into an empty heap in that order. Write down the array after each
   insert, then check yourself in the playground.
2. Draw the tree for the array `[2, 8, 3, 15, 9, 4]`. Is it a valid min-heap? Which single
   change would break it?
3. Change the program into a **max-heap**, so the largest value is always on top. Only two
   comparisons need to flip.
4. Use the heap to sort the list `[31, 7, 19, 2, 25, 11, 14]`: insert them all, then
   `removeMin` until it is empty.
5. Add a method `changeKey(i, value)` that replaces the value at index `i` and repairs the
   heap. When does it need to sift up, and when down?
