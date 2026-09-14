<?php
// Array: values sit side by side in numbered boxes.
// We build a fixed-size array ourselves so you can see every shift happen.
// (In everyday PHP you would use a plain array, which is really an ordered map, or SplFixedArray.)

declare(strict_types=1);

final class FixedArray
{
    // @snippet setup
    private array $items;    // a row of boxes, numbered from 0
    private int $capacity;   // how many boxes there are
    private int $size = 0;   // how many boxes are in use

    public function __construct(int $capacity)
    {
        $this->items = array_fill(0, $capacity, 0);
        $this->capacity = $capacity;
    }
    // @end

    // @snippet get
    public function get(int $index): int
    {
        if ($index < 0 || $index >= $this->size) {
            throw new OutOfRangeException('index out of range');
        }
        return $this->items[$index];
    }
    // @end

    // @snippet insert
    public function insert(int $index, int $value): void
    {
        if ($this->size === $this->capacity) {
            throw new OverflowException('array is full');
        }
        if ($index < 0 || $index > $this->size) {
            throw new OutOfRangeException('index out of range');
        }
        // Shift values one box to the right, starting from the end.
        for ($i = $this->size; $i > $index; $i--) {
            $this->items[$i] = $this->items[$i - 1];
        }
        $this->items[$index] = $value;
        $this->size++;
    }
    // @end

    // @snippet remove
    public function remove(int $index): int
    {
        if ($index < 0 || $index >= $this->size) {
            throw new OutOfRangeException('index out of range');
        }
        $value = $this->items[$index];
        // Shift values one box to the left to close the gap.
        for ($i = $index; $i < $this->size - 1; $i++) {
            $this->items[$i] = $this->items[$i + 1];
        }
        $this->size--;
        return $value;
    }
    // @end

    // @snippet search
    public function search(int $value): int
    {
        for ($i = 0; $i < $this->size; $i++) {
            if ($this->items[$i] === $value) {
                return $i;
            }
        }
        return -1; // not found
    }
    // @end

    public function size(): int
    {
        return $this->size;
    }

    public function capacity(): int
    {
        return $this->capacity;
    }

    public function __toString(): string
    {
        return '[' . implode(', ', array_slice($this->items, 0, $this->size)) . ']';
    }
}

function insertAndShow(FixedArray $array, int $index, int $value): void
{
    try {
        $array->insert($index, $value);
        echo "insert {$value} at {$index} -> {$array}\n";
    } catch (OverflowException | OutOfRangeException $error) {
        echo "insert {$value} at {$index} -> error: {$error->getMessage()}\n";
    }
}

function main(): void
{
    $array = new FixedArray(5);
    echo "Array with room for 5 values\n";

    foreach ([[0, 10], [1, 20], [2, 40], [2, 30], [0, 5], [5, 50]] as [$index, $value]) {
        insertAndShow($array, $index, $value);
    }

    foreach ([2, 7] as $index) {
        try {
            $value = $array->get($index);
            echo "get {$index} -> {$value}\n";
        } catch (OutOfRangeException $error) {
            echo "get {$index} -> error: {$error->getMessage()}\n";
        }
    }

    foreach ([30, 99] as $value) {
        echo "search {$value} -> " . $array->search($value) . "\n";
    }

    foreach ([0, 2, 3] as $index) {
        try {
            $removed = $array->remove($index);
            echo "remove {$index} -> {$removed}, array is now {$array}\n";
        } catch (OutOfRangeException $error) {
            echo "remove {$index} -> error: {$error->getMessage()}\n";
        }
    }

    insertAndShow($array, 3, 60);
    insertAndShow($array, 9, 70);
    echo 'size -> ' . $array->size() . ', capacity -> ' . $array->capacity() . "\n";
}

main();
