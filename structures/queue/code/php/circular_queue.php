<?php
// Queue: first in, first out.
// We build a circular queue on a fixed-size array so you can see exactly what happens inside.
// (In everyday PHP you would simply use SplQueue.)

declare(strict_types=1);

final class CircularQueue
{
    // @snippet setup
    private array $items;    // a row of boxes that hold our values
    private int $capacity;   // how many values fit
    private int $front = 0;  // index of the box holding the oldest value
    private int $count = 0;  // how many values are in the queue right now

    public function __construct(int $capacity)
    {
        $this->items = array_fill(0, $capacity, 0);
        $this->capacity = $capacity;
    }
    // @end

    // @snippet enqueue
    public function enqueue(int $value): void
    {
        if ($this->count === $this->capacity) {
            throw new OverflowException('queue is full');
        }
        $rear = ($this->front + $this->count) % $this->capacity;  // next free box
        $this->items[$rear] = $value;
        $this->count++;
    }
    // @end

    // @snippet dequeue
    public function dequeue(): int
    {
        if ($this->count === 0) {
            throw new UnderflowException('queue is empty');
        }
        $value = $this->items[$this->front];
        $this->front = ($this->front + 1) % $this->capacity;  // wraps to box 0
        $this->count--;
        return $value;
    }
    // @end

    // @snippet peek
    public function peek(): int
    {
        if ($this->count === 0) {
            throw new UnderflowException('queue is empty');
        }
        return $this->items[$this->front];
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
        $values = [];
        for ($i = 0; $i < $this->count; $i++) {
            $values[] = $this->items[($this->front + $i) % $this->capacity];
        }
        $out = '[' . implode(', ', $values) . '] (front at box ' . $this->front;
        if ($this->count > 0) {
            $out .= ', rear at box ' . (($this->front + $this->count - 1) % $this->capacity);
        }
        return $out . ')';
    }
}

function main(): void
{
    $queue = new CircularQueue(5);
    echo "Queue with room for 5 items (join at the rear, leave from the front)\n";

    foreach ([10, 20, 30, 40, 50, 60] as $value) {
        try {
            $queue->enqueue($value);
            echo "enqueue {$value} -> {$queue}\n";
        } catch (OverflowException $error) {
            echo "enqueue {$value} -> error: {$error->getMessage()}\n";
        }
    }

    echo 'peek -> ' . $queue->peek() . "\n";
    for ($i = 0; $i < 2; $i++) {
        $removed = $queue->dequeue();
        echo "dequeue -> {$removed}, queue is now {$queue}\n";
    }

    foreach ([60, 70] as $value) {
        $queue->enqueue($value);
        echo "enqueue {$value} -> {$queue}\n";
    }
    echo 'size -> ' . $queue->size() . "\n";

    while (!$queue->isEmpty()) {
        $removed = $queue->dequeue();
        echo "dequeue -> {$removed}, queue is now {$queue}\n";
    }

    echo 'is empty? -> ' . ($queue->isEmpty() ? 'yes' : 'no') . "\n";
    try {
        $queue->dequeue();
    } catch (UnderflowException $error) {
        echo "dequeue -> error: {$error->getMessage()}\n";
    }
}

main();
