<?php
// Stack: last in, first out.
// We build it on a fixed-size array so you can see exactly what happens inside.
// (In everyday PHP you would simply use SplStack, or an array with array_push() and array_pop().)

declare(strict_types=1);

final class Stack
{
    // @snippet setup
    private array $items;    // a row of boxes that hold our values
    private int $capacity;   // how many values fit
    private int $top = -1;   // index of the top value; -1 means empty

    public function __construct(int $capacity)
    {
        $this->items = array_fill(0, $capacity, 0);
        $this->capacity = $capacity;
    }
    // @end

    // @snippet push
    public function push(int $value): void
    {
        if ($this->top === $this->capacity - 1) {
            throw new OverflowException('stack is full');
        }
        $this->top++;
        $this->items[$this->top] = $value;
    }
    // @end

    // @snippet pop
    public function pop(): int
    {
        if ($this->top === -1) {
            throw new UnderflowException('stack is empty');
        }
        $value = $this->items[$this->top];
        $this->top--; // the old value stays in its box until a push overwrites it
        return $value;
    }
    // @end

    // @snippet peek
    public function peek(): int
    {
        if ($this->top === -1) {
            throw new UnderflowException('stack is empty');
        }
        return $this->items[$this->top];
    }
    // @end

    public function isEmpty(): bool
    {
        return $this->top === -1;
    }

    public function size(): int
    {
        return $this->top + 1;
    }

    public function __toString(): string
    {
        return '[' . implode(', ', array_slice($this->items, 0, $this->top + 1)) . ']';
    }
}

function main(): void
{
    $stack = new Stack(5);
    echo "Stack with room for 5 items (the top is on the right)\n";

    foreach ([10, 20, 30] as $value) {
        $stack->push($value);
        echo "push {$value} -> {$stack}\n";
    }

    echo 'peek -> ' . $stack->peek() . "\n";
    $popped = $stack->pop();
    echo "pop -> {$popped}, stack is now {$stack}\n";
    echo 'size -> ' . $stack->size() . "\n";

    foreach ([40, 50, 60, 70] as $value) {
        try {
            $stack->push($value);
            echo "push {$value} -> {$stack}\n";
        } catch (OverflowException $error) {
            echo "push {$value} -> error: {$error->getMessage()}\n";
        }
    }

    while (!$stack->isEmpty()) {
        $popped = $stack->pop();
        echo "pop -> {$popped}, stack is now {$stack}\n";
    }

    echo 'is empty? -> ' . ($stack->isEmpty() ? 'yes' : 'no') . "\n";
    try {
        $stack->pop();
    } catch (UnderflowException $error) {
        echo "pop -> error: {$error->getMessage()}\n";
    }
}

main();
