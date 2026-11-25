import type { LearnRichOverride } from './learnRichContent1';

export const LEARN_RICH_PART_2: Record<string, LearnRichOverride> = {
  'functions-basics': {
    introParagraphs: [
      'A function is a reusable block of code that performs a specific task and only runs when called. Splitting code into focused functions keeps programs organized, easier to debug, and avoids repeating the same logic in multiple places.',
    ],
    sections: [
      {
        id: 'declaring-calling',
        heading: 'Creating and Calling a Function',
        paragraphs: [
          'Every function starts with its return type (`void` if it returns nothing, or a type like `int` or `double` if it sends a value back), followed by the function name and parameter list in parentheses `( ... )`.',
          'In C++, a function must be declared *above* `main()` (or have a forward declaration prototype above `main()`) before `main()` can call it.',
        ],
        example: {
          code: `#include <iostream>

int add(int a, int b) {
    return a + b;
}

void greet(std::string name) {
    std::cout << "Hello, " << name << "!\\n";
}

int main() {
    greet("Sam");
    int total = add(12, 8);
    std::cout << "12 + 8 = " << total << "\\n";
    return 0;
}`,
          output: 'Hello, Sam!\n12 + 8 = 20',
          explained: [
            '`void greet(...)` prints text and returns nothing (`void`).',
            '`int add(int a, int b)` takes two parameters and hands back their sum using `return`.',
          ],
          runnable: true,
        },
      },
      {
        id: 'default-parameters',
        heading: 'Default Parameter Values',
        paragraphs: [
          'You can assign a default value to a trailing parameter with `=`. If the caller leaves out that argument, C++ automatically uses the default.',
        ],
        example: {
          code: `#include <iostream>
#include <string>

void printBanner(const std::string& country = "Canada") {
    std::cout << "Country: " << country << "\\n";
}

int main() {
    printBanner("Japan");
    printBanner(); // uses default "Canada"
    return 0;
}`,
          output: 'Country: Japan\nCountry: Canada',
          runnable: true,
        },
      },
    ],
  },

  'pass-by-reference': {
    introParagraphs: [
      'By default, passing a variable to a function passes a *copy* (pass by value). Any changes made inside the function stay local to that copy and do not affect the original variable.',
      'Adding `&` to the parameter passes a *reference* to the original variable instead—letting the function modify it directly or avoid copying large data like long strings and vectors.',
    ],
    sections: [
      {
        id: 'value-vs-reference',
        heading: 'Pass by Value vs Pass by Reference (&)',
        paragraphs: [
          'Use `int& x` when the function intentionally updates the caller’s variable (such as `swap`). Use `const std::string& s` when you only want to read a large object fast without copying it and without risking accidental edits.',
        ],
        example: {
          code: `#include <iostream>

void swapValues(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int first = 10, second = 25;
    swapValues(first, second);
    std::cout << "first = " << first << ", second = " << second << "\\n";
    return 0;
}`,
          output: 'first = 25, second = 10',
          runnable: true,
        },
      },
    ],
  },

  'function-overloading': {
    introParagraphs: [
      'Function overloading lets multiple functions share the exact same name as long as their parameter types or parameter counts differ. The compiler automatically picks the right version based on the arguments you pass.',
    ],
    sections: [
      {
        id: 'overloading-examples',
        heading: 'Same Function Name, Different Parameters',
        paragraphs: [
          'Instead of inventing separate names like `addInts` and `addDoubles`, you can define both as `add(...)`. Note that functions cannot be overloaded solely by changing their return type—their parameter lists must be distinguishable.',
        ],
        example: {
          code: `#include <iostream>

int add(int a, int b) {
    return a + b;
}

double add(double a, double b) {
    return a + b;
}

int main() {
    std::cout << add(4, 5) << "\\n";
    std::cout << add(4.2, 5.3) << "\\n";
    return 0;
}`,
          output: '9\n9.5',
          runnable: true,
        },
      },
    ],
  },

  recursion: {
    introParagraphs: [
      'Recursion is a technique where a function calls itself to solve a smaller version of the same problem. Every recursive function needs a **base case**—a condition where it stops calling itself—so it does not loop infinitely and overflow the call stack.',
    ],
    sections: [
      {
        id: 'base-recursive-case',
        heading: 'Base Case and Recursive Step',
        paragraphs: [
          'Think of recursion as two pieces: first check if the input is already simple enough to return an answer immediately (base case); otherwise, call the function on a smaller input and combine the result.',
        ],
        example: {
          code: `#include <iostream>

int sumUpTo(int n) {
    if (n <= 0) return 0;      // base case
    return n + sumUpTo(n - 1); // recursive step
}

int main() {
    std::cout << "Sum 1..5 = " << sumUpTo(5) << "\\n";
    return 0;
}`,
          output: 'Sum 1..5 = 15',
          runnable: true,
        },
      },
    ],
  },

  arrays: {
    introParagraphs: [
      'An array stores multiple values of the same type side by side in a single variable instead of creating separate variables like `score1`, `score2`, `score3`. Array indexing in C++ always starts at `0`, so the first item is at index `0` and the last item of an `n`-element array is at index `n - 1`.',
    ],
    sections: [
      {
        id: 'fixed-arrays',
        heading: 'Declaring and Looping Through Arrays',
        paragraphs: [
          'C++ supports both traditional fixed arrays (`int nums[4] = {10, 20, 30, 40};`) and the safer modern `std::array<int, 4>` container from `<array>` (which knows its own `.size()`). When you want an array that can grow or shrink dynamically, use `std::vector`.',
        ],
        example: {
          code: `#include <array>
#include <iostream>

int main() {
    std::array<int, 4> prices = {12, 25, 9, 40};

    std::cout << "First price: " << prices[0] << "\\n";
    prices[1] = 30; // update element at index 1

    int total = 0;
    for (int p : prices) {
        total += p;
    }
    std::cout << "Total (" << prices.size() << " items): " << total << "\\n";
    return 0;
}`,
          output: 'First price: 12\nTotal (4 items): 91',
          runnable: true,
        },
        note: {
          variant: 'warning',
          title: 'Stay Inside Array Bounds',
          text: 'C++ does not automatically stop you from reading `arr[10]` on a 4-element array with `[]`—doing so causes undefined behavior. Use `.at(index)` on `std::array` or `std::vector` when you want bounds checking.',
        },
      },
    ],
  },

  'cpp-strings': {
    introParagraphs: [
      'A `std::string` stores a sequence of characters such as names, messages, or file lines. Include `<string>` at the top of your file to create, combine, search, and modify text safely without worrying about manual memory buffers.',
    ],
    sections: [
      {
        id: 'string-operations',
        heading: 'Concatenation, Length, and Character Access',
        paragraphs: [
          'You can join strings with `+` (or `append()`), check how many characters a string holds with `.length()` or `.size()`, and read or change individual characters using `[index]`.',
        ],
        example: {
          code: `#include <iostream>
#include <string>

int main() {
    std::string first = "Ada";
    std::string last = "Lovelace";
    std::string full = first + " " + last;

    std::cout << "Name: " << full << "\\n";
    std::cout << "Length: " << full.length() << "\\n";
    std::cout << "Initial: " << full[0] << "\\n";

    full[0] = 'a';
    std::cout << "Modified: " << full << "\\n";
    return 0;
}`,
          output: 'Name: Ada Lovelace\nLength: 12\nInitial: A\nModified: ada Lovelace',
          runnable: true,
        },
      },
    ],
  },

  structs: {
    introParagraphs: [
      'While an array groups multiple items of the *same* type, a `struct` lets you group several related variables of *different* types (such as a student’s name, ID, and GPA) into one custom record.',
    ],
    sections: [
      {
        id: 'defining-structs',
        heading: 'Creating and Using a Structure',
        paragraphs: [
          'Define a `struct` outside `main()` with the member fields inside braces, ending with a semicolon. Once defined, you can create variables of that struct type and access fields using the dot operator (`.`).',
        ],
        example: {
          code: `#include <iostream>
#include <string>

struct Car {
    std::string brand;
    std::string model;
    int year;
};

int main() {
    Car myCar{"Toyota", "Corolla", 2022};
    std::cout << myCar.year << " " << myCar.brand << " " << myCar.model << "\\n";
    return 0;
}`,
          output: '2022 Toyota Corolla',
          runnable: true,
        },
      },
    ],
  },

  references: {
    introParagraphs: [
      'A reference variable is an alias—another name—for an already existing variable. Once a reference is bound to a variable using `&`, reading or modifying the reference reads or modifies the original variable directly.',
    ],
    sections: [
      {
        id: 'creating-references',
        heading: 'Creating References With &',
        paragraphs: [
          'Declare a reference by putting `&` after the type: `std::string& meal = food;`. Notice that references must be initialized when created and cannot be reseated to point to a different variable later.',
        ],
        example: {
          code: `#include <iostream>
#include <string>

int main() {
    std::string food = "Pizza";
    std::string& meal = food; // meal is an alias for food

    meal = "Pasta";
    std::cout << "food = " << food << "\\n";
    std::cout << "Address of food: " << &food << "\\n";
    return 0;
}`,
          output: 'food = Pasta\nAddress of food: 0x7ffd...',
          runnable: true,
        },
      },
    ],
  },

  'pointers-addresses': {
    introParagraphs: [
      'Every variable lives at a numeric memory address. A **pointer** is a variable whose value is the memory address of another variable.',
      'Although modern C++ prefers references and smart pointers (`std::unique_ptr`) over raw pointers, understanding `*` and `&` is essential for reading C++ libraries, working with dynamic memory, and avoiding dangling-pointer bugs.',
    ],
    sections: [
      {
        id: 'pointer-syntax',
        heading: 'Address-of (&) and Dereference (*)',
        paragraphs: [
          'Use `&variable` to get the memory address of a variable and store it in a pointer (`int* ptr = &x;`). Then use `*ptr` (the dereference operator) to read or update the value stored at that address.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    int score = 42;
    int* ptr = &score;

    std::cout << "Value: " << score << "\\n";
    std::cout << "Value via *ptr: " << *ptr << "\\n";

    *ptr = 99; // changes score through the pointer
    std::cout << "Updated score: " << score << "\\n";
    return 0;
}`,
          output: 'Value: 42\nValue via *ptr: 42\nUpdated score: 99',
          runnable: true,
        },
        note: {
          variant: 'warning',
          title: 'Always Initialize Pointers & Guard Against nullptr',
          text: 'If a pointer does not point to an object yet, initialize it to `nullptr` (`int* ptr = nullptr;`) and check `if (ptr != nullptr)` before dereferencing `*ptr`.',
        },
      },
    ],
  },

  'classes-objects': {
    introParagraphs: [
      'Object-Oriented Programming (OOP) organizes code around objects—bundles that hold both data (attributes) and the functions that operate on that data (methods).',
      'A `class` acts as the blueprint, and each `object` created from that class is an independent instance with its own data.',
    ],
    sections: [
      {
        id: 'defining-class',
        heading: 'Defining a Class and Creating Objects',
        paragraphs: [
          'Unlike `struct`, members inside a `class` are `private` by default unless placed under `public:`. Putting data under `private:` and exposing clean `public:` methods ensures objects stay in a valid state.',
        ],
        example: {
          code: `#include <iostream>
#include <string>

class Book {
public:
    std::string title;
    std::string author;
    int pages;

    void describe() const {
        std::cout << title << " by " << author << " (" << pages << " pages)\\n";
    }
};

int main() {
    Book b1{"Clean Code", "Robert Martin", 464};
    b1.describe();
    return 0;
}`,
          output: 'Clean Code by Robert Martin (464 pages)',
          runnable: true,
        },
      },
    ],
  },

  'constructors-destructors': {
    introParagraphs: [
      'A **constructor** is a special method that runs automatically whenever a new object is created, giving its fields safe starting values. A **destructor** (`~ClassName()`) runs automatically when the object goes out of scope to clean up resources.',
    ],
    sections: [
      {
        id: 'constructor-initializer',
        heading: 'Constructors & Member Initializer Lists',
        paragraphs: [
          'A constructor has the exact same name as the class and no return type. In C++, the cleanest and fastest way to initialize fields is with a colon initializer list (`: name(n), level(lvl)`).',
        ],
        example: {
          code: `#include <iostream>
#include <string>

class Player {
private:
    std::string name;
    int level;

public:
    Player(std::string n, int lvl) : name(std::move(n)), level(lvl) {
        std::cout << name << " joined at level " << level << "\\n";
    }

    ~Player() {
        std::cout << name << " cleaned up\\n";
    }
};

int main() {
    Player p1("Kai", 5);
    return 0;
}`,
          output: 'Kai joined at level 5\nKai cleaned up',
          runnable: true,
        },
      },
    ],
  },

  inheritance: {
    introParagraphs: [
      'Inheritance lets a new class (the **derived** or child class) reuse attributes and methods from an existing class (the **base** or parent class) while adding its own specialized behavior.',
    ],
    sections: [
      {
        id: 'base-derived',
        heading: 'Public Inheritance (: public Base)',
        paragraphs: [
          'Write `class Car : public Vehicle` so every `Car` inherits the `public` and `protected` members of `Vehicle`.',
        ],
        example: {
          code: `#include <iostream>
#include <string>

class Vehicle {
public:
    std::string brand = "Ford";
    void honk() const {
        std::cout << "Beep!\\n";
    }
};

class Car : public Vehicle {
public:
    std::string model = "Mustang";
};

int main() {
    Car myCar;
    myCar.honk();
    std::cout << myCar.brand << " " << myCar.model << "\\n";
    return 0;
}`,
          output: 'Beep!\nFord Mustang',
          runnable: true,
        },
      },
    ],
  },

  'polymorphism-virtual': {
    introParagraphs: [
      'Polymorphism ("many forms") lets you call the same method on a base pointer or reference and have C++ automatically run the derived class’s own overridden version.',
    ],
    sections: [
      {
        id: 'virtual-override',
        heading: 'virtual and override Keywords',
        paragraphs: [
          'Mark the base method `virtual` (and give the base class a `virtual ~Base() = default;` destructor), then mark each child method `override`. Adding `override` lets the compiler catch typos in method signatures.',
        ],
        example: {
          code: `#include <iostream>
#include <memory>
#include <vector>

class Animal {
public:
    virtual void speak() const { std::cout << "...\\n"; }
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void speak() const override { std::cout << "Woof!\\n"; }
};

class Cat : public Animal {
public:
    void speak() const override { std::cout << "Meow!\\n"; }
};

int main() {
    std::vector<std::unique_ptr<Animal>> pets;
    pets.push_back(std::make_unique<Dog>());
    pets.push_back(std::make_unique<Cat>());

    for (const auto& pet : pets) {
        pet->speak();
    }
    return 0;
}`,
          output: 'Woof!\nMeow!',
          runnable: true,
        },
      },
    ],
  },

  'vector-sequence': {
    introParagraphs: [
      'A `std::vector` is C++’s workhorse dynamic array. Unlike fixed C-style arrays, a vector automatically resizes itself as you add or remove elements and cleans up its own memory when it goes out of scope.',
    ],
    sections: [
      {
        id: 'vector-basics',
        heading: 'Adding, Reading, and Removing Elements',
        paragraphs: [
          'Include `<vector>`. Use `.push_back(value)` to append to the end, `.pop_back()` to remove the last item, `.size()` to check how many items are stored, and `.at(i)` or `[i]` to access an element.',
        ],
        example: {
          code: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> cars = {"Volvo", "BMW", "Ford"};
    cars.push_back("Mazda");

    std::cout << "Count: " << cars.size() << "\\n";
    std::cout << "First: " << cars.front() << ", Last: " << cars.back() << "\\n";

    for (const std::string& car : cars) {
        std::cout << "- " << car << "\\n";
    }
    return 0;
}`,
          output: 'Count: 4\nFirst: Volvo, Last: Mazda\n- Volvo\n- BMW\n- Ford\n- Mazda',
          runnable: true,
        },
      },
    ],
  },

  maps: {
    introParagraphs: [
      'A map stores data as **key-value pairs**—similar to a dictionary—so you can look up a value instantly by a name, ID, or word instead of an integer index.',
    ],
    sections: [
      {
        id: 'map-vs-unordered',
        heading: 'std::map vs std::unordered_map',
        paragraphs: [
          '`std::map` keeps keys sorted in ascending order (`O(log n)` lookup), whereas `std::unordered_map` uses hashing for fast average `O(1)` lookup when sort order does not matter.',
        ],
        example: {
          code: `#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> ages = {{"Alice", 24}, {"Bob", 30}};
    ages["Charlie"] = 22;

    if (ages.contains("Bob")) { // C++20
        std::cout << "Bob is " << ages["Bob"] << "\\n";
    }

    for (const auto& [name, age] : ages) {
        std::cout << name << ": " << age << "\\n";
    }
    return 0;
}`,
          output: 'Bob is 30\nAlice: 24\nBob: 30\nCharlie: 22',
          runnable: true,
        },
      },
    ],
  },
};
