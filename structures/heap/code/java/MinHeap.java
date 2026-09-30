// Min-heap: the smallest value is always on top.
// We build it on a fixed-size array so you can see exactly what happens inside.
// (In everyday Java you would simply use java.util.PriorityQueue.)
public class MinHeap {
    // @snippet setup
    private final int[] items;   // the tree, stored level by level
    private final int capacity;  // how many values fit
    private int count = 0;       // how many values are in the heap right now

    public MinHeap(int capacity) {
        this.items = new int[capacity];
        this.capacity = capacity;
    }

    private int parent(int i) {
        return (i - 1) / 2;
    }

    private int left(int i) {
        return 2 * i + 1;
    }

    private int right(int i) {
        return 2 * i + 2;
    }
    // @end

    // @snippet insert
    public int insert(int value) {
        if (count == capacity) {
            throw new IllegalStateException("heap is full");
        }
        items[count] = value;  // put it in the first free spot, at the end
        count++;
        return siftUp(count - 1);  // how many steps it climbed (for the demo)
    }

    private int siftUp(int i) {
        int swaps = 0;
        while (i > 0 && items[i] < items[parent(i)]) {
            int p = parent(i);
            int tmp = items[i];
            items[i] = items[p];
            items[p] = tmp;
            i = p;
            swaps++;
        }
        return swaps;
    }
    // @end

    // @snippet removeMin
    public int removeMin() {
        if (count == 0) {
            throw new IllegalStateException("heap is empty");
        }
        int smallest = items[0];
        count--;
        items[0] = items[count];  // the last value moves to the top...
        siftDown(0);              // ...and sinks to where it belongs
        return smallest;
    }

    private void siftDown(int i) {
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
            int tmp = items[i];
            items[i] = items[smallest];
            items[smallest] = tmp;
            i = smallest;
        }
    }
    // @end

    // @snippet peek
    public int peek() {
        if (count == 0) {
            throw new IllegalStateException("heap is empty");
        }
        return items[0];
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
            out.append(items[i]);
        }
        return out.append("]").toString();
    }

    private static String swapsText(int swaps) {
        return swaps + (swaps == 1 ? " swap" : " swaps");
    }

    public static void main(String[] args) {
        MinHeap heap = new MinHeap(7);
        System.out.println("Min-heap with room for 7 values (the smallest is always on top)");

        for (int value : new int[] {42, 17, 30, 8}) {
            int swaps = heap.insert(value);
            System.out.println("insert " + value + " -> " + heap + " (" + swapsText(swaps) + ")");
        }

        System.out.println("peek -> " + heap.peek());
        System.out.println("size -> " + heap.size());
        int smallest = heap.removeMin();
        System.out.println("removeMin -> " + smallest + ", heap is now " + heap);

        for (int value : new int[] {25, 5, 13, 60, 3}) {
            try {
                int swaps = heap.insert(value);
                System.out.println("insert " + value + " -> " + heap + " (" + swapsText(swaps) + ")");
            } catch (IllegalStateException error) {
                System.out.println("insert " + value + " -> error: " + error.getMessage());
            }
        }

        StringBuilder taken = new StringBuilder();
        while (!heap.isEmpty()) {
            smallest = heap.removeMin();
            if (taken.length() > 0) taken.append(", ");
            taken.append(smallest);
            System.out.println("removeMin -> " + smallest + ", heap is now " + heap);
        }

        System.out.println("taken out in order -> " + taken);
        System.out.println("is empty? -> " + (heap.isEmpty() ? "yes" : "no"));
        try {
            heap.removeMin();
        } catch (IllegalStateException error) {
            System.out.println("removeMin -> error: " + error.getMessage());
        }
    }
}
