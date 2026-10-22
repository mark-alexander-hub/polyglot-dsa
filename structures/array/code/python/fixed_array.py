# Array: values sit side by side in numbered boxes.
# We build a fixed-size array ourselves so you can see every shift happen.
# (In everyday Python you would simply use a list.)


class FixedArray:
    # @snippet setup
    def __init__(self, capacity):
        self.items = [0] * capacity  # a row of boxes, numbered from 0
        self.capacity = capacity     # how many boxes there are
        self.size = 0                # how many boxes are in use
    # @end

    # @snippet get
    def get(self, index):
        # @step get-check
        if index < 0 or index >= self.size:
            raise IndexError("index out of range")
        # @end
        # @step get-read
        return self.items[index]
        # @end
    # @end

    # @snippet insert
    def insert(self, index, value):
        # @step insert-full
        if self.size == self.capacity:
            raise IndexError("array is full")
        # @end
        # @step insert-range
        if index < 0 or index > self.size:
            raise IndexError("index out of range")
        # @end
        # Shift values one box to the right, starting from the end.
        # @step insert-shift
        for i in range(self.size, index, -1):
            self.items[i] = self.items[i - 1]
        # @end
        # @step insert-write
        self.items[index] = value
        # @end
        # @step insert-size
        self.size += 1
        # @end
    # @end

    # @snippet remove
    def remove(self, index):
        # @step remove-range
        if index < 0 or index >= self.size:
            raise IndexError("index out of range")
        # @end
        # @step remove-read
        value = self.items[index]
        # @end
        # Shift values one box to the left to close the gap.
        # @step remove-shift
        for i in range(index, self.size - 1):
            self.items[i] = self.items[i + 1]
        # @end
        # @step remove-size
        self.size -= 1
        # @end
        # @step remove-return
        return value
        # @end
    # @end

    # @snippet search
    def search(self, value):
        # @step search-loop
        for i in range(self.size):
            if self.items[i] == value:
        # @end
                # @step search-found
                return i
                # @end
        # @step search-missing
        return -1  # not found
        # @end
    # @end

    def __str__(self):
        return "[" + ", ".join(str(v) for v in self.items[: self.size]) + "]"


def insert_and_show(array, index, value):
    try:
        array.insert(index, value)
        print(f"insert {value} at {index} -> {array}")
    except IndexError as error:
        print(f"insert {value} at {index} -> error: {error}")


def main():
    array = FixedArray(5)
    print("Array with room for 5 values")

    for index, value in ((0, 10), (1, 20), (2, 40), (2, 30), (0, 5), (5, 50)):
        insert_and_show(array, index, value)

    for index in (2, 7):
        try:
            value = array.get(index)
            print(f"get {index} -> {value}")
        except IndexError as error:
            print(f"get {index} -> error: {error}")

    for value in (30, 99):
        print(f"search {value} -> {array.search(value)}")

    for index in (0, 2, 3):
        try:
            removed = array.remove(index)
            print(f"remove {index} -> {removed}, array is now {array}")
        except IndexError as error:
            print(f"remove {index} -> error: {error}")

    insert_and_show(array, 3, 60)
    insert_and_show(array, 9, 70)
    print(f"size -> {array.size}, capacity -> {array.capacity}")


if __name__ == "__main__":
    main()
