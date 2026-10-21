A **hash map** stores pairs: a **key** and the **value** that belongs to it, like a word and
its meaning, or a dish and its price. Give it the key and it hands you the value in a
single jump, without looking through everything else. It is the structure behind
Python's `dict`, Java's `HashMap`, C++'s `unordered_map`, JavaScript's `Map` and PHP's
associative arrays. Some books call it a **hash table** or a **dictionary**.

The trick is a **hash function**: a quick calculation that turns any key into a number,
and that number says exactly where the pair is kept.

## In real life

Picture the sorting rack at a post office: a wooden board of **pigeonholes**, numbered
`0`, `1`, `2`, `3`. Every letter that arrives has to go into one hole, and the sorter uses a
fixed rule to pick it: say, add up the letters of the name on the envelope and take the
remainder after dividing by the number of holes. No thinking, no searching, the same
answer every time.

When someone asks "is there a letter for *tea*?", the sorter does the same sum, walks
straight to that one hole and flips through the few envelopes in it. Letters for other
names are never touched. That is a hash map:

- The **rule** is the hash function.
- The **pigeonholes** are the **buckets**.
- Two names landing in the same hole is a **collision**. The envelopes simply sit together
  in that hole, and finding one means flipping past the others.
- When the holes get crowded, the post office gets a **bigger rack** and sorts every letter
  again with the new number of holes.

You meet the same idea in a dictionary (the first letter sends you to the right section),
in a library (the shelf number is printed on the book), and in an exam hall where your roll
number tells you your seat.

## How it works

A hash map is an array of **buckets**. Each bucket holds a **chain** of entries, a tiny
linked list, and each entry remembers one key, its value, and the next entry in the chain.
This way of handling collisions is called **chaining**.

Our hash function is deliberately simple: add up the character codes of the key. The code
of `t` is `116`, `e` is `101` and `a` is `97`, so `tea` hashes to `314`. Dividing by the
number of buckets and keeping the remainder gives the bucket: with `4` buckets,
`314 % 4 = 2`, so `tea` lives in bucket `2`. Any key, however long, becomes one small index.

`idli` hashes to `418`, and `418 % 4` is also `2`. That is a collision: `idli` and `tea`
share bucket `2`, chained one after the other. Collisions are normal. A hash map only has to
keep the chains short.

We keep `count`, the number of keys stored, and `bucketCount`, the number of buckets.
Their ratio, `count / bucketCount`, is the **load factor**: how crowded the table is.

<!-- code: setup -->

> **Why build it ourselves?** Every language ships one: `dict` in Python,
> `std::unordered_map` in C++, `HashMap` in Java, `Map` (and every plain object) in
> JavaScript, arrays with string keys in PHP. You will use those. But once you have built
> one you know why `get` is fast, what a collision costs, and why a bad hash function can
> make it crawl. Interviewers ask about exactly this.

## Operations

A hash map has three main operations, and every one of them starts the same way: hash the
key, find the bucket. Only that bucket's chain is ever looked at.

### put: store a key with its value

1. Hash the key and go to its bucket.
2. Walk the chain. If the key is already there, replace its value and stop. A key appears
   in a hash map only once.
3. If every bucket already has one key on average (`count` equals `bucketCount`), the
   table is getting crowded: **grow** it first (see below).
4. Make a new entry and put it at the **front** of the chain, in front of whatever was
   there. Add one to `count`.

<!-- code: put -->

In the demo, `put dosa=40` goes into empty bucket `3`. `put idli=30` finds `tea` already in
bucket `2`, so the chain becomes `idli=30 -> tea=10`. `put tea=12` finds `tea` in that chain
and only changes its value.

### get: find the value for a key

1. Hash the key and go to its bucket.
2. Walk the chain, comparing keys. Return the value as soon as the key matches.
3. If the chain ends without a match, the key is not in the map at all. No other bucket
   could hold it, so there is nothing more to search.

<!-- code: get -->

`get idli` goes straight to bucket `2` and finds `idli` at the front: one comparison.
`get puri` hashes to `448`, `448 % 4 = 0`, and bucket `0` holds only `vada`, so after one
comparison we know `puri` is not here.

### remove: take a key out

