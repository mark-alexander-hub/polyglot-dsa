# Queue: first in, first out.
# We build a circular queue on a fixed-size list so you can see exactly what happens inside.
# (In everyday Python you would simply use collections.deque.)


class CircularQueue:
    # @snippet setup
    def __init__(self, capacity):
        self.items = [0] * capacity  # a row of boxes that hold our values
        self.capacity = capacity     # how many values fit
        self.front = 0               # index of the box holding the oldest value
        self.count = 0               # how many values are in the queue right now
    # @end

    # @snippet enqueue
    def enqueue(self, value):
        if self.count == self.capacity:
            raise IndexError("queue is full")
        rear = (self.front + self.count) % self.capacity  # next free box
        self.items[rear] = value
        self.count += 1
    # @end

    # @snippet dequeue
    def dequeue(self):
        if self.count == 0:
            raise IndexError("queue is empty")
        value = self.items[self.front]
        self.front = (self.front + 1) % self.capacity  # wraps around to box 0
        self.count -= 1
        return value
    # @end

    # @snippet peek
    def peek(self):
        if self.count == 0:
            raise IndexError("queue is empty")
        return self.items[self.front]
    # @end

    def is_empty(self):
        return self.count == 0

    def size(self):
        return self.count

    def __str__(self):
        values = [str(self.items[(self.front + i) % self.capacity]) for i in range(self.count)]
        text = "[" + ", ".join(values) + "] (front at box " + str(self.front)
        if self.count > 0:
            text += ", rear at box " + str((self.front + self.count - 1) % self.capacity)
        return text + ")"


def main():
    queue = CircularQueue(5)
    print("Queue with room for 5 items (join at the rear, leave from the front)")

    for value in (10, 20, 30, 40, 50, 60):
        try:
            queue.enqueue(value)
            print(f"enqueue {value} -> {queue}")
        except IndexError as error:
            print(f"enqueue {value} -> error: {error}")

    print(f"peek -> {queue.peek()}")
    for _ in range(2):
        removed = queue.dequeue()
        print(f"dequeue -> {removed}, queue is now {queue}")

    for value in (60, 70):
        queue.enqueue(value)
        print(f"enqueue {value} -> {queue}")
    print(f"size -> {queue.size()}")

    while not queue.is_empty():
        removed = queue.dequeue()
        print(f"dequeue -> {removed}, queue is now {queue}")

    print(f"is empty? -> {'yes' if queue.is_empty() else 'no'}")
    try:
        queue.dequeue()
    except IndexError as error:
        print(f"dequeue -> error: {error}")


if __name__ == "__main__":
    main()
