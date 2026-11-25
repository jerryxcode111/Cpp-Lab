import type { CppStandard } from '../services/compiler';

export const DEFAULT_CPP_CODE = `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    int sum = std::accumulate(nums.begin(), nums.end(), 0);

    std::cout << "Hello, World!\\n";
    std::cout << "Vector sum: " << sum << "\\n";

    return 0;
}`;

export interface TopicSnippet {
  id: string;
  label: string;
  standard: CppStandard;
  stdin: string;
  code: string;
}

export const TOPIC_SNIPPETS: TopicSnippet[] = [
  {
    id: 'variables',
    label: 'Variables',
    standard: 'c++20',
    stdin: '',
    code: `#include <iostream>
#include <string>

int main() {
    std::string name = "Alex";
    int age = 21;
    double score = 98.6;
    bool passed = true;

    std::cout << "Name: " << name << "\\n";
    std::cout << "Age: " << age << "\\n";
    std::cout << "Score: " << score << "\\n";
    std::cout << "Passed: " << std::boolalpha << passed << "\\n";
    return 0;
}`,
  },
  {
    id: 'loops',
    label: 'Loops',
    standard: 'c++20',
    stdin: '5',
    code: `#include <iostream>

int main() {
    int limit = 5;
    if (std::cin >> limit) {
        // Use custom Input tab value if provided
    }

    int sum = 0;
    for (int i = 1; i <= limit; ++i) {
        sum += i;
    }

    std::cout << "Sum 1.." << limit << " = " << sum << "\\n";
    return 0;
}`,
  },
  {
    id: 'functions',
    label: 'Functions',
    standard: 'c++20',
    stdin: '',
    code: `#include <iostream>

constexpr long long factorial(int n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}

int main() {
    for (int i = 1; i <= 6; ++i) {
        std::cout << i << "! = " << factorial(i) << "\\n";
    }
    return 0;
}`,
  },
  {
    id: 'pointers',
    label: 'Pointers',
    standard: 'c++20',
    stdin: '',
    code: `#include <iostream>

void swap(int* a, int* b) {
    if (a == b) return;
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10, y = 20;
    swap(&x, &y);
    std::cout << "x = " << x << ", y = " << y << "\\n";

    // Dynamic allocation with clean deallocation
    int* arr = new int[4]{7, 7, 7, 7};
    std::cout << "arr[0] = " << arr[0] << "\\n";
    delete[] arr;
    return 0;
}`,
  },
  {
    id: 'oop',
    label: 'OOP',
    standard: 'c++20',
    stdin: '',
    code: `#include <iostream>
#include <string>

class Account {
private:
    std::string owner;
    double balance;

public:
    Account(std::string owner, double initial)
        : owner(std::move(owner)), balance(initial) {}

    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    void print() const {
        std::cout << owner << ": $" << balance << "\\n";
    }
};

int main() {
    Account acc("cpplab", 100.0);
    acc.deposit(45.5);
    acc.print();
    return 0;
}`,
  },
  {
    id: 'stl',
    label: 'STL',
    standard: 'c++20',
    stdin: '',
    code: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values = {42, 7, 19, 3, 25};
    std::sort(values.begin(), values.end());

    std::cout << "Sorted: ";
    for (int v : values) {
        std::cout << v << " ";
    }
    std::cout << "\\n";
    return 0;
}`,
  },
];

export interface StandardRow {
  standard: string;
  value: CppStandard;
  year: string;
  highlights: string;
}

export const SUPPORTED_STANDARDS: StandardRow[] = [
  { standard: 'C++23', value: 'c++23', year: '2023', highlights: 'std::print, std::expected' },
  { standard: 'C++20', value: 'c++20', year: '2020', highlights: 'Ranges, Concepts, Coroutines' },
  { standard: 'C++17', value: 'c++17', year: '2017', highlights: 'string_view, Structured Binding' },
  { standard: 'C++14', value: 'c++14', year: '2014', highlights: 'Generic Lambdas' },
  { standard: 'C++11', value: 'c++11', year: '2011', highlights: 'auto, Smart Pointers, Lambdas' },
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'free',
    question: 'Is this online C++ compiler free to use?',
    answer:
      'Yes. cpplab.tech is completely free for students, competitive programmers, and software engineers. You can write, compile, run, and check memory safety in C++ directly in your browser without creating an account.',
  },
  {
    id: 'stdin',
    question: 'How do I run C++ code online with custom inputs?',
    answer:
      'Click the Input tab inside the right-hand console panel, type or paste the values your program reads with std::cin or std::getline, and press Run (or Ctrl+Enter). Your input is piped directly into standard input during execution.',
  },
  {
    id: 'standards',
    question: 'Which C++ standard does this compiler support?',
    answer:
      'cpplab.tech compiles with GCC 14.2 using modern ISO C++20 by default (supporting C++11 through C++20 STL features, Ranges, Concepts, and Lambdas), with -Wall and -Wextra diagnostics enabled automatically.',
  },
  {
    id: 'install',
    question: 'Do I need to install any software or compilers?',
    answer:
      'No local installation is required. Everything compiles and executes remotely in an isolated sandboxed Linux environment, including AddressSanitizer and UndefinedBehaviorSanitizer checks under the Memory Check tab.',
  },
];

export type LegalDocKey = 'docs' | 'privacy' | 'terms';

export const LEGAL_DOCS: Record<LegalDocKey, { title: string; body: string[] }> = {
  docs: {
    title: 'Compiler Documentation',
    body: [
      'cpplab.tech compiles your C++ source code using GCC 14.2 with optimization (-O2) and strict warning flags (-Wall -Wextra).',
      'Keyboard shortcuts: Press Ctrl+Enter (or Cmd+Enter on macOS) inside the editor to compile and run immediately. Press Tab to indent with 4 spaces.',
      'Memory Check uses AddressSanitizer, LeakSanitizer, and UndefinedBehaviorSanitizer (-fsanitize=address,undefined -g) to catch memory leaks, out-of-bounds reads, and undefined behavior.',
      'Use Share to encode your current code and selected C++ standard into a permalink URL you can bookmark or send to peers.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'Your C++ code is sent securely over HTTPS to our sandboxed compiler endpoint solely for compilation and execution, and is not permanently stored in a user account database.',
      'Theme preference (light or dark mode) is stored locally in your browser via localStorage.',
      'Advertising & Analytics: cpplab.tech reserves non-intrusive ad placements to keep the online C++ compiler free. Third-party ad networks (such as Google AdSense) may use cookies to serve relevant developer or educational advertisements in accordance with their privacy policies.',
    ],
  },
  terms: {
    title: 'Terms of Use',
    body: [
      'cpplab.tech is provided as an educational and prototyping online C++ compiler. Do not submit confidential proprietary source code or attempt to abuse execution resources.',
      'Execution timeouts and memory limits are enforced automatically by the sandboxed compiler runner to keep the service fast and reliable for everyone.',
    ],
  },
};
