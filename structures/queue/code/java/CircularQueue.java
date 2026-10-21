// Queue: first in, first out.
// We build a circular queue on a fixed-size array so you can see exactly what happens inside.
// (In everyday Java you would simply use ArrayDeque.)
public class CircularQueue {
    // @snippet setup
    private final int[] items;   // a row of boxes that hold our values
    private final int capacity;  // how many values fit
    private int front = 0;       // index of the box holding the oldest value
    private int count = 0;       // how many values are in the queue right now

    public CircularQueue(int capacity) {
        this.items = new int[capacity];
        this.capacity = capacity;
    }
    // @end

    // @snippet enqueue
    public void enqueue(int value) {
        // @step enqueue-check
        if (count == capacity) {
            throw new IllegalStateException("queue is full");
        }
        // @end
        // @step enqueue-rear
        int rear = (front + count) % capacity;  // next free box
        // @end
        // @step enqueue-write
        items[rear] = value;
        // @end
        // @step enqueue-count
        count++;
        // @end
    }
    // @end

    // @snippet dequeue
    public int dequeue() {
        // @step dequeue-check
        if (count == 0) {
            throw new IllegalStateException("queue is empty");
        }
        // @end
        // @step dequeue-read
        int value = items[front];
        // @end
        // @step dequeue-front
        front = (front + 1) % capacity;  // wraps around to box 0
        // @end
        // @step dequeue-count
        count--;
        // @end
        // @step dequeue-return
        return value;
        // @end
    }
    // @end

    // @snippet peek
    public int peek() {
        // @step peek-check
        if (count == 0) {
            throw new IllegalStateException("queue is empty");
        }
        // @end
        // @step peek-return
        return items[front];
        // @end
    }
    // @end

    public boolean isEmpty() {
        return count == 0;
    }

    public int size() {
        return count;
    }

    @Override
    public String toString() {
        StringBuilder out = new StringBuilder("[");
        for (int i = 0; i < count; i++) {
            if (i > 0) out.append(", ");
            out.append(items[(front + i) % capacity]);
        }
        out.append("] (front at box ").append(front);
        if (count > 0) {
            out.append(", rear at box ").append((front + count - 1) % capacity);
        }
        return out.append(")").toString();
    }

    public static void main(String[] args) {
        CircularQueue queue = new CircularQueue(5);
        System.out.println("Queue with room for 5 items (join at the rear, leave from the front)");

        for (int value : new int[] {10, 20, 30, 40, 50, 60}) {
            try {
                queue.enqueue(value);
                System.out.println("enqueue " + value + " -> " + queue);
            } catch (IllegalStateException error) {
                System.out.println("enqueue " + value + " -> error: " + error.getMessage());
            }
        }

        System.out.println("peek -> " + queue.peek());
        for (int i = 0; i < 2; i++) {
            int removed = queue.dequeue();
            System.out.println("dequeue -> " + removed + ", queue is now " + queue);
        }

        for (int value : new int[] {60, 70}) {
            queue.enqueue(value);
            System.out.println("enqueue " + value + " -> " + queue);
        }
        System.out.println("size -> " + queue.size());

        while (!queue.isEmpty()) {
            int removed = queue.dequeue();
            System.out.println("dequeue -> " + removed + ", queue is now " + queue);
        }

        System.out.println("is empty? -> " + (queue.isEmpty() ? "yes" : "no"));
        try {
            queue.dequeue();
        } catch (IllegalStateException error) {
            System.out.println("dequeue -> error: " + error.getMessage());
        }
    }
}
