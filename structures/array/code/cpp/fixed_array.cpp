// Array: values sit side by side in numbered boxes.
// We build a fixed-size array ourselves so you can see every shift happen.
// (In everyday C++ you would simply use std::vector.)
#include <initializer_list>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

class FixedArray {
    // @snippet setup
    std::vector<int> items;  // a row of boxes, numbered from 0
    int capacity;            // how many boxes there are
    int size = 0;            // how many boxes are in use

public:
    explicit FixedArray(int capacity) : items(capacity), capacity(capacity) {}
    // @end

    // @snippet get
    int get(int index) const {
        if (index < 0 || index >= size) {
            throw std::out_of_range("index out of range");
        }
        return items[index];
    }
    // @end

    // @snippet insert
    void insert(int index, int value) {
        if (size == capacity) {
            throw std::overflow_error("array is full");
        }
        if (index < 0 || index > size) {
            throw std::out_of_range("index out of range");
        }
        // Shift values one box to the right, starting from the end.
        for (int i = size; i > index; i--) {
            items[i] = items[i - 1];
        }
        items[index] = value;
        size++;
    }
    // @end

    // @snippet remove
    int remove(int index) {
        if (index < 0 || index >= size) {
            throw std::out_of_range("index out of range");
        }
        int value = items[index];
        // Shift values one box to the left to close the gap.
        for (int i = index; i < size - 1; i++) {
            items[i] = items[i + 1];
        }
        size--;
        return value;
    }
    // @end

    // @snippet search
    int search(int value) const {
        for (int i = 0; i < size; i++) {
            if (items[i] == value) {
                return i;
            }
        }
        return -1;  // not found
    }
    // @end

    int getSize() const { return size; }

    int getCapacity() const { return capacity; }

    std::string toString() const {
        std::string out = "[";
        for (int i = 0; i < size; i++) {
            if (i > 0) out += ", ";
            out += std::to_string(items[i]);
        }
        return out + "]";
    }
};

void insertAndShow(FixedArray& array, int index, int value) {
    try {
        array.insert(index, value);
        std::cout << "insert " << value << " at " << index << " -> " << array.toString() << "\n";
    } catch (const std::exception& error) {
        std::cout << "insert " << value << " at " << index << " -> error: " << error.what() << "\n";
    }
}

int main() {
    FixedArray array(5);
    std::cout << "Array with room for 5 values\n";

    const int steps[][2] = {{0, 10}, {1, 20}, {2, 40}, {2, 30}, {0, 5}, {5, 50}};
    for (const auto& step : steps) {
        insertAndShow(array, step[0], step[1]);
    }

    for (int index : {2, 7}) {
        try {
            int value = array.get(index);
            std::cout << "get " << index << " -> " << value << "\n";
        } catch (const std::out_of_range& error) {
            std::cout << "get " << index << " -> error: " << error.what() << "\n";
        }
    }

    for (int value : {30, 99}) {
        std::cout << "search " << value << " -> " << array.search(value) << "\n";
    }

    for (int index : {0, 2, 3}) {
        try {
            int removed = array.remove(index);
            std::cout << "remove " << index << " -> " << removed << ", array is now " << array.toString() << "\n";
        } catch (const std::out_of_range& error) {
            std::cout << "remove " << index << " -> error: " << error.what() << "\n";
        }
    }

    insertAndShow(array, 3, 60);
    insertAndShow(array, 9, 70);
    std::cout << "size -> " << array.getSize() << ", capacity -> " << array.getCapacity() << "\n";
    return 0;
}
