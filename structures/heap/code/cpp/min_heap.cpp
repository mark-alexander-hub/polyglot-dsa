// Min-heap: the smallest value is always on top.
// We build it on a fixed-size array so you can see exactly what happens inside.
// (In everyday C++ you would simply use std::priority_queue.)
#include <initializer_list>
#include <iostream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

class MinHeap {
    // @snippet setup
    std::vector<int> items;  // the tree, stored level by level
    int capacity;            // how many values fit
    int count = 0;           // how many values are in the heap right now

public:
    explicit MinHeap(int capacity) : items(capacity), capacity(capacity) {}

    int parent(int i) const { return (i - 1) / 2; }

    int left(int i) const { return 2 * i + 1; }

    int right(int i) const { return 2 * i + 2; }
    // @end

    // @snippet insert
    int insert(int value) {
        if (count == capacity) {
            throw std::overflow_error("heap is full");
        }
        items[count] = value;  // put it in the first free spot, at the end
        count++;
        return siftUp(count - 1);  // how many steps it climbed (for the demo)
    }

    int siftUp(int i) {
        int swaps = 0;
        while (i > 0 && items[i] < items[parent(i)]) {
            int p = parent(i);
            std::swap(items[i], items[p]);
            i = p;
            swaps++;
        }
        return swaps;
    }
    // @end

    // @snippet removeMin
    int removeMin() {
        if (count == 0) {
            throw std::underflow_error("heap is empty");
        }
        int smallest = items[0];
        count--;
        items[0] = items[count];  // the last value moves to the top...
        siftDown(0);              // ...and sinks to where it belongs
        return smallest;
    }

    void siftDown(int i) {
        while (true) {
            int l = left(i);
            int r = right(i);
            int smallest = i;
            if (l < count && items[l] < items[smallest]) {
                smallest = l;
            }
            if (r < count && items[r] < items[smallest]) {
                smallest = r;
            }
            if (smallest == i) {
                return;
            }
            std::swap(items[i], items[smallest]);
            i = smallest;
        }
    }
    // @end

    // @snippet peek
    int peek() const {
        if (count == 0) {
            throw std::underflow_error("heap is empty");
        }
        return items[0];
    }
    // @end

    bool isEmpty() const { return count == 0; }

    int size() const { return count; }

    std::string toString() const {
        std::string out = "[";
        for (int i = 0; i < count; i++) {
            if (i > 0) out += ", ";
            out += std::to_string(items[i]);
        }
        return out + "]";
    }
};

static std::string swapsText(int swaps) {
    return std::to_string(swaps) + (swaps == 1 ? " swap" : " swaps");
}

int main() {
    MinHeap heap(7);
    std::cout << "Min-heap with room for 7 values (the smallest is always on top)\n";

    for (int value : {42, 17, 30, 8}) {
        int swaps = heap.insert(value);
        std::cout << "insert " << value << " -> " << heap.toString() << " (" << swapsText(swaps) << ")\n";
    }

    std::cout << "peek -> " << heap.peek() << "\n";
    std::cout << "size -> " << heap.size() << "\n";
    int smallest = heap.removeMin();
    std::cout << "removeMin -> " << smallest << ", heap is now " << heap.toString() << "\n";

    for (int value : {25, 5, 13, 60, 3}) {
        try {
            int swaps = heap.insert(value);
            std::cout << "insert " << value << " -> " << heap.toString() << " (" << swapsText(swaps) << ")\n";
        } catch (const std::overflow_error& error) {
            std::cout << "insert " << value << " -> error: " << error.what() << "\n";
        }
    }

    std::string taken;
    while (!heap.isEmpty()) {
        smallest = heap.removeMin();
        if (!taken.empty()) taken += ", ";
        taken += std::to_string(smallest);
        std::cout << "removeMin -> " << smallest << ", heap is now " << heap.toString() << "\n";
    }

    std::cout << "taken out in order -> " << taken << "\n";
    std::cout << "is empty? -> " << (heap.isEmpty() ? "yes" : "no") << "\n";
    try {
        heap.removeMin();
    } catch (const std::underflow_error& error) {
        std::cout << "removeMin -> error: " << error.what() << "\n";
    }
    return 0;
}
