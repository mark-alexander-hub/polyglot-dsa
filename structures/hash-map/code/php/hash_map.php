<?php
// Hash map: find any value by its key in one jump, without searching through everything.
// We build it on a small array of buckets so you can see exactly what happens inside.
// (In everyday PHP you would simply use an array with string keys.)

declare(strict_types=1);

final class Entry
{
    public string $key;
    public int $value;
    public ?Entry $next;  // the next entry in the same bucket, or null

    public function __construct(string $key, int $value, ?Entry $next)
    {
        $this->key = $key;
        $this->value = $value;
        $this->next = $next;
    }
}

final class HashMap
{
    // @snippet setup
    private array $buckets;    // each bucket holds a chain of entries
    private int $bucketCount;
    private int $count = 0;    // how many keys are stored right now

    public function __construct(int $bucketCount)
    {
        $this->buckets = array_fill(0, $bucketCount, null);
        $this->bucketCount = $bucketCount;
    }

    public function hashOf(string $key): int
    {
        $total = 0;
        // @step hash-sum
        for ($i = 0; $i < strlen($key); $i++) {
            $total += ord($key[$i]);  // add up the character codes of the key
        // @end
        }
        return $total;
    }

    public function indexOf(string $key): int
    {
        // @step hash-index
        return $this->hashOf($key) % $this->bucketCount;  // which bucket this key belongs to
        // @end
    }
    // @end

    // @snippet put
    public function put(string $key, int $value): bool
    {
        // @step put-bucket
        $entry = $this->buckets[$this->indexOf($key)];
        // @end
        // @step put-compare
        while ($entry !== null) {
            if ($entry->key === $key) {
        // @end
                // @step put-update
                $entry->value = $value;  // the key is already here: just replace its value
                return false;
                // @end
            }
            // @step put-next
            $entry = $entry->next;
            // @end
        }
        // @step put-grow
        if ($this->count === $this->bucketCount) {
            $this->grow();  // already one key per bucket on average: make room first
        // @end
        }
        // @step put-insert
        $index = $this->indexOf($key);
        $this->buckets[$index] = new Entry($key, $value, $this->buckets[$index]);  // new entry at the front of the chain
        $this->count++;
        return true;
        // @end
    }
    // @end

    // @snippet grow
    private function grow(): void
    {
        // @step grow-double
        $oldBuckets = $this->buckets;
        $this->bucketCount *= 2;
        $this->buckets = array_fill(0, $this->bucketCount, null);
        // @end
        foreach ($oldBuckets as $entry) {
            // @step grow-move
            while ($entry !== null) {  // every key gets a new bucket, because % changed
                $index = $this->indexOf($entry->key);
                $this->buckets[$index] = new Entry($entry->key, $entry->value, $this->buckets[$index]);
                $entry = $entry->next;
            // @end
            }
        }
    }
    // @end

    // @snippet get
    public function get(string $key): ?int
    {
        // @step get-bucket
        $entry = $this->buckets[$this->indexOf($key)];
        // @end
        // @step get-compare
        while ($entry !== null) {  // only this one chain is searched, never the whole map
            if ($entry->key === $key) {
        // @end
                // @step get-found
                return $entry->value;
                // @end
            }
            // @step get-next
            $entry = $entry->next;
            // @end
        }
        // @step get-missing
        return null;
        // @end
    }
    // @end

    public function contains(string $key): bool
    {
        return $this->get($key) !== null;
    }

    // @snippet remove
    public function remove(string $key): bool
    {
        // @step remove-bucket
        $index = $this->indexOf($key);
        $entry = $this->buckets[$index];
        $previous = null;
        // @end
        // @step remove-compare
        while ($entry !== null) {
            if ($entry->key === $key) {
        // @end
                // @step remove-unlink
                if ($previous === null) {
                    $this->buckets[$index] = $entry->next;  // it was the first in the chain
                } else {
                    $previous->next = $entry->next;         // unlink it from the middle
                }
                $this->count--;
                return true;
                // @end
            }
            // @step remove-next
            $previous = $entry;
            $entry = $entry->next;
            // @end
        }
        // @step remove-missing
        return false;
        // @end
    }
    // @end

    public function size(): int
    {
        return $this->count;
    }

    public function bucketCount(): int
    {
        return $this->bucketCount;
    }

    public function keys(): array
    {
        $result = [];
        foreach ($this->buckets as $entry) {
            while ($entry !== null) {
                $result[] = $entry->key;
                $entry = $entry->next;
            }
        }
        return $result;
    }

    public function bucketToString(int $index): string
    {
        $parts = [];
        $entry = $this->buckets[$index];
        while ($entry !== null) {
            $parts[] = "{$entry->key}={$entry->value}";
            $entry = $entry->next;
        }
        return $parts ? implode(' -> ', $parts) : '(empty)';
    }
}

function showPut(HashMap $m, string $key, int $value): void
{
    $bucketsBefore = $m->bucketCount();
    $added = $m->put($key, $value);
    if ($m->bucketCount() !== $bucketsBefore) {
        echo ($m->size() - 1) . " keys in {$bucketsBefore} buckets, one more would crowd it -> grew to " . $m->bucketCount() . " buckets and re-hashed every key\n";
    }
    $index = $m->indexOf($key);
    echo "put {$key}={$value} -> hash " . $m->hashOf($key) . ' % ' . $m->bucketCount() . " = bucket {$index}, " . ($added ? 'new key' : 'value replaced') . "\n";
    echo "  bucket {$index}: " . $m->bucketToString($index) . "\n";
}

function showGet(HashMap $m, string $key): void
{
    $value = $m->get($key);
    echo "get {$key} -> " . ($value === null ? 'not found' : $value) . "\n";
}

function showTable(HashMap $m): void
{
    echo 'the whole table (' . $m->size() . ' keys in ' . $m->bucketCount() . " buckets):\n";
    for ($i = 0; $i < $m->bucketCount(); $i++) {
        echo "  bucket {$i}: " . $m->bucketToString($i) . "\n";
    }
}

function main(): void
{
    $m = new HashMap(4);
    echo "Hash map with 4 buckets (a key's bucket = sum of its letter codes % 4)\n";

    foreach ([['tea', 10], ['dosa', 40], ['idli', 30], ['vada', 25]] as [$key, $value]) {
        showPut($m, $key, $value);
    }
    showTable($m);

    foreach (['tea', 'idli', 'puri'] as $key) {
        showGet($m, $key);
    }

    showPut($m, 'tea', 12);
    echo 'size -> ' . $m->size() . "\n";

    showPut($m, 'coffee', 15);
    showTable($m);
    showGet($m, 'vada');

    foreach (['idli', 'idli'] as $key) {
        $index = $m->indexOf($key);
        $removed = $m->remove($key);
        echo "remove {$key} -> " . ($removed ? "removed from bucket {$index}" : 'not found') . "\n";
    }
    showGet($m, 'idli');

    foreach (['dosa', 'puri'] as $key) {
        echo "contains {$key} -> " . ($m->contains($key) ? 'yes' : 'no') . "\n";
    }
    echo 'size -> ' . $m->size() . "\n";
    echo 'keys in bucket order -> ' . implode(', ', $m->keys()) . "\n";
}

main();