1. Hash the key and go to its bucket.
2. Walk the chain while remembering the **previous** entry.
3. When the key matches, unlink the entry: point the previous entry (or the bucket
   itself, if it was the first) at the one after it. Subtract one from `count`.

<!-- code: remove -->

### Growing the table

When `count` reaches `bucketCount`, the chains are about to get longer, so the table
doubles its number of buckets. Doubling changes the `%` in the hash calculation, so every
key must be placed again: `vada` hashed to `412`, which was bucket `0` out of `4` but is
bucket `4` out of `8`. This is called **rehashing**.

<!-- code: grow -->

The order of entries inside a bucket may change when they are moved. That is fine: a hash
map never promised any order.

## How fast is it?

With a decent hash function and a table that grows when it should, every chain holds about
one entry. So `put`, `get` and `remove` do one hash calculation, one array lookup and a
comparison or two: `O(1)`, however many keys are stored. A hundred keys or a hundred
million, same speed. That is why hash maps are everywhere.

| Operation | What it does | Time |
|---|---|---|
| `put` | hash, go to the bucket, walk a short chain | `O(1)` on average |
| `get` | hash, go to the bucket, walk a short chain | `O(1)` on average |
| `remove` | hash, go to the bucket, unlink one entry | `O(1)` on average |
| `grow` | place every key again | `O(n)`, but rare |
| `keys` | visit every bucket and every chain | `O(n)` |

Two warnings hide in that table. First, "on average": if the hash function sends every key
to the same bucket, the map is one long chain and everything becomes `O(n)`. Second,
growing costs `O(n)` when it happens, but it happens only after the key count doubles, so
spread over all the puts the cost per `put` is still constant.

A hash map with `n` keys uses `O(n)` memory for the entries plus one array of buckets.

## Common mistakes

- **Expecting an order.** `keys` returns `coffee, tea, vada, dosa` in the demo: bucket order,
  not the order they were added, and it changes when the table grows. Need order? Keep a
  list beside the map, or use a sorted structure.
- **A weak hash function.** Our letter sum sends every anagram to the same bucket: `listen`,
  `silent` and `enlist` all hash to `655`. Real hash functions mix the characters in, for
  example `hash = hash * 31 + code` for each character, so that order matters too.
- **Never growing.** Without `grow`, chains get longer with every key and `get` quietly
  slides from `O(1)` towards `O(n)`.
- **Forgetting that `put` can be an update.** A key appears once. If `put` does not check
  for the existing key first, the map ends up with two entries for `tea` and `get` returns
  whichever comes first.
- **Changing a key after storing it.** The bucket was chosen from the key's old value, so
  the entry can no longer be found. Use keys that never change: strings and numbers, not
  lists.
- **Mixing up "not found" with a stored nothing.** `get` returns `None`, `null` or
  `undefined` when the key is missing. If you also store such a value, you cannot tell the
  two apart; use `contains` to ask whether a key exists.

## Where is it used?

- **Dictionaries and objects** in every language: `prices["dosa"]`, `user.name`, JSON.
- **Counting:** how many times each word appears in a book, each product sells, each IP
  address connects. The key is the thing, the value is its count.
- **Caches:** keep the answer to an expensive question (a web page, a database row) under
  its key, and return it instantly next time.
- **Sets:** a hash map that keeps only keys answers "have I seen this before?" in `O(1)`.
  That is how duplicates are removed and visited places are remembered in a search.
- **Indexes** in databases and in search engines, so that a lookup does not read the whole
  table.
- **Your phone's contacts**, DNS (name to address), compilers (variable name to its
  type), and the classic interview question "find two numbers that add up to a target".

## Try these

1. With `4` buckets, work out the bucket for `chai`, `puri`, `upma` and `poha` by hand (add
   the character codes, then `% 4`), then check yourself in the playground.
2. `vada` (`412`) and `coffee` (`616`) collide with `4` buckets but not with `8`. Find two
   other keys that do the same.
3. Change `hashOf` to `hash = hash * 31 + code` for each character. Do `listen` and
   `silent` still collide? Which buckets do the demo's keys land in now?
4. Write `countWords(text)` that splits a sentence into words and returns a hash map from
   each word to the number of times it appears.
5. Add a method `longestChain()` that returns the length of the longest chain in the table.
   Put `20` keys in and see what it says. Then try the `31` hash from exercise 3 and compare.
