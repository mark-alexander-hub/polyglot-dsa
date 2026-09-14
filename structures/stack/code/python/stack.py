# Stack: last in, first out.
# We build it on a fixed-size list so you can see exactly what happens inside.
# (In everyday Python you would simply use a list with append() and pop().)


class Stack:
    # @snippet setup
    def __init__(self, capacity):
        self.items = [0] * capacity  # a row of boxes that hold our values
        self.capacity = capacity     # how many values fit
        self.top = -1                # index of the top value; -1 means empty
    # @end

    # @snippet push
    def push(self, value):
        if self.top == self.capacity - 1:
            raise IndexError("stack is full")
        self.top += 1
        self.items[self.top] = value
    # @end

    # @snippet pop
    def pop(self):
        if self.top == -1:
            raise IndexError("stack is empty")
        value = self.items[self.top]
        self.top -= 1  # the old value stays in its box until a push overwrites it
        return value
    # @end

    # @snippet peek
    def peek(self):
        if self.top == -1:
            raise IndexError("stack is empty")
        return self.items[self.top]
    # @end

    def is_empty(self):
        return self.top == -1

    def size(self):
        return self.top + 1

    def __str__(self):
        return "[" + ", ".join(str(v) for v in self.items[: self.top + 1]) + "]"


def main():
    stack = Stack(5)
    print("Stack with room for 5 items (the top is on the right)")

    for value in (10, 20, 30):
        stack.push(value)
        print(f"push {value} -> {stack}")

    print(f"peek -> {stack.peek()}")
    popped = stack.pop()
    print(f"pop -> {popped}, stack is now {stack}")
    print(f"size -> {stack.size()}")

    for value in (40, 50, 60, 70):
        try:
            stack.push(value)
            print(f"push {value} -> {stack}")
        except IndexError as error:
            print(f"push {value} -> error: {error}")

    while not stack.is_empty():
        popped = stack.pop()
        print(f"pop -> {popped}, stack is now {stack}")

    print(f"is empty? -> {'yes' if stack.is_empty() else 'no'}")
    try:
        stack.pop()
    except IndexError as error:
        print(f"pop -> error: {error}")


if __name__ == "__main__":
    main()
