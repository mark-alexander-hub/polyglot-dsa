# Hash map: find any value by its key in one jump, without searching through everything.
# We build it on a small array of buckets so you can see exactly what happens inside.
# (In everyday Python you would simply use a dict.)


class Entry:
    def __init__(self, key, value, next_entry):
        self.key = key
        self.value = value
        self.next = next_entry  # the next entry in the same bucket, or None


class HashMap:
    # @snippet setup
    def __init__(self, bucket_count):
        self.buckets = [None] * bucket_count  # each bucket holds a chain of entries
        self.bucket_count = bucket_count
        self.count = 0                        # how many keys are stored right now

    def hash_of(self, key):
        total = 0
        # @step hash-sum
        for ch in key:
            total += ord(ch)  # add up the character codes of the key
        # @end
        return total

    def index_of(self, key):
        # @step hash-index
        return self.hash_of(key) % self.bucket_count  # which bucket this key belongs to
        # @end
    # @end

    # @snippet put
    def put(self, key, value):
        # @step put-bucket
        entry = self.buckets[self.index_of(key)]
        # @end
        # @step put-compare
        while entry is not None:
            if entry.key == key:
        # @end
                # @step put-update
                entry.value = value  # the key is already here: just replace its value
                return False
                # @end
            # @step put-next
            entry = entry.next
            # @end
        # @step put-grow
        if self.count == self.bucket_count:
            self.grow()  # already one key per bucket on average: make room first
        # @end
        # @step put-insert
        index = self.index_of(key)
        self.buckets[index] = Entry(key, value, self.buckets[index])  # new entry at the front of the chain
        self.count += 1
        return True
        # @end
    # @end

    # @snippet grow
    def grow(self):
        # @step grow-double
        old_buckets = self.buckets
        self.bucket_count *= 2
        self.buckets = [None] * self.bucket_count
        # @end
        for entry in old_buckets:
            # @step grow-move
            while entry is not None:  # every key gets a new bucket, because % changed
                index = self.index_of(entry.key)
                self.buckets[index] = Entry(entry.key, entry.value, self.buckets[index])
                entry = entry.next
            # @end
    # @end

    # @snippet get
    def get(self, key):
        # @step get-bucket
        entry = self.buckets[self.index_of(key)]
        # @end
        # @step get-compare
        while entry is not None:  # only this one chain is searched, never the whole map
            if entry.key == key:
        # @end
                # @step get-found
                return entry.value
                # @end
            # @step get-next
            entry = entry.next
            # @end
        # @step get-missing
        return None
        # @end
    # @end

    def contains(self, key):
        return self.get(key) is not None

    # @snippet remove
    def remove(self, key):
        # @step remove-bucket
        index = self.index_of(key)
        entry = self.buckets[index]
        previous = None
        # @end
        # @step remove-compare
        while entry is not None:
            if entry.key == key:
        # @end
                # @step remove-unlink
                if previous is None:
                    self.buckets[index] = entry.next  # it was the first in the chain
                else:
                    previous.next = entry.next        # unlink it from the middle
                self.count -= 1
                return True
                # @end
            # @step remove-next
            previous = entry
            entry = entry.next
            # @end
        # @step remove-missing
        return False
        # @end
    # @end

    def size(self):
        return self.count

    def keys(self):
        result = []
        for entry in self.buckets:
            while entry is not None:
                result.append(entry.key)
                entry = entry.next
        return result

    def bucket_to_string(self, index):
        parts = []
        entry = self.buckets[index]
        while entry is not None:
            parts.append(f"{entry.key}={entry.value}")
            entry = entry.next
        return " -> ".join(parts) if parts else "(empty)"


def show_put(m, key, value):
    buckets_before = m.bucket_count
    added = m.put(key, value)
    if m.bucket_count != buckets_before:
        print(f"{m.size() - 1} keys in {buckets_before} buckets, one more would crowd it -> grew to {m.bucket_count} buckets and re-hashed every key")
    index = m.index_of(key)
    print(f"put {key}={value} -> hash {m.hash_of(key)} % {m.bucket_count} = bucket {index}, {'new key' if added else 'value replaced'}")
    print(f"  bucket {index}: {m.bucket_to_string(index)}")


def show_get(m, key):
    value = m.get(key)
    print(f"get {key} -> {'not found' if value is None else value}")


def show_table(m):
    print(f"the whole table ({m.size()} keys in {m.bucket_count} buckets):")
    for i in range(m.bucket_count):
        print(f"  bucket {i}: {m.bucket_to_string(i)}")


def main():
    m = HashMap(4)
    print("Hash map with 4 buckets (a key's bucket = sum of its letter codes % 4)")

    for key, value in (("tea", 10), ("dosa", 40), ("idli", 30), ("vada", 25)):
        show_put(m, key, value)
    show_table(m)

    for key in ("tea", "idli", "puri"):
        show_get(m, key)

    show_put(m, "tea", 12)
    print(f"size -> {m.size()}")

    show_put(m, "coffee", 15)
    show_table(m)
    show_get(m, "vada")

    for key in ("idli", "idli"):
        index = m.index_of(key)
        removed = m.remove(key)
        print(f"remove {key} -> {f'removed from bucket {index}' if removed else 'not found'}")
    show_get(m, "idli")

    for key in ("dosa", "puri"):
        print(f"contains {key} -> {'yes' if m.contains(key) else 'no'}")
    print(f"size -> {m.size()}")
    print(f"keys in bucket order -> {', '.join(m.keys())}")


if __name__ == "__main__":
    main()
