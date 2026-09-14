An **array** is a row of boxes that sit side by side in memory. Every box has a number,
called its **index**, and the numbering starts at `0`. If you know the index, you can go
straight to any box, which makes the array the simplest and fastest way to keep a list of
values.

## In real life

Think of the seats in one row of a cinema hall. The seats are fixed to the floor, one
after another, and each has a number. If your ticket says seat 7, you do not check seats
1 to 6 first. You walk straight to seat 7.

A sleeper coach on a train works the same way. Your berth number tells you exactly where
to go, and the coach has a fixed number of berths: nobody can add an extra berth once the
coach is built.

Two ideas from these pictures matter for arrays:

- **Numbered places.** Every value has a position you can reach directly.
- **Fixed length.** The row has a set number of places. To get more, you need a new,
  bigger row.

One difference: cinema seats usually start at 1, but in code the first box is index `0`.

## How it works

When a program creates an array, the computer reserves one block of memory with all the
boxes right next to each other, and every box is the same size. That means it can work out
where any box is with one small sum:

```text
address of box i = address of box 0 + i * size of one box
```

If box `0` starts at address `1000` and each box takes 4 bytes, box `3` is at
`1000 + 3 * 4 = 1012`. No searching and no counting: that is why reading any box is
instant.

We will build an array with a fixed number of boxes, its **capacity**, and keep a second
number, **size**, that counts how many boxes are in use. The values always sit in boxes
`0` to `size - 1`, with no gaps between them.

<!-- code: setup -->

> **Why build it ourselves?** A Python `list`, a C++ `std::vector`, a Java `ArrayList` and
> a JavaScript array are all arrays underneath that grow for you. (A PHP array is really an
> ordered map; `SplFixedArray` is PHP's closest thing to a fixed row of boxes.) Building a
> fixed one shows you the shifting they do behind the scenes, and why some operations are
> fast and others are slow.

## Operations

### get: read the value at an index

1. If the index is below `0`, or not smaller than `size`, there is no value there, so we
   stop with an **index out of range** error.
2. Otherwise, return the value in that box. No loop is needed.

<!-- code: get -->

### insert: put a value at an index

Values must stay side by side, so to make room at `index`, every value from `index`
onwards moves one box to the right.

1. If `size` equals `capacity`, every box is taken, so we stop with **array is full**.
2. The index can be anything from `0` to `size`. Inserting at `size` means adding at the
   end, and then nothing has to move.
3. Starting from the **end**, move each value one box to the right until you reach
   `index`.
4. Put the new value at `index`, and add one to `size`.

<!-- code: insert -->

Why start from the end? If you moved the value at `index` first, it would overwrite its
neighbour before that neighbour had moved. Going from right to left, each box you write
into has already been copied.

### remove: take out the value at an index

1. Check the index, just like `get` does.
2. Remember the value at `index`.
3. Close the gap: move every value after it one box to the left.
4. Take one away from `size`, and return the value you remembered.

<!-- code: remove -->

The last box still holds an old copy of a value, but it is past `size` now, so it is not
part of the array. In the playground above, these old copies are shown faded.

### search: find where a value is

The array knows what is in each box, but not where a particular value is. So `search`
checks the boxes one by one, starting at index `0`, and returns the first index that
matches, or `-1` if the value is not there. This is called **linear search**.

<!-- code: search -->

## How fast is it?

| Operation | What it does | Time |
|---|---|---|
| `get` | read the box at an index | `O(1)` |
| `insert` at the end | write into box `size`, nothing moves | `O(1)` |
| `insert` at an index | shift up to `size` values right | `O(n)` |
| `remove` at the end | nothing moves | `O(1)` |
| `remove` at an index | shift up to `size` values left | `O(n)` |
| `search` | check the boxes one by one | `O(n)` |

Here `n` is the number of values. Inserting at index `0` is the slowest case, because
every single value has to move. An array with room for `n` values needs `O(n)` memory,
even when most of its boxes are empty.

## Common mistakes

- **Counting from 1.** The first box is index `0` and the last one is `size - 1`. Index
  `size` is one step too far.
- **Mixing up size and capacity.** `capacity` is how many boxes exist; `size` is how many
  of them hold real values.
- **Shifting in the wrong direction.** For `insert`, copy from the end towards the index.
  For `remove`, copy from the index towards the end. The other way round overwrites values
  before they move.
- **Forgetting to update size.** Every insert adds one, and every remove takes one away.
- **Inserting at the front again and again.** Each insert shifts everything, so adding
  `n` values this way takes `O(n²)` time. Add at the end instead whenever you can.

## Where is it used?

- **Almost everywhere.** Lists, vectors, ArrayLists and JavaScript arrays are all built on
  arrays.
- **Images.** A photo is a big array of pixel colours.
- **Marks in a class register.** One mark per roll number: the roll number is the index.
- **Lookup tables**, such as the number of days in each month, where the index answers the
  question instantly.
- **Other structures.** The stack and the queue in this course are built on arrays.

## Try these

1. Insert `7` at index `1` into `[3, 9, 4]`. Which values move, and in what order? Check
   your answer in the playground.
2. Write a function that returns the largest value in the array. How many boxes does it
   have to look at?
3. Write a function that reverses the array in place: swap the first and last values, then
   the second and second-last, and so on.
4. Change `insert` so that a full array doubles its capacity: create a new array twice as
   big, copy every value across, then insert. This is how Python lists and C++ vectors
   grow.
