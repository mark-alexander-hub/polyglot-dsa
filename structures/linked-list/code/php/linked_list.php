<?php
// Linked list: a chain of nodes, each one pointing to the next.
// We build it from scratch so you can see exactly how the links change.
// (In everyday PHP you would usually use an array, or SplDoublyLinkedList.)

declare(strict_types=1);

// @snippet node
final class Node
{
    public int $value;          // the data this node holds
    public ?Node $next = null;  // the next node in the chain; null means "no next node"

    public function __construct(int $value)
    {
        $this->value = $value;
    }
}
// @end

final class LinkedList
{
    // @snippet setup
    private ?Node $head = null;  // the first node; null means the list is empty
    private int $count = 0;      // how many nodes the list has
    // @end

    // @snippet add-first
    public function addFirst(int $value): void
    {
        $node = new Node($value);
        $node->next = $this->head;  // 1. the new node points at the old first node
        $this->head = $node;        // 2. head moves to the new node
        $this->count++;
    }
    // @end

    // @snippet add-last
    public function addLast(int $value): void
    {
        $node = new Node($value);
        if ($this->head === null) {  // empty list: the new node becomes the head
            $this->head = $node;
        } else {
            $current = $this->head;
            while ($current->next !== null) {  // walk until the last node
                $current = $current->next;
            }
            $current->next = $node;
        }
        $this->count++;
    }
    // @end

    // @snippet find
    public function find(int $value): bool
    {
        $current = $this->head;
        while ($current !== null) {
            if ($current->value === $value) {
                return true;
            }
            $current = $current->next;
        }
        return false;
    }
    // @end

    // @snippet remove
    public function remove(int $value): void
    {
        if ($this->head === null) {
            throw new InvalidArgumentException('value not found');
        }
        if ($this->head->value === $value) {  // removing the first node: just move head
            $this->head = $this->head->next;
            $this->count--;
            return;
        }
        $previous = $this->head;
        while ($previous->next !== null && $previous->next->value !== $value) {
            $previous = $previous->next;
        }
        if ($previous->next === null) {
            throw new InvalidArgumentException('value not found');
        }
        $previous->next = $previous->next->next;  // skip over the removed node
        $this->count--;
    }
    // @end

    public function size(): int
    {
        return $this->count;
    }

    public function __toString(): string
    {
        $out = '';
        for ($current = $this->head; $current !== null; $current = $current->next) {
            $out .= $current->value . ' -> ';
        }
        return $out . 'null';
    }
}

function main(): void
{
    $numbers = new LinkedList();
    echo "Linked list, starting empty: {$numbers}\n";

    foreach ([20, 10] as $value) {
        $numbers->addFirst($value);
        echo "add first {$value}: {$numbers}\n";
    }

    foreach ([30, 40] as $value) {
        $numbers->addLast($value);
        echo "add last {$value}: {$numbers}\n";
    }

    echo 'size: ' . $numbers->size() . "\n";

    foreach ([30, 99] as $value) {
        echo "find {$value}: " . ($numbers->find($value) ? 'yes' : 'no') . "\n";
    }

    foreach ([10, 30, 99, 40, 20] as $value) {
        try {
            $numbers->remove($value);
            echo "remove {$value}: {$numbers}\n";
        } catch (InvalidArgumentException $error) {
            echo "remove {$value}: error: {$error->getMessage()}\n";
        }
    }

    echo 'size: ' . $numbers->size() . "\n";
}

main();
