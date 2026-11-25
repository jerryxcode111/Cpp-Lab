import type { LearnArticleSection } from './learnTypes';

export interface LearnRichOverride {
  introParagraphs: string[];
  sections: LearnArticleSection[];
}

export const LEARN_RICH_PART_1: Record<string, LearnRichOverride> = {
  introduction: {
    introParagraphs: [
      'C++ is a general-purpose programming language created by Bjarne Stroustrup at Bell Labs as an extension of the C language. It gives programmers direct control over hardware and memory while supporting modern features like classes, templates, and the Standard Template Library (STL).',
      'Because compiled C++ turns directly into fast machine code, it powers web browsers, game engines, databases, operating systems, embedded devices, and high-frequency trading systems.',
    ],
    sections: [
      {
        id: 'why-use-cpp',
        heading: 'Why Learn C++?',
        paragraphs: [
          'C++ remains one of the most widely used languages in computer science and production software because it balances raw speed with high-level organization:',
        ],
        bullets: [
          'Performance and efficiency: C++ compiles straight to native machine instructions with minimal runtime overhead.',
          'Cross-platform portability: The same standard C++ code runs on Windows, Linux, macOS, and microcontrollers.',
          'Rich standard library: Containers like `std::vector`, strings, sorting algorithms, and smart pointers are built in.',
          'Strong foundation: Learning C++ teaches you how memory, types, and object-oriented design actually work under the hood.',
        ],
      },
      {
        id: 'first-program',
        heading: 'Your First C++ Program',
        paragraphs: [
          'Every executable C++ program starts running inside a function called `main()`. Below is a complete program you can run right here in the browser:',
        ],
        example: {
          code: `#include <iostream>

int main() {
    std::cout << "Hello from cpplab.tech!\\n";
    std::cout << "Welcome to C++.\\n";
    return 0;
}`,
          output: 'Hello from cpplab.tech!\nWelcome to C++.',
          explained: [
            'Line 1: `#include <iostream>` is a header file library that lets your program read input and print output with objects like `std::cout`.',
            'Line 3: `int main()` is the entry point of every C++ program. Everything inside its curly braces `{ ... }` runs in order.',
            'Line 4–5: `std::cout` sends text to the screen using the `<<` operator. Each statement in C++ must end with a semicolon `;`.',
            'Line 6: `return 0;` ends the `main()` function and tells the operating system the program finished cleanly.',
          ],
          runnable: true,
        },
        note: {
          variant: 'tip',
          title: 'Omitting std:: with using namespace std',
          text: 'Many introductory examples put `using namespace std;` near the top so you can write `cout` instead of `std::cout`. Writing `std::` explicitly is slightly longer, but avoids naming conflicts in larger projects.',
        },
      },
      {
        id: 'c-vs-cpp',
        heading: 'Difference Between C and C++',
        paragraphs: [
          'C++ grew out of C and keeps almost the same basic syntax for variables, loops, and functions. The main difference is that C++ supports classes, objects, function overloading, references, exceptions, and generic templates, whereas C is strictly procedural.',
        ],
      },
    ],
  },

  'output-comments': {
    introParagraphs: [
      'Displaying text and numbers on screen is usually the first thing you test when writing code. In C++, the `std::cout` object (short for "character output") works together with the insertion operator `<<` to print values to the terminal.',
      'As your programs grow longer, you can also leave notes inside your source code called comments. The compiler completely ignores comments when building your program.',
    ],
    sections: [
      {
        id: 'print-text-numbers',
        heading: 'Printing Text and Numbers',
        paragraphs: [
          'Wrap text in double quotes `"..."` when passing it to `std::cout`. Numbers and math expressions do not use quotes—if you write `std::cout << 3 + 4;`, C++ evaluates the math and prints `7`.',
          'You can add as many `std::cout` statements as you want, or chain multiple values onto one line using `<<`.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    std::cout << "Item: Notebook\\n";
    std::cout << "Price: $" << 12.50 << "\\n";
    std::cout << "3 x 15 = " << (3 * 15) << "\\n";
    return 0;
}`,
          output: 'Item: Notebook\nPrice: $12.5\n3 x 15 = 45',
          runnable: true,
        },
      },
      {
        id: 'new-lines',
        heading: 'Adding New Lines (\\n vs std::endl)',
        paragraphs: [
          'C++ does not automatically move to a new line after `std::cout`. If you omit a line break, the next `std::cout` prints immediately next to the previous text on the same line.',
          'To insert a line break, include `\\n` inside your string (or print `std::endl`). Both move the cursor to the next line, though `\\n` is faster in loops because `std::endl` also forces the output buffer to flush every time.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    std::cout << "First line\\nSecond line\\n";
    std::cout << "Third line" << std::endl;
    return 0;
}`,
          output: 'First line\nSecond line\nThird line',
          explained: [
            '`\\n` is an escape sequence representing a newline character.',
            'Two backslashes `\\\\` or `\\t` (horizontal tab) work the same way inside double-quoted strings.',
          ],
          runnable: true,
        },
      },
      {
        id: 'comments',
        heading: 'Single-Line and Multi-Line Comments',
        paragraphs: [
          'Use `//` for a single-line comment: everything from `//` to the end of that line is ignored by the compiler. Use `/* ... */` when you want a comment that spans multiple lines or sits in the middle of code.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    // Single-line comment: explain why this line exists
    std::cout << "Comments are ignored by GCC\\n";

    /* Multi-line comment:
       Useful for longer notes or temporarily
       disabling a block of code while testing. */
    std::cout << "Code runs normally\\n";
    return 0;
}`,
          output: 'Comments are ignored by GCC\nCode runs normally',
          runnable: true,
        },
      },
    ],
  },

  variables: {
    introParagraphs: [
      'A variable is a named container in memory for storing a piece of data—such as a player’s score, an item’s price, or a user’s name.',
      'Unlike dynamically typed languages (such as Python or JavaScript), C++ requires you to specify the type of data a variable will hold when you create it.',
    ],
    sections: [
      {
        id: 'declaring-variables',
        heading: 'Creating (Declaring) Variables',
        paragraphs: [
          'To create a variable, write the type first, then the variable name, and assign an initial value with `=`:',
        ],
        table: {
          headers: ['Type', 'Stores', 'Example'],
          rows: [
            ['int', 'Whole numbers without decimals', 'int age = 21;'],
            ['double', 'Floating-point numbers with decimals', 'double price = 19.99;'],
            ['char', 'A single character in single quotes', "char grade = 'A';"],
            ['std::string', 'Text in double quotes (needs <string>)', 'std::string city = "Austin";'],
            ['bool', 'Logical values: true or false', 'bool is_open = true;'],
          ],
        },
        example: {
          code: `#include <iostream>
#include <string>

int main() {
    std::string name = "Alex";
    int age = 21;
    double score = 98.5;
    char grade = 'A';
    bool passed = true;

    std::cout << "Name: " << name << "\\n";
    std::cout << "Age: " << age << "\\n";
    std::cout << "Score: " << score << " (Grade " << grade << ")\\n";
    std::cout << "Passed: " << std::boolalpha << passed << "\\n";
    return 0;
}`,
          output: 'Name: Alex\nAge: 21\nScore: 98.5 (Grade A)\nPassed: true',
          runnable: true,
        },
        note: {
          variant: 'warning',
          title: 'Always Initialize Your Variables',
          text: 'If you write `int count;` without giving it a value, local variables in C++ hold unpredictable leftover memory ("garbage"). Always initialize variables right away, such as `int count = 0;`.',
        },
      },
      {
        id: 'updating-and-multiple',
        heading: 'Changing Values & Declaring Multiple Variables',
        paragraphs: [
          'Unless marked `const`, assigning a new value to an existing variable overwrites its previous value. You can also declare several variables of the same type on one line separated by commas.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    int x = 5, y = 10, z = 15;
    std::cout << "Initial sum: " << (x + y + z) << "\\n";

    x = 20; // overwrites previous value 5
    std::cout << "Updated x: " << x << "\\n";
    return 0;
}`,
          output: 'Initial sum: 30\nUpdated x: 20',
          runnable: true,
        },
      },
      {
        id: 'identifiers',
        heading: 'Variable Naming Rules (Identifiers)',
        paragraphs: [
          'All C++ variables must have unique, descriptive names called identifiers. Short names like `x` work for quick math, while descriptive names like `minutes_per_hour` make real programs much easier to read.',
        ],
        bullets: [
          'Names can contain letters, digits, and underscores (`_`).',
          'Names must begin with a letter or an underscore (never a digit like `2nd_item`).',
          'Names are case-sensitive: `score` and `Score` are two different variables.',
          'Names cannot contain spaces or use C++ keywords such as `int`, `return`, or `class`.',
        ],
      },
    ],
  },

  constants: {
    introParagraphs: [
      'When you have a value that should never change while your program runs—such as the number of minutes in an hour or the mathematical value of pi—declare it as a constant.',
      'Marking a value constant prevents accidental edits later in your code and helps the compiler catch bugs early.',
    ],
    sections: [
      {
        id: 'const-keyword',
        heading: 'Using the const Keyword',
        paragraphs: [
          'Put `const` before the variable type to make it read-only. If any line tries to reassign a `const` variable afterward, the compiler stops with an error.',
          'You must always assign a value to a `const` variable on the same line where you declare it.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    const int MINUTES_PER_HOUR = 60;
    const double TAX_RATE = 0.08;

    double price = 50.0;
    double total = price * (1.0 + TAX_RATE);

    std::cout << "Minutes/hour: " << MINUTES_PER_HOUR << "\\n";
    std::cout << "Total with tax: $" << total << "\\n";
    return 0;
}`,
          output: 'Minutes/hour: 60\nTotal with tax: $54',
          runnable: true,
        },
      },
      {
        id: 'constexpr-keyword',
        heading: 'Compile-Time Constants With constexpr',
        paragraphs: [
          'Modern C++ also provides `constexpr`. While `const` means "do not modify this value after it is set," `constexpr` goes one step further and tells the compiler the value is fixed and known at compile time.',
          'Prefer `constexpr` for math constants (`constexpr double PI = 3.14159;`), fixed buffer sizes, and lookup limits.',
        ],
        note: {
          variant: 'tip',
          text: 'A common convention in C++ is writing constant names in UPPER_SNAKE_CASE (such as `MAX_USERS`) so anyone reading the code recognizes right away that the value never changes.',
        },
      },
    ],
  },

  'user-input': {
    introParagraphs: [
      'Just as `std::cout` prints output to the screen, `std::cin` (character input) reads values typed by the user using the extraction operator `>>`.',
      'Inside the cpplab.tech Compiler, anything you type into the Input (stdin) tab is passed directly to `std::cin` when your program runs.',
    ],
    sections: [
      {
        id: 'reading-cin',
        heading: 'Reading Numbers and Single Words With std::cin',
        paragraphs: [
          'First declare a variable with the type you expect, then read into it with `std::cin >> variable;`. You can also chain `>>` to read multiple values separated by spaces or new lines.',
        ],
        example: {
          code: `#include <iostream>
#include <sstream>

int main() {
    // Using a simulated input stream so this lesson runs immediately;
    // in the main Compiler tab, replace fake_input with std::cin.
    std::istringstream fake_input("4.5 2.0");

    double width = 0.0, height = 0.0;
    fake_input >> width >> height;

    std::cout << "Width: " << width << ", Height: " << height << "\\n";
    std::cout << "Area: " << (width * height) << "\\n";
    return 0;
}`,
          output: 'Width: 4.5, Height: 2\nArea: 9',
          runnable: true,
        },
      },
      {
        id: 'reading-lines',
        heading: 'Reading Full Sentences With std::getline',
        paragraphs: [
          '`std::cin >> text` treats whitespace as a separator, so reading `"Alex Mercer"` into a `std::string` with `>>` stops at `"Alex"`. When you want an entire line including spaces, use `std::getline(std::cin, text)` instead.',
        ],
        example: {
          code: `#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

int main() {
    std::istringstream fake_input("24\\nAlex Mercer\\n98.456");

    int age = 0;
    std::string full_name;
    double score = 0.0;

    fake_input >> age;
    std::getline(fake_input >> std::ws, full_name);
    fake_input >> score;

    std::cout << "Name: " << full_name << ", Age: " << age << "\\n";
    std::cout << std::fixed << std::setprecision(2) << "Score: " << score << "\\n";
    return 0;
}`,
          output: 'Name: Alex Mercer, Age: 24\nScore: 98.46',
          explained: [
            '`std::ws` clears the leftover Enter newline after `fake_input >> age` so `std::getline` does not read an empty line.',
            '`std::fixed` and `std::setprecision(2)` from `<iomanip>` format decimals cleanly to 2 places.',
          ],
          runnable: true,
        },
      },
    ],
  },

  'data-types': {
    introParagraphs: [
      'Every variable in C++ has a data type that determines how much memory it occupies and what operations are allowed on it. Choosing the right type prevents overflow bugs and avoids wasting precision.',
    ],
    sections: [
      {
        id: 'basic-types-table',
        heading: 'Fundamental C++ Data Types',
        paragraphs: [
          'Here are the built-in types you will use in almost every C++ program (sizes reflect standard 64-bit systems):',
        ],
        table: {
          headers: ['Data Type', 'Typical Size', 'Description'],
          rows: [
            ['boolean (bool)', '1 byte', 'Stores true or false values'],
            ['char', '1 byte', 'Stores a single ASCII character or small integer'],
            ['int', '4 bytes', 'Whole numbers roughly between -2.14B and +2.14B'],
            ['long long', '8 bytes', 'Very large integers up to ~9 quintillion'],
            ['float', '4 bytes', 'Decimals with ~6–7 digits of precision'],
            ['double', '8 bytes', 'Decimals with ~15 digits of precision (preferred)'],
          ],
        },
      },
      {
        id: 'numbers-precision',
        heading: 'Choosing Between int, float, and double',
        paragraphs: [
          'Use `int` for counting and whole numbers, and switch to `long long` if a calculation might pass 2 billion. For decimals, `double` is preferred over `float` because twice as many bytes gives far better accuracy with rounding.',
          'The `auto` keyword lets the compiler deduce the type from the right-hand value—for example, `auto pi = 3.14;` deduces `double`.',
        ],
      },
      {
        id: 'type-casting',
        heading: 'Type Conversion & static_cast',
        paragraphs: [
          'Dividing two integers in C++ performs integer division and drops the decimal remainder: `7 / 2` evaluates to `3`, not `3.5`. To keep the fractional part, explicitly convert at least one operand with `static_cast<double>(...)`.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    int correct = 7, total = 2;

    double wrong_avg = correct / total;
    double exact_avg = static_cast<double>(correct) / total;

    std::cout << "Integer division: " << wrong_avg << "\\n";
    std::cout << "With static_cast: " << exact_avg << "\\n";
    std::cout << "char 'A' as ASCII code: " << static_cast<int>('A') << "\\n";
    return 0;
}`,
          output: "Integer division: 3\nWith static_cast: 3.5\nchar 'A' as ASCII code: 65",
          runnable: true,
        },
      },
    ],
  },

  operators: {
    introParagraphs: [
      'Operators are symbols that perform math, update variables, or compare values. Understanding how integer division and assignment shortcuts work saves you from subtle logic bugs.',
    ],
    sections: [
      {
        id: 'arithmetic-operators',
        heading: 'Arithmetic Operators',
        paragraphs: [
          'C++ supports standard math operators (`+`, `-`, `*`, `/`) plus the modulo operator `%` (which returns the remainder of integer division) and increment/decrement (`++`, `--`).',
        ],
        table: {
          headers: ['Operator', 'Name', 'Example (a = 10, b = 3)'],
          rows: [
            ['+', 'Addition', 'a + b  ->  13'],
            ['-', 'Subtraction', 'a - b  ->  7'],
            ['*', 'Multiplication', 'a * b  ->  30'],
            ['/', 'Division', 'a / b  ->  3 (integer division)'],
            ['%', 'Modulo (remainder)', 'a % b  ->  1'],
            ['++ / --', 'Increment / Decrement', '++a -> 11, --b -> 2'],
          ],
        },
      },
      {
        id: 'assignment-shortcuts',
        heading: 'Compound Assignment Operators',
        paragraphs: [
          'Instead of writing `score = score + 10;`, C++ lets you write `score += 10;`. The same shorthand works for `-=`, `*=`, `/=`, and `%=`.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    int coins = 10;
    coins += 5;   // coins is now 15
    coins *= 2;   // coins is now 30
    --coins;      // coins is now 29

    std::cout << "Coins: " << coins << "\\n";
    std::cout << "Remainder of 29 / 4: " << (coins % 4) << "\\n";
    return 0;
}`,
          output: 'Coins: 29\nRemainder of 29 / 4: 1',
          runnable: true,
        },
      },
    ],
  },

  'comparison-logical': {
    introParagraphs: [
      'Comparison and logical operators let your program ask yes/no questions—such as whether a user’s password matches or whether a score falls inside a passing range. Every comparison evaluates to a `bool` (`true` or `false`).',
    ],
    sections: [
      {
        id: 'comparison-ops',
        heading: 'Comparison Operators',
        paragraphs: [
          'Notice that checking equality uses **two** equals signs (`==`). A single `=` is assignment, not comparison.',
        ],
        table: {
          headers: ['Operator', 'Meaning', 'Example'],
          rows: [
            ['==', 'Equal to', 'x == 5'],
            ['!=', 'Not equal to', 'x != 5'],
            ['>', 'Greater than', 'x > 5'],
            ['<', 'Less than', 'x < 5'],
            ['>=', 'Greater than or equal to', 'x >= 5'],
            ['<=', 'Less than or equal to', 'x <= 5'],
          ],
        },
      },
      {
        id: 'logical-ops',
        heading: 'Logical Operators (&&, ||, !)',
        paragraphs: [
          'Combine multiple conditions using `&&` (AND: true only if both sides are true), `||` (OR: true if at least one side is true), and `!` (NOT: flips `true` to `false` and vice versa).',
        ],
        example: {
          code: `#include <iostream>

int main() {
    int age = 22;
    bool has_ticket = true;
    bool is_banned = false;

    bool can_enter = (age >= 18 && has_ticket) && !is_banned;
    std::cout << std::boolalpha;
    std::cout << "Can enter: " << can_enter << "\\n";
    std::cout << "Discount eligible: " << (age < 12 || age >= 65) << "\\n";
    return 0;
}`,
          output: 'Can enter: true\nDiscount eligible: false',
          runnable: true,
        },
        note: {
          variant: 'warning',
          title: 'Never Chain Comparisons Like Math',
          text: 'Writing `10 < x < 20` is valid syntax in C++ but does NOT check a range—it evaluates `(10 < x)` as `0` or `1`, then checks `< 20`. Always write `(x > 10 && x < 20)`.',
        },
      },
    ],
  },

  'cmath-booleans': {
    introParagraphs: [
      'C++ represents yes/no states with `bool` (`true` and `false`), and includes common mathematical operations like square roots, powers, and rounding inside the `<cmath>` and `<algorithm>` headers.',
    ],
    sections: [
      {
        id: 'booleans',
        heading: 'Boolean Values',
        paragraphs: [
          'By default, printing a `bool` with `std::cout` prints `1` for `true` and `0` for `false`. Adding `std::boolalpha` tells `std::cout` to print the words `true` and `false` instead.',
        ],
      },
      {
        id: 'math-functions',
        heading: 'Standard Math Functions (<cmath> & <algorithm>)',
        paragraphs: [
          'Include `<cmath>` for `std::sqrt`, `std::pow`, `std::round`, `std::ceil`, `std::floor`, and `std::abs`, and `<algorithm>` for `std::max` and `std::min`.',
        ],
        example: {
          code: `#include <algorithm>
#include <cmath>
#include <iostream>

int main() {
    std::cout << "max(5, 12) = " << std::max(5, 12) << "\\n";
    std::cout << "sqrt(64) = " << std::sqrt(64) << "\\n";
    std::cout << "round(2.6) = " << std::round(2.6) << "\\n";
    std::cout << "2^5 = " << std::pow(2, 5) << "\\n";
    return 0;
}`,
          output: 'max(5, 12) = 12\nsqrt(64) = 8\nround(2.6) = 3\n2^5 = 32',
          runnable: true,
        },
      },
    ],
  },

  'if-else': {
    introParagraphs: [
      'Programs make decisions by testing conditions and running different code paths depending on the result. C++ uses `if`, `else if`, and `else` statements for conditional branching.',
    ],
    sections: [
      {
        id: 'if-else-chain',
        heading: 'if, else if, and else',
        paragraphs: [
          'An `if` block runs only when its condition inside parentheses `( ... )` evaluates to `true`. You can chain `else if` blocks to test additional conditions in order, ending with a fallback `else` block if none of them matched.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    int score = 84;

    if (score >= 90) {
        std::cout << "Grade: A\\n";
    } else if (score >= 80) {
        std::cout << "Grade: B\\n";
    } else if (score >= 70) {
        std::cout << "Grade: C\\n";
    } else {
        std::cout << "Grade: Needs review\\n";
    }
    return 0;
}`,
          output: 'Grade: B',
          explained: [
            'Conditions are checked from top to bottom. Once one branch matches (`score >= 80`), the remaining `else if` and `else` blocks are skipped.',
            'Always wrap branch bodies in `{ ... }` braces—even for a single line—to avoid indentation bugs.',
          ],
          runnable: true,
        },
      },
      {
        id: 'ternary-operator',
        heading: 'Short-Hand If...Else (Ternary Operator)',
        paragraphs: [
          'When choosing between two simple values based on a single condition, the ternary operator `condition ? value_if_true : value_if_false` fits cleanly on one line.',
        ],
        example: {
          code: `#include <iostream>
#include <string>

int main() {
    int time = 20;
    std::string greeting = (time < 18) ? "Good day." : "Good evening.";
    std::cout << greeting << "\\n";
    return 0;
}`,
          output: 'Good evening.',
          runnable: true,
        },
      },
    ],
  },

  'switch-case': {
    introParagraphs: [
      'When you want to compare a single integer, character, or `enum` against several fixed values, a `switch` statement is often cleaner and easier to scan than a long chain of `else if` statements.',
    ],
    sections: [
      {
        id: 'switch-syntax',
        heading: 'How switch, break, and default Work',
        paragraphs: [
          'The expression inside `switch (expr)` is evaluated once and compared against each `case` label. When a match is found, execution jumps to that case and continues until it hits a `break;` statement (or the end of the `switch`).',
          'The optional `default:` case runs if none of the listed `case` values matched.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    int day = 4;

    switch (day) {
        case 1:
            std::cout << "Monday\\n";
            break;
        case 2:
            std::cout << "Tuesday\\n";
            break;
        case 3:
            std::cout << "Wednesday\\n";
            break;
        case 4:
            std::cout << "Thursday\\n";
            break;
        case 5:
            std::cout << "Friday\\n";
            break;
        default:
            std::cout << "Weekend\\n";
            break;
    }
    return 0;
}`,
          output: 'Thursday',
          runnable: true,
        },
        note: {
          variant: 'warning',
          title: 'Do Not Forget break;',
          text: 'If you leave out `break;` at the end of a case, C++ "falls through" and keeps executing the next case underneath it—even when that next case did not match.',
        },
      },
    ],
  },

  'while-loop': {
    introParagraphs: [
      'Loops repeat a block of code as long as a condition stays true. A `while` loop is ideal when you do not know in advance exactly how many times the loop will repeat—such as reading until a user enters `0` or waiting until a balance reaches a target.',
    ],
    sections: [
      {
        id: 'while-basics',
        heading: 'The while Loop',
        paragraphs: [
          'Before every iteration, `while (condition)` checks the condition. If it is `true`, the loop body runs; if `false`, the loop stops immediately.',
          'Be sure to update the variable used in the condition inside the loop—otherwise the loop will run forever.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    int countdown = 3;
    while (countdown > 0) {
        std::cout << countdown << "...\\n";
        --countdown;
    }
    std::cout << "Lift off!\\n";
    return 0;
}`,
          output: '3...\n2...\n1...\nLift off!',
          runnable: true,
        },
      },
      {
        id: 'do-while',
        heading: 'The do/while Loop',
        paragraphs: [
          'A `do / while` loop works like `while`, except it checks its condition *after* running the body. That guarantees the loop body executes at least once, even if the condition starts out false.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    int i = 0;
    do {
        std::cout << "Step " << i << "\\n";
        ++i;
    } while (i < 3);
    return 0;
}`,
          output: 'Step 0\nStep 1\nStep 2',
          runnable: true,
        },
      },
    ],
  },

  'for-loop': {
    introParagraphs: [
      'When you know how many times you want to loop—or want to walk through every item in a collection—use a `for` loop. It packs initialization, condition checking, and updating neatly into one header line.',
    ],
    sections: [
      {
        id: 'classic-for',
        heading: 'Classic for Loop',
        paragraphs: [
          'A standard `for (init; condition; update)` loop has three parts separated by semicolons: `init` runs once at the start, `condition` is checked before every turn, and `update` runs at the end of every turn.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    for (int i = 1; i <= 5; ++i) {
        std::cout << i << " squared = " << (i * i) << "\\n";
    }
    return 0;
}`,
          output: '1 squared = 1\n2 squared = 4\n3 squared = 9\n4 squared = 16\n5 squared = 25',
          runnable: true,
        },
      },
      {
        id: 'range-for',
        heading: 'Range-Based for Loop (Modern C++)',
        paragraphs: [
          'When iterating through every element of an array, `std::vector`, or `std::string`, the range-based `for` loop (`for (auto item : container)`) is shorter and avoids off-by-one index mistakes.',
        ],
        example: {
          code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores = {85, 92, 78, 95};
    int sum = 0;

    for (int s : scores) {
        sum += s;
    }

    std::cout << "Total score: " << sum << "\\n";
    return 0;
}`,
          output: 'Total score: 350',
          runnable: true,
        },
      },
    ],
  },

  'break-continue': {
    introParagraphs: [
      'Sometimes you need to exit a loop early as soon as you find what you are looking for, or skip over one unwanted iteration and keep going. C++ gives you `break` and `continue` for both cases.',
    ],
    sections: [
      {
        id: 'break-vs-continue',
        heading: 'break vs continue',
        paragraphs: [
          '`break` stops the innermost loop immediately and jumps to the first statement after the loop. `continue` skips the rest of the current iteration and jumps straight to the next turn of the loop.',
        ],
        example: {
          code: `#include <iostream>

int main() {
    for (int i = 1; i <= 8; ++i) {
        if (i == 3) {
            continue; // skip 3
        }
        if (i == 6) {
            break;    // stop loop at 6
        }
        std::cout << i << " ";
    }
    std::cout << "\\n";
    return 0;
}`,
          output: '1 2 4 5',
          runnable: true,
        },
      },
    ],
  },
};
