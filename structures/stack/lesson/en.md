A **stack** is a list where you can only add or remove things at one end, called the
**top**. The last thing you put in is the first thing you take out. People call this
**LIFO**: *Last In, First Out*.

## In real life

Think of the plates at a wedding buffet. Clean plates go on top of the pile, and every
guest takes a plate from the top. Nobody pulls a plate out of the middle or the bottom.
The plate that was put down last is picked up first.

You already use stacks every day without noticing:

- **Undo** in a text editor removes your most recent change first.
- The **back button** in your browser takes you to the page you opened most recently.
- A pile of **notebooks** on a desk: you pick up the one you put down last.

## How it works

We will build a stack on an array with a fixed number of boxes, called its **capacity**.
We keep one number, `top`, which is the index of the value at the top.

- When the stack is empty, `top` is `-1`, because there is no top value yet.
- When the stack is full, `top` is `capacity - 1`, the last box.

<!-- code: setup -->

> **Why build it ourselves?** Every language already has a ready-made stack: a Python
> `list`, `std::stack` in C++, `ArrayDeque` in Java, an array in JavaScript. Building one
> once shows you what those tools do for you, and interviewers love asking about it.

## Operations

A stack has three main operations. All three only ever look at the top.

### push: put a value on top

1. If `top` is already at the last box, the stack is full. Adding more is called
   **overflow**, so we stop with an error.
2. Otherwise, move `top` up by one.
3. Put the value in the box at `top`.

<!-- code: push -->

### pop: take the top value off

1. If `top` is `-1`, the stack is empty. Taking from an empty stack is called
   **underflow**, so we stop with an error.
2. Remember the value at `top`.
3. Move `top` down by one, and return the value you remembered.

<!-- code: pop -->

Notice that we do **not** erase the old value. Moving `top` down is enough: that box is
now outside the stack, and the next `push` will write over it. In the playground above,
these old values are shown faded.

### peek: look at the top without removing it

`peek` returns the value at `top` and changes nothing. It is useful when you need to see
what is on top before deciding what to do.

<!-- code: peek -->

## How fast is it?

Every operation touches only the top box, however many values the stack holds. So they
all take the same small amount of time, written `O(1)` (constant time).

| Operation | What it does | Time |
|---|---|---|
| `push` | put a value on top | `O(1)` |
| `pop` | take the top value off | `O(1)` |
| `peek` | look at the top value | `O(1)` |
| `isEmpty` | check whether `top` is `-1` | `O(1)` |
| search for a value | pop values off one by one until you find it | `O(n)` |

A stack with room for `n` values uses `n` boxes, so it needs `O(n)` memory.

## Common mistakes

- **Popping without checking.** Check `isEmpty()` (or catch the error) before `pop` or
  `peek`. Underflow is the most common stack bug.
- **Mixing up the ends.** The top is where the last value went in. If your `pop` returns
  the *first* value you pushed, you have built a queue by accident.
- **Off by one on "full".** The last box has index `capacity - 1`, not `capacity`.
- **Forgetting that order flips.** Push `1, 2, 3` and pop three times: you get `3, 2, 1`.
  A stack reverses order.

## Where is it used?

- **Function calls.** When one function calls another, the computer pushes the unfinished
  work onto the *call stack* and pops it when the inner function returns. A function that
  calls itself forever runs out of room: that is a real **stack overflow**.
- **Undo and back buttons**, as above.
- **Checking brackets** in code: every `(` is pushed, and every `)` pops its partner.
- **Reversing** a word or a list.
- **Depth-first search** in graphs and mazes, which you will meet later.

## Try these

1. Push `4, 8, 15`, then pop once. What is on top now? Check your answer in the
   playground.
2. Use a stack to reverse the word `STACK`: push each letter, then pop them all.
3. Write a function that checks whether the brackets in `"(()())"` are balanced. Try it
   again with `"(()"`.
4. Change the program so that `push` on a full stack doubles the capacity instead of
   giving an error. This is how Python lists and C++ vectors grow.
