// Stack: last in, first out.
// We build it on a fixed-size array so you can see exactly what happens inside.
// (In everyday C++ you would simply use std::stack or std::vector.)
#include <initializer_list>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

class Stack {
    // @snippet setup
    std::vector<int> items;  // a row of boxes that hold our values
    int capacity;            // how many values fit
    int top = -1;            // index of the top value; -1 means empty

public:
    explicit Stack(int capacity) : items(capacity), capacity(capacity) {}
    // @end

    // @snippet push
    void push(int value) {
        if (top == capacity - 1) {
            throw std::overflow_error("stack is full");
        }
        top++;
        items[top] = value;
    }
    // @end

    // @snippet pop
    int pop() {
        if (top == -1) {
            throw std::underflow_error("stack is empty");
        }
        int value = items[top];
        top--;  // the old value stays in its box until a push overwrites it
        return value;
    }
    // @end

    // @snippet peek
    int peek() const {
        if (top == -1) {
            throw std::underflow_error("stack is empty");
        }
        return items[top];
    }
    // @end

    bool isEmpty() const { return top == -1; }

    int size() const { return top + 1; }

    std::string toString() const {
        std::string out = "[";
        for (int i = 0; i <= top; i++) {
            if (i > 0) out += ", ";
            out += std::to_string(items[i]);
        }
        return out + "]";
    }
};

int main() {
    Stack stack(5);
    std::cout << "Stack with room for 5 items (the top is on the right)\n";

    for (int value : {10, 20, 30}) {
        stack.push(value);
        std::cout << "push " << value << " -> " << stack.toString() << "\n";
    }

    std::cout << "peek -> " << stack.peek() << "\n";
    int popped = stack.pop();
    std::cout << "pop -> " << popped << ", stack is now " << stack.toString() << "\n";
    std::cout << "size -> " << stack.size() << "\n";

    for (int value : {40, 50, 60, 70}) {
        try {
            stack.push(value);
            std::cout << "push " << value << " -> " << stack.toString() << "\n";
        } catch (const std::overflow_error& error) {
            std::cout << "push " << value << " -> error: " << error.what() << "\n";
        }
    }

    while (!stack.isEmpty()) {
        popped = stack.pop();
        std::cout << "pop -> " << popped << ", stack is now " << stack.toString() << "\n";
    }

    std::cout << "is empty? -> " << (stack.isEmpty() ? "yes" : "no") << "\n";
    try {
        stack.pop();
    } catch (const std::underflow_error& error) {
        std::cout << "pop -> error: " << error.what() << "\n";
    }
    return 0;
}
