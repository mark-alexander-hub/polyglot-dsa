// Linked list: a chain of nodes, each one pointing to the next.
// We build it from scratch so you can see exactly how the links change.
// (In everyday C++ you would usually use std::vector, or std::forward_list.)
#include <initializer_list>
#include <iostream>
#include <stdexcept>
#include <string>

// @snippet node
struct Node {
    int value;   // the data this node holds
    Node* next;  // the next node in the chain; nullptr means "no next node"

    explicit Node(int value) : value(value), next(nullptr) {}
};
// @end

class LinkedList {
    // @snippet setup
    Node* head = nullptr;  // the first node; nullptr means the list is empty
    int count = 0;         // how many nodes the list has
    // @end

public:
    LinkedList() = default;

    // Every node was made with new, so the list must delete all of them.
    ~LinkedList() {
        Node* current = head;
        while (current != nullptr) {
            Node* next = current->next;
            delete current;
            current = next;
        }
    }

    // A copy would share (and later delete twice) the same nodes, so copying is not allowed.
    LinkedList(const LinkedList&) = delete;
    LinkedList& operator=(const LinkedList&) = delete;

    // @snippet add-first
    void addFirst(int value) {
        // @step add-first-new
        Node* node = new Node(value);
        // @end
        // @step add-first-link
        node->next = head;  // 1. the new node points at the old first node
        // @end
        // @step add-first-head
        head = node;        // 2. head moves to the new node
        count++;
        // @end
    }
    // @end

    // @snippet add-last
    void addLast(int value) {
        Node* node = new Node(value);
        // @step add-last-empty
        if (head == nullptr) {  // empty list: the new node becomes the head
            head = node;
        // @end
        } else {
            // @step add-last-walk
            Node* current = head;
            while (current->next != nullptr) {  // walk until the last node
                current = current->next;
            }
            // @end
            // @step add-last-link
            current->next = node;
            // @end
        }
        count++;
    }
    // @end

    // @snippet find
    bool find(int value) const {
        // @step find-start
        Node* current = head;
        // @end
        while (current != nullptr) {
            // @step find-check
            if (current->value == value) {
                return true;
            // @end
            }
            // @step find-next
            current = current->next;
            // @end
        }
        // @step find-none
        return false;
        // @end
    }
    // @end

    // @snippet remove
    void remove(int value) {
        // @step remove-empty
        if (head == nullptr) {
            throw std::invalid_argument("value not found");
        // @end
        }
        // @step remove-head
        if (head->value == value) {  // removing the first node: just move head
            Node* old = head;
            head = head->next;
            delete old;
            count--;
            return;
        // @end
        }
        // @step remove-walk
        Node* previous = head;
        while (previous->next != nullptr && previous->next->value != value) {
            previous = previous->next;
        }
        // @end
        // @step remove-missing
        if (previous->next == nullptr) {
            throw std::invalid_argument("value not found");
        // @end
        }
        // @step remove-skip
        Node* old = previous->next;
        previous->next = old->next;  // skip over the removed node
        delete old;                  // C++ does not free memory for us
        count--;
        // @end
    }
    // @end

    int size() const { return count; }

    std::string toString() const {
        std::string out;
        for (Node* current = head; current != nullptr; current = current->next) {
            out += std::to_string(current->value) + " -> ";
        }
        return out + "null";
    }
};

int main() {
    LinkedList numbers;
    std::cout << "Linked list, starting empty: " << numbers.toString() << "\n";

    for (int value : {20, 10}) {
        numbers.addFirst(value);
        std::cout << "add first " << value << ": " << numbers.toString() << "\n";
    }

    for (int value : {30, 40}) {
        numbers.addLast(value);
        std::cout << "add last " << value << ": " << numbers.toString() << "\n";
    }

    std::cout << "size: " << numbers.size() << "\n";

    for (int value : {30, 99}) {
        std::cout << "find " << value << ": " << (numbers.find(value) ? "yes" : "no") << "\n";
    }

    for (int value : {10, 30, 99, 40, 20}) {
        try {
            numbers.remove(value);
            std::cout << "remove " << value << ": " << numbers.toString() << "\n";
        } catch (const std::invalid_argument& error) {
            std::cout << "remove " << value << ": error: " << error.what() << "\n";
        }
    }

    std::cout << "size: " << numbers.size() << "\n";
    return 0;
}
