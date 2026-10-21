<?php
// Min-heap: the smallest value is always on top.
// We build it on a fixed-size array so you can see exactly what happens inside.
// (In everyday PHP you would simply use SplMinHeap.)

declare(strict_types=1);

final class MinHeap
{
    // @snippet setup
    private array $items;    // the tree, stored level by level
    private int $capacity;   // how many values fit
    private int $count = 0;  // how many values are in the heap right now

    public function __construct(int $capacity)
    {
        $this->items = array_fill(0, $capacity, 0);
        $this->capacity = $capacity;
    }

    private function parent(int $i): int
    {
        return intdiv($i - 1, 2);
    }

    private function left(int $i): int
    {
        return 2 * $i + 1;
    }

    private function right(int $i): int
    {
        return 2 * $i + 2;
    }
    // @end

    // @snippet insert
    public function insert(int $value): int
    {
        // @step insert-check
        if ($this->count === $this->capacity) {
            throw new OverflowException('heap is full');
        }
        // @end
        // @step insert-place
        $this->items[$this->count] = $value; // put it in the first free spot, at the end
        $this->count++;
        // @end
        return $this->siftUp($this->count - 1); // how many steps it climbed (for the demo)
    }

    private function siftUp(int $i): int
    {
        $swaps = 0;
        // @step insert-compare
        while ($i > 0 && $this->items[$i] < $this->items[$this->parent($i)]) {
        // @end
            // @step insert-swap
            $p = $this->parent($i);
            [$this->items[$i], $this->items[$p]] = [$this->items[$p], $this->items[$i]];
            $i = $p;
            $swaps++;
            // @end
        }
        // @step insert-return
        return $swaps;
        // @end
    }
    // @end

    // @snippet removeMin
    public function removeMin(): int
    {
        // @step removeMin-check
        if ($this->count === 0) {
            throw new UnderflowException('heap is empty');
        }
        // @end
        // @step removeMin-take
        $smallest = $this->items[0];
        $this->count--;
        $this->items[0] = $this->items[$this->count]; // the last value moves to the top...
        // @end
        $this->siftDown(0);                           // ...and sinks to where it belongs
        return $smallest;
    }

    private function siftDown(int $i): void
    {
        while (true) {
            // @step siftDown-compare
            $l = $this->left($i);
            $r = $this->right($i);
            $smallest = $i;
            if ($l < $this->count && $this->items[$l] < $this->items[$smallest]) {
                $smallest = $l;
            }
            if ($r < $this->count && $this->items[$r] < $this->items[$smallest]) {
                $smallest = $r;
            }
            // @end
            // @step siftDown-stop
            if ($smallest === $i) {
                return;
            }
            // @end
            // @step siftDown-swap
            [$this->items[$i], $this->items[$smallest]] = [$this->items[$smallest], $this->items[$i]];
            $i = $smallest;
            // @end
        }
    }
    // @end

    // @snippet peek
    public function peek(): int
    {
        // @step peek-check
        if ($this->count === 0) {
            throw new UnderflowException('heap is empty');
        }
        // @end
        // @step peek-read
        return $this->items[0];
        // @end
    }
    // @end

    public function isEmpty(): bool
    {
        return $this->count === 0;
    }

    public function size(): int
    {
        return $this->count;
    }

    public function __toString(): string
    {
        return '[' . implode(', ', array_slice($this->items, 0, $this->count)) . ']';
    }
}

function swapsText(int $swaps): string
{
    return $swaps . ($swaps === 1 ? ' swap' : ' swaps');
}

function main(): void
{
    $heap = new MinHeap(7);
    echo "Min-heap with room for 7 values (the smallest is always on top)\n";

    foreach ([42, 17, 30, 8] as $value) {
        $swaps = $heap->insert($value);
        echo "insert {$value} -> {$heap} (" . swapsText($swaps) . ")\n";
    }

    echo 'peek -> ' . $heap->peek() . "\n";
    echo 'size -> ' . $heap->size() . "\n";
    $smallest = $heap->removeMin();
    echo "removeMin -> {$smallest}, heap is now {$heap}\n";

    foreach ([25, 5, 13, 60, 3] as $value) {
        try {
            $swaps = $heap->insert($value);
            echo "insert {$value} -> {$heap} (" . swapsText($swaps) . ")\n";
        } catch (OverflowException $error) {
            echo "insert {$value} -> error: {$error->getMessage()}\n";
        }
    }

    $taken = [];
    while (!$heap->isEmpty()) {
        $smallest = $heap->removeMin();
        $taken[] = $smallest;
        echo "removeMin -> {$smallest}, heap is now {$heap}\n";
    }

    echo 'taken out in order -> ' . implode(', ', $taken) . "\n";
    echo 'is empty? -> ' . ($heap->isEmpty() ? 'yes' : 'no') . "\n";
    try {
        $heap->removeMin();
    } catch (UnderflowException $error) {
        echo "removeMin -> error: {$error->getMessage()}\n";
    }
}

main();
