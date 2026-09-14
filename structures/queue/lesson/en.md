A **queue** is a list where values join at one end, called the **rear**, and leave from
the other end, called the **front**. The first value to join is the first one to leave.
People call this **FIFO**: *First In, First Out*.

## In real life

Think of the line at a railway ticket counter. A new passenger joins at the back of the
line, and the clerk serves whoever is at the front. Nobody is served from the middle, and
nobody who came later is served before someone who came earlier.

Computers wait in line all the time too:

- **Print jobs** wait in a queue. If three people press Print, the pages come out in the
  order they pressed it.
- **Messages** you send while your phone is offline wait in a queue and go out in order
  when the network comes back.
- A **video** keeps the next few seconds waiting in a queue, so it plays smoothly.

## How it works

We will build a queue on an array with a fixed number of boxes, called its **capacity**.

The first idea most people have is: add values at the end of the array and remove them
from box 0. But removing from box 0 means every other value has to shift one box to the
left, which is slow. The second idea is to keep a `front` index and simply move it forward
when a value leaves. That is fast, but now the boxes before `front` are wasted: after a few
dequeues the queue says "full" while half the array is empty.

The fix is to treat the array as a **circle**. When we step past the last box, we go back
to box 0. The `%` (remainder) operator does this wrapping for us: with 5 boxes,
`(4 + 1) % 5` is `0`.

We keep two numbers:

- `front` is the index of the box holding the oldest value, the next one to leave.
- `count` is how many values are in the queue right now.

We do not need to store the rear. The next free box is `(front + count) % capacity`, and
the newest value sits just before it.

<!-- code: setup -->

> **Why keep `count`?** Many books keep a `rear` index instead of `count`. If `rear` means
> "the next free box", then `front == rear` is true both when the queue is empty and when it
> is full, so you cannot tell the two apart without an extra rule. With `count` both checks
> are obvious: empty is `count == 0`, full is `count == capacity`.

## Operations

A queue has three main operations. Values only join at the rear and only leave from the
front.

### enqueue: join at the rear

1. If `count` equals `capacity`, every box is in use. The queue is full, so we stop with an
   error.
2. Work out the next free box: `(front + count) % capacity`. If that goes past the last
   box, `%` wraps it around to the start of the array.
3. Put the value in that box and add one to `count`.

<!-- code: enqueue -->

### dequeue: leave from the front

1. If `count` is `0`, the queue is empty. There is nothing to take, so we stop with an
   error.
2. Remember the value in the box at `front`.
3. Move `front` forward by one, wrapping with `% capacity`, take one off `count`, and
   return the value you remembered.

<!-- code: dequeue -->

Just like in the stack, we do **not** erase the old value. That box is now outside the
queue, and a later `enqueue` will write over it. In the playground above, these old values
are shown faded.

### peek: look at the front without removing it

`peek` returns the value at `front` and changes nothing. It is how the ticket clerk sees who
is next before calling them.

<!-- code: peek -->

## How fast is it?

Every operation does a little arithmetic and touches one box, however long the queue is.
So they all take the same small amount of time, `O(1)`. This is exactly why we use the
circle: the "remove from box 0 and shift everyone" version needs `O(n)` for every dequeue.

| Operation | What it does | Time |
|---|---|---|
| `enqueue` | add a value at the rear | `O(1)` |
| `dequeue` | take the value at the front | `O(1)` |
| `peek` | look at the front value | `O(1)` |
| `isEmpty` | check whether `count` is `0` | `O(1)` |
| search for a value | look through the values one by one | `O(n)` |

A queue with room for `n` values uses `n` boxes, so it needs `O(n)` memory.

## Common mistakes

- **Forgetting to wrap.** Writing `front + 1` instead of `(front + 1) % capacity` runs past
  the end of the array after a few operations.
- **Confusing full and empty.** If you only keep `front` and `rear`, both can look the same.
  Keep `count`, or always leave one box unused.
- **Removing from the wrong end.** Values leave from the front. If your `dequeue` returns
  the *newest* value, you have built a stack by accident.
- **Shifting every value on dequeue.** It works, but it turns an `O(1)` operation into
  `O(n)`. In JavaScript, `array.shift()` does exactly this.

## Where is it used?

- **Printer queues**, as above.
- **CPU scheduling.** The operating system keeps programs that are waiting for their turn
  on the processor in queues.
- **Breadth-first search** explores a graph or a maze level by level, and keeps the places
  it still has to visit in a queue.
- **Messages** between apps and servers wait in queues, so nothing is lost when one side is
  busy.
- **Video and music buffering**: the next pieces of the stream wait in a queue.

## Try these

1. Press reset in the playground, then enqueue `5, 6, 7`, dequeue once and enqueue `8`.
   Which box does `8` go into, and which value is at the front?
2. In a queue with capacity 5, `front` is `3` and `count` is `2`. Which box does the next
   value go into? Work it out with `%`, then check it in the program.
3. Use a queue to run a ticket counter: enqueue five names, then serve (dequeue) them one
   by one, printing each name.
4. Change the program so that `enqueue` on a full queue doubles the capacity instead of
   giving an error. Be careful: copy the values into the new array in queue order, starting
   from `front`.
