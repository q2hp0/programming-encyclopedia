var topics5 = [
    {
        title: "Value Categories, References and Perfect Forwarding",
        sections: [
            {
                title: "Why value categories exist",
                content: `C++ does not treat every expression as the same kind of value.

An expression can represent an object that has a persistent identity, or it can represent a temporary result that can be moved from or consumed.

The main categories are lvalue, xvalue and prvalue.

An lvalue identifies an object that exists somewhere in storage.

A prvalue primarily represents a value that can be used to initialize another object or produce a temporary result.

An xvalue identifies an object whose resources can be reused.

These categories become important when overload resolution, references, move semantics and template deduction are involved.

Understanding them explains why a function taking T& behaves differently from one taking T&&.

It also explains why std::move does not actually move an object by itself.

std::move is essentially a cast that allows an expression to be treated as an expiring value. The selected move constructor or move assignment operator performs the actual resource transfer.`
            },
            {
                title: "Lvalue and rvalue references",
                content: `An lvalue reference normally binds to an existing named object.

An rvalue reference can bind to a temporary or an object explicitly converted into an xvalue.

References allow APIs to express ownership-independent access without copying objects.

For example, a function receiving const std::string& can inspect a string without copying it.

A function receiving std::string&& can indicate that it may consume the resources of the supplied object.

This distinction is particularly useful for classes containing dynamically allocated resources.`,
                code: `void inspect(const std::string& value) {
    std::cout << value << '\\n';
}

void consume(std::string&& value) {
    std::string local = std::move(value);
}

std::string name = "alice";

inspect(name);
inspect("temporary");

consume(std::move(name));`
            },
            {
                title: "Perfect forwarding",
                content: `Perfect forwarding is used when a function template receives an argument and passes it to another function while preserving its original value category.

This is important for generic factories, wrappers, containers and forwarding constructors.

A forwarding reference is written as T&& when T is deduced.

std::forward<T> conditionally converts the parameter back into the value category that the caller originally supplied.

Without forwarding, a named reference parameter is itself an lvalue expression even when the caller supplied an rvalue.

This can accidentally select a copy operation instead of a move operation.`,
                code: `template <typename T>
void wrapper(T&& value) {
    process(std::forward<T>(value));
}

std::string name = "alice";

wrapper(name);
wrapper(std::move(name));`
            },
            {
                title: "Practical design rules",
                content: `Perfect forwarding should not be added simply because a function template can use it.

Use it when an abstraction genuinely needs to preserve the caller's value category.

For ordinary APIs, passing small types by value or larger read-only objects by const reference is often clearer.

Forwarding constructors require particular care because an unconstrained forwarding constructor can interfere with copy and move constructors.

Generic interfaces should also use concepts or constraints when the accepted operations need to be restricted.

The important design goal is not maximum use of forwarding. The goal is preserving the semantics that the API actually needs.`
            }
        ]
    },

    {
        title: "Type Erasure and Runtime Polymorphism Without Inheritance",
        sections: [
            {
                title: "The problem type erasure solves",
                content: `Traditional runtime polymorphism usually requires a common base class and virtual functions.

That model works well when the participating types are designed around the same interface.

Sometimes that assumption is undesirable.

A library may need to store unrelated types as long as they provide a particular operation.

Type erasure separates the interface from the concrete implementation.

The caller interacts with a small erased interface while the implementation stores the actual object and knows how to invoke the required operations.

std::function is a familiar example.

It can store a function pointer, lambda, function object or another callable type even though those concrete types are completely different.`
            },
            {
                title: "Building a simple erased callable",
                content: `A basic type-erased wrapper can store an arbitrary callable behind a common invocation mechanism.

The implementation commonly contains an abstract operation layer and a concrete model containing the original type.

The exact implementation can vary depending on allocation strategy, exception guarantees and ownership requirements.`,
                code: `class Callable {
    struct Concept {
        virtual ~Concept() = default;
        virtual void call() = 0;
    };

    template <typename T>
    struct Model : Concept {
        T value;

        explicit Model(T v) : value(std::move(v)) {}

        void call() override {
            value();
        }
    };

    std::unique_ptr<Concept> object;

public:
    template <typename T>
    Callable(T value)
        : object(std::make_unique<Model<T>>(std::move(value))) {}

    void operator()() {
        object->call();
    }
};

Callable task([] {
    std::cout << "running\\n";
});

task();`
            },
            {
                title: "When type erasure is useful",
                content: `Type erasure is useful when the concrete type should not become part of the public API.

It is common in plugin systems, callback registries, GUI event systems, dependency injection, task schedulers and heterogeneous collections.

The trade-off is that runtime polymorphism introduces indirection and can require dynamic allocation.

Small-buffer optimization can reduce allocations by storing small objects directly inside the wrapper.

The design should therefore consider object size, lifetime, copying, allocation behavior and exception safety rather than treating type erasure as automatically superior to inheritance.`
            }
        ]
    },

    {
        title: "SFINAE, Detection and Compile-Time Interface Design",
        sections: [
            {
                title: "What SFINAE actually means",
                content: `SFINAE means Substitution Failure Is Not An Error.

During template substitution, a candidate can become invalid because the supplied type does not satisfy the required expression.

Instead of producing a hard compilation error, the candidate can simply be removed from overload resolution.

This mechanism historically powered many advanced generic programming techniques.

Modern C++ concepts provide a clearer interface for many of these cases, but understanding SFINAE remains important when reading older libraries and template-heavy code.`
            },
            {
                title: "Detecting whether an operation exists",
                content: `A type can be tested at compile time by attempting to form an expression involving that type.

The result can then be represented as a compile-time boolean.`,
                code: `template <typename T, typename = void>
struct has_size : std::false_type {};

template <typename T>
struct has_size<T, std::void_t<
    decltype(std::declval<T>().size())
>> : std::true_type {};

static_assert(has_size<std::vector<int>>::value);
static_assert(!has_size<int>::value);`
            },
            {
                title: "Replacing detection with concepts",
                content: `Concepts express the intended interface directly and usually produce much clearer diagnostics.

Instead of constructing a complicated substitution mechanism, a constraint can state exactly which expression must be valid.`,
                code: `template <typename T>
concept Sized = requires(const T& value) {
    value.size();
};

template <Sized T>
auto size_of(const T& value) {
    return value.size();
}

std::vector<int> values;
auto count = size_of(values);`
            },
            {
                title: "Choosing between SFINAE and concepts",
                content: `For new C++20 and later code, concepts should normally be preferred when they express the required interface naturally.

SFINAE remains relevant for compatibility with older language standards and for understanding existing template libraries.

A good generic API should constrain templates close to their interface boundary.

This makes invalid uses fail early and produces diagnostics that explain the actual requirement rather than exposing several layers of template implementation details.`
            }
        ]
    },

    {
        title: "Object Model, ABI and Virtual Dispatch",
        sections: [
            {
                title: "How polymorphic objects are represented",
                content: `A class containing virtual functions normally requires runtime information that allows a call to select the correct implementation.

A common implementation uses a virtual table and a hidden pointer inside each polymorphic object.

The C++ standard specifies the language behavior but does not require a particular vtable layout.

Compiler ABI conventions define how these details are represented in a particular environment.

This distinction matters when building shared libraries or communicating between independently compiled components.`
            },
            {
                title: "Virtual dispatch",
                content: `When a virtual function is called through a base reference or pointer, the selected implementation can depend on the dynamic type of the object.

The compiler can sometimes devirtualize the call when it can prove which implementation will execute.

However, generic polymorphic calls may require an indirect lookup and branch.`,
                code: `struct Shape {
    virtual ~Shape() = default;
    virtual double area() const = 0;
};

struct Circle : Shape {
    double radius;

    double area() const override {
        return 3.141592653589793 * radius * radius;
    }
};

void print_area(const Shape& shape) {
    std::cout << shape.area() << '\\n';
}

Circle circle{2.0};
print_area(circle);`
            },
            {
                title: "ABI stability",
                content: `A public C++ library interface can depend on compiler ABI details.

Changing virtual functions, data members, compiler settings or standard library assumptions can affect binary compatibility.

This is why large libraries sometimes expose a stable C-compatible boundary or use techniques such as the Pimpl idiom.

The Pimpl pattern moves implementation details away from the public class layout.

That can reduce recompilation and help preserve binary compatibility when internal implementation details change.`
            }
        ]
    },

    {
        title: "Undefined Behavior and Object Representation",
        sections: [
            {
                title: "Why undefined behavior matters",
                content: `Undefined behavior means that the C++ standard places no requirements on what happens when a program performs a prohibited operation.

The compiler is therefore allowed to assume that valid programs do not execute that operation.

This can affect optimization in ways that are surprising when code is tested only with one compiler or one build configuration.

Undefined behavior is not simply another kind of runtime error.

The optimizer can use the absence of undefined behavior as a mathematical assumption when transforming the program.`
            },
            {
                title: "Object lifetime and valid access",
                content: `Memory existing at an address does not automatically mean that an object of every possible type can be accessed there.

C++ has rules governing object lifetime, alignment, storage duration and permitted access through different types.

Violating these rules can produce undefined behavior even when the generated machine instructions appear to work.`,
                code: `struct Data {
    int value;
};

alignas(Data) std::byte storage[sizeof(Data)];

Data* object = new (storage) Data{42};

std::cout << object->value << '\\n';

object->~Data();`
            },
            {
                title: "Strict aliasing and representation",
                content: `Optimizers rely on rules describing which objects may be accessed through which types.

For low-level code, byte-oriented access through char, unsigned char or std::byte has special importance for examining object representation.

Serialization code must still distinguish between inspecting bytes and treating arbitrary bytes as an object of another type.

memcpy or carefully designed serialization routines are often safer than pointer reinterpretation.`
            },
            {
                title: "Practical defensive strategy",
                content: `Low-level code should make object lifetime explicit.

Sanitizers can detect many classes of memory errors, although they cannot prove that a program contains no undefined behavior.

Compiler warnings, static analysis, assertions and focused tests should be combined with a clear ownership model.

When writing code close to the language and machine representation, correctness should be established from the C++ rules rather than from whether a particular compiler happens to produce the expected assembly.`
            }
        ]
    },

    {
        title: "Cache Locality and Data-Oriented Design",
        sections: [
            {
                title: "Why memory layout affects performance",
                content: `Modern processors are substantially faster at operating on data already present in nearby cache than at waiting for data from main memory.

Two algorithms with similar computational complexity can therefore have very different performance characteristics.

A data structure that performs fewer cache misses can outperform a structure that performs fewer arithmetic operations.

Performance engineering should therefore consider how data is laid out and accessed, not only the number of instructions in the algorithm.`
            },
            {
                title: "Array of structures versus structure of arrays",
                content: `An array of structures stores all fields of each object together.

A structure of arrays stores each field in a separate contiguous array.

The better representation depends on the operations performed.

If an algorithm processes only one field across millions of objects, a structure of arrays can avoid loading unrelated fields into the cache.`,
                code: `struct Particle {
    float x;
    float y;
    float velocity;
};

std::vector<Particle> particles;

for (auto& particle : particles) {
    particle.x += particle.velocity;
}

std::vector<float> x;
std::vector<float> velocity;

for (std::size_t i = 0; i < x.size(); ++i) {
    x[i] += velocity[i];
}`
            },
            {
                title: "Measuring instead of guessing",
                content: `Data-oriented design should be guided by measurements.

Use a profiler to determine where time is actually being spent.

Useful measurements include cache misses, branch behavior, allocation frequency, memory bandwidth and CPU utilization.

A theoretically cache-friendly layout can still be slower if it makes the algorithm more complicated or causes expensive conversions elsewhere.

The correct approach is to establish a baseline, change the representation, measure the result and verify that the improvement matters for the real workload.`
            }
        ]
    },

    {
        title: "Compile-Time Programming and constexpr Architecture",
        sections: [
            {
                title: "Moving work from runtime to compilation",
                content: `constexpr allows functions and expressions to participate in constant evaluation when their inputs and operations satisfy the language requirements.

This can move validation, lookup construction and mathematical computation away from runtime.

The goal is not to make everything constexpr.

Compile-time computation is useful when the required information is known during compilation and when the resulting design is clearer or more efficient.`
            },
            {
                title: "Compile-time algorithms",
                content: `A constexpr function can be evaluated during compilation when called with constant expressions.

This can be used to construct lookup tables, validate configuration values and calculate constants.`,
                code: `constexpr unsigned factorial(unsigned value) {
    unsigned result = 1;

    for (unsigned i = 2; i <= value; ++i) {
        result *= i;
    }

    return result;
}

static_assert(factorial(5) == 120);

constexpr auto value = factorial(10);`
            },
            {
                title: "consteval and guaranteed compile-time execution",
                content: `consteval is stronger than constexpr.

A consteval function must be evaluated at compile time when it is called.

This is useful when runtime execution would indicate a programming error or when an API is explicitly designed around compile-time values.

For example, compile-time parsers can validate literals and configuration strings before the program is produced.

The resulting design can provide stronger guarantees than runtime validation, but compile-time computation also increases compiler workload and can make diagnostics more complex.`
            }
        ]
    },

    {
        title: "Exception Safety and Transactional Resource Management",
        sections: [
            {
                title: "The exception safety guarantees",
                content: `Exception-safe C++ code is commonly described using several guarantees.

The no-throw guarantee means an operation does not allow exceptions to escape.

The strong guarantee means that if an operation fails, observable program state remains unchanged.

The basic guarantee means invariants remain valid and resources are not leaked, although state may have changed.

The weakest designs may provide no meaningful guarantee and can leave objects partially modified.

These guarantees help developers reason about what happens when an operation fails halfway through.`
            },
            {
                title: "RAII as the foundation",
                content: `RAII connects resource lifetime to object lifetime.

When an object leaves scope because of normal execution or an exception, its destructor releases the resource.

This allows code to remain correct even when control flow exits unexpectedly.`,
                code: `void process_file(const std::filesystem::path& path) {
    std::ifstream file(path);

    if (!file) {
        throw std::runtime_error("failed to open file");
    }

    std::string line;

    while (std::getline(file, line)) {
        process(line);
    }
}`
            },
            {
                title: "Designing operations with the strong guarantee",
                content: `The strong guarantee can often be achieved by constructing new state first and committing it only after all operations succeed.

This resembles a transaction.

For example, a container-like object can build a replacement representation and then swap it into place.

If construction fails, the original representation remains untouched.

Copy-and-swap is one historical example of this strategy, although modern move semantics and carefully designed operations often provide more efficient alternatives.`
            }
        ]
    },

    {
        title: "Plugin Architecture and Dynamic Libraries",
        sections: [
            {
                title: "Separating applications from extensions",
                content: `A plugin architecture allows functionality to be implemented separately from the main executable.

The application defines a boundary that plugins must satisfy.

At runtime the application loads a shared library and obtains entry points from it.

This architecture is useful for optional features, tools, editors, media systems and applications that need third-party extensions.`
            },
            {
                title: "Designing the plugin boundary",
                content: `A plugin boundary should expose as little implementation detail as possible.

Passing C++ standard library objects directly across independently built modules can create ABI and runtime-library compatibility concerns.

A narrow C-compatible interface is often easier to keep stable.

Ownership rules must also be explicit.

The module that allocates memory should generally provide the operation that releases it, unless both sides are guaranteed to use a compatible allocation model.`,
                code: `extern "C" {

struct PluginApi {
    int version;
    void (*initialize)();
    void (*shutdown)();
};

PluginApi* plugin_get_api();

}`
            },
            {
                title: "Versioning and failure handling",
                content: `A production plugin system should validate the plugin version before using the interface.

The loader should handle missing libraries, missing symbols, incompatible versions and initialization failures.

Plugin boundaries should also define whether exceptions are allowed to cross the boundary.

A robust architecture treats a plugin as an independently failing component rather than assuming that loading a library guarantees that every operation will succeed.`
            }
        ]
    },

    {
        title: "Custom Allocators, Pools and Memory Strategies",
        sections: [
            {
                title: "Why custom allocation exists",
                content: `General-purpose allocation is designed to support many different allocation patterns.

Applications sometimes have predictable allocation behavior that can be handled more efficiently with a specialized strategy.

Examples include frame allocators, object pools, arenas and monotonic allocation.

The purpose is usually not simply making malloc faster.

Custom allocation can provide predictable lifetime, reduce fragmentation, improve locality or make ownership easier to model.`
            },
            {
                title: "A simple arena model",
                content: `An arena reserves a region of memory and satisfies allocations from that region.

Individual objects do not normally need to be freed separately.

The entire arena can be discarded when the group of objects is no longer needed.`,
                code: `class Arena {
    std::vector<std::byte> storage;
    std::size_t offset = 0;

public:
    explicit Arena(std::size_t size)
        : storage(size) {}

    void* allocate(std::size_t size, std::size_t alignment) {
        std::size_t aligned =
            (offset + alignment - 1) & ~(alignment - 1);

        if (aligned + size > storage.size()) {
            throw std::bad_alloc();
        }

        void* result = storage.data() + aligned;
        offset = aligned + size;

        return result;
    }
};`
            },
            {
                title: "std::pmr and allocator-aware design",
                content: `The polymorphic memory resource facilities in C++ provide a standardized way to separate containers from the strategy used to allocate their memory.

A container can use a memory_resource supplied by the application.

This is useful when a subsystem needs a particular allocation policy without rewriting the container itself.`,
                code: `std::array<std::byte, 4096> buffer;

std::pmr::monotonic_buffer_resource resource(
    buffer.data(),
    buffer.size()
);

std::pmr::vector<int> values(&resource);

values.push_back(10);
values.push_back(20);
values.push_back(30);`
            }
        ]
    },

    {
        title: "Binary Serialization and Portable Data Formats",
        sections: [
            {
                title: "Why raw memory is not a portable format",
                content: `Writing an arbitrary C++ object directly to disk does not automatically produce a portable serialization format.

Object representation can depend on padding, alignment, byte order, type sizes and implementation details.

Pointers are addresses, not persistent identifiers.

Virtual tables and other implementation details are also not suitable as portable serialized state.

A real binary format should define its representation explicitly.`
            },
            {
                title: "Explicit serialization",
                content: `A serialization routine should write fields according to the format specification instead of copying the entire object representation.`,
                code: `void write_u32(std::ostream& out, std::uint32_t value) {
    std::byte bytes[4]{
        std::byte(value >> 24),
        std::byte(value >> 16),
        std::byte(value >> 8),
        std::byte(value)
    };

    out.write(
        reinterpret_cast<const char*>(bytes),
        sizeof(bytes)
    );
}

void write_header(std::ostream& out) {
    write_u32(out, 1);
    write_u32(out, 2026);
}`
            },
            {
                title: "Versioning and compatibility",
                content: `A serious binary format needs a versioning strategy.

Readers should know which version they are decoding.

Optional fields, reserved fields and migration rules allow a format to evolve without breaking every existing file.

Validation is also essential.

A parser must reject invalid lengths, impossible values and truncated input before allocating memory or interpreting data.

Serialization is therefore both a data representation problem and a security boundary.`
            }
        ]
    }
];

if (typeof topics4 !== "undefined") {
    topics4 = topics4.concat(topics5);
} else {
    var topics4 = topics5;
}
