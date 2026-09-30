var rustTopics = [
    {
        title: "Ownership, Borrowing and Lifetimes",
        sections: [
            {
                title: "Ownership as a Resource Model",
                content: "Rust treats ownership as part of the type system. Every value has an owner, moving transfers ownership, and the compiler verifies that resources are released exactly once. This model replaces large classes of manual lifetime bugs with compile-time rules.",
                code: `fn main() {
    let data = String::from("hello");
    let moved = data;

    println!("{moved}");
}`
            },
            {
                title: "Borrowing and Aliasing",
                content: "A shared reference permits multiple readers, while a mutable reference requires exclusive access. The important idea is not simply that Rust has references, but that aliasing and mutation are controlled together.",
                code: `fn update(value: &mut String) {
    value.push_str(" world");
}

fn main() {
    let mut text = String::from("hello");
    update(&mut text);
    println!("{text}");
}`
            },
            {
                title: "Lifetime Relationships",
                content: "Lifetimes describe relationships between references rather than extending an object's lifetime. Explicit lifetime parameters become useful when a function returns a reference whose validity depends on one of its inputs.",
                code: `fn longer<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() {
        a
    } else {
        b
    }
}`
            },
            {
                title: "Designing APIs Around Ownership",
                content: "Good Rust APIs make ownership boundaries explicit. Accept borrowed data when the function does not need ownership, consume values when ownership is required, and return owned values when the result must outlive its inputs."
            }
        ]
    },
    {
        title: "Traits, Generics and Type-Level Design",
        sections: [
            {
                title: "Traits as Contracts",
                content: "Traits describe capabilities rather than inheritance relationships. They allow algorithms to depend on behavior while keeping concrete implementations independent.",
                code: `trait Serialize {
    fn serialize(&self) -> Vec<u8>;
}

struct User {
    id: u64,
}

impl Serialize for User {
    fn serialize(&self) -> Vec<u8> {
        self.id.to_le_bytes().to_vec()
    }
}`
            },
            {
                title: "Generic Algorithms",
                content: "Generic code is specialized for concrete types by the compiler. This makes it possible to express reusable algorithms without paying for a runtime abstraction when static dispatch is appropriate.",
                code: `fn max_value<T: Ord>(a: T, b: T) -> T {
    if a > b { a } else { b }
}`
            },
            {
                title: "Associated Types",
                content: "Associated types connect a trait implementation with a specific related type. They are particularly useful for iterators, parsers, storage layers and protocol abstractions.",
                code: `trait Storage {
    type Item;

    fn get(&self, key: u64) -> Option<Self::Item>;
}`
            },
            {
                title: "Designing Trait-Based Architectures",
                content: "A large Rust system can use traits as boundaries between infrastructure and application logic. The difficult part is deciding which behavior belongs behind a trait and which behavior should remain statically typed."
            }
        ]
    },
    {
        title: "Unsafe Rust and Raw Memory",
        sections: [
            {
                title: "Why Unsafe Rust Exists",
                content: "Unsafe Rust allows operations that the compiler cannot prove safe, including raw pointer dereferencing, calling unsafe functions and implementing unsafe traits. Unsafe does not disable Rust's type system; it creates a boundary where the programmer assumes additional proof obligations.",
                code: `unsafe fn read_raw(ptr: *const u32) -> u32 {
    *ptr
}`
            },
            {
                title: "Raw Pointers",
                content: "Raw pointers do not carry Rust's borrowing guarantees. They are useful for FFI, custom memory structures and low-level systems work, but dereferencing them requires an unsafe block.",
                code: `fn main() {
    let value = 42u32;
    let ptr = &value as *const u32;

    unsafe {
        println!("{}", *ptr);
    }
}`
            },
            {
                title: "Creating Safe Abstractions",
                content: "The strongest use of unsafe Rust is to place a small unsafe implementation behind a safe public interface. The unsafe region becomes a contained implementation detail whose invariants can be tested and documented.",
                code: `pub struct Buffer {
    ptr: *mut u8,
    len: usize,
}

impl Buffer {
    pub fn len(&self) -> usize {
        self.len
    }
}`
            },
            {
                title: "Unsafe Invariants",
                content: "Every unsafe abstraction should define its invariants: pointer validity, alignment, initialized memory, ownership, aliasing and destruction rules. These invariants form the real safety contract."
            }
        ]
    },
    {
        title: "Memory Layout and Data Representation",
        sections: [
            {
                title: "Stack, Heap and Layout",
                content: "Rust values can have different representations depending on their type. Understanding layout matters when building allocators, FFI interfaces, binary protocols and high-performance data structures.",
                code: `#[repr(C)]
struct Header {
    version: u32,
    length: u32,
    flags: u16,
}`
            },
            {
                title: "repr and ABI Boundaries",
                content: "The default Rust representation is optimized for the compiler's needs. repr(C) is useful when a structure must follow a C-compatible representation across an FFI boundary.",
                code: `#[repr(C)]
pub struct Packet {
    pub id: u64,
    pub size: u32,
}`
            },
            {
                title: "Slices and Fat Pointers",
                content: "A slice reference carries both a pointer and length. Trait objects similarly carry information needed for dynamic dispatch. These representations become important when reasoning about memory layout and FFI."
            },
            {
                title: "Data-Oriented Rust",
                content: "High-performance Rust systems can organize data around access patterns rather than object hierarchies. Structures of arrays, compact indices and contiguous storage can improve cache behavior and reduce pointer chasing."
            }
        ]
    },
    {
        title: "Send, Sync and Concurrent Ownership",
        sections: [
            {
                title: "The Concurrency Type System",
                content: "Rust uses Send and Sync to express whether values can safely cross thread boundaries or be shared between threads. These traits connect concurrency guarantees directly to the type system.",
                code: `use std::thread;

fn main() {
    let value = String::from("worker");

    let handle = thread::spawn(move || {
        println!("{value}");
    });

    handle.join().unwrap();
}`
            },
            {
                title: "Arc and Shared Ownership",
                content: "Arc provides reference-counted shared ownership suitable for concurrent systems. It solves ownership transfer between threads, but it does not by itself make mutable access safe.",
                code: `use std::sync::Arc;
use std::thread;

fn main() {
    let data = Arc::new(vec![1, 2, 3]);
    let shared = Arc::clone(&data);

    thread::spawn(move || {
        println!("{}", shared.len());
    }).join().unwrap();
}`
            },
            {
                title: "Mutex and Interior Mutability",
                content: "Synchronization primitives provide controlled mutation behind shared ownership. The design question is often whether a lock is actually required or whether the data can be partitioned so threads own independent regions."
            },
            {
                title: "Designing Thread Lifetimes",
                content: "Thread lifetime should be part of the architecture. Workers need explicit shutdown, ownership of queues, error propagation and a deterministic join strategy rather than being treated as unmanaged background processes."
            }
        ]
    },
    {
        title: "Atomics and Lock-Free Programming",
        sections: [
            {
                title: "Atomic State",
                content: "Atomic operations allow threads to modify shared values without a traditional mutex. Correct lock-free design depends on choosing an appropriate memory ordering and proving the algorithm's invariants.",
                code: `use std::sync::atomic::{AtomicU64, Ordering};

static REQUESTS: AtomicU64 = AtomicU64::new(0);

fn record_request() {
    REQUESTS.fetch_add(1, Ordering::Relaxed);
}`
            },
            {
                title: "Memory Ordering",
                content: "Relaxed, acquire, release and sequentially consistent operations provide different synchronization guarantees. The correct ordering depends on what relationship between memory operations the algorithm requires."
            },
            {
                title: "Compare-and-Swap",
                content: "Compare-and-swap operations can implement state machines and lock-free structures. The loop must account for contention, spurious failure where applicable, and the possibility that another thread changed the state.",
                code: `use std::sync::atomic::{AtomicUsize, Ordering};

fn increment(value: &AtomicUsize) {
    let mut current = value.load(Ordering::Relaxed);

    loop {
        match value.compare_exchange_weak(
            current,
            current + 1,
            Ordering::AcqRel,
            Ordering::Relaxed,
        ) {
            Ok(_) => break,
            Err(next) => current = next,
        }
    }
}`
            },
            {
                title: "When Lock-Free Is Worth It",
                content: "Lock-free structures are difficult to prove and maintain. They become interesting when contention and latency requirements justify the additional complexity, especially in queues, schedulers and high-throughput runtimes."
            }
        ]
    },
    {
        title: "Async Rust and Runtime Architecture",
        sections: [
            {
                title: "Future as a State Machine",
                content: "An async function does not simply create another thread. It creates a future representing suspended computation that an executor can poll until completion.",
                code: `async fn load_data() -> String {
    String::from("data")
}

async fn application() {
    let value = load_data().await;
    println!("{value}");
}`
            },
            {
                title: "Executors and Wakers",
                content: "An executor repeatedly polls futures and uses wakers to know when suspended work may make progress. Building an executor requires coordinating task storage, readiness notification and worker scheduling."
            },
            {
                title: "Building a Minimal Executor",
                content: "A learning executor can store tasks in a queue, poll them, and requeue pending tasks through a waker. The interesting design problem is safely connecting the waker to the scheduler.",
                code: `use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

fn poll_task<F: Future>(
    future: Pin<&mut F>,
    context: &mut Context<'_>,
) -> Poll<F::Output> {
    future.poll(context)
}`
            },
            {
                title: "Async Architecture",
                content: "A production runtime needs cancellation, timers, IO readiness, task ownership, backpressure, worker coordination and shutdown semantics. Async syntax is only the surface of the architecture."
            }
        ]
    },
    {
        title: "Pin, Unpin and Self-Referential State",
        sections: [
            {
                title: "Why Pin Exists",
                content: "Some values must not move after initialization because internal references or asynchronous state machines depend on stable addresses. Pin provides an API-level guarantee that a value will not be moved through the pinned interface."
            },
            {
                title: "Pinning a Future",
                content: "Executors commonly poll futures through Pin because compiler-generated async state machines can contain self-referential relationships after transformation.",
                code: `use std::future::Future;
use std::pin::Pin;

fn poll_once<F: Future>(
    future: Pin<&mut F>,
) {
    let _ = future;
}`
            },
            {
                title: "Unpin",
                content: "Unpin means a type does not require pinning to maintain its invariants. Many ordinary types implement Unpin automatically, while some state machines do not."
            },
            {
                title: "Designing Pin-Based APIs",
                content: "Pin becomes much easier to reason about when APIs expose only the operations required by the invariant. The goal is not to pin everything, but to prevent invalid moves where address stability matters."
            }
        ]
    },
    {
        title: "Zero-Cost Abstractions",
        sections: [
            {
                title: "Abstraction Without Runtime Tax",
                content: "Rust's generics, enums, iterators and traits with static dispatch can express high-level designs that compile down to specialized machine code. The abstraction is primarily visible during compilation rather than execution."
            },
            {
                title: "Iterator Pipelines",
                content: "Iterator combinators can describe transformations without manually managing indexing and temporary collections. The compiler can specialize the chain when the abstraction permits it.",
                code: `let total: u64 = (1..=1_000_000)
    .filter(|value| value % 2 == 0)
    .map(|value| value * value)
    .sum();`
            },
            {
                title: "Static Dispatch",
                content: "Generic functions normally use monomorphization, producing specialized versions for concrete types. This can enable inlining and optimization while increasing binary size in some designs."
            },
            {
                title: "Choosing Abstraction Boundaries",
                content: "Zero-cost does not mean free in every dimension. Compile time, binary size, cache behavior and generated code all matter. A good architecture considers the complete cost model."
            }
        ]
    },
    {
        title: "Procedural Macros and Compile-Time Programming",
        sections: [
            {
                title: "Macros as Code Generation",
                content: "Rust macros operate at compile time and can generate repetitive implementations or domain-specific syntax. Declarative macros match syntax patterns, while procedural macros can inspect and transform token streams."
            },
            {
                title: "Declarative Macros",
                content: "macro_rules! can express reusable syntax transformations without runtime overhead.",
                code: `macro_rules! make_pair {
    ($a:expr, $b:expr) => {
        ($a, $b)
    };
}

fn main() {
    let pair = make_pair!(10, 20);
    println!("{pair:?}");
}`
            },
            {
                title: "Derive Systems",
                content: "Custom derive macros can generate trait implementations from a type declaration. This is useful for serialization, command-line parsing, database mappings and reflection-like infrastructure."
            },
            {
                title: "Compile-Time Architecture",
                content: "A mature Rust project can move repetitive validation and code generation into compilation. The challenge is keeping generated behavior understandable, debuggable and compatible with normal tooling."
            }
        ]
    },
    {
        title: "FFI and C/C++ Interoperability",
        sections: [
            {
                title: "C ABI Boundaries",
                content: "Rust can expose and consume C-compatible functions and data structures. The boundary requires explicit attention to ownership, layout, nullability, allocation and error representation.",
                code: `#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}`
            },
            {
                title: "repr(C) Data",
                content: "Types crossing an FFI boundary should use representations whose layout is appropriate for the foreign ABI. Ownership must also be explicit: the side that allocates should generally define how the resource is released."
            },
            {
                title: "Calling C++",
                content: "C++ interoperability commonly uses a C-compatible bridge or dedicated binding layer. A stable ABI boundary should minimize assumptions about C++ object layout and compiler-specific behavior."
            },
            {
                title: "Safe FFI Wrappers",
                content: "Unsafe FFI calls can be wrapped in safe Rust types that validate inputs, encode ownership and expose domain-level errors. This keeps unsafe details concentrated at the boundary."
            }
        ]
    },
    {
        title: "Custom Allocators and Memory Pools",
        sections: [
            {
                title: "Allocation Strategy",
                content: "General-purpose allocation is not optimal for every workload. Servers, game engines, parsers and runtimes may benefit from arenas, pools, slabs or object-specific allocation strategies."
            },
            {
                title: "Arena Allocation",
                content: "An arena owns many allocations and releases them together. This can simplify lifetime management and reduce allocator overhead for objects sharing a common lifetime.",
                code: `struct Arena {
    storage: Vec<u8>,
}

impl Arena {
    fn new(capacity: usize) -> Self {
        Self {
            storage: Vec::with_capacity(capacity),
        }
    }
}`
            },
            {
                title: "Pools and Reuse",
                content: "Object pools can reuse storage for frequently created objects. Correct designs must consider initialization, destruction, fragmentation and synchronization between workers."
            },
            {
                title: "Allocator Architecture",
                content: "A serious allocator experiment should measure allocation rate, fragmentation, locality and contention. The interesting problem is matching allocation policy to the application's lifetime and access patterns."
            }
        ]
    },
    {
        title: "Lock-Free Queues and Work Scheduling",
        sections: [
            {
                title: "Queue as a Concurrency Boundary",
                content: "A work queue connects producers and consumers. Its design determines ownership transfer, contention, memory ordering and shutdown behavior."
            },
            {
                title: "Bounded Queues",
                content: "A bounded queue introduces backpressure. Instead of allowing memory usage to grow without limit, producers must respond when the queue reaches capacity."
            },
            {
                title: "Worker Scheduling",
                content: "A scheduler can combine a queue with worker threads, task states and completion handles. More advanced designs use local worker queues and work stealing to reduce contention."
            },
            {
                title: "A Rust Runtime Project",
                content: "A challenging project is a small executor with a bounded task queue, worker pool, timers, cancellation, task priorities and graceful shutdown. Each feature exposes a different ownership and concurrency problem."
            }
        ]
    },
    {
        title: "Building a Systems-Level Rust Application",
        sections: [
            {
                title: "Application Architecture",
                content: "A production-style Rust application should separate configuration, domain logic, infrastructure, IO and application orchestration. Rust's ownership model can make those boundaries explicit."
            },
            {
                title: "Error Architecture",
                content: "Errors should preserve enough context to diagnose failures while remaining useful to callers. Libraries generally expose structured errors while applications decide how to report them.",
                code: `#[derive(Debug)]
enum AppError {
    Config(String),
    Io(std::io::Error),
}

type AppResult<T> = Result<T, AppError>;`
            },
            {
                title: "Configuration and Runtime State",
                content: "Configuration should be parsed once and transformed into validated runtime state. Avoid scattering environment reads and configuration parsing throughout the application."
            },
            {
                title: "Testing the Architecture",
                content: "A serious Rust system should test pure domain logic separately from IO and integration behavior. Property tests, concurrency tests and failure injection become valuable as infrastructure becomes more complex."
            }
        ]
    },
    {
        title: "Compiler and Parser Architecture",
        sections: [
            {
                title: "From Source to Representation",
                content: "A compiler can be understood as a pipeline: lexical analysis, parsing, semantic analysis, intermediate representation, optimization and code generation. Rust itself has a large compiler architecture built around these ideas."
            },
            {
                title: "Building an AST",
                content: "A parser converts source syntax into a structured representation. An AST should preserve the information required by later semantic stages without forcing every stage to understand raw text.",
                code: `enum Expr {
    Number(i64),
    Add(Box<Expr>, Box<Expr>),
    Multiply(Box<Expr>, Box<Expr>),
}`
            },
            {
                title: "Intermediate Representation",
                content: "An intermediate representation creates a boundary between source syntax and machine-level behavior. A useful IR makes transformations explicit and simplifies optimization passes."
            },
            {
                title: "A Complete Compiler Project",
                content: "A strong Rust project idea is a small programming language with a lexer, Pratt parser, typed AST, bytecode compiler, virtual machine, diagnostics and a test suite. This combines ownership, enums, traits, memory management and systems architecture."
            }
        ]
    }
];

