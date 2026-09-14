// Stack: last in, first out.
// We build it on a fixed-size array so you can see exactly what happens inside.
// (In everyday Java you would simply use ArrayDeque.)
public class Stack {
    // @snippet setup
    private final int[] items;   // a row of boxes that hold our values
    private final int capacity;  // how many values fit
    private int top = -1;        // index of the top value; -1 means empty

    public Stack(int capacity) {
        this.items = new int[capacity];
        this.capacity = capacity;
    }
    // @end

    // @snippet push
    public void push(int value) {
        if (top == capacity - 1) {
            throw new IllegalStateException("stack is full");
        }
        top++;
        items[top] = value;
    }
    // @end

    // @snippet pop
    public int pop() {
        if (top == -1) {
            throw new IllegalStateException("stack is empty");
        }
        int value = items[top];
        top--;  // the old value stays in its box until a push overwrites it
        return value;
    }
    // @end

    // @snippet peek
    public int peek() {
        if (top == -1) {
            throw new IllegalStateException("stack is empty");
        }
        return items[top];
    }
    // @end

    public boolean isEmpty() {
        return top == -1;
    }

    public int size() {
        return top + 1;
    }

    @Override
    public String toString() {
        StringBuilder out = new StringBuilder("[");
        for (int i = 0; i <= top; i++) {
            if (i > 0) out.append(", ");
            out.append(items[i]);
        }
        return out.append("]").toString();
    }

    public static void main(String[] args) {
        Stack stack = new Stack(5);
        System.out.println("Stack with room for 5 items (the top is on the right)");

        for (int value : new int[] {10, 20, 30}) {
            stack.push(value);
            System.out.println("push " + value + " -> " + stack);
        }

        System.out.println("peek -> " + stack.peek());
        int popped = stack.pop();
        System.out.println("pop -> " + popped + ", stack is now " + stack);
        System.out.println("size -> " + stack.size());

        for (int value : new int[] {40, 50, 60, 70}) {
            try {
                stack.push(value);
                System.out.println("push " + value + " -> " + stack);
            } catch (IllegalStateException error) {
                System.out.println("push " + value + " -> error: " + error.getMessage());
            }
        }

        while (!stack.isEmpty()) {
            popped = stack.pop();
            System.out.println("pop -> " + popped + ", stack is now " + stack);
        }

        System.out.println("is empty? -> " + (stack.isEmpty() ? "yes" : "no"));
        try {
            stack.pop();
        } catch (IllegalStateException error) {
            System.out.println("pop -> error: " + error.getMessage());
        }
    }
}
