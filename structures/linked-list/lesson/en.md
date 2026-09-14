A **linked list** is a chain of small boxes called **nodes**. Each node holds a value and
the address of the next node. To go through the list, you start at the first node, called
the **head**, and follow the links one by one until there is no next node.

## In real life

Think of a train. Each coach is coupled to the one behind it. You can add a coach at the
front, add one at the end, or uncouple one from the middle and join its neighbours
together. The other coaches do not have to move at all.

A treasure hunt works the same way. The first clue tells you where the second clue is
hidden, the second tells you where the third one is, and so on. You cannot jump straight
to clue number 5: you have to follow the chain from the start.

## How it works

In an array, values sit side by side in one block of memory. A linked list is different:
each node can be anywhere in memory. What joins the nodes is the `next` link inside each
one.

- `head` points at the first node. If the list is empty, `head` is `null`.
- The last node's `next` is `null`, which means "the chain ends here".

(`null` is called `None` in Python and `nullptr` in C++.)

<!-- code: node -->

The list itself only needs to remember the head, plus a counter so it can tell you its
size without walking the whole chain.

<!-- code: setup -->

Here is how a linked list compares with an array:

| | Array | Linked list |
|---|---|---|
| Where values live | side by side in memory | anywhere, joined by links |
| Get the value at index 5 | jump straight there, `O(1)` | walk from the head, `O(n)` |
| Add a value at the front | shift every value right, `O(n)` | change two links, `O(1)` |
| Extra memory | none | one link in every node |

## Operations

### add-first: put a new node at the front

1. Make a new node for the value.
2. Point the new node's `next` at the current head.
3. Move `head` to the new node.

The order matters. If you move `head` first, you lose the address of the old first node,
and with it the rest of the list.

<!-- code: add-first -->

### add-last: put a new node at the end

1. Make a new node for the value.
2. If the list is empty, the new node becomes the head, and you are done.
3. Otherwise, start at the head and follow `next` until you reach the node whose `next` is
   `null`. That is the last node.
4. Point the last node's `next` at the new node.

<!-- code: add-last -->

### find: is this value in the list?

Start at the head and check each node in turn. If a node holds the value, the answer is
yes. If you walk past the last node and reach `null`, the answer is no.

<!-- code: find -->

### remove: take out the first node that holds a value

1. If the list is empty, there is nothing to remove, so stop with an error.
2. If the head holds the value, move `head` to the second node. The old first node is no
   longer part of the chain.
3. Otherwise, walk with a pointer called `previous` until `previous.next` holds the value.
   If you reach the end first, the value is not in the list: stop with an error.
4. Point `previous.next` past that node, at the node after it. The chain now skips it.

<!-- code: remove -->

The relinking in step 4 is a single line and takes `O(1)`. It is the walk to find the node
that takes time.

## How fast is it?

| Operation | What it does | Time |
|---|---|---|
| `add-first` | new node at the front | `O(1)` |
| `add-last` | walk to the end, then link | `O(n)` |
| `find` | check nodes one by one | `O(n)` |
| `remove` | walk to the node, then relink | `O(n)` |
| `size` | read the counter | `O(1)` |

> **Faster add-last with a tail pointer.** If the list also remembers its last node, in a
> field called `tail`, then `add-last` does not need the walk: link the new node after
> `tail`, then move `tail` to it. That makes `add-last` `O(1)`, which is very handy when
> you build a queue.

A list of `n` nodes needs `O(n)` memory, and each node carries one extra link.

## Common mistakes

- **Changing links in the wrong order.** In `add-first`, if you write `head = node` before
  `node.next = head`, the new node ends up pointing at itself and the rest of the list is
  lost. Always connect the new node first, then move the old pointer.
- **Forgetting the head case.** Removing the first node is special: there is no `previous`
  node, so you must move `head` itself. Many bugs hide here.
- **Walking off the end.** Check that a node is not `null` before you read its `value` or
  its `next`.
- **Losing count.** Update the counter in every method that adds or removes a node.
- **Memory leaks in C++.** Every node made with `new` must be freed with `delete`, both in
  `remove` and in the destructor. Python, Java, JavaScript and PHP clean up unused nodes
  for you.

## Where is it used?

- **Music playlists and photo galleries** with "next" and "previous" buttons. These use a
  *doubly* linked list, where each node also points back to the one before it.
- **Hash tables** keep short linked lists for values that land in the same slot.
- **Stacks and queues** can be built on a linked list, so they never become full.
- **Operating systems** keep running programs and free blocks of memory in linked lists.

## Try these

1. In the playground, use add-first with `7`, then add-last with `9`. Which button walks
   through the list and which one does not? Why?
2. Write a function that prints the list backwards. (Hint: a stack helps.)
3. Add a `tail` field to the program so that `add-last` becomes `O(1)`. Remember to update
   it in `remove` too.
4. Write a function that reverses the list by changing only the `next` links, without
   making any new nodes.
