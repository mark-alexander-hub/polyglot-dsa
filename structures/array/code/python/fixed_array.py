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
        if index < 0 or index >= self.size:
            raise IndexError("index out of range")
        return self.items[index]
    # @end

    # @snippet insert
    def insert(self, index, value):
        if self.size == self.capacity:
            raise IndexError("array is full")
        if index < 0 or index > self.size:
            raise IndexError("index out of range")
        # Shift values one box to the right, starting from the end.
        for i in range(self.size, index, -1):
            self.items[i] = self.items[i - 1]
        self.items[index] = value
        self.size += 1
    # @end

    # @snippet remove
    def remove(self, index):
        if index < 0 or index >= self.size:
            raise IndexError("index out of range")
        value = self.items[index]
        # Shift values one box to the left to close the gap.
        for i in range(index, self.size - 1):
            self.items[i] = self.items[i + 1]
        self.size -= 1
        return value
    # @end

    # @snippet search
    def search(self, value):
        for i in range(self.size):
            if self.items[i] == value:
                return i
        return -1  # not found
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
