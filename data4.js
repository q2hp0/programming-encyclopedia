var topics4 = [
    {
        id: "modern-cpp",
        title: "Modern C++ and the Evolution of the Language",
        sections: [
            {
                title: "From C++11 to modern C++",
                content: `
Modern C++ is not simply older C++ with additional syntax. The language has gradually moved toward safer ownership, stronger type systems, generic programming, expressive algorithms and abstractions that allow the compiler to enforce more of the programmer's intent.

C++11 introduced major changes such as move semantics, smart pointers, lambda expressions, range-based for loops, constexpr, variadic templates, type inference with auto, nullptr and concurrency primitives.

C++14 refined constexpr and generic programming.

C++17 introduced structured bindings, if constexpr, std::optional, std::variant, std::any, filesystem and parallel algorithms.

C++20 introduced concepts, ranges, coroutines, modules, three-way comparison and synchronization improvements.

C++23 continued this direction with additions to ranges, std::expected, multidimensional views, stacktrace support on implementations that provide it, and many library improvements.

The important point is that modern C++ development is about combining these features rather than learning them independently.

For example, a modern function might combine:

template<typename T>
requires std::ranges::input_range<T>
auto process(T&& values) {
    return std::forward<T>(values)
        | std::views::transform(...)
        | std::views::filter(...);
}

This style expresses the constraints, ownership model and data transformation directly in the type system.

Modern C++ therefore encourages a different question:

"What guarantees can the type system and standard library provide before runtime?"

Instead of manually checking everything at runtime, a good API can encode requirements into types, concepts, ownership and interfaces.
`
            },
            {
                title: "Choosing modern features without turning code into syntax",
                content: `
Modern C++ contains an enormous number of language features. Using all of them is not the goal.

A mature codebase chooses features based on the problem.

Use auto when the type is obvious from the initializer or when spelling the type would add noise.

Use constexpr when compile-time evaluation provides a meaningful benefit.

Use concepts when a generic interface has meaningful requirements.

Use ranges when a pipeline is clearer than a collection of manual loops.

Use smart pointers when dynamic ownership is required.

Use exceptions or expected-style error handling according to the project's error model.

Use coroutines when asynchronous or generator-style control flow benefits from suspended execution.

Avoid using a feature simply because it is new.

A technically impressive implementation can still be a poor design if readers need to understand five unrelated language mechanisms before understanding the business logic.

Modern C++ should reduce accidental complexity, not replace old complexity with fashionable syntax.

One useful approach is to establish a project-wide vocabulary.

For example:

- values are preferred by default
- references represent borrowing
- unique_ptr represents exclusive dynamic ownership
- shared_ptr is reserved for genuine shared ownership
- concepts describe generic constraints
- exceptions represent exceptional failures
- expected represents recoverable result-or-error operations
- ranges describe transformations over sequences

When a project follows consistent rules, individual language features become easier to understand.
`
            }
        ]
    },

    {
        id: "coroutines",
        title: "Coroutines and Asynchronous C++",
        sections: [
            {
                title: "How coroutines change control flow",
                content: `
A coroutine is a function whose execution can be suspended and resumed.

Normal function execution follows a simple model:

call
execute
return

A coroutine can instead behave like:

start
execute
suspend
resume
execute
suspend
resume
finish

This is useful for generators, asynchronous operations, event loops and state machines.

The C++ coroutine machinery is intentionally low-level. The language provides the mechanism, while libraries and frameworks define the higher-level meaning.

A coroutine can use co_await, co_yield or co_return.

A generator-like abstraction can conceptually behave as:

Generator<int> numbers() {
    for (int i = 0; i < 10; ++i) {
        co_yield i;
    }
}

The caller can consume values one at a time without requiring the coroutine to construct the entire sequence in advance.

This is especially useful when producing values is expensive or when values arrive over time.

Asynchronous programming uses co_await to suspend until an operation becomes ready.

The important architectural idea is that suspension does not necessarily mean blocking the operating-system thread.

A coroutine can give control back to an event loop while waiting for I/O.

This makes it possible to write asynchronous logic in a sequential-looking style.
`
            },
            {
                title: "Coroutine lifetime and ownership",
                content: `
Coroutine lifetime is one of the most important concepts to understand.

A coroutine frame can contain local variables that must remain alive across suspension points.

That means:

auto operation() -> Task {
    Resource resource;

    co_await something();

    use(resource);
}

resource must survive while the coroutine is suspended.

The coroutine frame therefore becomes part of the lifetime model.

This creates design questions:

Who owns the coroutine?

Who destroys the coroutine frame?

What happens when cancellation occurs?

What happens if an exception is thrown?

What happens if the awaited operation never completes?

A poorly designed coroutine system can introduce lifetime bugs that are difficult to debug.

Cancellation is particularly important.

An asynchronous operation should have a defined answer to:

"How does the caller stop waiting for this operation?"

Modern C++ libraries can use cancellation tokens and cooperative cancellation models.

The cancellation operation should be safe even when the coroutine is currently suspended.

The deeper lesson is that coroutines do not remove concurrency complexity. They change how control flow is represented.

A good coroutine abstraction hides the low-level coroutine machinery while making ownership, cancellation and failure behavior explicit.
`
            }
        ]
    },

    {
        id: "memory-model",
        title: "Memory Model, Object Representation and Undefined Behavior",
        sections: [
            {
                title: "Objects, bytes, representation and lifetime",
                content: `
C++ programs operate at several conceptual levels simultaneously.

At the language level there are objects and values.

At the machine level there are bytes and memory addresses.

The language defines rules connecting the two.

An object has a lifetime. Before its lifetime begins or after it ends, accessing it as if it were still a live object can be invalid.

This matters for custom allocators, placement construction, unions, serialization, memory pools and low-level libraries.

For example:

void* storage = operator new(sizeof(int));

int* value = new (storage) int(42);

The allocation provides raw storage. The placement construction begins the lifetime of an int inside that storage.

Eventually:

value->~int();

is conceptually about ending the object's lifetime, although scalar destruction has special language treatment and the exact syntax depends on the type.

These details matter when implementing containers and allocators.

Object representation is also important.

std::memcpy can copy the representation of certain trivially copyable objects, but that does not mean every arbitrary object can be safely serialized by dumping its bytes.

Problems can include:

padding bytes
endianness
pointer values
virtual table representation
implementation-defined layout
different compiler ABIs

Portable serialization therefore normally requires an explicit format rather than blindly copying object memory.
`
            },
            {
                title: "Undefined behavior as a design boundary",
                content: `
Undefined behavior is not merely a runtime error category.

It changes what the compiler is allowed to assume.

Examples include:

reading outside an array
dereferencing an invalid pointer
using an object after its lifetime
signed integer overflow
data races
invalid shifts
violating alignment requirements

When undefined behavior occurs, the standard does not define the resulting program behavior.

The compiler can optimize under the assumption that valid executions do not contain such operations.

This is why code that appears to work in a debug build may fail under optimization.

Tools are therefore critical:

AddressSanitizer
UndefinedBehaviorSanitizer
ThreadSanitizer
MemorySanitizer
static analyzers
compiler warnings

Warnings should also be treated as part of the development process.

A serious project commonly enables aggressive warning sets and turns important warnings into errors.

The goal is not to silence warnings.

The goal is to make suspicious behavior visible as early as possible.
`
            }
        ]
    },

    {
        id: "allocators-memory-resources",
        title: "Allocators, Memory Resources and Custom Memory Management",
        sections: [
            {
                title: "Why custom allocation exists",
                content: `
General-purpose allocation is designed to support many different workloads.

A large application may have specialized allocation patterns that benefit from a custom strategy.

Examples include:

many short-lived objects
fixed-size objects
temporary frame data
parser nodes
network buffers
game entities
compiler intermediate structures
request-scoped allocations

Allocating every small object independently can create overhead and fragmentation.

A memory arena can allocate a large region and then satisfy many smaller allocations from it.

Conceptually:

Arena
    -> object
    -> object
    -> object
    -> object

When the whole group is no longer needed, the arena can release the region at once.

This is extremely useful when object lifetimes have a common boundary.

The C++ standard library provides polymorphic memory resources through <memory_resource>.

For example:

std::pmr::monotonic_buffer_resource resource;

std::pmr::vector<int> values(&resource);

The container can obtain its memory from the supplied resource.

This creates a separation between container logic and allocation strategy.
`
            },
            {
                title: "Monotonic resources, pools and lifetime design",
                content: `
A monotonic resource is useful when allocations remain valid until the resource itself is released.

It can make allocation extremely cheap because individual deallocation is generally unnecessary.

This is ideal for phase-based workloads:

parse document
build temporary structures
use structures
discard entire phase

But it is inappropriate when individual objects must live and die independently over long periods.

Pool resources are useful for repeated allocations of similar objects.

The important design question is:

"What is the lifetime shape of my data?"

If objects share a lifetime boundary, an arena may be appropriate.

If objects have independent lifetimes, a pool or general allocator may be more appropriate.

Custom allocators should not be introduced solely because allocation sounds slow.

Measure allocation behavior first.

A custom allocator increases implementation complexity, testing requirements and failure modes.

It becomes worthwhile when the workload has a clear allocation pattern and measurements demonstrate that allocation behavior matters.
`
            }
        ]
    },

    {
        id: "serialization",
        title: "Serialization, Binary Formats and Data Representation",
        sections: [
            {
                title: "Designing a serialization format",
                content: `
Serialization converts program state into a representation that can be stored or transmitted.

A serious serialization format must answer:

How are values represented?

How are strings encoded?

How are integers encoded?

How is byte order defined?

How are optional fields represented?

How are version changes handled?

What happens when fields are unknown?

How are corrupted messages detected?

Simply writing a C++ object to a file is usually not a portable serialization strategy.

For example:

file.write(reinterpret_cast<const char*>(&object), sizeof(object));

may fail across architectures or compiler implementations.

Pointers become meaningless after the process exits.

Padding can differ.

Endianness can differ.

Class layout can change.

Virtual table pointers cannot be persisted meaningfully.

A real format should describe its data independently of the compiler's internal representation.

Text formats such as JSON are easy to inspect and debug.

Binary formats can be smaller and faster but require stricter specifications.

The correct choice depends on:

human readability
bandwidth
storage
speed
compatibility
security
schema evolution
`
            },
            {
                title: "Versioning and backward compatibility",
                content: `
A format that works today can become a maintenance problem when the program evolves.

Suppose version one contains:

id
name

Version two adds:

email

Old readers may not know about email.

A robust format should define what happens when unknown fields appear.

Similarly, new readers may encounter old data where email does not exist.

This requires default behavior.

Schema evolution should therefore be considered from the beginning for persistent data.

Version numbers can help:

format_version = 3

But a version number alone does not define compatibility.

The format should specify which changes are backward compatible and which require migration.

A mature serialization layer separates the wire format from internal C++ classes.

This allows internal classes to evolve without forcing the external format to change every time an implementation detail changes.
`
            }
        ]
    },

    {
        id: "networking",
        title: "Networking and Systems Programming in C++",
        sections: [
            {
                title: "Networking as a state machine",
                content: `
Network programming is fundamentally about asynchronous state.

A connection can be:

disconnected
connecting
connected
sending
receiving
closing
failed

The program must correctly handle transitions between these states.

A TCP connection does not guarantee that one send corresponds to one receive.

A message may be split:

send:
HELLO WORLD

receive:
HEL

then:

LO WORLD

Therefore application protocols need framing.

A length-prefixed message might use:

[length][payload]

or a delimiter-based protocol might use:

header
body
separator

The receiver must buffer incomplete data until a complete message is available.

This is one of the most common mistakes in beginner networking code: treating TCP as a message protocol.

TCP provides an ordered byte stream.

The application defines messages on top of that stream.
`
            },
            {
                title: "Timeouts, retries, backpressure and failure",
                content: `
Network operations fail normally.

Connections can disappear.

Packets can be delayed.

Servers can become overloaded.

DNS can fail.

A production network client therefore needs explicit policies for:

timeouts
retries
connection limits
buffer limits
cancellation
authentication
validation
logging

Retries can also make failures worse.

If a server is overloaded and thousands of clients immediately retry, the retry storm can increase the load.

Backoff strategies reduce this effect.

Backpressure is another important concept.

If a producer generates data faster than a consumer can process it, the system must eventually choose between:

buffering
dropping
blocking
slowing the producer
rejecting new work

An unbounded queue is not automatically a solution.

It can simply move the failure into memory consumption.

Good network architecture treats failure and overload as normal states rather than exceptional impossibilities.
`
            }
        ]
    },

    {
        id: "build-systems",
        title: "CMake, Build Systems, Dependencies and Reproducible Builds",
        sections: [
            {
                title: "Understanding the build graph",
                content: `
A large C++ project is fundamentally a dependency graph.

Executable A depends on library B.

Library B depends on library C.

Tests depend on the libraries they validate.

The build system must represent these relationships.

CMake targets are useful because dependencies can be expressed at the target level.

A library can expose:

public dependencies
private dependencies
interface compile definitions
include directories
compile features

This is better than globally adding include directories and compiler flags because the dependency relationship remains visible.

For example:

target_link_libraries(app
    PRIVATE
    core
)

means app depends on core.

A library can expose only the headers and definitions that consumers actually need.

This helps keep large projects maintainable.
`
            },
            {
                title: "Reproducible builds and dependency management",
                content: `
A build should ideally produce predictable results from a known source state.

Important variables include:

compiler version
standard library
operating system
architecture
build flags
third-party dependencies
generator
linker

If dependencies silently change, two developers can compile the same source and obtain different results.

Locking dependency versions can improve reproducibility.

CI should build from a clean environment rather than relying on files left over from previous local builds.

A serious project can have separate configurations for:

debug
release
sanitizers
tests
coverage
static analysis

The build system should make these configurations explicit.

Dependency management is also part of security.

Every external dependency expands the trusted codebase.

Projects should know:

where dependencies come from
which versions are used
which licenses apply
whether updates are available
whether known vulnerabilities affect them

A clean build system therefore contributes to both engineering quality and project security.
`
            }
        ]
    },

    {
        id: "design-patterns",
        title: "C++ Design Patterns and Practical Problem Solving",
        sections: [
            {
                title: "Patterns as solutions to recurring problems",
                content: `
Design patterns are not classes that should be copied mechanically.

A pattern describes a recurring relationship between responsibilities.

Common patterns in C++ include:

Factory
Strategy
Observer
Command
Adapter
Decorator
State
Visitor
Pimpl
Dependency Injection

The important question is always:

"What problem does this pattern solve?"

For example, Strategy can separate an algorithm from the object that uses it.

Suppose an application supports multiple compression algorithms.

Instead of putting every algorithm into one huge class:

class Compressor {
    if (...) ...
    else if (...) ...
    else if (...) ...
};

a strategy boundary can separate them.

But a strategy interface introduces abstraction and potentially dynamic dispatch.

If there are only two fixed algorithms and performance is critical, a template-based solution or variant-based design may be simpler.

Patterns therefore have costs.

A pattern is valuable when the problem it solves is larger than the complexity it introduces.
`
            },
            {
                title: "Avoiding the giant class and giant manager problem",
                content: `
Large projects often accumulate classes such as:

ApplicationManager
SystemManager
DataManager
NetworkManager
EverythingManager

These classes become responsible for unrelated operations.

A useful diagnostic is to inspect why a class changes.

If one class changes because of:

network protocol changes
database changes
UI changes
logging changes
configuration changes

then it likely has too many responsibilities.

The solution is not automatically to split it into twenty classes.

Instead identify coherent responsibilities and boundaries.

A good component should have a clear answer to:

What does this component own?

What does it know?

What does it expose?

What does it not control?

What can replace it?

What invariants does it maintain?

These questions produce architecture that is easier to test and evolve.
`
            }
        ]
    },

    {
        id: "cpp-security",
        title: "C++ Security, Defensive Programming and Safe Systems Design",
        sections: [
            {
                title: "Memory safety and input validation",
                content: `
C++ gives direct access to memory and system resources, so defensive programming is important.

External input should be treated as untrusted.

That includes:

files
network messages
environment variables
command-line arguments
configuration
IPC messages
user-provided strings

Never assume that a length field is correct.

For a binary message:

[length][payload]

the receiver should verify:

length is representable
length is within configured limits
enough bytes are available
the allocation is reasonable
the resulting operation is valid

Without limits, a malicious or corrupted input can cause enormous allocations or excessive processing.

Integer arithmetic should also be checked when calculating sizes.

For example:

if (count > std::numeric_limits<std::size_t>::max() / sizeof(Item)) {
    throw std::overflow_error("size overflow");
}

This prevents multiplication from wrapping around before allocation.

Security in C++ is therefore strongly connected to ordinary correctness.

Bounds checks, lifetime correctness, initialization and validation are not optional polish. They define the safety boundary of the program.
`
            },
            {
                title: "Reducing attack surface through architecture",
                content: `
A program becomes easier to secure when components have limited responsibilities and privileges.

A parser should not need unrestricted filesystem access.

A network layer should not directly control unrelated application state.

A configuration loader should validate input before handing it to the rest of the application.

Least privilege can be applied inside a program's architecture.

Another useful principle is minimizing dangerous interfaces.

Instead of exposing:

char* get_internal_buffer();

prefer an interface that communicates its actual contract.

std::span<std::byte> buffer();

The exact type does not magically make a program safe, but explicit interfaces make assumptions visible.

Security reviews should examine:

input boundaries
memory ownership
serialization
authentication
authorization
file access
process execution
logging
temporary files
dependency supply chain
error handling

A secure design is usually easier to maintain because it makes dangerous assumptions explicit.
`
            }
        ]
    }
];

for (var i = 0; i < topics4.length; i++) {
    topics.push(topics4[i]);
}
