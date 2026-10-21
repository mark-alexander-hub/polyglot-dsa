// Hash map: find any value by its key in one jump, without searching through everything.
// We build it on a small array of buckets so you can see exactly what happens inside.
// (In everyday Java you would simply use java.util.HashMap.)
public class HashMap {
    // @snippet setup
    private static final class Entry {
        String key;
        int value;
        Entry next;  // the next entry in the same bucket, or null

        Entry(String key, int value, Entry next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }

    private Entry[] buckets;   // each bucket holds a chain of entries
    private int bucketCount;
    private int count = 0;     // how many keys are stored right now

    public HashMap(int bucketCount) {
        this.buckets = new Entry[bucketCount];
        this.bucketCount = bucketCount;
    }

    public int hashOf(String key) {
        int total = 0;
        // @step hash-sum
        for (int i = 0; i < key.length(); i++) {
            total += key.charAt(i);  // add up the character codes of the key
        // @end
        }
        return total;
    }

    public int indexOf(String key) {
        // @step hash-index
        return hashOf(key) % bucketCount;  // which bucket this key belongs to
        // @end
    }
    // @end

    // @snippet put
    public boolean put(String key, int value) {
        // @step put-bucket
        Entry entry = buckets[indexOf(key)];
        // @end
        // @step put-compare
        while (entry != null) {
            if (entry.key.equals(key)) {
        // @end
                // @step put-update
                entry.value = value;  // the key is already here: just replace its value
                return false;
                // @end
            }
            // @step put-next
            entry = entry.next;
            // @end
        }
        // @step put-grow
        if (count == bucketCount) {
            grow();  // already one key per bucket on average: make room first
        // @end
        }
        // @step put-insert
        int index = indexOf(key);
        buckets[index] = new Entry(key, value, buckets[index]);  // new entry at the front of the chain
        count++;
        return true;
        // @end
    }
    // @end

    // @snippet grow
    private void grow() {
        // @step grow-double
        Entry[] oldBuckets = buckets;
        bucketCount *= 2;
        buckets = new Entry[bucketCount];
        // @end
        for (Entry entry : oldBuckets) {
            // @step grow-move
            while (entry != null) {  // every key gets a new bucket, because % changed
                Entry next = entry.next;
                int index = indexOf(entry.key);
                entry.next = buckets[index];
                buckets[index] = entry;
                entry = next;
            // @end
            }
        }
    }
    // @end

    // @snippet get
    public Integer get(String key) {
        // @step get-bucket
        Entry entry = buckets[indexOf(key)];
        // @end
        // @step get-compare
        while (entry != null) {  // only this one chain is searched, never the whole map
            if (entry.key.equals(key)) {
        // @end
                // @step get-found
                return entry.value;
                // @end
            }
            // @step get-next
            entry = entry.next;
            // @end
        }
        // @step get-missing
        return null;
        // @end
    }
    // @end

    public boolean contains(String key) {
        return get(key) != null;
    }

    // @snippet remove
    public boolean remove(String key) {
        // @step remove-bucket
        int index = indexOf(key);
        Entry entry = buckets[index];
        Entry previous = null;
        // @end
        // @step remove-compare
        while (entry != null) {
            if (entry.key.equals(key)) {
        // @end
                // @step remove-unlink
                if (previous == null) {
                    buckets[index] = entry.next;  // it was the first in the chain
                } else {
                    previous.next = entry.next;   // unlink it from the middle
                }
                count--;
                return true;
                // @end
            }
            // @step remove-next
            previous = entry;
            entry = entry.next;
            // @end
        }
        // @step remove-missing
        return false;
        // @end
    }
    // @end

    public int size() {
        return count;
    }

    public int bucketCount() {
        return bucketCount;
    }

    public String[] keys() {
        String[] result = new String[count];
        int n = 0;
        for (Entry entry : buckets) {
            while (entry != null) {
                result[n++] = entry.key;
                entry = entry.next;
            }
        }
        return result;
    }

    public String bucketToString(int index) {
        StringBuilder out = new StringBuilder();
        Entry entry = buckets[index];
        while (entry != null) {
            if (out.length() > 0) out.append(" -> ");
            out.append(entry.key).append("=").append(entry.value);
            entry = entry.next;
        }
        return out.length() > 0 ? out.toString() : "(empty)";
    }

    private static void showPut(HashMap m, String key, int value) {
        int bucketsBefore = m.bucketCount();
        boolean added = m.put(key, value);
        if (m.bucketCount() != bucketsBefore) {
            System.out.println((m.size() - 1) + " keys in " + bucketsBefore + " buckets, one more would crowd it -> grew to " + m.bucketCount() + " buckets and re-hashed every key");
        }
        int index = m.indexOf(key);
        System.out.println("put " + key + "=" + value + " -> hash " + m.hashOf(key) + " % " + m.bucketCount() + " = bucket " + index + ", " + (added ? "new key" : "value replaced"));
        System.out.println("  bucket " + index + ": " + m.bucketToString(index));
    }

    private static void showGet(HashMap m, String key) {
        Integer value = m.get(key);
        System.out.println("get " + key + " -> " + (value == null ? "not found" : value));
    }

    private static void showTable(HashMap m) {
        System.out.println("the whole table (" + m.size() + " keys in " + m.bucketCount() + " buckets):");
        for (int i = 0; i < m.bucketCount(); i++) {
            System.out.println("  bucket " + i + ": " + m.bucketToString(i));
        }
    }

    public static void main(String[] args) {
        HashMap m = new HashMap(4);
        System.out.println("Hash map with 4 buckets (a key's bucket = sum of its letter codes % 4)");

        String[] keys = {"tea", "dosa", "idli", "vada"};
        int[] values = {10, 40, 30, 25};
        for (int i = 0; i < keys.length; i++) {
            showPut(m, keys[i], values[i]);
        }
        showTable(m);

        for (String key : new String[] {"tea", "idli", "puri"}) {
            showGet(m, key);
        }

        showPut(m, "tea", 12);
        System.out.println("size -> " + m.size());

        showPut(m, "coffee", 15);
        showTable(m);
        showGet(m, "vada");

        for (String key : new String[] {"idli", "idli"}) {
            int index = m.indexOf(key);
            boolean removed = m.remove(key);
            System.out.println("remove " + key + " -> " + (removed ? "removed from bucket " + index : "not found"));
        }
        showGet(m, "idli");

        for (String key : new String[] {"dosa", "puri"}) {
            System.out.println("contains " + key + " -> " + (m.contains(key) ? "yes" : "no"));
        }
        System.out.println("size -> " + m.size());
        System.out.println("keys in bucket order -> " + String.join(", ", m.keys()));
    }
}