var rustData = [];

rustTopics.push(
    {
        title: "Building a Lock-Free Rust Runtime",
        sections: [
            {
                title: "Runtime Architecture",
                content: "A serious runtime combines task representation, scheduling, synchronization, timers and shutdown into one coherent architecture. The central challenge is transferring ownership between workers without introducing unnecessary locks.",
                code: `use std::sync::atomic::{AtomicBool, Ordering};

struct Runtime {
    running: AtomicBool,
}

impl Runtime {
    fn new() -> Self {
        Self {
            running: AtomicBool::new(true),
        }
    }

    fn shutdown(&self) {
        self.running.store(false, Ordering::Release);
    }
}`
            },
            {
                title: "Lock-Free Task State",
                content: "Tasks can represent their lifecycle as an atomic state machine. A task might transition between queued, running, waiting and completed states. Each transition must define which thread owns the next operation."
            },
            {
                title: "Work Stealing",
                content: "A worker-local queue reduces contention because most tasks remain local to their worker. When a worker becomes idle, it can steal work from another worker. This creates a more scalable scheduling architecture than one global queue."
            },
            {
                title: "Wakeups and Backpressure",
                content: "A runtime must decide how sleeping workers are notified and what happens when producers generate work faster than workers can execute it. Backpressure, bounded queues and wakeup coalescing become important for predictable latency."
            },
            {
                title: "Project Extension",
                content: "Extend the runtime with priorities, cancellation, timers, worker-local queues, work stealing and metrics. Then benchmark it against a simple mutex-based executor and analyze throughput, contention and latency."
            }
        ]
    },
    {
        title: "Building a Rust Compiler and Virtual Machine",
        sections: [
            {
                title: "Compiler Pipeline",
                content: "A complete educational compiler can be divided into lexer, parser, AST, semantic analysis, intermediate representation, bytecode generation and virtual machine execution. Rust's enums and pattern matching are particularly useful for representing syntax trees and instructions.",
                code: `enum Expr {
    Number(i64),
    Add(Box<Expr>, Box<Expr>),
    Multiply(Box<Expr>, Box<Expr>),
}

enum Instruction {
    Push(i64),
    Add,
    Multiply,
    Halt,
}`
            },
            {
                title: "Parser Design",
                content: "A Pratt parser is a strong project for expression-heavy languages because operator precedence can be represented directly through binding powers. The parser converts source text into structured syntax instead of executing text directly."
            },
            {
                title: "Bytecode Generation",
                content: "The compiler can translate the AST into a compact instruction stream. This introduces an important architectural boundary: parsing concerns disappear from the virtual machine and execution operates only on bytecode."
            },
            {
                title: "Virtual Machine",
                content: "A stack-based VM maintains an instruction pointer and operand stack. More advanced implementations can add function calls, local variables, heap objects, garbage collection and optimized dispatch."
            },
            {
                title: "Project Extension",
                content: "Turn the project into a complete language with modules, functions, closures, a type checker, diagnostics, bytecode serialization and a debugger. This becomes a substantial Rust systems project combining parsing, memory management and runtime design."
            }
        ]
    }
);

