# Linked list: a chain of nodes, each one pointing to the next.
# We build it from scratch so you can see exactly how the links change.
# (In everyday Python you would usually use a list, or collections.deque.)


# @snippet node
class Node:
    def __init__(self, value):
        self.value = value  # the data this node holds
        self.next = None    # the next node in the chain; None means "no next node"
# @end


class LinkedList:
    # @snippet setup
    def __init__(self):
        self.head = None  # the first node; None means the list is empty
        self.count = 0    # how many nodes the list has
    # @end

    # @snippet add-first
    def add_first(self, value):
        # @step add-first-new
        node = Node(value)
        # @end
        # @step add-first-link
        node.next = self.head  # 1. the new node points at the old first node
        # @end
        # @step add-first-head
        self.head = node       # 2. head moves to the new node
        self.count += 1
        # @end
    # @end

    # @snippet add-last
    def add_last(self, value):
        node = Node(value)
        # @step add-last-empty
        if self.head is None:  # empty list: the new node becomes the head
            self.head = node
        # @end
        else:
            # @step add-last-walk
            current = self.head
            while current.next is not None:  # walk until the last node
                current = current.next
            # @end
            # @step add-last-link
            current.next = node
            # @end
        self.count += 1
    # @end

    # @snippet find
    def find(self, value):
        # @step find-start
        current = self.head
        # @end
        while current is not None:
            # @step find-check
            if current.value == value:
                return True
            # @end
            # @step find-next
            current = current.next
            # @end
        # @step find-none
        return False
        # @end
    # @end

    # @snippet remove
    def remove(self, value):
        # @step remove-empty
        if self.head is None:
            raise ValueError("value not found")
        # @end
        # @step remove-head
        if self.head.value == value:  # removing the first node: just move head
            self.head = self.head.next
            self.count -= 1
            return
        # @end
        # @step remove-walk
        previous = self.head
        while previous.next is not None and previous.next.value != value:
            previous = previous.next
        # @end
        # @step remove-missing
        if previous.next is None:
            raise ValueError("value not found")
        # @end
        # @step remove-skip
        previous.next = previous.next.next  # skip over the removed node
        self.count -= 1
        # @end
    # @end

    def size(self):
        return self.count

    def __str__(self):
        parts = []
        current = self.head
        while current is not None:
            parts.append(str(current.value))
            current = current.next
        parts.append("null")
        return " -> ".join(parts)


def main():
    numbers = LinkedList()
    print(f"Linked list, starting empty: {numbers}")

    for value in (20, 10):
        numbers.add_first(value)
        print(f"add first {value}: {numbers}")

    for value in (30, 40):
        numbers.add_last(value)
        print(f"add last {value}: {numbers}")

    print(f"size: {numbers.size()}")

    for value in (30, 99):
        print(f"find {value}: {'yes' if numbers.find(value) else 'no'}")

    for value in (10, 30, 99, 40, 20):
        try:
            numbers.remove(value)
            print(f"remove {value}: {numbers}")
        except ValueError as error:
            print(f"remove {value}: error: {error}")

    print(f"size: {numbers.size()}")


if __name__ == "__main__":
    main()
