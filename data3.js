var topics3 = [
    {
        id: "object-lifetime-raii",
        title: "Object Lifetime, RAII, Ownership and Resource Management",
        sections: [
            {
                title: "Understanding lifetime as a design problem",
                content: `
C++ gives the programmer direct control over object lifetime. This is one of the language's greatest strengths, but it also means that lifetime is part of program design rather than something that can always be left to a runtime garbage collector.

An object has a lifetime that begins when its initialization is complete and ends when its destructor begins execution. That simple rule becomes much more important when objects own resources such as dynamically allocated memory, file descriptors, sockets, mutexes, operating-system handles, GPU resources, or transactions.

A common beginner mistake is to think of memory ownership as the only lifetime problem. In real programs, memory is only one kind of resource. A file can remain open after the object that was supposed to close it disappears. A mutex can remain locked after an exception. A socket can leak. A database transaction can remain unfinished. RAII solves these problems by connecting resource ownership to object lifetime.

The central design principle is:

    resource acquisition is initialization

A resource should normally be acquired by an object's constructor and released by its destructor. This makes the lifetime of the resource follow the lifetime of the object.

For example:

class File {
public:
    explicit File(const char* path) {
        handle = open_file(path);
        if (!handle) {
            throw std::runtime_error("failed to open file");
        }
    }

    ~File() {
        if (handle) {
            close_file(handle);
        }
    }

private:
    FileHandle* handle{};
};

The important property is not the exact implementation. The important property is that there is no separate "remember to close this later" operation required from the caller.

This becomes especially valuable when a function has multiple exit paths:

void process() {
    File file("data.bin");

    if (!validate()) {
        return;
    }

    if (!prepare()) {
        return;
    }

    execute();
}

The destructor still runs when process returns.

The same property applies when an exception is thrown. Stack unwinding destroys automatic objects whose scope is being exited:

void process() {
    File file("data.bin");

    perform_operation();

    throw std::runtime_error("failure");
}

Even though execution does not reach the end of the function, file's destructor is still executed.

This makes RAII more than a memory-management technique. It is a general strategy for making invalid resource states difficult to represent.

A strong C++ API should make ownership obvious. If a function receives a pointer, the reader should not have to guess whether the pointer is borrowed, owned, optional, or shared.

Prefer expressing ownership through types:

void inspect(const Data& data);
void modify(Data& data);
void consume(std::unique_ptr<Data> data);
std::shared_ptr<Data> share(Data data);

These signatures communicate very different contracts.

A reference usually represents a non-owning relationship. unique_ptr represents exclusive ownership. shared_ptr represents shared ownership. A raw pointer can represent a non-owning nullable reference, but its ownership semantics are not visible from the type itself.

The most useful question when designing a class is not "where do I delete this?" but:

"Who owns this resource, and what event ends that ownership?"

Once that question has a precise answer, the implementation usually becomes much simpler.
`
            },
            {
                title: "Rule of zero, rule of five and ownership-safe classes",
                content: `
Modern C++ strongly rewards classes that do not manually manage resources.

Consider:

class Buffer {
public:
    Buffer(std::size_t size)
        : data(size) {}

private:
    std::vector<std::byte> data;
};

This class does not need a destructor, copy constructor, move constructor, or assignment operators. std::vector already manages its resource correctly.

This is the rule of zero: if your class can express ownership through existing RAII types, let those types handle the special member functions.

The situation changes when a class directly owns a resource represented by a low-level handle:

class Buffer {
public:
    explicit Buffer(std::size_t size)
        : data(new std::byte[size]), size(size) {}

    ~Buffer() {
        delete[] data;
    }

private:
    std::byte* data;
    std::size_t size;
};

Now copying becomes dangerous.

Buffer a(1024);
Buffer b = a;

The compiler-generated copy constructor copies the pointer. Both objects now believe they own the same allocation. When both destructors run, the same memory is released twice.

A resource-owning class therefore needs a carefully defined copy and move policy.

The five special member functions are:

1. destructor
2. copy constructor
3. copy assignment operator
4. move constructor
5. move assignment operator

A correct implementation might look like:

class Buffer {
public:
    explicit Buffer(std::size_t size)
        : data(size ? new std::byte[size] : nullptr), size(size) {}

    ~Buffer() {
        delete[] data;
    }

    Buffer(const Buffer& other)
        : data(other.size ? new std::byte[other.size] : nullptr),
          size(other.size) {
        std::copy(other.data, other.data + size, data);
    }

    Buffer& operator=(const Buffer& other) {
        if (this == &other) {
            return *this;
        }

        Buffer copy(other);
        swap(copy);

        return *this;
    }

    Buffer(Buffer&& other) noexcept
        : data(std::exchange(other.data, nullptr)),
          size(std::exchange(other.size, 0)) {}

    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = std::exchange(other.data, nullptr);
            size = std::exchange(other.size, 0);
        }

        return *this;
    }

private:
    void swap(Buffer& other) noexcept {
        std::swap(data, other.data);
        std::swap(size, other.size);
    }

    std::byte* data{};
    std::size_t size{};
};

The move constructor transfers ownership instead of duplicating the resource.

The noexcept specification is important. Standard containers can use move operations more aggressively when moving is known not to throw. For example, vector may prefer copying elements during reallocation if their move constructor could throw.

However, manually implementing the rule of five should usually be treated as a signal that the design might be improved.

Often this:

std::unique_ptr<std::byte[]> data;

is better than manually managing the allocation.

And often:

std::vector<std::byte> data;

is better still.

The strongest design is usually the one where the ownership policy is delegated to a standard RAII type.

A useful hierarchy is:

value type
    -> standard container/value member
        -> unique_ptr/custom RAII owner
            -> raw owning resource

Move toward the top whenever possible.
`
            },
            {
                title: "Exception safety and transactional state changes",
                content: `
Exception safety is fundamentally about maintaining valid program state when an operation fails.

There are commonly four useful guarantees.

The no-throw guarantee means an operation does not throw.

The strong guarantee means that if an operation fails, the observable state remains unchanged.

The basic guarantee means the object remains valid and no resources leak, but its state may have changed.

The no-fail guarantee is often used for operations such as destructors and swap functions that must not fail.

Consider a container-like class:

class Database {
public:
    void update() {
        remove_old_state();
        insert_new_state();
    }
};

If insert_new_state throws after remove_old_state succeeds, the database is left partially modified.

A stronger design prepares the new state first:

void Database::update() {
    State next = build_new_state();
    commit(std::move(next));
}

Now the potentially failing work happens before the observable state changes.

This is essentially a transaction.

The same idea appears throughout C++:

std::vector operations allocate and construct before changing the logical structure when possible.

Copy-and-swap assignment creates a new state first and commits it through swap.

Temporary objects can represent pending state.

Move operations can transfer already-established ownership.

A useful design pattern is:

prepare
validate
commit

For example:

Config next = parse_config(file);
validate(next);
config_ = std::move(next);

If parsing or validation fails, the old configuration remains intact.

This is often much safer than mutating the live object field-by-field.

Exception safety also explains why destructors should generally not throw. During stack unwinding, another exception may already be active. If a destructor throws while another exception is propagating, the program normally terminates.

Therefore cleanup functions should normally be noexcept:

~Resource() noexcept {
    release();
}

The important lesson is that exception safety is not something added after the program is written. It is a consequence of ownership and state-transition design.

If an operation can fail halfway through, ask:

What state is visible after failure?

Can the operation be performed on a temporary state?

Can the final update be reduced to one commit operation?

Can RAII make cleanup automatic?

These questions often produce a cleaner architecture than adding more try/catch blocks.
`
            },
            {
                title: "Smart pointers, ownership graphs and when not to use shared_ptr",
                content: `
std::unique_ptr is the default smart pointer for exclusive ownership.

std::shared_ptr represents shared ownership through reference counting.

std::weak_ptr observes an object managed by shared_ptr without extending its lifetime.

The important distinction is ownership, not syntax.

For example:

std::unique_ptr<Widget> widget = std::make_unique<Widget>();

The current scope owns the Widget.

Ownership can be transferred:

auto create_widget() {
    return std::make_unique<Widget>();
}

auto widget = create_widget();

Or:

void consume(std::unique_ptr<Widget> widget);

consume(std::move(widget));

After the move, the caller no longer owns the Widget.

shared_ptr is useful when several independent owners genuinely need to keep an object alive:

auto object = std::make_shared<Object>();

a.object = object;
b.object = object;

The reference count keeps the object alive until the last owner releases it.

But shared ownership introduces additional complexity.

There is atomic reference-count manipulation in common implementations, additional control-block storage, and a less explicit lifetime relationship.

More importantly, shared_ptr can hide architecture problems.

If object A owns B and B owns A through shared_ptr, neither object can be destroyed:

struct B;

struct A {
    std::shared_ptr<B> b;
};

struct B {
    std::shared_ptr<A> a;
};

This creates a reference cycle.

weak_ptr breaks the ownership cycle:

struct B {
    std::weak_ptr<A> a;
};

The broader architectural lesson is:

ownership should form a clear graph.

A healthy design often looks like:

Application
    owns -> Controller
        owns -> Services
            owns -> Resources

Rather than:

A shared_ptr B
B shared_ptr C
C shared_ptr A
D shared_ptr A
E shared_ptr C

When every object is shared, it becomes difficult to reason about lifetime.

Prefer values when practical.

Prefer references for borrowing.

Prefer unique_ptr for dynamic exclusive ownership.

Use shared_ptr when shared ownership is actually part of the domain model.

Use weak_ptr for non-owning observation of shared objects.

This is one of the most important ownership decisions in modern C++ architecture.
`
            }
        ]
    },

    {
        id: "templates-concepts",
        title: "Templates, Concepts and Compile-Time Programming",
        sections: [
            {
                title: "Templates as a programming language inside C++",
                content: `
C++ templates are much more than a mechanism for avoiding duplicated code. They form a compile-time programming system capable of selecting types, generating implementations, validating interfaces, and computing values before the program starts.

A function template:

template<typename T>
T maximum(T a, T b) {
    return a > b ? a : b;
}

can produce different functions for different types.

maximum(3, 7);
maximum(2.5, 1.5);

The compiler generates the required specializations.

This is called instantiation.

Templates therefore move some decisions from runtime into compile time.

That can provide both performance and correctness benefits.

For example, instead of writing:

void process_int(int value);
void process_double(double value);

a generic algorithm can express the operation once.

However, unconstrained templates can produce terrible diagnostics.

Consider:

template<typename T>
void process(T value) {
    value.serialize();
}

If somebody passes int, the compiler may produce a long diagnostic describing internal template substitution failures.

Modern C++ concepts improve this significantly.

template<typename T>
concept Serializable = requires(const T& value) {
    value.serialize();
};

template<Serializable T>
void process(const T& value) {
    value.serialize();
}

Now the template explicitly states its requirement.

Concepts are therefore not merely syntax. They document the API contract at compile time.

A good generic API should answer:

What operations must T support?

What relationships between types are required?

What values are valid?

What complexity guarantees are expected?

What semantic behavior does the algorithm assume?

The final question is especially important because concepts generally describe syntactic requirements, while semantic correctness may require documentation and tests.
`
            },
            {
                title: "Constraints, overload resolution and designing generic APIs",
                content: `
Generic programming becomes difficult when multiple possible implementations compete.

Suppose an API accepts any range:

template<typename Range>
void print(Range&& range);

Then another overload is introduced for strings, another for containers, and another for pointers.

As the number of overloads grows, overload resolution becomes difficult to reason about.

Concepts allow the programmer to describe categories explicitly.

template<typename T>
concept Integral = std::is_integral_v<T>;

template<Integral T>
T add(T a, T b) {
    return a + b;
}

The constraint becomes part of overload selection.

This makes APIs easier to reason about than large collections of SFINAE expressions.

Before concepts, programmers often used enable_if:

template<typename T,
         std::enable_if_t<std::is_integral_v<T>, int> = 0>
T add(T a, T b);

This works, but the intent is much harder to read.

Modern C++ favors:

template<std::integral T>
T add(T a, T b);

Constraints can also express relationships:

template<typename T, typename U>
requires std::convertible_to<U, T>
T convert(U value) {
    return static_cast<T>(value);
}

Good generic design is about restricting templates enough that invalid uses fail early, while keeping them general enough to remain useful.

An important mistake is trying to make everything generic.

A generic abstraction has costs:

longer compile times
more complex diagnostics
larger generated binaries in some cases
more difficult debugging
more difficult API reasoning

Use templates when the variation is structural and compile-time information provides value.

Do not introduce a template merely because duplication exists.

Sometimes two simple functions are easier to maintain than one complicated generic framework.
`
            },
            {
                title: "Type traits, constexpr and compile-time decisions",
                content: `
C++ can perform significant computation during compilation.

constexpr functions can execute at compile time when their inputs are compile-time values.

constexpr int square(int value) {
    return value * value;
}

constexpr int value = square(8);

The result can become part of the program's compile-time structure.

if constexpr allows compile-time branching:

template<typename T>
void serialize(const T& value) {
    if constexpr (std::is_integral_v<T>) {
        serialize_integer(value);
    } else {
        serialize_object(value);
    }
}

The discarded branch is not instantiated for the selected case.

This is very different from runtime if.

Type traits provide compile-time information:

std::is_integral_v<T>
std::is_pointer_v<T>
std::is_enum_v<T>
std::is_trivially_copyable_v<T>
std::is_default_constructible_v<T>

These properties can be combined with concepts to construct expressive generic APIs.

For example:

template<typename T>
concept SafeByteType =
    std::is_trivially_copyable_v<T> &&
    std::is_standard_layout_v<T>;

template<SafeByteType T>
std::array<std::byte, sizeof(T)> serialize(const T& value) {
    std::array<std::byte, sizeof(T)> result;
    std::memcpy(result.data(), &value, sizeof(T));
    return result;
}

Even here, semantic concerns remain. Object representation, endianness, padding, and portability must be considered.

Compile-time programming therefore does not eliminate design problems. It moves some of them earlier.

That is one of the biggest strengths of modern C++: incorrect assumptions can often become compiler errors instead of runtime bugs.
`
            },
            {
                title: "Template architecture and avoiding compile-time disasters",
                content: `
Templates can create extremely large compile-time workloads.

A header-only library may cause the same template definitions to be parsed and instantiated across many translation units.

Large template-heavy architectures can therefore increase:

compile time
memory usage during compilation
debug information size
binary size
error message complexity

A practical design separates stable non-template implementation from template-facing code when possible.

For example:

template<typename T>
void process(const T& value) {
    process_impl(to_internal_representation(value));
}

The generic wrapper remains small while the heavy implementation can live in a normal source file.

Explicit instantiation can also be used when the supported types are known.

template class Matrix<float>;
template class Matrix<double>;

The goal is not to avoid templates. The goal is to control where template complexity appears.

Templates are a powerful architectural tool, but they should remain understandable to someone who did not originally write them.

A useful rule is:

genericity should solve a real variation problem.

If a template exists only because C++ allows it, the abstraction probably needs another design review.
`
            }
        ]
    },

    {
        id: "stl-architecture",
        title: "STL Architecture, Containers, Iterators, Algorithms and Ranges",
        sections: [
            {
                title: "Choosing containers by workload rather than habit",
                content: `
The standard library contains many containers because different workloads require different memory and access characteristics.

std::vector is usually the first container to consider when elements form a sequence.

It provides contiguous storage:

std::vector<int> values;

This gives excellent cache locality and constant-time indexing.

A vector's elements are stored next to each other in memory, which makes sequential traversal extremely efficient on modern processors.

std::list provides constant-time insertion and removal at known positions, but each element is normally stored in a separate node.

That means pointer chasing and poor cache locality can make list slower than vector even when list has better theoretical insertion complexity.

This is one of the most important lessons in performance-oriented C++:

asymptotic complexity does not describe the entire cost of an operation.

Other important containers include:

std::deque
std::array
std::forward_list
std::map
std::set
std::unordered_map
std::unordered_set

Container choice should consider:

access pattern
mutation pattern
memory locality
allocation frequency
element size
ordering requirements
lookup requirements
iterator invalidation
exception guarantees
concurrency strategy

For example, if you repeatedly append elements and iterate over them, vector is often a natural choice.

If you need key-based lookup and ordering, map may be appropriate.

If ordering is irrelevant and hashing provides useful performance, unordered_map may be appropriate.

If the number of elements is fixed at compile time, array can eliminate dynamic allocation entirely.

The right question is not:

"Which container is fastest?"

It is:

"What operations dominate this workload, and what memory behavior does that workload create?"
`
            },
            {
                title: "Iterators, invalidation and algorithm composition",
                content: `
Iterators form an abstraction between containers and algorithms.

This allows algorithms such as:

std::sort
std::find
std::copy
std::transform
std::remove
std::accumulate

to operate without knowing the exact container type.

For example:

std::vector<int> values{4, 1, 9, 2, 7};

std::sort(values.begin(), values.end());

The algorithm works through iterators.

However, iterator validity is one of the most important correctness concerns in STL code.

Consider:

auto it = values.begin();
values.push_back(100);

If push_back causes reallocation, the old iterator becomes invalid.

Using it afterward is undefined behavior.

The same concept applies to references and pointers into containers.

A robust programmer therefore learns invalidation rules instead of treating iterators as permanent references.

The erase-remove pattern is another classic example:

values.erase(
    std::remove(values.begin(), values.end(), 7),
    values.end()
);

Modern C++ also provides std::erase where appropriate.

Algorithms should generally be preferred over handwritten loops when the algorithm expresses the intent clearly.

Compare:

for (auto& value : values) {
    if (value < 0) {
        value = 0;
    }
}

with:

std::transform(
    values.begin(),
    values.end(),
    values.begin(),
    [](int value) {
        return std::max(value, 0);
    }
);

Neither is universally better, but the algorithm communicates that the operation transforms every element.

The important principle is to choose the abstraction that makes the operation's intent obvious without hiding important performance behavior.
`
            },
            {
                title: "Ranges and building pipelines",
                content: `
Ranges extend the iterator model by allowing algorithms and views to compose more naturally.

A range can be viewed as a source of elements rather than simply a pair of iterators.

For example:

auto result =
    values
    | std::views::filter([](int value) {
        return value % 2 == 0;
    })
    | std::views::transform([](int value) {
        return value * value;
    });

Views are generally lazy. The operations do not necessarily create an intermediate container.

This can be extremely useful for data-processing pipelines.

Instead of:

create temporary list
filter temporary list
create another list
transform another list

a range pipeline can describe the computation as one composed expression.

But laziness introduces its own design concerns.

The source range must remain alive while the view is used.

A view may contain references to its underlying data.

Some views are single-pass.

Some operations have different complexity characteristics than users might expect.

Therefore range code should still be designed with lifetime and complexity in mind.

Ranges are particularly useful when a program contains many transformations over data and the intermediate collections would otherwise be unnecessary.

The deeper architectural benefit is composability: each operation describes one transformation, and the complete pipeline describes the data flow.
`
            },
            {
                title: "Allocations, locality and performance consequences of containers",
                content: `
Two implementations can have identical big-O complexity and dramatically different performance.

Consider iterating over one million integers.

A vector stores them contiguously.

A linked list stores nodes distributed throughout memory.

The vector allows the CPU to fetch multiple nearby values through cache lines and hardware prefetching.

The linked list can require a pointer dereference for every element.

This means memory layout is part of algorithm performance.

The same principle affects unordered_map. Hash-table lookup may be approximately constant time, but each lookup can involve hashing, bucket selection, pointer chasing, and cache misses.

For performance-sensitive code, measure:

allocation count
allocation size
cache behavior
branch behavior
memory bandwidth
CPU time
contention

Do not automatically replace vector with list because insertion is theoretically O(1).

Do not automatically replace map with unordered_map because lookup is theoretically O(1).

The real workload matters.

A good STL design therefore combines algorithmic complexity with knowledge of the hardware memory hierarchy.

This is one of the points where modern C++ becomes much more than syntax. The standard library gives you high-level abstractions, but understanding their physical behavior lets you choose them intelligently.
`
            }
        ]
    },

    {
        id: "concurrency-memory-model",
        title: "Concurrency, Threads, Atomics and the C++ Memory Model",
        sections: [
            {
                title: "Threads are not enough: understanding shared state",
                content: `
Concurrency becomes difficult when multiple execution contexts interact with shared mutable state.

The simplest example:

int counter = 0;

void worker() {
    ++counter;
}

Running worker from multiple threads creates a data race.

The problem is not simply that two threads might execute at the same time. The increment operation is not necessarily one indivisible machine operation. It conceptually involves reading, modifying, and writing the value.

A race occurs when multiple threads access the same memory concurrently, at least one access is a write, and there is no appropriate synchronization.

In C++, a data race is undefined behavior.

The standard solution is a mutex:

std::mutex mutex;
int counter = 0;

void worker() {
    std::lock_guard lock(mutex);
    ++counter;
}

RAII is again important. lock_guard locks in its constructor and unlocks in its destructor.

This means exceptions and early returns do not accidentally leave the mutex locked.

But synchronization has costs.

A mutex can introduce:

contention
blocking
context switches
cache-line traffic
priority interactions

The goal is therefore not to remove every mutex. The goal is to design ownership and synchronization so that shared mutable state is minimized.

One strong strategy is message passing.

Instead of multiple threads modifying the same complex object, one thread can own that object and other threads communicate through a queue.

Ownership becomes:

thread A owns state
thread B sends command
thread A processes command

This can be easier to reason about than dozens of threads directly modifying shared state.
`
            },
            {
                title: "Atomics and memory ordering",
                content: `
std::atomic provides synchronization for individual atomic objects.

For example:

std::atomic<bool> running{true};

void worker() {
    while (running.load()) {
        do_work();
    }
}

The atomic ensures that accesses to running do not create a data race.

However, atomics are not simply "faster mutexes".

They provide a formal memory-ordering model.

Common memory orders include:

memory_order_relaxed
memory_order_acquire
memory_order_release
memory_order_acq_rel
memory_order_seq_cst

Relaxed ordering provides atomicity but minimal ordering constraints.

Acquire and release can establish synchronization between threads.

Sequential consistency provides stronger global ordering guarantees and is often easier to reason about, though it may impose additional constraints.

For example:

std::atomic<bool> ready{false};
int data = 0;

void producer() {
    data = 42;
    ready.store(true, std::memory_order_release);
}

void consumer() {
    while (!ready.load(std::memory_order_acquire)) {
    }

    std::cout << data;
}

The release store and acquire load establish a happens-before relationship.

Without the appropriate synchronization, merely observing ready as true would not automatically make every other memory access correctly synchronized.

This is why lock-free programming is difficult.

The code may appear simple while the correctness argument depends on subtle relationships between memory operations.

A useful rule is:

use the strongest simple synchronization primitive that satisfies the design.

Do not choose relaxed atomics merely because they appear faster unless the memory-ordering requirements are understood and documented by the design itself.
`
            },
            {
                title: "Deadlocks, contention and designing synchronization",
                content: `
Deadlocks commonly occur when threads acquire multiple locks in different orders.

Thread A:

lock(mutex_a);
lock(mutex_b);

Thread B:

lock(mutex_b);
lock(mutex_a);

Both threads can wait forever.

std::scoped_lock can acquire multiple mutexes using a deadlock-avoidance strategy:

std::scoped_lock lock(mutex_a, mutex_b);

Another strategy is to establish a global lock ordering and require every part of the program to follow it.

But the better solution can be reducing the number of locks.

If one mutex protects ten unrelated pieces of state, unrelated operations contend unnecessarily.

If ten mutexes protect one tightly coupled state machine, reasoning becomes difficult.

Synchronization should follow ownership boundaries.

A useful architecture might be:

ConnectionManager owns connection state.

Worker threads communicate through a queue.

Only ConnectionManager mutates connection state.

This converts many synchronization problems into one controlled synchronization boundary.

Condition variables can be used when threads should sleep until work becomes available:

std::condition_variable condition;
std::mutex mutex;
std::queue<Task> tasks;

Worker threads wait until the queue is not empty.

The predicate should always be checked in a loop because wakeups do not themselves guarantee that the desired condition remains true.

Concurrency becomes substantially easier when shared state is reduced instead of trying to synchronize increasingly large amounts of shared state.
`
            },
            {
                title: "False sharing, cache lines and practical concurrency performance",
                content: `
Even correct lock-free code can perform badly because multiple threads may modify values located on the same cache line.

Suppose two atomic counters are adjacent:

struct Counters {
    std::atomic<long> a;
    std::atomic<long> b;
};

Thread A repeatedly updates a.

Thread B repeatedly updates b.

Although the logical variables are independent, the CPU may need to repeatedly transfer the cache line between cores.

This is false sharing.

Padding or alignment can separate frequently modified variables:

struct alignas(64) Counter {
    std::atomic<long> value{};
};

The exact cache-line size is platform dependent, so portable designs should avoid blindly assuming a particular hardware value when it matters.

Concurrency performance is therefore influenced by:

lock contention
atomic contention
cache-line ownership
memory bandwidth
thread scheduling
NUMA topology
allocation behavior
work distribution

Adding more threads does not guarantee more performance.

If eight threads compete for one mutex, the program may still behave almost like a serial program.

A well-designed concurrent system attempts to partition work and ownership so that threads can make progress independently.

The most useful concurrency optimization is often architectural rather than instruction-level.
`
            }
        ]
    },

    {
        id: "performance-optimization",
        title: "Performance Engineering, Profiling and Low-Level Optimization",
        sections: [
            {
                title: "Performance starts with measurement",
                content: `
Performance optimization should begin with evidence.

A common mistake is to optimize code based on intuition:

"this function looks slow"
"unordered_map must be faster"
"this loop should be vectorized"
"allocation is probably the bottleneck"

These assumptions can be wrong.

A disciplined performance process is:

define the performance goal
create a representative workload
measure the baseline
identify the dominant cost
change one important factor
measure again
verify correctness

Useful metrics include:

wall-clock time
CPU time
throughput
latency
peak memory
allocation count
cache misses
branch misses
system calls
I/O wait

Profilers are often more valuable than manually reading thousands of lines of source code.

A profiler can reveal that the function you thought was expensive consumes only 1% of runtime while a seemingly insignificant parsing function consumes 60%.

Optimization should target the measured bottleneck.

If a program spends most of its time waiting for disk I/O, changing a mathematical expression will not produce meaningful improvement.

If it spends most of its time allocating tiny objects, changing the allocator strategy may matter more than changing the algorithm.

If it spends most of its time scanning memory, cache locality and data layout may dominate.

Performance engineering is therefore a measurement discipline rather than a collection of tricks.
`
            },
            {
                title: "Cache locality and data-oriented design",
                content: `
Modern CPUs are extremely fast compared with main memory.

A CPU can execute many instructions while waiting for a memory access, but a cache miss can still create a large relative delay.

Consider:

struct Entity {
    float x;
    float y;
    float z;
    float health;
    std::string name;
};

If an update loop only needs positions, loading the entire Entity structure may bring unnecessary data into cache.

A data-oriented layout might store:

std::vector<float> x;
std::vector<float> y;
std::vector<float> z;
std::vector<float> health;

Now a position-processing loop can access dense arrays containing mostly the values it needs.

This is not universally better. It can make code more complex and may be less convenient when individual objects are manipulated frequently.

The correct design depends on access patterns.

This is why data layout should be considered part of algorithm design.

The same principle explains why contiguous vector storage is often extremely efficient.

Performance is frequently determined by how much useful work the CPU can perform per cache miss.

Before optimizing individual instructions, ask:

What data is accessed?

In what order?

How much unrelated data is loaded?

How often does the program allocate?

How predictable are branches?

How many threads touch the same cache lines?

These questions often produce larger improvements than micro-optimizations.
`
            },
            {
                title: "Move semantics, allocations and avoiding unnecessary work",
                content: `
Move semantics allow resources to be transferred rather than copied.

Consider:

std::vector<std::string> build();

auto values = build();

A modern implementation can return the vector without copying every element.

Move semantics are particularly useful for resource-owning types.

A vector move can transfer its internal allocation:

old object
    pointer -> allocation

after move:

new object
    pointer -> allocation

old object
    pointer -> empty/null state

The resource itself does not need to be copied.

However, programmers sometimes add std::move everywhere without understanding its effect.

For example:

return std::move(local);

can interfere with return-value optimization in some situations and is usually unnecessary for a local variable being returned by value.

Likewise, moving from an object has semantic consequences. After a move, the object remains valid but its value is generally unspecified unless the type documents stronger guarantees.

The best optimization is often to avoid creating unnecessary objects in the first place.

Reserve capacity when growth is predictable:

std::vector<Item> items;
items.reserve(expected_count);

This can reduce repeated reallocations.

But reserve should not be added everywhere. It is useful when there is a reasonable estimate of the required capacity.

Optimization should preserve clarity while targeting measured costs.
`
            },
            {
                title: "Undefined behavior and why the optimizer matters",
                content: `
Undefined behavior means the C++ standard imposes no requirements on what happens.

Examples include:

out-of-bounds access
use-after-free
signed integer overflow
invalid pointer dereference
data races
accessing an object outside its lifetime

A dangerous misconception is:

"it works on my machine."

Undefined behavior may appear to work during testing and then fail after:

compiler optimization
different compiler version
different CPU
different build flags
different surrounding code

Optimizing compilers are allowed to assume that well-defined programs do not perform undefined operations.

For example:

int f(int x) {
    return x + 1 > x;
}

For ordinary mathematical integers this is not always true because signed overflow exists, but a compiler can reason under the assumption that signed overflow does not occur in a well-defined execution.

This means undefined behavior can affect optimization itself.

Tools such as sanitizers are therefore essential during development.

AddressSanitizer can detect many memory errors.

UndefinedBehaviorSanitizer can detect many forms of undefined behavior.

ThreadSanitizer can detect many data races.

These tools do not prove that a program is correct, but they can turn difficult runtime failures into precise diagnostics.

Performance work should therefore come after correctness validation.

There is little value in making undefined behavior execute faster.
`
            }
        ]
    },

    {
        id: "debugging-testing-toolchain",
        title: "Debugging, Testing, Sanitizers, Linking and the C++ Toolchain",
        sections: [
            {
                title: "A serious debugging workflow",
                content: `
Debugging should be treated as an investigation rather than repeatedly changing code until the problem disappears.

Start with a reproducible failure.

A good bug report should establish:

what was expected
what actually happened
how to reproduce it
whether the behavior is deterministic
which inputs trigger it
which build configuration is involved

A debugger such as GDB can inspect:

stack frames
local variables
registers
memory
threads
breakpoints
watchpoints

A useful workflow is:

build with debug information
reproduce the failure
stop at the relevant location
inspect the call stack
inspect the state
identify the earliest incorrect state
trace backward to the operation that created it

The most important debugging question is often not:

"where did it crash?"

but:

"where did the program first become incorrect?"

A crash may occur thousands of instructions after memory corruption.

Sanitizers can dramatically reduce the search space.

For example:

-fsanitize=address,undefined

can detect many memory lifetime and undefined behavior problems.

For concurrent programs:

-fsanitize=thread

can detect many data races.

Sanitizers have runtime and build costs, so they are generally development tools rather than production configuration.
`
            },
            {
                title: "Testing beyond simple input-output examples",
                content: `
A serious C++ project should test behavior, invariants, error paths, and boundary conditions.

A unit test should not merely prove that one example works.

For a parser, test:

empty input
minimum valid input
maximum expected input
malformed input
unexpected whitespace
duplicate fields
invalid encoding
very large input

For a container, test:

empty state
single element
growth
copy
move
erase
iteration
exception paths

Property-based thinking is useful even when a property-testing framework is not used.

For example, if sorting a sequence should produce ordered output:

sort(values.begin(), values.end());

the invariant is:

values[i] <= values[i + 1]

for every valid adjacent pair.

Testing should also include failure behavior.

If allocation fails, what happens?

If a file cannot be opened, is the object left valid?

If a network request fails halfway through, can the operation be retried?

If a constructor throws, are already-acquired resources released?

The best tests often document the contract of the system more clearly than comments do.

Tests also become valuable architecture feedback.

If a class requires twenty mocks to test one function, the class may have too many responsibilities.

If every test requires global state manipulation, dependencies may not be isolated properly.

Testing is therefore not only validation. It is also a design diagnostic.
`
            },
            {
                title: "Compilation, translation units, linking and ABI",
                content: `
A C++ program is normally built through several stages.

Source files are preprocessed and compiled into translation units.

Each translation unit produces an object file.

The linker combines object files and libraries into the final executable or shared library.

Understanding this model explains many common errors.

A declaration can appear in a header:

int calculate(int value);

A definition can appear in a source file:

int calculate(int value) {
    return value * 2;
}

If the declaration is visible but the definition is not linked, the compiler may accept the source while the linker reports an undefined reference.

Headers define interfaces between translation units.

This is why multiple-definition problems can occur when non-inline definitions are placed incorrectly in headers.

Templates are different because their definitions generally need to be visible at the point of instantiation.

The build system therefore becomes an important part of C++ architecture.

Large projects need to manage:

include dependencies
compile definitions
compiler flags
link dependencies
platform-specific code
debug/release configurations
sanitizer builds
testing targets
installation targets

CMake is commonly used to describe these relationships.

A good build configuration should make the dependency graph explicit rather than relying on accidental global compiler flags.

The toolchain itself is part of the software system.

Compiler version, standard library implementation, linker, ABI, architecture, and build flags can all influence behavior and compatibility.
`
            },
            {
                title: "API design, ABI stability and production-quality libraries",
                content: `
A C++ API has both source-level and binary-level consequences.

Changing a public class can require downstream projects to recompile.

Changing the binary layout of a class can also break ABI compatibility between compiled components.

This matters especially for shared libraries.

One common technique for hiding implementation details is the Pimpl pattern.

The public class stores a pointer to an implementation object:

class Widget {
public:
    Widget();
    ~Widget();

    void process();

private:
    class Impl;
    std::unique_ptr<Impl> impl;
};

The implementation can change without exposing all private fields in the public header.

This can reduce compile-time dependencies and help preserve ABI boundaries.

But Pimpl introduces an allocation and indirection, so it should be used where its architectural benefits matter.

API design should also minimize unnecessary exposure.

If users only need:

void process(const Data& data);

there is little reason to expose internal containers, locks, helper classes, or implementation-specific state.

A stable API separates:

what callers need to know

from:

how the implementation achieves it.

This separation is one of the strongest characteristics of maintainable C++ libraries.

A production-quality project should also define:

supported C++ standard
supported compilers
platform requirements
error handling policy
thread-safety guarantees
ownership rules
exception guarantees
ABI expectations
testing strategy
build instructions

These details turn source code into an actual software product rather than a collection of files.
`
            }
        ]
    },

    {
        id: "modern-cpp-architecture",
        title: "Modern C++ Architecture, API Design and Large-Scale Systems",
        sections: [
            {
                title: "Designing boundaries before writing classes",
                content: `
Large C++ systems become difficult when boundaries are unclear.

A common failure mode is creating classes first and deciding responsibilities afterward.

A better approach is to identify major responsibilities:

input
validation
domain logic
state management
persistence
networking
presentation
logging
configuration

Then define the dependency direction.

For example:

UI
 ↓
Application layer
 ↓
Domain layer
 ↓
Infrastructure

The domain layer should not necessarily depend directly on a specific database library.

Instead, define an interface:

class UserRepository {
public:
    virtual ~UserRepository() = default;
    virtual User find(int id) = 0;
    virtual void save(const User& user) = 0;
};

Infrastructure can implement it.

This allows the domain logic to remain independent from the storage mechanism.

However, interfaces should not be introduced automatically.

A virtual interface adds complexity and can make ownership and lifetime harder to understand.

If a concrete type is sufficient, use the concrete type.

Abstraction should exist where there is a real architectural boundary or meaningful variation.

The goal is not to maximize abstraction.

The goal is to minimize unnecessary coupling.
`
            },
            {
                title: "Value semantics, type erasure and polymorphism",
                content: `
C++ supports several forms of polymorphism.

Runtime polymorphism commonly uses virtual functions:

class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;
};

Compile-time polymorphism uses templates:

template<typename Shape>
double area(const Shape& shape) {
    return shape.area();
}

These approaches have different tradeoffs.

Runtime polymorphism provides stable interfaces and heterogeneous collections:

std::vector<std::unique_ptr<Shape>> shapes;

Compile-time polymorphism can eliminate virtual dispatch and enable aggressive optimization:

template<typename T>
concept ShapeLike = requires(const T& value) {
    { value.area() } -> std::convertible_to<double>;
};

template<ShapeLike T>
double total_area(const std::vector<T>& shapes) {
    double result = 0;

    for (const auto& shape : shapes) {
        result += shape.area();
    }

    return result;
}

There is also type erasure, which can provide runtime polymorphism without requiring the erased type to inherit from a common base.

std::function is a familiar example.

A callback can be stored without the caller knowing its exact concrete type.

The design decision should be driven by requirements:

Do types need to be heterogeneous?

Does the interface need to cross a binary boundary?

Is dynamic dispatch required?

Is compile-time specialization valuable?

Does the object need stable value semantics?

There is no universal "best" polymorphism mechanism.
`
            },
            {
                title: "Error handling as part of API architecture",
                content: `
Error handling should be designed into an API instead of added after the implementation.

C++ offers several mechanisms:

exceptions
error codes
std::optional
std::expected
status objects
assertions

Each represents a different kind of failure.

std::optional is appropriate when absence is expected:

std::optional<User> find_user(int id);

There is no error information beyond "not found".

std::expected can represent either a value or a structured error:

std::expected<User, Error> load_user(int id);

This makes failure part of the return type.

Exceptions can be appropriate when failure is exceptional relative to normal control flow and the architecture is designed around exception propagation.

Assertions are different again. They express conditions that should be impossible if the program is correct.

assert(index < size);

A good architecture distinguishes:

invalid caller input
expected absence
recoverable operational failure
programmer error
system failure

If every problem becomes an exception, error handling becomes difficult to reason about.

If every problem becomes an integer error code, important information may be lost.

The API should make the expected failure model obvious to its callers.
`
            },
            {
                title: "Designing for change without overengineering",
                content: `
Software architecture is largely about controlling the cost of future change.

If one feature requires modifying ten unrelated modules, coupling is high.

If adding a new implementation requires changing only one factory and one implementation file, the boundary may be healthier.

But predicting every possible future requirement leads to overengineering.

A common example is creating:

IRepository
IRepositoryFactory
IRepositoryProvider
RepositoryStrategy
RepositoryManager

when the program currently has one repository implementation and no real variation.

This adds abstraction without solving an existing problem.

Good architecture balances:

simplicity today
changeability tomorrow
performance
testability
maintainability

One useful principle is to make the easy path simple.

If most callers need one concrete implementation, provide a simple API for that case.

Advanced customization can exist behind an explicit extension point.

Architecture should reduce complexity, not merely move it into more files.

A mature C++ project is not defined by how many classes it contains. It is defined by how clearly responsibilities, ownership, dependencies, and failure modes can be understood.
`
            }
        ]
    }
];

for (var i = 0; i < topics3.length; i++) {
    topics.push(topics3[i]);
}
