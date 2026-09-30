var topics7 = [
    {
        title: "Building a High-Performance C++ Runtime",
        sections: [
            {
                title: "Why a Runtime Needs an Architecture",
                content: `A serious C++ program eventually stops being a collection of classes and becomes a system with explicit ownership, lifetime, memory, scheduling, diagnostics and failure boundaries.

The important idea is that performance does not come from sprinkling inline or constexpr everywhere. It comes from designing the lifetime of data, deciding where memory is allocated, minimizing unnecessary movement, choosing predictable data structures and making expensive operations visible.

A runtime layer can sit underneath a larger application and provide common services such as allocation, task execution, logging, timing and object ownership.

The architecture should be explicit about which component owns a resource, which component may access it, when it becomes invalid and what happens when an operation fails.

A useful starting point is to separate long-lived infrastructure from short-lived work. Configuration and global services may live for the entire application lifetime, while request objects and temporary buffers can use shorter arenas or pools.

This separation makes both reasoning and profiling easier.`
            },
            {
                title: "Ownership and Resource Boundaries",
                content: `Ownership is one of the most important architectural concepts in C++. A pointer tells you where an object is, but it does not necessarily tell you who is responsible for destroying it.

Use owning types when ownership is part of the interface. Use references or non-owning pointers when another component controls the lifetime.

A function returning std::unique_ptr communicates that the caller receives ownership. A function accepting std::span communicates that it observes a range without owning its storage.

The following small runtime component demonstrates an explicit ownership boundary.`,
                code: `#include <cstddef>
#include <memory>
#include <vector>

class Buffer {
public:
    explicit Buffer(std::size_t size)
        : data_(size) {}

    std::byte* data() {
        return data_.data();
    }

    const std::byte* data() const {
        return data_.data();
    }

    std::size_t size() const {
        return data_.size();
    }

private:
    std::vector<std::byte> data_;
};

class Runtime {
public:
    std::unique_ptr<Buffer> create_buffer(std::size_t size) const {
        return std::make_unique<Buffer>(size);
    }
};

int main() {
    Runtime runtime;

    auto buffer = runtime.create_buffer(4096);

    buffer->data()[0] = std::byte{0x42};
}`
            },
            {
                title: "Arena Allocation",
                content: `General-purpose allocation is convenient, but many systems repeatedly create objects with related lifetimes.

An arena can allocate a large region and satisfy many smaller allocations from that region. Individual objects do not need independent deallocation. The arena is destroyed when the whole group of objects is no longer needed.

This is particularly useful for parsers, request processing, temporary compiler structures and frame-based systems.

The tradeoff is important: an arena is fast because it gives up some flexibility. Objects normally share the lifetime of the arena, so it is not appropriate for arbitrary long-lived ownership.`,
                code: `#include <cstddef>
#include <memory>
#include <new>
#include <utility>
#include <vector>

class Arena {
public:
    explicit Arena(std::size_t capacity)
        : storage_(capacity),
          offset_(0) {}

    Arena(const Arena&) = delete;
    Arena& operator=(const Arena&) = delete;

    void* allocate(std::size_t size, std::size_t alignment) {
        const std::size_t base =
            reinterpret_cast<std::size_t>(storage_.data());

        const std::size_t current = base + offset_;
        const std::size_t aligned =
            (current + alignment - 1) & ~(alignment - 1);

        const std::size_t next =
            aligned - base + size;

        if (next > storage_.size()) {
            throw std::bad_alloc{};
        }

        offset_ = next;
        return reinterpret_cast<void*>(aligned);
    }

    template <typename T, typename... Args>
    T* create(Args&&... args) {
        void* memory = allocate(sizeof(T), alignof(T));
        return std::construct_at(
            static_cast<T*>(memory),
            std::forward<Args>(args)...
        );
    }

    void reset() {
        offset_ = 0;
    }

private:
    std::vector<std::byte> storage_;
    std::size_t offset_;
};`
            },
            {
                title: "Connecting Memory and Cache Behavior",
                content: `Allocation speed is only one part of memory performance. The layout of data determines how efficiently the processor can load it.

A vector of compact objects often gives the CPU a predictable sequential access pattern. A structure containing many pointers can cause unrelated memory accesses and increase cache misses.

Consider a particle system. If an update only needs position and velocity, storing unrelated metadata beside those values increases the amount of memory transferred into cache.

This is where data-oriented design connects directly to allocator design: first choose the data layout, then choose an allocation strategy that preserves that layout.

The runtime should therefore treat memory layout as part of the architecture rather than as an implementation detail.`
            },
            {
                title: "A Runtime Service Container",
                content: `Once allocation and infrastructure services exist, larger applications need a controlled way to expose them.

A service container should remain simple. The goal is not to recreate a dependency injection framework. The goal is to establish explicit lifetime and access rules.

The runtime can own services while application systems receive references to the services they actually need.`,
                code: `#include <iostream>
#include <memory>
#include <string>

class Logger {
public:
    void info(const std::string& message) {
        std::cout << "[info] " << message << '\\n';
    }
};

class Runtime {
public:
    Runtime()
        : logger_(std::make_unique<Logger>()) {}

    Logger& logger() {
        return *logger_;
    }

private:
    std::unique_ptr<Logger> logger_;
};

class Application {
public:
    explicit Application(Runtime& runtime)
        : runtime_(runtime) {}

    void run() {
        runtime_.logger().info("application started");
        runtime_.logger().info("runtime services are available");
    }

private:
    Runtime& runtime_;
};

int main() {
    Runtime runtime;
    Application application(runtime);
    application.run();
}`
            }
        ]
    },

    {
        title: "Designing a Concurrent C++ System",
        sections: [
            {
                title: "Concurrency Is an Ownership Problem",
                content: `Concurrency is often introduced as a thread problem, but the deeper problem is shared ownership.

When multiple execution contexts access the same object, the program needs a precise answer to three questions: who owns the object, which operations may happen concurrently, and what synchronization establishes visibility?

A mutex solves some problems, but blindly adding mutexes does not create a good concurrent architecture.

A strong design minimizes shared mutable state. Work should preferably move between threads through explicit queues, immutable values or ownership transfer.

This approach connects concurrency with the ownership principles from the runtime chapter.`
            },
            {
                title: "Atomics and Memory Ordering",
                content: `An atomic operation guarantees atomic access, but atomicity alone does not explain when other memory becomes visible.

Relaxed ordering is useful for counters and statistics where ordering with unrelated memory is not required. Acquire and release operations establish synchronization between a producer and consumer.

Sequential consistency is easier to reason about, but it can impose stronger ordering requirements than necessary.

The correct memory ordering should be derived from the communication protocol rather than chosen because it appears faster.`,
                code: `#include <atomic>
#include <iostream>
#include <thread>

class ReadyState {
public:
    void publish() {
        value_ = 42;
        ready_.store(true, std::memory_order_release);
    }

    int consume() {
        while (!ready_.load(std::memory_order_acquire)) {
            std::this_thread::yield();
        }

        return value_;
    }

private:
    int value_ = 0;
    std::atomic<bool> ready_{false};
};

int main() {
    ReadyState state;

    std::thread producer([&] {
        state.publish();
    });

    std::thread consumer([&] {
        std::cout << state.consume() << '\\n';
    });

    producer.join();
    consumer.join();
}`
            },
            {
                title: "Building a Work Queue",
                content: `A work queue creates an architectural boundary between producers and workers.

Instead of allowing every subsystem to access every other subsystem directly, producers submit work and workers consume it.

The queue becomes responsible for synchronization while jobs remain ordinary callable objects.

A condition variable allows workers to sleep while no work exists instead of continuously polling.`,
                code: `#include <condition_variable>
#include <functional>
#include <mutex>
#include <queue>

class WorkQueue {
public:
    void push(std::function<void()> job) {
        {
            std::lock_guard lock(mutex_);
            jobs_.push(std::move(job));
        }

        condition_.notify_one();
    }

    bool pop(std::function<void()>& job) {
        std::unique_lock lock(mutex_);

        condition_.wait(lock, [&] {
            return stopping_ || !jobs_.empty();
        });

        if (jobs_.empty()) {
            return false;
        }

        job = std::move(jobs_.front());
        jobs_.pop();
        return true;
    }

    void stop() {
        {
            std::lock_guard lock(mutex_);
            stopping_ = true;
        }

        condition_.notify_all();
    }

private:
    std::mutex mutex_;
    std::condition_variable condition_;
    std::queue<std::function<void()>> jobs_;
    bool stopping_ = false;
};`
            },
            {
                title: "Avoiding Shared State",
                content: `The easiest concurrent object to synchronize is the object that is not shared.

Instead of allowing workers to modify a central data structure, partition work into independent pieces and combine the results after processing.

This is closely related to functional programming: values are passed into operations, transformed and returned instead of being modified through hidden global state.

When shared state is unavoidable, isolate it behind a small synchronization boundary.`
            },
            {
                title: "Thread Lifetime and Shutdown",
                content: `A production concurrent system must define shutdown behavior.

Stopping a worker does not simply mean setting a boolean. Workers may be blocked waiting for work, jobs may still exist in queues and resources may be destroyed while threads are still executing.

The owner of a thread should therefore own the thread's lifetime and coordinate shutdown before destroying the resources used by that thread.

Modern C++ provides std::jthread and stop tokens for expressing this model directly.`,
                code: `#include <chrono>
#include <iostream>
#include <stop_token>
#include <thread>

void worker(std::stop_token token) {
    while (!token.stop_requested()) {
        std::cout << "worker active\\n";
        std::this_thread::sleep_for(std::chrono::milliseconds(250));
    }

    std::cout << "worker stopping\\n";
}

int main() {
    std::jthread thread(worker);

    std::this_thread::sleep_for(
        std::chrono::seconds(2)
    );

    thread.request_stop();
}`
            }
        ]
    },

    {
        title: "Building a Custom Task Scheduler",
        sections: [
            {
                title: "From Threads to Tasks",
                content: `Creating a thread for every operation is not a scalable scheduling model.

A task scheduler separates the description of work from the execution mechanism. A task is submitted to the scheduler and an available worker eventually executes it.

This allows the application to control concurrency independently from the number of tasks.

The same abstraction can later support priorities, dependencies, cancellation and work stealing.`
            },
            {
                title: "Task Representation",
                content: `A task needs to represent executable work without forcing the scheduler to know its concrete type.

std::function is convenient for a general-purpose scheduler, while custom type erasure can reduce allocations and improve control in specialized systems.

The task boundary should remain small: execute the work and report completion.`,
                code: `#include <functional>
#include <utility>

class Task {
public:
    Task() = default;

    template <typename F>
    Task(F&& function)
        : function_(std::forward<F>(function)) {}

    void execute() {
        if (function_) {
            function_();
        }
    }

    explicit operator bool() const {
        return static_cast<bool>(function_);
    }

private:
    std::function<void()> function_;
};`
            },
            {
                title: "Worker Pool",
                content: `The scheduler can maintain a fixed number of workers and route tasks through a shared queue.

The number of workers should normally be based on the machine and workload rather than the number of submitted tasks.

CPU-bound work and I/O-bound work may require different scheduling strategies. A single global worker count is not automatically correct for every workload.`,
                code: `#include <condition_variable>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>

class ThreadPool {
public:
    explicit ThreadPool(std::size_t count) {
        for (std::size_t i = 0; i < count; ++i) {
            workers_.emplace_back([this] {
                worker_loop();
            });
        }
    }

    ~ThreadPool() {
        stop();
    }

    void submit(std::function<void()> task) {
        {
            std::lock_guard lock(mutex_);
            queue_.push(std::move(task));
        }

        condition_.notify_one();
    }

    void stop() {
        {
            std::lock_guard lock(mutex_);
            stopping_ = true;
        }

        condition_.notify_all();

        for (auto& worker : workers_) {
            if (worker.joinable()) {
                worker.join();
            }
        }
    }

private:
    void worker_loop() {
        while (true) {
            std::function<void()> task;

            {
                std::unique_lock lock(mutex_);

                condition_.wait(lock, [&] {
                    return stopping_ || !queue_.empty();
                });

                if (stopping_ && queue_.empty()) {
                    return;
                }

                task = std::move(queue_.front());
                queue_.pop();
            }

            task();
        }
    }

    std::mutex mutex_;
    std::condition_variable condition_;
    std::queue<std::function<void()>> queue_;
    std::vector<std::thread> workers_;
    bool stopping_ = false;
};`
            },
            {
                title: "Futures and Result Propagation",
                content: `A scheduler becomes significantly more useful when submitting work can return a future.

The future represents a result that may not exist yet. This creates a clean relationship between asynchronous execution and synchronous consumption.

Exceptions thrown by the task can also be transported through the future instead of disappearing inside the worker thread.

This connects scheduling with the exception-safety principles of production application architecture.`
            },
            {
                title: "Task Dependencies",
                content: `Real systems frequently contain dependency graphs.

For example, loading an asset may depend on reading a file, parsing the file and constructing runtime objects. These operations can form a directed acyclic graph.

A scheduler can represent each node with a dependency counter. When the counter reaches zero, the task becomes eligible for execution.

This turns the scheduler from a simple thread pool into a small execution engine.`
            }
        ]
    },

    {
        title: "C++ Memory Architecture and Object Lifetime",
        sections: [
            {
                title: "Storage and Lifetime Are Different",
                content: `Memory existing at an address does not automatically mean a C++ object exists there.

Storage is a region of memory. Object lifetime begins when an object is created according to the language rules and ends when its lifetime is terminated.

This distinction becomes important when using placement construction, custom allocators, unions, arenas and low-level data structures.

Many difficult C++ bugs come from confusing an address with a valid object.`
            },
            {
                title: "Alignment",
                content: `Every type has an alignment requirement.

Allocators must return storage suitable for the object being created. An allocator that works for int may fail for a type with stronger alignment.

std::align, alignof and aligned allocation facilities provide the language-level tools required to reason about this.`,
                code: `#include <cstddef>
#include <iostream>

struct alignas(64) CacheLineValue {
    int value;
};

int main() {
    std::cout << alignof(int) << '\\n';
    std::cout << alignof(CacheLineValue) << '\\n';
}`
            },
            {
                title: "Placement Construction",
                content: `Placement construction allows an object to be created inside already allocated storage.

The operation is useful when an allocator controls storage separately from object construction.

However, manually managing lifetime means the programmer becomes responsible for destruction and correct reuse of the storage.`,
                code: `#include <cstddef>
#include <memory>
#include <new>

struct Connection {
    int id;

    explicit Connection(int value)
        : id(value) {}

    ~Connection() {}
};

int main() {
    alignas(Connection)
    std::byte storage[sizeof(Connection)];

    Connection* connection =
        std::construct_at(
            reinterpret_cast<Connection*>(storage),
            42
        );

    std::destroy_at(connection);
}`
            },
            {
                title: "Object Representation",
                content: `Every object has an object representation made from bytes, but not every sequence of bytes is a valid representation of every type.

This distinction matters when serializing memory, hashing structures, implementing binary protocols or inspecting data for debugging.

Portable serialization should normally operate on defined fields rather than blindly writing arbitrary object memory to disk.

Padding bytes, endianness, pointer values and implementation-defined representations can make raw memory formats non-portable.`
            },
            {
                title: "Lifetime as an Architectural Tool",
                content: `Lifetime should be designed at the architecture level.

A request arena can contain temporary parsing objects. A cache can own objects until eviction. A runtime can own services until shutdown.

When lifetimes correspond to real system boundaries, cleanup becomes simpler and ownership becomes easier to verify.

This is one of the strongest connections between low-level C++ and high-level architecture: good lifetime design removes entire categories of bugs.`
            }
        ]
    },

    {
        title: "Designing a Production-Style C++ Application",
        sections: [
            {
                title: "From Prototype to Architecture",
                content: `A prototype usually starts with one executable and a few files. A production application needs boundaries.

The goal is not to create dozens of directories simply to look professional. Each boundary should represent a responsibility.

A practical architecture might contain application logic, infrastructure, domain objects and platform-facing components.

Dependencies should point in predictable directions. Low-level platform code should not leak into every business component.`
            },
            {
                title: "Configuration",
                content: `Configuration should be loaded once and transformed into a validated representation.

The rest of the application should not repeatedly parse environment variables or configuration files.

A configuration object can therefore become an immutable input to the runtime.`,
                code: `#include <string>

struct Config {
    std::string host = "127.0.0.1";
    unsigned short port = 8080;
    unsigned workers = 4;
};

class ConfigLoader {
public:
    Config load() const {
        Config config;

        if (config.port == 0) {
            throw std::runtime_error("invalid port");
        }

        if (config.workers == 0) {
            throw std::runtime_error("workers must be positive");
        }

        return config;
    }
};`
            },
            {
                title: "Logging as Infrastructure",
                content: `Logging is infrastructure because application code should not need to know where messages are stored.

A logger can later be connected to stdout, files, rotating logs or a structured logging backend without changing the business logic.

The interface should expose useful semantic operations while keeping formatting and output concerns outside the application.`
            },
            {
                title: "Error Boundaries",
                content: `Not every error should be handled at the point where it occurs.

A low-level component should provide enough information for a higher layer to decide whether an operation can be retried, ignored, converted into a user-facing error or treated as fatal.

Exceptions, error codes and expected-value style results are all tools. The architecture determines where each belongs.

The important property is that errors should not disappear silently.`
            },
            {
                title: "Application Composition",
                content: `Composition is where the previously discussed systems connect.

The runtime owns infrastructure. Configuration describes how the application should operate. Services receive explicit dependencies. The scheduler executes work. Logging records important events.

This produces a system where the main function mostly constructs the application instead of containing its business logic.`,
                code: `#include <iostream>

class Logger {
public:
    void info(const char* message) {
        std::cout << "[info] " << message << '\\n';
    }
};

class Application {
public:
    explicit Application(Logger& logger)
        : logger_(logger) {}

    int run() {
        logger_.info("application initialized");
        logger_.info("application running");
        return 0;
    }

private:
    Logger& logger_;
};

int main() {
    Logger logger;
    Application application(logger);

    return application.run();
}`
            },
            {
                title: "Testing the Architecture",
                content: `A well-designed application is easier to test because its components have explicit boundaries.

A parser can be tested without starting the complete application. A scheduler can be tested with deterministic tasks. Configuration validation can be tested without touching unrelated services.

Tests should verify behavior and contracts rather than internal implementation details.

The architecture therefore affects not only production code but also the cost and quality of verification.`
            }
        ]
    },

    {
        title: "Building a C++ Networking Stack",
        sections: [
            {
                title: "Networking as Layers",
                content: `Networking becomes easier to reason about when divided into layers.

A socket provides transport access. A connection layer manages lifetime. A framing layer determines where messages begin and end. Serialization converts structured values into bytes. The application protocol defines what those messages mean.

Keeping these responsibilities separate allows each layer to evolve without rewriting the entire stack.`
            },
            {
                title: "Byte Buffers",
                content: `Networking code should not constantly allocate temporary strings.

A reusable byte buffer can store received data, allow partial messages to remain in memory and expose views into complete frames.

This is where the memory architecture discussed earlier becomes directly useful.`,
                code: `#include <cstddef>
#include <vector>

class ByteBuffer {
public:
    void append(const std::byte* data, std::size_t size) {
        storage_.insert(storage_.end(), data, data + size);
    }

    const std::byte* data() const {
        return storage_.data();
    }

    std::size_t size() const {
        return storage_.size();
    }

    void consume(std::size_t count) {
        if (count >= storage_.size()) {
            storage_.clear();
            return;
        }

        storage_.erase(
            storage_.begin(),
            storage_.begin() + static_cast<std::ptrdiff_t>(count)
        );
    }

private:
    std::vector<std::byte> storage_;
};`
            },
            {
                title: "Message Framing",
                content: `TCP is a byte stream rather than a message protocol.

A send operation does not guarantee that the receiver gets the same boundaries. One message may arrive in several reads, while several messages may arrive in one read.

A framing protocol solves this by encoding enough information to determine the size of each message.

A common design uses a fixed-size length prefix followed by the payload.`,
                code: `#include <cstdint>
#include <vector>

std::vector<std::byte> encode_frame(
    const std::vector<std::byte>& payload
) {
    const std::uint32_t size =
        static_cast<std::uint32_t>(payload.size());

    std::vector<std::byte> frame;
    frame.resize(sizeof(size) + payload.size());

    std::memcpy(frame.data(), &size, sizeof(size));

    std::memcpy(
        frame.data() + sizeof(size),
        payload.data(),
        payload.size()
    );

    return frame;
}`
            },
            {
                title: "Serialization and Portability",
                content: `A network protocol cannot assume that the remote machine uses the same object representation.

Integer width, byte order, padding and floating-point representation must be considered.

A protocol should define its representation explicitly.

This is another direct connection with object representation: network serialization is not simply copying arbitrary C++ objects into a socket.`
            },
            {
                title: "Connection Lifetime",
                content: `A connection owns resources such as a socket, receive buffers and protocol state.

Its lifetime should be explicit and deterministic.

RAII is particularly effective here because closing the connection becomes part of object destruction. The rest of the application can then reason about a Connection object instead of manually remembering every cleanup operation.`,
                code: `#include <utility>

class Connection {
public:
    explicit Connection(int socket)
        : socket_(socket) {}

    Connection(const Connection&) = delete;
    Connection& operator=(const Connection&) = delete;

    Connection(Connection&& other) noexcept
        : socket_(std::exchange(other.socket_, -1)) {}

    ~Connection() {
        close();
    }

    void close() noexcept {
        if (socket_ != -1) {
            shutdown_socket(socket_);
            socket_ = -1;
        }
    }

private:
    static void shutdown_socket(int) noexcept {}

    int socket_;
};`
            },
            {
                title: "Asynchronous Networking Architecture",
                content: `Once networking is connected to the task scheduler, the architecture becomes asynchronous.

Socket events produce work. The scheduler executes protocol processing. Completed operations produce outgoing messages.

The key is to prevent socket callbacks from directly modifying unrelated application state.

Instead, events should cross explicit queues or task boundaries. This connects networking, concurrency, scheduling, memory management and application architecture into one coherent design.

At this point the individual C++ language features are no longer isolated tricks. They form a system: RAII controls lifetime, allocators control storage, tasks control execution, serialization controls representation and architectural boundaries control dependencies.`
            }
        ]
    }
];

if (typeof topics4 !== "undefined" && Array.isArray(topics4)) {
    topics4.push.apply(topics4, topics7);
}
