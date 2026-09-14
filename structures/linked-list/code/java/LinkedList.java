// Linked list: a chain of nodes, each one pointing to the next.
// We build it from scratch so you can see exactly how the links change.
// (In everyday Java you would usually use ArrayList, or the built-in java.util.LinkedList.)
public class LinkedList {
    // @snippet node
    static class Node {
        int value;  // the data this node holds
        Node next;  // the next node in the chain; null means "no next node"

        Node(int value) {
            this.value = value;
        }
    }
    // @end

    // @snippet setup
    private Node head = null;  // the first node; null means the list is empty
    private int count = 0;     // how many nodes the list has
    // @end

    // @snippet add-first
    public void addFirst(int value) {
        Node node = new Node(value);
        node.next = head;  // 1. the new node points at the old first node
        head = node;       // 2. head moves to the new node
        count++;
    }
    // @end

    // @snippet add-last
    public void addLast(int value) {
        Node node = new Node(value);
        if (head == null) {  // empty list: the new node becomes the head
            head = node;
        } else {
            Node current = head;
            while (current.next != null) {  // walk until the last node
                current = current.next;
            }
            current.next = node;
        }
        count++;
    }
    // @end

    // @snippet find
    public boolean find(int value) {
        Node current = head;
        while (current != null) {
            if (current.value == value) {
                return true;
            }
            current = current.next;
        }
        return false;
    }
    // @end

    // @snippet remove
    public void remove(int value) {
        if (head == null) {
            throw new IllegalArgumentException("value not found");
        }
        if (head.value == value) {  // removing the first node: just move head
            head = head.next;
            count--;
            return;
        }
        Node previous = head;
        while (previous.next != null && previous.next.value != value) {
            previous = previous.next;
        }
        if (previous.next == null) {
            throw new IllegalArgumentException("value not found");
        }
        previous.next = previous.next.next;  // skip over the removed node
        count--;
    }
    // @end

    public int size() {
        return count;
    }

    @Override
    public String toString() {
        StringBuilder out = new StringBuilder();
        for (Node current = head; current != null; current = current.next) {
            out.append(current.value).append(" -> ");
        }
        return out.append("null").toString();
    }

    public static void main(String[] args) {
        LinkedList numbers = new LinkedList();
        System.out.println("Linked list, starting empty: " + numbers);

        for (int value : new int[] {20, 10}) {
            numbers.addFirst(value);
            System.out.println("add first " + value + ": " + numbers);
        }

        for (int value : new int[] {30, 40}) {
            numbers.addLast(value);
            System.out.println("add last " + value + ": " + numbers);
        }

        System.out.println("size: " + numbers.size());

        for (int value : new int[] {30, 99}) {
            System.out.println("find " + value + ": " + (numbers.find(value) ? "yes" : "no"));
        }

        for (int value : new int[] {10, 30, 99, 40, 20}) {
            try {
                numbers.remove(value);
                System.out.println("remove " + value + ": " + numbers);
            } catch (IllegalArgumentException error) {
                System.out.println("remove " + value + ": error: " + error.getMessage());
            }
        }

        System.out.println("size: " + numbers.size());
    }
}
