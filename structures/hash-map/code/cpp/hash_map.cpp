// Hash map: find any value by its key in one jump, without searching through everything.
// We build it on a small array of buckets so you can see exactly what happens inside.
// (In everyday C++ you would simply use std::unordered_map.)
#include <iostream>
#include <optional>
#include <string>
#include <utility>
#include <vector>

struct Entry {
    std::string key;
    int value;
    Entry* next;  // the next entry in the same bucket, or nullptr

    Entry(std::string key, int value, Entry* next) : key(std::move(key)), value(value), next(next) {}
};

class HashMap {
    // @snippet setup
    std::vector<Entry*> buckets;  // each bucket holds a chain of entries
    int bucketCount;
    int count = 0;                // how many keys are stored right now

public:
    explicit HashMap(int bucketCount) : buckets(bucketCount, nullptr), bucketCount(bucketCount) {}

    int hashOf(const std::string& key) const {
        int total = 0;
        for (char ch : key) {
            total += static_cast<unsigned char>(ch);  // add up the character codes of the key
        }
        return total;
    }

    int indexOf(const std::string& key) const {
        return hashOf(key) % bucketCount;  // which bucket this key belongs to
    }
    // @end

    HashMap(const HashMap&) = delete;
    HashMap& operator=(const HashMap&) = delete;

    ~HashMap() {
        for (Entry* entry : buckets) {
            while (entry != nullptr) {
                Entry* next = entry->next;
                delete entry;
                entry = next;
            }
        }
    }

    // @snippet put
    bool put(const std::string& key, int value) {
        Entry* entry = buckets[indexOf(key)];
        while (entry != nullptr) {
            if (entry->key == key) {
                entry->value = value;  // the key is already here: just replace its value
                return false;
            }
            entry = entry->next;
        }
        if (count == bucketCount) {
            grow();  // already one key per bucket on average: make room first
        }
        int index = indexOf(key);
        buckets[index] = new Entry(key, value, buckets[index]);  // new entry at the front of the chain
        count++;
        return true;
    }
    // @end

    // @snippet grow
    void grow() {
        std::vector<Entry*> oldBuckets = std::move(buckets);
        bucketCount *= 2;
        buckets.assign(bucketCount, nullptr);
        for (Entry* entry : oldBuckets) {
            while (entry != nullptr) {  // every key gets a new bucket, because % changed
                Entry* next = entry->next;
                int index = indexOf(entry->key);
                entry->next = buckets[index];
                buckets[index] = entry;
                entry = next;
            }
        }
    }
    // @end

    // @snippet get
    std::optional<int> get(const std::string& key) const {
        Entry* entry = buckets[indexOf(key)];
        while (entry != nullptr) {  // only this one chain is searched, never the whole map
            if (entry->key == key) {
                return entry->value;
            }
            entry = entry->next;
        }
        return std::nullopt;
    }
    // @end

    bool contains(const std::string& key) const {
        return get(key).has_value();
    }

    // @snippet remove
    bool remove(const std::string& key) {
        int index = indexOf(key);
        Entry* entry = buckets[index];
        Entry* previous = nullptr;
        while (entry != nullptr) {
            if (entry->key == key) {
                if (previous == nullptr) {
                    buckets[index] = entry->next;  // it was the first in the chain
                } else {
                    previous->next = entry->next;  // unlink it from the middle
                }
                delete entry;
                count--;
                return true;
            }
            previous = entry;
            entry = entry->next;
        }
        return false;
    }
    // @end

    int size() const {
        return count;
    }

    int getBucketCount() const {
        return bucketCount;
    }

    std::vector<std::string> keys() const {
        std::vector<std::string> result;
        for (Entry* entry : buckets) {
            while (entry != nullptr) {
                result.push_back(entry->key);
                entry = entry->next;
            }
        }
        return result;
    }

    std::string bucketToString(int index) const {
        std::string out;
        for (Entry* entry = buckets[index]; entry != nullptr; entry = entry->next) {
            if (!out.empty()) out += " -> ";
            out += entry->key + "=" + std::to_string(entry->value);
        }
        return out.empty() ? "(empty)" : out;
    }
};

static void showPut(HashMap& m, const std::string& key, int value) {
    int bucketsBefore = m.getBucketCount();
    bool added = m.put(key, value);
    if (m.getBucketCount() != bucketsBefore) {
        std::cout << (m.size() - 1) << " keys in " << bucketsBefore << " buckets, one more would crowd it -> grew to "
                  << m.getBucketCount() << " buckets and re-hashed every key\n";
    }
    int index = m.indexOf(key);
    std::cout << "put " << key << "=" << value << " -> hash " << m.hashOf(key) << " % " << m.getBucketCount()
              << " = bucket " << index << ", " << (added ? "new key" : "value replaced") << "\n";
    std::cout << "  bucket " << index << ": " << m.bucketToString(index) << "\n";
}

static void showGet(const HashMap& m, const std::string& key) {
    std::optional<int> value = m.get(key);
    std::cout << "get " << key << " -> ";
    if (value.has_value()) {
        std::cout << *value << "\n";
    } else {
        std::cout << "not found\n";
    }
}

static void showTable(const HashMap& m) {
    std::cout << "the whole table (" << m.size() << " keys in " << m.getBucketCount() << " buckets):\n";
    for (int i = 0; i < m.getBucketCount(); i++) {
        std::cout << "  bucket " << i << ": " << m.bucketToString(i) << "\n";
    }
}

int main() {
    HashMap m(4);
    std::cout << "Hash map with 4 buckets (a key's bucket = sum of its letter codes % 4)\n";

    for (const auto& [key, value] : std::vector<std::pair<std::string, int>>{{"tea", 10}, {"dosa", 40}, {"idli", 30}, {"vada", 25}}) {
        showPut(m, key, value);
    }
    showTable(m);

    for (const char* key : {"tea", "idli", "puri"}) {
        showGet(m, key);
    }

    showPut(m, "tea", 12);
    std::cout << "size -> " << m.size() << "\n";

    showPut(m, "coffee", 15);
    showTable(m);
    showGet(m, "vada");

    for (const char* key : {"idli", "idli"}) {
        int index = m.indexOf(key);
        bool removed = m.remove(key);
        std::cout << "remove " << key << " -> ";
        if (removed) {
            std::cout << "removed from bucket " << index << "\n";
        } else {
            std::cout << "not found\n";
        }
    }
    showGet(m, "idli");

    for (const char* key : {"dosa", "puri"}) {
        std::cout << "contains " << key << " -> " << (m.contains(key) ? "yes" : "no") << "\n";
    }
    std::cout << "size -> " << m.size() << "\n";

    std::string joined;
    for (const std::string& key : m.keys()) {
        if (!joined.empty()) joined += ", ";
        joined += key;
    }
    std::cout << "keys in bucket order -> " << joined << "\n";
    return 0;
}
