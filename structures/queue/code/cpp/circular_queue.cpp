// Queue: first in, first out.
// We build a circular queue on a fixed-size array so you can see exactly what happens inside.
// (In everyday C++ you would simply use std::queue.)
#include <initializer_list>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

class CircularQueue {
    // @snippet setup
    std::vector<int> items;  // a row of boxes that hold our values
    int capacity;            // how many values fit
    int front = 0;           // index of the box holding the oldest value
    int count = 0;           // how many values are in the queue right now

public:
    explicit CircularQueue(int capacity) : items(capacity), capacity(capacity) {}
    // @end

    // @snippet enqueue
    void enqueue(int value) {
        if (count == capacity) {
            throw std::overflow_error("queue is full");
        }
        int rear = (front + count) % capacity;  // next free box
        items[rear] = value;
        count++;
    }
    // @end

    // @snippet dequeue
    int dequeue() {
        if (count == 0) {
            throw std::underflow_error("queue is empty");
        }
        int value = items[front];
        front = (front + 1) % capacity;  // wraps around to box 0
        count--;
        return value;
    }
    // @end

    // @snippet peek
    int peek() const {
        if (count == 0) {
            throw std::underflow_error("queue is empty");
        }
        return items[front];
    }
    // @end

    bool isEmpty() const { return count == 0; }

    int size() const { return count; }

    std::string toString() const {
        std::string out = "[";
        for (int i = 0; i < count; i++) {
            if (i > 0) out += ", ";
            out += std::to_string(items[(front + i) % capacity]);
        }
        out += "] (front at box " + std::to_string(front);
        if (count > 0) {
            out += ", rear at box " + std::to_string((front + count - 1) % capacity);
        }
        return out + ")";
    }
};

int main() {
    CircularQueue queue(5);
    std::cout << "Queue with room for 5 items (join at the rear, leave from the front)\n";

    for (int value : {10, 20, 30, 40, 50, 60}) {
        try {
            queue.enqueue(value);
            std::cout << "enqueue " << value << " -> " << queue.toString() << "\n";
        } catch (const std::overflow_error& error) {
            std::cout << "enqueue " << value << " -> error: " << error.what() << "\n";
        }
    }

    std::cout << "peek -> " << queue.peek() << "\n";
    for (int i = 0; i < 2; i++) {
        int removed = queue.dequeue();
        std::cout << "dequeue -> " << removed << ", queue is now " << queue.toString() << "\n";
    }

    for (int value : {60, 70}) {
        queue.enqueue(value);
        std::cout << "enqueue " << value << " -> " << queue.toString() << "\n";
    }
    std::cout << "size -> " << queue.size() << "\n";

    while (!queue.isEmpty()) {
        int removed = queue.dequeue();
        std::cout << "dequeue -> " << removed << ", queue is now " << queue.toString() << "\n";
    }

    std::cout << "is empty? -> " << (queue.isEmpty() ? "yes" : "no") << "\n";
    try {
        queue.dequeue();
    } catch (const std::underflow_error& error) {
        std::cout << "dequeue -> error: " << error.what() << "\n";
    }
    return 0;
}