const rustAdvancedExtra = [
    {
        title: "Rust Type System Architecture",
        description: "A deep study of Rust's type system, inference, trait resolution, associated types, GATs, trait objects and type-level design.",
        sections: [
            {
                title: "Type Inference and Constraints",
                text: "Rust's type inference works by collecting constraints between expressions, variables, generic parameters and trait requirements. The compiler then resolves those constraints to determine concrete types.",
                code: `fn choose<T>(a: T, b: T) -> T {
    a
}

fn main() {
    let value = choose(10u32, 20u32);
    println!("{value}");
}`,
                details: [
                    "Type information propagates through expressions and function calls.",
                    "Generic functions introduce type variables resolved from their use sites.",
                    "Trait bounds add additional constraints that must be satisfied.",
                    "Explicit annotations are useful when inference has multiple possible solutions."
                ]
            },
            {
                title: "Associated Types and GATs",
                text: "Associated types allow a trait implementation to define a type naturally coupled to the implementing type. Generic associated types extend this model by allowing associated types to depend on lifetimes or other generic parameters.",
                code: `trait LendingIterator {
    type Item<'a>
    where
        Self: 'a;

    fn next<'a>(&'a mut self) -> Option<Self::Item<'a>>;
}

struct Numbers {
    values: Vec<u32>,
}

impl LendingIterator for Numbers {
    type Item<'a> = &'a u32
    where
        Self: 'a;

    fn next<'a>(&'a mut self) -> Option<Self::Item<'a>> {
        self.values.first()
    }
}`,
                details: [
                    "GATs allow associated types to have their own generic parameters.",
                    "Lifetime-aware associated types can express borrowing relationships in APIs.",
                    "They are useful for lending iterators and zero-copy abstractions.",
                    "Public APIs using GATs require careful lifetime and object-safety design."
                ]
            },
            {
                title: "Trait Objects and Dynamic Dispatch",
                text: "Trait objects provide runtime polymorphism through dyn-compatible traits. Dynamic dispatch allows different concrete implementations to be handled through one interface while moving method selection to runtime.",
                code: `trait Processor {
    fn process(&self, value: u32) -> u32;
}

struct Doubler;

impl Processor for Doubler {
    fn process(&self, value: u32) -> u32 {
        value * 2
    }
}

fn run(processor: &dyn Processor) {
    println!("{}", processor.process(21));
}

fn main() {
    let processor = Doubler;
    run(&processor);
}`,
                details: [
                    "dyn Trait hides the concrete implementing type behind a trait interface.",
                    "The compiler checks whether the trait can be used as a trait object.",
                    "Trait objects are useful for heterogeneous runtime behavior.",
                    "Generics and trait objects provide different forms of polymorphism and different tradeoffs."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/reference/items/associated-items.html",
            "https://doc.rust-lang.org/reference/types/trait-object.html",
            "https://doc.rust-lang.org/book/ch10-02-traits.html",
            "https://doc.rust-lang.org/reference/type-system.html"
        ]
    },

    {
        title: "Rust Memory Model and Aliasing",
        description: "How Rust represents memory, controls aliasing, handles interior mutability and connects safe abstractions to the underlying machine.",
        sections: [
            {
                title: "Stack, Heap and Ownership",
                text: "Rust does not require garbage collection because ownership and destruction are determined statically. Values with known fixed layouts can live directly on the stack while dynamically sized allocations are commonly stored on the heap.",
                code: `struct Buffer {
    data: Vec<u8>,
}

fn create_buffer() -> Buffer {
    Buffer {
        data: vec![1, 2, 3, 4],
    }
}

fn main() {
    let buffer = create_buffer();
    println!("{}", buffer.data.len());
}`,
                details: [
                    "Ownership determines which value is responsible for destruction.",
                    "Move semantics transfer ownership without automatically copying heap allocations.",
                    "Heap allocation is explicit through types such as Vec, String and Box.",
                    "Drop provides deterministic destruction when an owning value leaves its scope."
                ]
            },
            {
                title: "Aliasing and Mutable References",
                text: "Rust's reference rules are designed around the principle that mutable access must be exclusive while shared access may be duplicated. These rules allow the compiler to reason about memory without a garbage collector.",
                code: `fn update(value: &mut u32) {
    *value += 1;
}

fn main() {
    let mut value = 10;
    update(&mut value);
    println!("{value}");
}`,
                details: [
                    "Multiple immutable references can coexist.",
                    "A mutable reference requires exclusive access during its lifetime.",
                    "The borrow checker tracks these relationships statically.",
                    "These guarantees allow aggressive compiler optimizations while preventing many classes of memory bugs."
                ]
            },
            {
                title: "Interior Mutability",
                text: "Interior mutability allows mutation through a shared reference when the type provides a controlled runtime mechanism for enforcing borrowing rules.",
                code: `use std::cell::RefCell;

fn main() {
    let value = RefCell::new(10);

    {
        let mut borrowed = value.borrow_mut();
        *borrowed += 5;
    }

    println!("{}", value.borrow());
}`,
                details: [
                    "RefCell performs borrow checking at runtime.",
                    "Cell provides smaller copy-oriented interior mutability.",
                    "Mutex and RwLock extend similar ideas to multithreaded programs.",
                    "Interior mutability is useful when static borrowing alone cannot express the required design."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html",
            "https://doc.rust-lang.org/reference/behavior-considered-undefined.html",
            "https://doc.rust-lang.org/nomicon/aliasing.html",
            "https://doc.rust-lang.org/std/cell/"
        ]
    },

    {
        title: "Advanced Rust Concurrency Architecture",
        description: "Threads, synchronization, channels, atomics and architectural patterns for building concurrent Rust systems.",
        sections: [
            {
                title: "Threads and Ownership Transfer",
                text: "Rust threads integrate ownership checking directly into concurrency APIs. Values moved into a spawned thread must satisfy the ownership and lifetime requirements needed by the thread model.",
                code: `use std::thread;

fn main() {
    let value = String::from("hello");

    let handle = thread::spawn(move || {
        println!("{value}");
    });

    handle.join().unwrap();
}`,
                details: [
                    "move closures transfer captured ownership into the spawned task.",
                    "Thread APIs require values crossing thread boundaries to satisfy the appropriate safety guarantees.",
                    "Join handles provide synchronization with completed threads.",
                    "Ownership prevents accidental concurrent destruction or unsynchronized access."
                ]
            },
            {
                title: "Arc, Mutex and RwLock",
                text: "Shared mutable state can be built from reference counting combined with synchronization primitives. Arc provides shared ownership while Mutex and RwLock control access to the underlying data.",
                code: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = Vec::new();

    for _ in 0..4 {
        let counter = Arc::clone(&counter);

        handles.push(thread::spawn(move || {
            let mut value = counter.lock().unwrap();
            *value += 1;
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("{}", counter.lock().unwrap());
}`,
                details: [
                    "Arc provides atomic reference counting for shared ownership.",
                    "Mutex provides exclusive synchronized access.",
                    "RwLock allows multiple readers or one writer.",
                    "Lock scope should be kept small to reduce contention and deadlock risk."
                ]
            },
            {
                title: "Message Passing and Work Distribution",
                text: "Channels provide a communication-oriented alternative to shared mutable state. A producer can send work while consumers process messages independently.",
                code: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        for value in 1..=5 {
            tx.send(value).unwrap();
        }
    });

    for value in rx {
        println!("received {value}");
    }
}`,
                details: [
                    "Channels separate communication from direct memory sharing.",
                    "Bounded channels can provide backpressure.",
                    "Multiple workers can consume independent units of work.",
                    "Message passing can simplify ownership compared with shared-state designs."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/book/ch16-00-concurrency.html",
            "https://doc.rust-lang.org/std/sync/",
            "https://doc.rust-lang.org/nomicon/send-and-sync.html"
        ]
    },

    {
        title: "Rust Async Runtime Internals",
        description: "A deep look at futures, executors, wakers, polling and the architecture behind asynchronous Rust.",
        sections: [
            {
                title: "Future and Poll",
                text: "An async Rust function is compiled into a state machine implementing Future. Polling advances that state machine until it produces a value or reports that it is not ready.",
                code: `use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

struct ReadyValue;

impl Future for ReadyValue {
    type Output = u32;

    fn poll(
        self: Pin<&mut Self>,
        _cx: &mut Context<'_>,
    ) -> Poll<Self::Output> {
        Poll::Ready(42)
    }
}`,
                details: [
                    "Future represents a computation that may complete later.",
                    "Poll::Pending means the future cannot make progress immediately.",
                    "Poll::Ready contains the completed result.",
                    "The executor is responsible for repeatedly polling tasks when progress may be possible."
                ]
            },
            {
                title: "Wakers and Task Scheduling",
                text: "A future returning Pending must arrange for its task to be awakened when external progress becomes possible. Wakers connect asynchronous events to executor scheduling.",
                code: `use std::task::Waker;

fn wake_task(waker: &Waker) {
    waker.wake_by_ref();
}`,
                details: [
                    "Wakers notify executors that a task should be polled again.",
                    "I/O runtimes connect operating-system readiness events to task wakeups.",
                    "A correct async primitive must arrange wakeups whenever a Pending future can make progress.",
                    "Poor wakeup design can cause stalled tasks or unnecessary polling."
                ]
            },
            {
                title: "Building an Executor",
                text: "A minimal executor maintains tasks, polls ready tasks and reacts to wakeups. Production runtimes additionally integrate timers, I/O drivers, work stealing, synchronization and cancellation.",
                code: `struct Task {
    future: std::pin::Pin<Box<dyn std::future::Future<Output = ()>>>,
}

struct Executor {
    tasks: Vec<Task>,
}`,
                details: [
                    "Executors own and schedule asynchronous tasks.",
                    "Task queues determine which futures are polled next.",
                    "Wakers provide the bridge between futures and scheduling.",
                    "Runtime architecture determines latency, throughput and resource usage."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/book/ch17-00-async-await.html",
            "https://rust-lang.github.io/async-book/02_execution/01_chapter.html",
            "https://doc.rust-lang.org/std/future/trait.Future.html",
            "https://doc.rust-lang.org/std/task/"
        ]
    },

    {
        title: "Rust FFI and ABI Engineering",
        description: "Designing safe boundaries between Rust and C or C++ systems through ABI control, raw pointers, ownership and wrapper APIs.",
        sections: [
            {
                title: "C ABI Functions",
                text: "Rust can expose functions using an external ABI such as C. This creates a binary interface that other languages and native systems can call when the function signature is compatible with the selected ABI.",
                code: `#[unsafe(no_mangle)]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}`,
                details: [
                    "extern C selects the C calling convention.",
                    "no_mangle prevents normal Rust symbol-name mangling.",
                    "FFI boundaries must use representations understood by both sides.",
                    "Rust-specific abstractions should normally remain behind a stable wrapper."
                ]
            },
            {
                title: "Raw Pointers and Ownership",
                text: "Raw pointers allow Rust to interact with memory managed outside Rust's ownership system. Dereferencing them is unsafe because the compiler cannot prove that the pointer is valid.",
                code: `#[unsafe(no_mangle)]
pub unsafe extern "C" fn increment(value: *mut i32) {
    if !value.is_null() {
        *value += 1;
    }
}`,
                details: [
                    "Raw pointers do not carry Rust's normal borrowing guarantees.",
                    "Null checks alone do not prove pointer validity.",
                    "The foreign side must follow the ownership and lifetime contract defined by the API.",
                    "Unsafe operations should be isolated behind small audited interfaces."
                ]
            },
            {
                title: "Safe FFI Wrappers",
                text: "A good FFI design isolates unsafe operations and exposes a safe Rust API whenever the foreign contract can be represented with enforceable invariants.",
                code: `pub struct NativeBuffer {
    ptr: *mut u8,
    len: usize,
}

impl NativeBuffer {
    pub fn len(&self) -> usize {
        self.len
    }
}`,
                details: [
                    "Safe wrappers should encode ownership and lifetime rules.",
                    "Drop implementations can release foreign resources deterministically.",
                    "Opaque handles can hide foreign implementation details.",
                    "FFI documentation should clearly define who allocates and who frees each resource."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/nomicon/ffi.html",
            "https://doc.rust-lang.org/reference/items/external-blocks.html",
            "https://doc.rust-lang.org/reference/abi.html",
            "https://doc.rust-lang.org/std/primitive.pointer.html"
        ]
    },

    {
        title: "Rust Compiler and Code Generation Pipeline",
        description: "How Rust source code moves through parsing, analysis, MIR, borrow checking, monomorphization and machine-code generation.",
        sections: [
            {
                title: "Parsing and High-Level Representation",
                text: "The compiler first parses Rust source into an abstract syntax representation. Later compiler phases progressively transform and analyze that representation before lowering it toward executable code.",
                code: `fn square(value: u32) -> u32 {
    value * value
}`,
                details: [
                    "Parsing transforms source text into structured syntax.",
                    "Name resolution connects identifiers to declarations.",
                    "Type checking establishes semantic relationships.",
                    "Later representations become increasingly suitable for compiler analysis and optimization."
                ]
            },
            {
                title: "MIR and Borrow Checking",
                text: "Rust's Mid-level Intermediate Representation provides a simplified representation used by important analyses including borrow checking. MIR makes control flow and storage behavior explicit enough for compiler reasoning.",
                code: `fn move_value() {
    let first = String::from("rust");
    let second = first;
    println!("{second}");
}`,
                details: [
                    "MIR represents control flow in a form suitable for analysis.",
                    "Borrow checking reasons about references, moves and lifetimes.",
                    "Storage and drop behavior become explicit compiler concepts.",
                    "MIR also enables later compiler analyses and transformations."
                ]
            },
            {
                title: "Monomorphization and LLVM",
                text: "Generic Rust code is commonly specialized for concrete types during code generation. The resulting representation can then be optimized by LLVM before machine code is emitted.",
                code: `fn identity<T>(value: T) -> T {
    value
}

fn main() {
    let a = identity(10u32);
    let b = identity(20u64);

    println!("{a} {b}");
}`,
                details: [
                    "Generic functions can produce specialized machine-code instances.",
                    "Monomorphization enables static dispatch and optimization.",
                    "It can also increase binary size when many concrete instantiations are generated.",
                    "LLVM performs additional optimization and target-specific code generation."
                ]
            }
        ],
        sources: [
            "https://rustc-dev-guide.rust-lang.org/overview.html",
            "https://rustc-dev-guide.rust-lang.org/mir/index.html",
            "https://rustc-dev-guide.rust-lang.org/borrow_check.html",
            "https://rustc-dev-guide.rust-lang.org/backend/overview.html",
            "https://doc.rust-lang.org/reference/"
        ]
    }
];

rustData.push(...rustAdvancedExtra);

rustData.push(
    {
        title: "Atomic Memory Ordering and Lock-Free Rust",
        description: "A deep study of atomic operations, memory ordering, synchronization and the design of lock-free algorithms in Rust.",
        sections: [
            {
                title: "Atomic Operations",
                text: "Atomic types allow threads to modify shared values without using traditional mutex-based locking. Rust exposes atomic operations through std::sync::atomic and provides explicit control over the ordering guarantees required by an algorithm.",
                code: `use std::sync::atomic::{AtomicUsize, Ordering};

static COUNTER: AtomicUsize = AtomicUsize::new(0);

fn increment() {
    COUNTER.fetch_add(1, Ordering::Relaxed);
}

fn main() {
    increment();
    increment();

    println!("{}", COUNTER.load(Ordering::Relaxed));
}`,
                details: [
                    "Atomic operations are indivisible with respect to other atomic operations on the same object.",
                    "Relaxed ordering provides atomicity without establishing additional synchronization.",
                    "Acquire and Release orderings are commonly used to establish communication between threads.",
                    "Sequentially consistent ordering provides a stronger global ordering at additional conceptual and sometimes hardware cost."
                ]
            },
            {
                title: "Acquire and Release",
                text: "Acquire and Release orderings are fundamental building blocks for concurrent algorithms. A Release operation can publish preceding writes while an Acquire operation can observe those writes after synchronization is established.",
                code: `use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};

static READY: AtomicBool = AtomicBool::new(false);
static VALUE: AtomicUsize = AtomicUsize::new(0);

fn publish() {
    VALUE.store(42, Ordering::Relaxed);
    READY.store(true, Ordering::Release);
}

fn consume() {
    if READY.load(Ordering::Acquire) {
        println!("{}", VALUE.load(Ordering::Relaxed));
    }
}`,
                details: [
                    "Release prevents earlier operations from being reordered after the publishing operation in the relevant memory model.",
                    "Acquire prevents later operations from being moved before the synchronization point.",
                    "The synchronization relationship is established through compatible atomic operations.",
                    "Correct ordering must be derived from the algorithm rather than chosen arbitrarily."
                ]
            },
            {
                title: "Designing Lock-Free Algorithms",
                text: "Lock-free algorithms replace blocking synchronization with atomic state transitions, commonly using compare-and-exchange operations. Correct designs must account for races, visibility, progress guarantees and the ABA problem.",
                code: `use std::sync::atomic::{AtomicUsize, Ordering};

struct Counter {
    value: AtomicUsize,
}

impl Counter {
    fn increment(&self) {
        let mut current = self.value.load(Ordering::Relaxed);

        loop {
            match self.value.compare_exchange_weak(
                current,
                current + 1,
                Ordering::Relaxed,
                Ordering::Relaxed,
            ) {
                Ok(_) => break,
                Err(next) => current = next,
            }
        }
    }
}`,
                details: [
                    "compare_exchange allows algorithms to update state only when an expected value is still current.",
                    "compare_exchange_weak may fail spuriously and is normally used inside retry loops.",
                    "Lock-free does not mean wait-free.",
                    "Memory reclamation becomes a major challenge when lock-free structures contain dynamically allocated nodes."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/std/sync/atomic/",
            "https://doc.rust-lang.org/nomicon/atomics.html",
            "https://doc.rust-lang.org/nomicon/arc-mutex/arc.html"
        ]
    },

    {
        title: "Pin, Unpin and Self-Referential State",
        description: "How Rust prevents unsafe movement of pinned values and how Pin enables futures, intrusive structures and self-referential state machines.",
        sections: [
            {
                title: "Why Pin Exists",
                text: "Some asynchronous state machines and low-level data structures require an object to remain at a stable memory address after internal references or pointers have been established. Pin provides a type-level mechanism for expressing this requirement.",
                code: `use std::marker::PhantomPinned;
use std::pin::Pin;

struct Node {
    value: u32,
    _pin: PhantomPinned,
}

fn create() -> Pin<Box<Node>> {
    Box::pin(Node {
        value: 42,
        _pin: PhantomPinned,
    })
}`,
                details: [
                    "Pin prevents safe code from moving a value when its type does not implement Unpin.",
                    "Pin does not itself allocate memory.",
                    "Box::pin is a common way to allocate and pin a value on the heap.",
                    "The guarantee matters when internal addresses must remain stable."
                ]
            },
            {
                title: "Unpin and Movement",
                text: "Most ordinary Rust types implement Unpin automatically. Such types can still be moved even when accessed through Pin because their correctness does not depend on a stable address.",
                code: `use std::pin::Pin;

fn use_value(value: Pin<&mut u32>) {
    let value = Pin::into_inner(value);
    *value += 1;
}

fn main() {
    let mut number = 10;
    use_value(Pin::new(&mut number));
    println!("{number}");
}`,
                details: [
                    "Unpin means that pinning does not impose additional movement restrictions on the type.",
                    "Primitive values normally implement Unpin.",
                    "Types containing PhantomPinned can opt out of automatic Unpin.",
                    "Unsafe code must preserve the invariants required by Pin."
                ]
            },
            {
                title: "Pinning and Futures",
                text: "The Future trait receives Pin<&mut Self> because compiler-generated async state machines can contain references between internal states. Moving such a state machine after those relationships become active could invalidate those assumptions.",
                code: `use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

fn poll_future<F: Future>(
    future: Pin<&mut F>,
    cx: &mut Context<'_>,
) -> Poll<F::Output> {
    future.poll(cx)
}`,
                details: [
                    "Future::poll takes Pin<&mut Self> rather than &mut Self.",
                    "Async functions compile into state-machine-like futures.",
                    "Executors normally store futures in stable task allocations.",
                    "Pin is an important part of the contract between futures and executors."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/std/pin/",
            "https://doc.rust-lang.org/nomicon/pin.html",
            "https://doc.rust-lang.org/std/future/trait.Future.html",
            "https://rust-lang.github.io/async-book/04_pinning/01_chapter.html"
        ]
    },

    {
        title: "Zero-Cost Abstractions and Monomorphization",
        description: "How Rust turns high-level generic abstractions into efficient machine code through static dispatch, inlining and compile-time specialization.",
        sections: [
            {
                title: "Generic Static Dispatch",
                text: "Rust generics are normally resolved at compile time. The compiler can generate specialized versions of generic functions for concrete types, allowing abstractions to disappear from the runtime representation.",
                code: `fn sum<T>(a: T, b: T) -> T
where
    T: std::ops::Add<Output = T>,
{
    a + b
}

fn main() {
    let a = sum(10u32, 20u32);
    let b = sum(10u64, 20u64);

    println!("{a} {b}");
}`,
                details: [
                    "Static dispatch allows the compiler to know the concrete implementation at compile time.",
                    "Monomorphization generates specialized instances for concrete generic arguments.",
                    "Generic abstractions can therefore have little or no runtime dispatch overhead.",
                    "The tradeoff can be increased compilation time and binary size."
                ]
            },
            {
                title: "Iterator Optimization",
                text: "Rust iterator chains provide a high-level programming model while allowing the compiler to optimize away many intermediate abstractions. This is a practical example of zero-cost abstraction design.",
                code: `fn calculate(values: &[u64]) -> u64 {
    values
        .iter()
        .filter(|value| **value % 2 == 0)
        .map(|value| value * value)
        .sum()
}`,
                details: [
                    "Iterator adapters generally describe transformations rather than allocating intermediate collections.",
                    "Monomorphization exposes concrete iterator types to optimization.",
                    "Inlining can remove function-call boundaries.",
                    "Performance should still be measured because optimization depends on context and compiler decisions."
                ]
            },
            {
                title: "Static Versus Dynamic Polymorphism",
                text: "Generic parameters and trait objects provide different runtime models. Static polymorphism enables specialization and optimization, while dynamic polymorphism provides runtime flexibility through trait objects.",
                code: `trait Operation {
    fn execute(&self, value: u64) -> u64;
}

fn static_run<T: Operation>(op: &T, value: u64) -> u64 {
    op.execute(value)
}

fn dynamic_run(op: &dyn Operation, value: u64) -> u64 {
    op.execute(value)
}`,
                details: [
                    "Generic bounds normally use static dispatch.",
                    "dyn Trait uses dynamic dispatch.",
                    "Static dispatch may increase code generation while dynamic dispatch can reduce duplicated code.",
                    "API design should consider extensibility, binary size, performance and object-safety requirements."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/book/ch10-01-syntax.html",
            "https://doc.rust-lang.org/reference/items/generics.html",
            "https://doc.rust-lang.org/book/ch13-04-performance.html",
            "https://doc.rust-lang.org/rust-by-example/generics.html"
        ]
    },

    {
        title: "Procedural Macros and Compile-Time Programming",
        description: "How Rust procedural macros transform syntax trees and enable custom derives, attribute macros and function-like compile-time transformations.",
        sections: [
            {
                title: "Token Streams",
                text: "Procedural macros operate on token streams rather than ordinary runtime values. The macro receives syntax from the compiler, transforms it and returns generated Rust code.",
                code: `use proc_macro::TokenStream;

#[proc_macro]
pub fn generate_value(_input: TokenStream) -> TokenStream {
    "42".parse().unwrap()
}`,
                details: [
                    "Procedural macros execute during compilation.",
                    "The input and output are represented as token streams.",
                    "Generated code becomes part of the program being compiled.",
                    "Procedural macros can implement transformations that declarative macros cannot express conveniently."
                ]
            },
            {
                title: "Custom Derive Macros",
                text: "Derive macros allow a type to automatically receive generated implementations based on its declaration. They are widely used by serialization, ORM, command-line and framework libraries.",
                code: `#[derive(Debug)]
struct User {
    id: u64,
    name: String,
}

fn main() {
    let user = User {
        id: 1,
        name: String::from("Alice"),
    };

    println!("{user:?}");
}`,
                details: [
                    "Custom derive macros are declared with proc_macro_derive.",
                    "The macro receives the annotated item's syntax representation.",
                    "Generated implementations can depend on fields, attributes and generic parameters.",
                    "Good derive macros should produce predictable diagnostics and preserve useful source locations."
                ]
            },
            {
                title: "Attribute and Function-Like Macros",
                text: "Attribute macros transform annotated items while function-like procedural macros accept custom token syntax. Together they allow libraries to build domain-specific compile-time APIs.",
                code: `#[route("/users")]
fn users() {
    println!("users");
}

generate_value!();`,
                details: [
                    "Attribute macros can transform functions, structs and other supported items.",
                    "Function-like macros can define custom compile-time syntax.",
                    "Macro expansion occurs before later compiler analysis.",
                    "Generated APIs should be designed carefully because errors may originate from generated code."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/reference/procedural-macros.html",
            "https://doc.rust-lang.org/book/ch20-05-macros.html",
            "https://doc.rust-lang.org/proc_macro/",
            "https://doc.rust-lang.org/reference/macros.html"
        ]
    },

    {
        title: "Custom Allocators and Memory Pools",
        description: "Advanced memory management in Rust using allocation strategies, arenas, pools and custom allocation interfaces.",
        sections: [
            {
                title: "Allocation Architecture",
                text: "Rust normally delegates dynamic allocation to the global allocator. Systems software can require specialized allocation strategies when allocation frequency, object lifetime or locality becomes a performance concern.",
                code: `struct Arena {
    storage: Vec<u8>,
    offset: usize,
}

impl Arena {
    fn new(capacity: usize) -> Self {
        Self {
            storage: vec![0; capacity],
            offset: 0,
        }
    }
}`,
                details: [
                    "General-purpose allocators handle many different allocation patterns.",
                    "Specialized allocators can optimize for predictable object sizes or lifetimes.",
                    "Allocation strategy affects fragmentation and cache locality.",
                    "Allocator design must account for alignment and ownership."
                ]
            },
            {
                title: "Arena Allocation",
                text: "Arena allocation groups many allocations under one lifetime. Individual objects generally do not need to be freed separately, making arenas useful for parsers, compilers and temporary graphs.",
                code: `struct Arena<T> {
    values: Vec<T>,
}

impl<T> Arena<T> {
    fn new() -> Self {
        Self { values: Vec::new() }
    }

    fn alloc(&mut self, value: T) -> &T {
        self.values.push(value);
        self.values.last().unwrap()
    }
}`,
                details: [
                    "Arenas can reduce the overhead of many small allocations.",
                    "Objects can share one coarse-grained lifetime.",
                    "Bulk destruction can be much simpler than individual deallocation.",
                    "Moving the backing storage can invalidate references, so real arena designs must account for stable addresses."
                ]
            },
            {
                title: "Object Pools",
                text: "Object pools recycle previously allocated storage instead of repeatedly allocating and freeing objects. They are useful when a system repeatedly creates objects with similar sizes and lifetimes.",
                code: `struct Pool<T> {
    free: Vec<T>,
}

impl<T> Pool<T> {
    fn new() -> Self {
        Self { free: Vec::new() }
    }

    fn release(&mut self, value: T) {
        self.free.push(value);
    }

    fn take(&mut self) -> Option<T> {
        self.free.pop()
    }
}`,
                details: [
                    "Pools can reduce allocator pressure.",
                    "Reusing objects can improve locality.",
                    "Pools must prevent stale references from surviving object reuse.",
                    "Thread-safe pools require additional synchronization or thread-local ownership."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/std/alloc/",
            "https://doc.rust-lang.org/nomicon/vec/vec.html",
            "https://doc.rust-lang.org/reference/memory-allocation-and-lifetime.html"
        ]
    },

    {
        title: "Lock-Free Queues and Work Scheduling",
        description: "Designing concurrent queues and worker schedulers using ownership, atomics, bounded buffers and explicit task state.",
        sections: [
            {
                title: "Bounded Ring Buffers",
                text: "A bounded ring buffer stores elements in a fixed-capacity circular region. Producer and consumer positions can be represented using atomic counters, making the structure suitable for high-throughput systems.",
                code: `struct RingBuffer<T> {
    buffer: Vec<Option<T>>,
    head: usize,
    tail: usize,
}

impl<T> RingBuffer<T> {
    fn new(capacity: usize) -> Self {
        Self {
            buffer: (0..capacity).map(|_| None).collect(),
            head: 0,
            tail: 0,
        }
    }
}`,
                details: [
                    "Ring buffers avoid repeated allocation for each message.",
                    "Bounded capacity naturally provides backpressure.",
                    "Single-producer and single-consumer designs can be substantially simpler than multi-producer variants.",
                    "Concurrent implementations require precise ownership and memory-ordering rules."
                ]
            },
            {
                title: "Task Queues",
                text: "A worker scheduler separates task submission from execution. Tasks can be represented as owned closures, state machines or explicit job structures and placed into a shared queue.",
                code: `use std::sync::mpsc;
use std::thread;

type Job = Box<dyn FnOnce() + Send + 'static>;

fn worker(rx: mpsc::Receiver<Job>) {
    while let Ok(job) = rx.recv() {
        job();
    }
}

fn main() {
    let (tx, rx) = mpsc::channel::<Job>();

    thread::spawn(move || worker(rx));

    tx.send(Box::new(|| {
        println!("job executed");
    })).unwrap();
}`,
                details: [
                    "Jobs must have ownership compatible with the worker lifetime.",
                    "Send allows task ownership to cross thread boundaries.",
                    "Backpressure and queue capacity are important for production schedulers.",
                    "Worker count should be chosen according to workload characteristics rather than assumed to match CPU count."
                ]
            },
            {
                title: "Work Stealing",
                text: "Work-stealing schedulers give workers local queues and allow idle workers to take tasks from other workers. This can improve utilization for irregular workloads.",
                code: `struct WorkerQueue<T> {
    local: Vec<T>,
}

impl<T> WorkerQueue<T> {
    fn push(&mut self, task: T) {
        self.local.push(task);
    }

    fn pop(&mut self) -> Option<T> {
        self.local.pop()
    }
}`,
                details: [
                    "Local queues reduce contention on a single global queue.",
                    "Idle workers can steal work from other workers.",
                    "Schedulers must balance locality against fairness.",
                    "Production runtimes commonly combine local queues, global queues and wakeup mechanisms."
                ]
            }
        ],
        sources: [
            "https://doc.rust-lang.org/book/ch16-04-extensible-concurrency-sync-and-send.html",
            "https://doc.rust-lang.org/std/sync/mpsc/",
            "https://rust-lang.github.io/async-book/02_execution/04_executor.html",
            "https://doc.rust-lang.org/nomicon/send-and-sync.html"
        ]
    }
);



rustTopics.push(
    {
        title: "Rust Trait Object and VTable Architecture",
        sections: [
            {
                title: "Trait Objects and Dynamic Dispatch",
                content: "Trait objects allow Rust to represent values through a shared interface when the concrete type is not known statically. A value such as Box<dyn Shape> stores a pointer to an object together with metadata describing the concrete type. Method calls through dyn Trait use dynamic dispatch rather than monomorphized static dispatch. This makes trait objects useful for plugin systems, heterogeneous collections and runtime-selected implementations, while introducing an indirect call and preventing some compile-time optimizations.",
                code: "trait Shape {\\n    fn area(&self) -> f64;\\n}\\n\\nstruct Circle {\\n    radius: f64,\\n}\\n\\nimpl Shape for Circle {\\n    fn area(&self) -> f64 {\\n        std::f64::consts::PI * self.radius * self.radius\\n    }\\n}\\n\\nfn print_area(shape: &dyn Shape) {\\n    println!(\\\"{}\\\", shape.area());\\n}"
            },
            {
                title: "Fat Pointers and VTable Metadata",
                content: "A dynamically dispatched trait object is a dynamically sized value and therefore requires metadata in addition to the data address. For ordinary trait objects, that metadata points to a vtable containing information needed to perform operations such as method dispatch and destruction. This is why references such as &dyn Trait and Box<dyn Trait> are commonly described as fat pointers. The exact ABI representation of Rust trait objects is an implementation detail rather than a stable language-level ABI contract, so unsafe code should not assume a particular layout.",
                code: "fn inspect(shape: &dyn Shape) {\\n    let object: &dyn Shape = shape;\\n    println!(\\\"{}\\\", object.area());\\n}\\n\\nlet circle = Circle { radius: 4.0 };\\nlet shape: &dyn Shape = &circle;\\ninspect(shape);"
            },
            {
                title: "Object Safety and Architecture Tradeoffs",
                content: "Not every trait can be used as a trait object. Methods involving Self in positions that require knowing the concrete type, generic methods, or incompatible associated behavior can prevent dyn compatibility. When designing a large system, static dispatch through generics is useful when performance and compile-time specialization matter, while dynamic dispatch is useful when components must be selected at runtime. A robust architecture often uses static dispatch internally and exposes dynamic trait boundaries only where runtime extensibility is actually required.",
                code: "trait Storage {\\n    fn read(&self, key: &str) -> Option<Vec<u8>>;\\n}\\n\\nstruct MemoryStorage;\\n\\nimpl Storage for MemoryStorage {\\n    fn read(&self, key: &str) -> Option<Vec<u8>> {\\n        println!(\\\"reading {key}\\\");\\n        None\\n    }\\n}\\n\\nfn run(storage: &dyn Storage) {\\n    storage.read(\\\"config\\\");\\n}"
            }
        ]
    },
    {
        title: "Rust Kernel and OS-Level Systems Programming",
        sections: [
            {
                title: "Kernel Boundaries and Unsafe Rust",
                content: "Operating-system development requires direct control over memory, CPU state, interrupts, synchronization and hardware interfaces. Rust can enforce many invariants inside kernel code, but hardware-facing operations still require carefully isolated unsafe blocks. A kernel architecture should keep unsafe code near the boundary where raw pointers, memory-mapped registers, assembly or architecture-specific instructions are required, while exposing safe abstractions to the rest of the system.",
                code: "#![no_std]\\n\\nuse core::ptr::{read_volatile, write_volatile};\\n\\nfn read_register(address: usize) -> u32 {\\n    unsafe { read_volatile(address as *const u32) }\\n}\\n\\nfn write_register(address: usize, value: u32) {\\n    unsafe { write_volatile(address as *mut u32, value) }\\n}"
            },
            {
                title: "Memory Management and Interrupt Architecture",
                content: "A kernel cannot depend on the normal operating-system services that user-space programs take for granted. Early boot code must establish page tables, stacks and memory regions before higher-level allocators can operate. Interrupt handlers also impose strict constraints because they execute asynchronously relative to normal code. Shared state must use synchronization appropriate for the execution context, and interrupt paths should remain small and deterministic whenever possible.",
                code: "#[repr(C)]\\nstruct InterruptFrame {\\n    instruction_pointer: u64,\\n    stack_pointer: u64,\\n}\\n\\nfn handle_interrupt(frame: &InterruptFrame) {\\n    let instruction = frame.instruction_pointer;\\n    let stack = frame.stack_pointer;\\n    log_interrupt(instruction, stack);\\n}\\n\\nfn log_interrupt(instruction: u64, stack: u64) {\\n    let _ = (instruction, stack);\\n}"
            },
            {
                title: "Drivers, Hardware Abstraction and Kernel Architecture",
                content: "A maintainable kernel separates architecture-specific operations from generic kernel services. Hardware abstraction layers can expose safe interfaces for devices while keeping register access and platform-specific code isolated. Drivers typically coordinate memory-mapped I/O, interrupts, DMA and device state. Rust's ownership model is particularly useful for expressing exclusive access to device state, but synchronization and hardware ordering requirements still need explicit design. The most important boundary is between trusted low-level primitives and higher-level code that should not manipulate hardware directly.",
                code: "trait Device {\\n    fn init(&mut self);\\n    fn read(&mut self, buffer: &mut [u8]) -> usize;\\n}\\n\\nstruct SerialPort {\\n    base: usize,\\n}\\n\\nimpl Device for SerialPort {\\n    fn init(&mut self) {}\\n\\n    fn read(&mut self, buffer: &mut [u8]) -> usize {\\n        let _ = self.base;\\n        buffer.len()\\n    }\\n}\\n\\nfn initialize<D: Device>(device: &mut D) {\\n    device.init();\\n}"
            }
        ]
    }
);

rustTopics.push(
    {
        title: "Rust Borrow Checker and Lifetime Analysis",
        sections: [
            {
                title: "How Borrow Checking Works",
                content: "Rust's borrow checker verifies that references remain valid and that mutable access is exclusive. The analysis is based on lifetimes, ownership relationships and control-flow constraints rather than runtime checks. Understanding these rules makes complex APIs involving references much easier to design.",
                code: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() {
        a
    } else {
        b
    }
}`
            },
            {
                title: "Non-Lexical Lifetimes and Control Flow",
                content: "Modern Rust reasons about when a reference is actually used instead of treating its lifetime as the entire lexical scope. This allows mutable borrows to begin after earlier immutable borrows are no longer used. Control-flow analysis is therefore an important part of understanding why apparently conflicting references can sometimes coexist safely.",
                code: `let mut value = String::from("hello");

let view = &value;
println!("{view}");

value.push_str(" world");
println!("{value}");`
            },
            {
                title: "Designing APIs Around Lifetimes",
                content: "Good lifetime design usually expresses real relationships between inputs and outputs instead of exposing unnecessary lifetime parameters. Prefer owned values when ownership transfer is appropriate and references when borrowing provides a meaningful performance or architectural advantage.",
                code: `struct Parser<'a> {
    input: &'a str,
}

impl<'a> Parser<'a> {
    fn new(input: &'a str) -> Self {
        Self { input }
    }

    fn input(&self) -> &'a str {
        self.input
    }
}`
            }
        ],
        sources: [
            "[https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html)",
            "[https://doc.rust-lang.org/reference/lifetime-elision.html](https://doc.rust-lang.org/reference/lifetime-elision.html)"
        ]
    },
    {
        title: "Rust Memory Allocator Architecture",
        sections: [
            {
                title: "Global and Custom Allocators",
                content: "Rust normally delegates heap allocation to the platform allocator, but systems applications can provide custom allocation strategies. Allocators are useful when allocation patterns are predictable, latency matters or memory must come from a specialized region.",
                code: `use std::alloc::{GlobalAlloc, Layout, System};

struct Allocator;

unsafe impl GlobalAlloc for Allocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        unsafe { System.alloc(layout) }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        unsafe { System.dealloc(ptr, layout) }
    }
}`
            },
            {
                title: "Arena and Pool Allocation",
                content: "Arena allocators group allocations into regions that can be released together. Object pools reuse objects of similar size and can reduce allocator contention and fragmentation. These techniques are especially useful for compilers, servers, game engines and high-throughput systems.",
                code: `struct Arena {
    storage: Vec<Box<[u8]>>,
}

impl Arena {
    fn new() -> Self {
        Self { storage: Vec::new() }
    }

    fn reserve(&mut self, size: usize) {
        self.storage.push(vec![0; size].into_boxed_slice());
    }
}`
            },
            {
                title: "Allocator Tradeoffs",
                content: "Custom allocation is not automatically faster. It introduces ownership, alignment, reclamation and concurrency concerns. A production design should measure allocation frequency, object lifetime distribution, fragmentation and synchronization costs before replacing the system allocator.",
                code: `struct Pool<T> {
    objects: Vec<T>,
}

impl<T> Pool<T> {
    fn with_capacity(capacity: usize) -> Self {
        Self {
            objects: Vec::with_capacity(capacity),
        }
    }
}`
            }
        ],
        sources: [
            "[https://doc.rust-lang.org/std/alloc/index.html](https://doc.rust-lang.org/std/alloc/index.html)",
            "[https://doc.rust-lang.org/std/alloc/trait.GlobalAlloc.html](https://doc.rust-lang.org/std/alloc/trait.GlobalAlloc.html)"
        ]
    },
    {
        title: "Rust Networking and Protocol Engineering",
        sections: [
            {
                title: "TCP and UDP Architecture",
                content: "Network applications need explicit decisions about connection lifetime, framing, buffering, timeouts and failure handling. TCP provides ordered reliable streams but does not preserve application message boundaries. UDP exposes datagrams and requires the application to handle loss, duplication and ordering when necessary.",
                code: `use std::io::{Read, Write};
use std::net::TcpStream;

fn request(mut stream: TcpStream) -> std::io::Result<()> {
    stream.write_all(b"ping")?;
    let mut buffer = [0u8; 4];
    stream.read_exact(&mut buffer)?;
    Ok(())
}`
            },
            {
                title: "Protocol Framing and Serialization",
                content: "A stream protocol needs a framing strategy so the receiver can determine where one message ends and another begins. Length-prefixed frames are common because they separate transport concerns from application payloads and allow efficient buffered processing.",
                code: `fn encode(payload: &[u8]) -> Vec<u8> {
    let mut frame = Vec::with_capacity(4 + payload.len());
    frame.extend_from_slice(&(payload.len() as u32).to_be_bytes());
    frame.extend_from_slice(payload);
    frame
}`
            },
            {
                title: "Production Network Design",
                content: "Reliable networking requires bounded buffers, cancellation, timeouts, backpressure, connection limits and explicit error handling. Protocol implementations should also validate lengths before allocation and reject malformed messages before they reach higher-level logic.",
                code: `use std::time::Duration;
use std::net::TcpStream;

fn configure(stream: &TcpStream) -> std::io::Result<()> {
    stream.set_read_timeout(Some(Duration::from_secs(5)))?;
    stream.set_write_timeout(Some(Duration::from_secs(5)))?;
    Ok(())
}`
            }
        ],
        sources: [
            "[https://doc.rust-lang.org/std/net/index.html](https://doc.rust-lang.org/std/net/index.html)",
            "[https://tokio.rs/tokio/tutorial](https://tokio.rs/tokio/tutorial)"
        ]
    },
    {
        title: "Rust Distributed Systems Architecture",
        sections: [
            {
                title: "Nodes, Messages and State",
                content: "Distributed Rust systems represent independent processes that communicate through messages rather than shared memory. The architecture must explicitly model node identity, message formats, connection failures, retries and state transitions.",
                code: `enum Message {
    Ping { sequence: u64 },
    Data { payload: Vec<u8> },
    Shutdown,
}

fn handle(message: Message) {
    match message {
        Message::Ping { sequence } => println!("ping {sequence}"),
        Message::Data { payload } => println!("{}", payload.len()),
        Message::Shutdown => println!("shutdown"),
    }
}`
            },
            {
                title: "Failure Detection and Retries",
                content: "Network failures are ambiguous: a missing response may mean that a node crashed, the network failed or the response was delayed. Retry systems therefore need deadlines, backoff and idempotency rather than blindly repeating operations.",
                code: `use std::time::Duration;

fn backoff(attempt: u32) -> Duration {
    let seconds = 1u64 << attempt.min(5);
    Duration::from_secs(seconds)
}`
            },
            {
                title: "Consistency and Coordination",
                content: "Distributed state requires explicit consistency guarantees. Systems may use leader election, replication, quorum-based decisions or eventually consistent data structures depending on their requirements. Rust's type system can model message states and protocol transitions, but distributed correctness remains an architectural problem.",
                code: `struct Term(u64);

struct NodeState {
    term: Term,
    leader: Option<u64>,
}

impl NodeState {
    fn is_leader(&self, id: u64) -> bool {
        self.leader == Some(id)
    }
}`
            }
        ],
        sources: [
            "[https://tokio.rs/tokio/tutorial/channels](https://tokio.rs/tokio/tutorial/channels)",
            "[https://raft.github.io/](https://raft.github.io/)"
        ]
    },
    {
        title: "Rust Embedded Systems Engineering",
        sections: [
            {
                title: "no_std and Hardware Constraints",
                content: "Embedded Rust often runs without the standard library because there may be no operating system, filesystem or conventional heap. Code instead relies on core and hardware-specific abstractions while carefully controlling memory and execution time.",
                code: `#![no_std]

use core::sync::atomic::{AtomicU32, Ordering};

static COUNTER: AtomicU32 = AtomicU32::new(0);

fn tick() {
    COUNTER.fetch_add(1, Ordering::Relaxed);
}`
            },
            {
                title: "Memory-Mapped Hardware",
                content: "Peripheral registers are commonly exposed through memory-mapped addresses. Volatile operations are required when reading or writing hardware registers because the compiler must not optimize those accesses away.",
                code: `use core::ptr::{read_volatile, write_volatile};

fn read_register(address: usize) -> u32 {
    unsafe { read_volatile(address as *const u32) }
}

fn write_register(address: usize, value: u32) {
    unsafe { write_volatile(address as *mut u32, value) }
}`
            },
            {
                title: "Interrupts and Real-Time Design",
                content: "Interrupt handlers execute under strict timing and synchronization constraints. Shared state should be minimal, interrupt work should remain deterministic and communication with normal tasks should use carefully designed synchronization primitives.",
                code: `static EVENTS: AtomicU32 = AtomicU32::new(0);

fn interrupt_handler() {
    EVENTS.fetch_or(1, Ordering::Release);
}

fn poll() -> bool {
    EVENTS.load(Ordering::Acquire) != 0
}`
            }
        ],
        sources: [
            "[https://doc.rust-lang.org/embedded-book/](https://doc.rust-lang.org/embedded-book/)",
            "[https://docs.rust-embedded.org/book/](https://docs.rust-embedded.org/book/)"
        ]
    },
    {
        title: "Rust Cryptography and Secure Systems",
        sections: [
            {
                title: "Cryptographic Boundaries",
                content: "Security-sensitive Rust code should separate cryptographic primitives from protocol logic. Keys, nonces, authentication state and serialized messages should have explicit ownership and lifetime rules, while secret material should be handled as carefully as possible in memory.",
                code: `struct Key {
    bytes: [u8; 32],
}

impl Key {
    fn new(bytes: [u8; 32]) -> Self {
        Self { bytes }
    }
}`
            },
            {
                title: "Authenticated Encryption",
                content: "Authenticated encryption combines confidentiality and integrity. Applications should use established constructions and well-reviewed libraries rather than implementing cryptographic primitives themselves. Protocols must also guarantee nonce uniqueness and authenticate the correct associated data.",
                code: `struct Packet<'a> {
    nonce: &'a [u8],
    ciphertext: &'a [u8],
    tag: &'a [u8],
}

fn validate(packet: &Packet<'_>) -> bool {
    packet.nonce.len() > 0 &&
    packet.tag.len() > 0 &&
    packet.ciphertext.len() > 0
}`
            },
            {
                title: "Secure API Design",
                content: "Security APIs should make invalid states difficult to represent. Rust's ownership model can help prevent accidental aliasing and use-after-move patterns, while enums and newtypes can separate authenticated data from untrusted input.",
                code: `struct Authenticated<T> {
    value: T,
}

fn consume(value: Authenticated<Vec<u8>>) {
    drop(value);
}`
            }
        ],
        sources: [
            "[https://docs.rs/ring/latest/ring/](https://docs.rs/ring/latest/ring/)",
            "[https://docs.rs/chacha20poly1305/latest/chacha20poly1305/](https://docs.rs/chacha20poly1305/latest/chacha20poly1305/)"
        ]
    },
    {
        title: "Rust Database Engine Architecture",
        sections: [
            {
                title: "Storage and Pages",
                content: "A database engine normally organizes persistent data into fixed-size pages. The storage layer manages reads, writes, allocation and caching while higher layers operate on records and indexes.",
                code: `const PAGE_SIZE: usize = 4096;

struct Page {
    data: [u8; PAGE_SIZE],
}

impl Page {
    fn new() -> Self {
        Self { data: [0; PAGE_SIZE] }
    }
}`
            },
            {
                title: "Indexes and Query Execution",
                content: "Indexes trade write cost and storage for faster lookup. A query engine transforms a logical query into physical operations such as scans, index lookups, filtering and joins. Rust enums are useful for representing these execution plans explicitly.",
                code: `enum Plan {
    Scan,
    Filter { input: Box<Plan> },
    IndexLookup { key: Vec<u8> },
}

fn cost(plan: &Plan) -> usize {
    match plan {
        Plan::Scan => 100,
        Plan::Filter { input } => cost(input) + 10,
        Plan::IndexLookup { .. } => 1,
    }
}`
            },
            {
                title: "Transactions and Recovery",
                content: "Durable databases must survive crashes without leaving persistent state inconsistent. Write-ahead logging records enough information to recover committed operations and roll back incomplete work. Buffer management and synchronization are central to correctness.",
                code: `struct LogRecord {
    transaction: u64,
    page: u64,
    offset: u16,
    value: Vec<u8>,
}

fn commit(record: LogRecord) {
    println!("commit {}", record.transaction);
}`
            }
        ],
        sources: [
            "[https://www.sqlite.org/arch.html](https://www.sqlite.org/arch.html)",
            "[https://doc.rust-lang.org/std/fs/](https://doc.rust-lang.org/std/fs/)"
        ]
    },
    {
        title: "Rust WebAssembly and Runtime Design",
        sections: [
            {
                title: "Rust to WebAssembly",
                content: "WebAssembly provides a portable execution target with a compact binary format and a linear memory model. Rust can compile strongly typed systems code to WebAssembly while exposing selected functions through bindings.",
                code: `#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}`
            },
            {
                title: "Linear Memory and Boundaries",
                content: "WebAssembly modules communicate with hosts through explicit boundaries. Data crossing those boundaries often requires serialization, pointers, lengths or generated bindings. Memory ownership must be clearly defined because the host and module have different execution environments.",
                code: `#[repr(C)]
pub struct Buffer {
    pub ptr: *const u8,
    pub len: usize,
}

#[no_mangle]
pub extern "C" fn buffer_len(buffer: Buffer) -> usize {
    buffer.len
}`
            },
            {
                title: "Runtime Integration",
                content: "A WebAssembly runtime is responsible for loading modules, validating instructions, providing imports and controlling execution. Production runtimes also need resource limits, host capability boundaries and deterministic handling of traps and failures.",
                code: `enum Trap {
    OutOfFuel,
    InvalidMemory,
    HostFailure,
}

fn execute() -> Result<(), Trap> {
    Ok(())
}`
            }
        ],
        sources: [
            "[https://webassembly.org/docs/](https://webassembly.org/docs/)",
            "[https://docs.rs/wasmtime/latest/wasmtime/](https://docs.rs/wasmtime/latest/wasmtime/)"
        ]
    },
    {
        title: "Rust JIT Compilation and Runtime Code Generation",
        sections: [
            {
                title: "JIT Architecture",
                content: "A just-in-time compiler translates an intermediate representation into native machine code during execution. A typical pipeline contains profiling, optimization, code generation, executable memory management and runtime patching.",
                code: `enum Value {
    Integer(i64),
    Float(f64),
}

enum Instruction {
    Add,
    Sub,
    Return,
}

fn compile(instructions: &[Instruction]) -> usize {
    instructions.len()
}`
            },
            {
                title: "Executable Memory",
                content: "Generated machine code must be placed in memory with appropriate permissions. Systems commonly separate writable code generation from executable code to reduce security risks. Cache synchronization and platform-specific calling conventions also matter.",
                code: `struct CodeBlock {
    address: usize,
    size: usize,
}

impl CodeBlock {
    fn contains(&self, address: usize) -> bool {
        address >= self.address &&
        address < self.address + self.size
    }
}`
            },
            {
                title: "Optimization and Deoptimization",
                content: "JIT compilers can specialize frequently executed paths using runtime information. When assumptions become invalid, execution may need to deoptimize back into an interpreter or less specialized representation. This makes runtime metadata and stack maps important parts of the architecture.",
                code: `struct CompiledFunction {
    entry: usize,
    optimized: bool,
}

fn select_version(function: &CompiledFunction) -> usize {
    function.entry
}`
            }
        ],
        sources: [
            "[https://docs.rs/cranelift/latest/cranelift/](https://docs.rs/cranelift/latest/cranelift/)",
            "[https://docs.rs/wasmtime/latest/wasmtime/](https://docs.rs/wasmtime/latest/wasmtime/)"
        ]
    },
    {
        title: "Rust Binary Serialization and ABI Design",
        sections: [
            {
                title: "Binary Formats",
                content: "Binary protocols represent structured values using explicit layouts, integer widths, byte ordering and framing rules. A robust format must define how every field is encoded and how malformed or future data is handled.",
                code: `fn write_u32(value: u32, output: &mut Vec<u8>) {
    output.extend_from_slice(&value.to_le_bytes());
}

fn read_u32(input: &[u8]) -> Option<u32> {
    let bytes: [u8; 4] = input.get(..4)?.try_into().ok()?;
    Some(u32::from_le_bytes(bytes))
}`
            },
            {
                title: "ABI and Representation",
                content: "An ABI defines how values cross compilation or language boundaries. Rust's default representation is optimized for the language rather than stable interoperability, so FFI structures should normally use explicit representations such as repr(C).",
                code: `#[repr(C)]
pub struct Header {
    pub version: u32,
    pub flags: u32,
    pub length: u64,
}`
            },
            {
                title: "Versioning and Compatibility",
                content: "Long-lived binary protocols need versioning rules. Adding fields, changing integer widths or altering enum representations can break compatibility. Explicit schemas and validation allow newer implementations to reject unsupported data safely.",
                code: `enum Version {
    V1 = 1,
    V2 = 2,
}

fn supported(version: u8) -> bool {
    matches!(version, 1 | 2)
}`
            }
        ],
        sources: [
            "[https://doc.rust-lang.org/reference/type-layout.html](https://doc.rust-lang.org/reference/type-layout.html)",
            "[https://doc.rust-lang.org/nomicon/ffi.html](https://doc.rust-lang.org/nomicon/ffi.html)"
        ]
    },
    {
        title: "Rust Operating System Architecture",
        sections: [
            {
                title: "Boot and Kernel Initialization",
                content: "An operating system must establish execution state before higher-level services can operate. Early initialization commonly configures CPU state, memory mappings, interrupt tables, stacks and architecture-specific hardware before entering the main kernel.",
                code: `#![no_std]

#[no_mangle]
pub extern "C" fn kernel_main() -> ! {
    loop {
        core::hint::spin_loop();
    }
}`
            },
            {
                title: "Processes, Scheduling and Isolation",
                content: "An operating system separates execution contexts and controls access to memory and hardware. A scheduler selects runnable tasks while context switching preserves CPU state. Rust can model many kernel data structures safely, but context switching and hardware control still require carefully isolated low-level code.",
                code: `struct Process {
    id: u64,
    state: ProcessState,
}

enum ProcessState {
    Ready,
    Running,
    Blocked,
    Terminated,
}`
            },
            {
                title: "Virtual Memory and System Calls",
                content: "Virtual memory maps process addresses onto physical memory and enables isolation between applications. System calls provide controlled transitions from user space into kernel services. A clean kernel architecture keeps architecture-specific mechanisms behind stable internal interfaces.",
                code: `enum Syscall {
    Write,
    Read,
    Exit,
}

fn dispatch(call: Syscall) -> usize {
    match call {
        Syscall::Write => 1,
        Syscall::Read => 2,
        Syscall::Exit => 0,
    }
}`
            }
        ],
        sources: [
            "[https://os.phil-opp.com/](https://os.phil-opp.com/)",
            "[https://doc.rust-lang.org/embedded-book/](https://doc.rust-lang.org/embedded-book/)"
        ]
    }
);

