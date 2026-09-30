# Min-heap: the smallest value is always on top.
# We build it on a fixed-size list so you can see exactly what happens inside.
# (In everyday Python you would simply use the heapq module.)


class MinHeap:
    # @snippet setup
    def __init__(self, capacity):
        self.items = [0] * capacity  # the tree, stored level by level
        self.capacity = capacity     # how many values fit
        self.count = 0               # how many values are in the heap right now

    def parent(self, i):
        return (i - 1) // 2

    def left(self, i):
        return 2 * i + 1

    def right(self, i):
        return 2 * i + 2
    # @end

    # @snippet insert
    def insert(self, value):
        if self.count == self.capacity:
            raise IndexError("heap is full")
        self.items[self.count] = value  # put it in the first free spot, at the end
        self.count += 1
        return self.sift_up(self.count - 1)  # how many steps it climbed (for the demo)

    def sift_up(self, i):
        swaps = 0
        while i > 0 and self.items[i] < self.items[self.parent(i)]:
            p = self.parent(i)
            self.items[i], self.items[p] = self.items[p], self.items[i]
            i = p
            swaps += 1
        return swaps
    # @end

    # @snippet removeMin
    def remove_min(self):
        if self.count == 0:
            raise IndexError("heap is empty")
        smallest = self.items[0]
        self.count -= 1
        self.items[0] = self.items[self.count]  # the last value moves to the top...
        self.sift_down(0)                       # ...and sinks to where it belongs
        return smallest

    def sift_down(self, i):
        while True:
            l, r = self.left(i), self.right(i)
            smallest = i
            if l < self.count and self.items[l] < self.items[smallest]:
                smallest = l
            if r < self.count and self.items[r] < self.items[smallest]:
                smallest = r
            if smallest == i:
                return
            self.items[i], self.items[smallest] = self.items[smallest], self.items[i]
            i = smallest
    # @end

    # @snippet peek
    def peek(self):
        if self.count == 0:
            raise IndexError("heap is empty")
        return self.items[0]
    # @end

    def is_empty(self):
        return self.count == 0

    def size(self):
        return self.count

    def __str__(self):
        return "[" + ", ".join(str(v) for v in self.items[: self.count]) + "]"


def main():
    heap = MinHeap(7)
    print("Min-heap with room for 7 values (the smallest is always on top)")

    for value in (42, 17, 30, 8):
        swaps = heap.insert(value)
        print(f"insert {value} -> {heap} ({swaps} {'swap' if swaps == 1 else 'swaps'})")

    print(f"peek -> {heap.peek()}")
    print(f"size -> {heap.size()}")
    smallest = heap.remove_min()
    print(f"removeMin -> {smallest}, heap is now {heap}")

    for value in (25, 5, 13, 60, 3):
        try:
            swaps = heap.insert(value)
            print(f"insert {value} -> {heap} ({swaps} {'swap' if swaps == 1 else 'swaps'})")
        except IndexError as error:
            print(f"insert {value} -> error: {error}")

    taken = []
    while not heap.is_empty():
        smallest = heap.remove_min()
        taken.append(smallest)
        print(f"removeMin -> {smallest}, heap is now {heap}")

    print(f"taken out in order -> {', '.join(str(v) for v in taken)}")
    print(f"is empty? -> {'yes' if heap.is_empty() else 'no'}")
    try:
        heap.remove_min()
    except IndexError as error:
        print(f"removeMin -> error: {error}")


if __name__ == "__main__":
    main()
