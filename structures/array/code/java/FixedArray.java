// Array: values sit side by side in numbered boxes.
// We build a fixed-size array ourselves so you can see every shift happen.
// (In everyday Java you would simply use ArrayList.)
public class FixedArray {
    // @snippet setup
    private final int[] items;   // a row of boxes, numbered from 0
    private final int capacity;  // how many boxes there are
    private int size = 0;        // how many boxes are in use

    public FixedArray(int capacity) {
        this.items = new int[capacity];
        this.capacity = capacity;
    }
    // @end

    // @snippet get
    public int get(int index) {
        // @step get-check
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("index out of range");
        }
        // @end
        // @step get-read
        return items[index];
        // @end
    }
    // @end

    // @snippet insert
    public void insert(int index, int value) {
        // @step insert-full
        if (size == capacity) {
            throw new IllegalStateException("array is full");
        }
        // @end
        // @step insert-range
        if (index < 0 || index > size) {
            throw new IndexOutOfBoundsException("index out of range");
        }
        // @end
        // Shift values one box to the right, starting from the end.
        // @step insert-shift
        for (int i = size; i > index; i--) {
            items[i] = items[i - 1];
        }
        // @end
        // @step insert-write
        items[index] = value;
        // @end
        // @step insert-size
        size++;
        // @end
    }
    // @end

    // @snippet remove
    public int remove(int index) {
        // @step remove-range
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("index out of range");
        }
        // @end
        // @step remove-read
        int value = items[index];
        // @end
        // Shift values one box to the left to close the gap.
        // @step remove-shift
        for (int i = index; i < size - 1; i++) {
            items[i] = items[i + 1];
        }
        // @end
        // @step remove-size
        size--;
        // @end
        // @step remove-return
        return value;
        // @end
    }
    // @end

    // @snippet search
    public int search(int value) {
        // @step search-loop
        for (int i = 0; i < size; i++) {
            if (items[i] == value) {
        // @end
                // @step search-found
                return i;
                // @end
            }
        }
        // @step search-missing
        return -1;  // not found
        // @end
    }
    // @end

    public int size() {
        return size;
    }

    public int capacity() {
        return capacity;
    }

    @Override
    public String toString() {
        StringBuilder out = new StringBuilder("[");
        for (int i = 0; i < size; i++) {
            if (i > 0) out.append(", ");
            out.append(items[i]);
        }
        return out.append("]").toString();
    }

    static void insertAndShow(FixedArray array, int index, int value) {
        try {
            array.insert(index, value);
            System.out.println("insert " + value + " at " + index + " -> " + array);
        } catch (RuntimeException error) {
            System.out.println("insert " + value + " at " + index + " -> error: " + error.getMessage());
        }
    }

    public static void main(String[] args) {
        FixedArray array = new FixedArray(5);
        System.out.println("Array with room for 5 values");

        int[][] steps = {{0, 10}, {1, 20}, {2, 40}, {2, 30}, {0, 5}, {5, 50}};
        for (int[] step : steps) {
            insertAndShow(array, step[0], step[1]);
        }

        for (int index : new int[] {2, 7}) {
            try {
                int value = array.get(index);
                System.out.println("get " + index + " -> " + value);
            } catch (IndexOutOfBoundsException error) {
                System.out.println("get " + index + " -> error: " + error.getMessage());
            }
        }

        for (int value : new int[] {30, 99}) {
            System.out.println("search " + value + " -> " + array.search(value));
        }

        for (int index : new int[] {0, 2, 3}) {
            try {
                int removed = array.remove(index);
                System.out.println("remove " + index + " -> " + removed + ", array is now " + array);
            } catch (IndexOutOfBoundsException error) {
                System.out.println("remove " + index + " -> error: " + error.getMessage());
            }
        }

        insertAndShow(array, 3, 60);
        insertAndShow(array, 9, 70);
        System.out.println("size -> " + array.size() + ", capacity -> " + array.capacity());
    }
}
