var programmingSources = [
    {
        category: "C++ Language",
        title: "cppreference",
        description: "A comprehensive reference for the C++ language, standard library, language features, containers, algorithms, templates, concurrency and more.",
        url: "https://en.cppreference.com/"
    },
    {
        category: "C++ Language",
        title: "ISO C++",
        description: "The official ISO C++ community site containing information about the language standard, committees, releases and ecosystem.",
        url: "https://isocpp.org/"
    },
    {
        category: "C++ Language",
        title: "C++ Core Guidelines",
        description: "Guidelines for writing safer, simpler and more maintainable modern C++.",
        url: "https://isocpp.github.io/CppCoreGuidelines/"
    },
    {
        category: "C++ Language",
        title: "WG21",
        description: "The C++ standards committee material, proposals, papers and ongoing language development.",
        url: "https://www.open-std.org/jtc1/sc22/wg21/"
    },
    {
        category: "C++ Learning",
        title: "LearnCpp",
        description: "A large free C++ tutorial covering fundamentals through modern C++ concepts.",
        url: "https://www.learncpp.com/"
    },
    {
        category: "C++ Learning",
        title: "Fluent C++",
        description: "Articles focused on modern C++, generic programming, design, templates and advanced techniques.",
        url: "https://www.fluentcpp.com/"
    },
    {
        category: "C++ Learning",
        title: "C++ Weekly",
        description: "Educational C++ material covering language features, design, performance and modern techniques.",
        url: "https://www.youtube.com/@cppweekly"
    },
    {
        category: "Compilers",
        title: "GCC",
        description: "GNU Compiler Collection documentation for C, C++, optimization, diagnostics, language standards and compiler behavior.",
        url: "https://gcc.gnu.org/onlinedocs/"
    },
    {
        category: "Compilers",
        title: "Clang",
        description: "LLVM's C/C++ compiler documentation, diagnostics, language features and tooling.",
        url: "https://clang.llvm.org/docs/"
    },
    {
        category: "Compilers",
        title: "MSVC",
        description: "Microsoft's C++ compiler and Visual Studio C++ documentation.",
        url: "https://learn.microsoft.com/cpp/"
    },
    {
        category: "Tooling",
        title: "LLVM",
        description: "Compiler infrastructure, optimizer documentation, libraries and development tools.",
        url: "https://llvm.org/docs/"
    },
    {
        category: "Tooling",
        title: "Compiler Explorer",
        description: "Interactive compiler environment for examining generated assembly and comparing compiler behavior.",
        url: "https://godbolt.org/"
    },
    {
        category: "Tooling",
        title: "GDB",
        description: "The GNU debugger documentation for breakpoints, stack inspection, memory, threads and debugging workflows.",
        url: "https://sourceware.org/gdb/documentation/"
    },
    {
        category: "Tooling",
        title: "Valgrind",
        description: "Dynamic analysis tools for memory debugging, profiling and program analysis.",
        url: "https://valgrind.org/docs/"
    },
    {
        category: "Tooling",
        title: "AddressSanitizer",
        description: "LLVM documentation for detecting memory errors such as use-after-free and buffer overflows.",
        url: "https://clang.llvm.org/docs/AddressSanitizer.html"
    },
    {
        category: "Tooling",
        title: "UndefinedBehaviorSanitizer",
        description: "LLVM documentation for detecting many forms of undefined behavior at runtime.",
        url: "https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html"
    },
    {
        category: "Tooling",
        title: "ThreadSanitizer",
        description: "LLVM documentation for detecting data races in multithreaded programs.",
        url: "https://clang.llvm.org/docs/ThreadSanitizer.html"
    },
    {
        category: "Build Systems",
        title: "CMake",
        description: "Documentation for configuring, building, testing and packaging C++ projects.",
        url: "https://cmake.org/documentation/"
    },
    {
        category: "Build Systems",
        title: "Ninja",
        description: "A small build system focused on fast incremental builds.",
        url: "https://ninja-build.org/"
    },
    {
        category: "Libraries",
        title: "Boost",
        description: "A large collection of portable C++ libraries covering algorithms, containers, networking, serialization, concurrency and more.",
        url: "https://www.boost.org/"
    },
    {
        category: "Libraries",
        title: "POCO",
        description: "C++ libraries for networking, filesystem, JSON, utilities and application development.",
        url: "https://pocoproject.org/"
    },
    {
        category: "Libraries",
        title: "fmt",
        description: "A modern formatting library that influenced and complements standard C++ formatting facilities.",
        url: "https://fmt.dev/"
    },
    {
        category: "Libraries",
        title: "Catch2",
        description: "A modern C++ testing framework suitable for unit and integration tests.",
        url: "https://catch2.github.io/"
    },
    {
        category: "Libraries",
        title: "GoogleTest",
        description: "Google's C++ testing framework for unit testing and test organization.",
        url: "https://google.github.io/googletest/"
    },
    {
        category: "Libraries",
        title: "Abseil",
        description: "Open-source C++ library components used in large-scale software development.",
        url: "https://abseil.io/"
    },
    {
        category: "Performance",
        title: "Quick Bench",
        description: "Online C++ microbenchmarking environment for comparing implementations.",
        url: "https://quick-bench.com/"
    },
    {
        category: "Performance",
        title: "Google Benchmark",
        description: "A library for writing reliable C++ microbenchmarks.",
        url: "https://github.com/google/benchmark"
    },
    {
        category: "Performance",
        title: "perf",
        description: "Linux performance analysis tooling for CPU usage, sampling, counters and system performance investigation.",
        url: "https://perf.wiki.kernel.org/"
    },
    {
        category: "Documentation",
        title: "Doxygen",
        description: "Documentation generator for C++ and other languages.",
        url: "https://www.doxygen.nl/"
    },
    {
        category: "Documentation",
        title: "C++ Draft Standard",
        description: "The working draft of the C++ standard, useful for studying precise language and library wording.",
        url: "https://eel.is/c++draft/"
    },
    {
        category: "Community",
        title: "Stack Overflow C++",
        description: "A large archive of programming questions and answers covering practical C++ problems.",
        url: "https://stackoverflow.com/questions/tagged/c%2b%2b"
    },
    {
        category: "Community",
        title: "r/cpp",
        description: "A community focused on C++ language development, libraries, tooling and ecosystem discussions.",
        url: "https://www.reddit.com/r/cpp/"
    },
    {
        category: "Community",
        title: "C++ Discord",
        description: "Community discussions, learning and technical help around C++.",
        url: "https://discord.com/"
    }
];

var rustSources = [];

rustSources.push(
    {
        title: "The Rust Programming Language",
        description: "The official Rust Book covering ownership, borrowing, traits, generics, concurrency and advanced language concepts.",
        url: "https://doc.rust-lang.org/book/"
    },
    {
        title: "The Rust Reference",
        description: "The official language reference covering Rust syntax, semantics, types, expressions, traits, lifetimes and language behavior.",
        url: "https://doc.rust-lang.org/reference/"
    },
    {
        title: "The Rustonomicon",
        description: "The official guide to unsafe Rust, raw pointers, undefined behavior, variance, FFI and advanced memory-related concepts.",
        url: "https://doc.rust-lang.org/nomicon/"
    },
    {
        title: "Rust Standard Library",
        description: "Official documentation for Rust's standard library, including collections, synchronization, networking, allocation and filesystem APIs.",
        url: "https://doc.rust-lang.org/std/"
    },
    {
        title: "Rust Compiler Development Guide",
        description: "Technical documentation describing rustc internals, parsing, HIR, MIR, borrow checking, code generation and compiler architecture.",
        url: "https://rustc-dev-guide.rust-lang.org/"
    },
    {
        title: "Rust Async Book",
        description: "Official asynchronous Rust guide covering futures, executors, tasks, streams and asynchronous runtime architecture.",
        url: "https://rust-lang.github.io/async-book/"
    },
    {
        title: "Rust Embedded Book",
        description: "Official guide to embedded Rust, no_std development, hardware interfaces, interrupts and embedded systems architecture.",
        url: "https://doc.rust-lang.org/embedded-book/"
    },
    {
        title: "Rust FFI and Interoperability",
        description: "Official documentation covering foreign-function interfaces, C interoperability, ABI boundaries and unsafe interoperability.",
        url: "https://doc.rust-lang.org/nomicon/ffi.html"
    },
    {
        title: "Rust Atomics and Concurrency",
        description: "Reference material for atomic operations, memory ordering, synchronization and concurrent programming in Rust.",
        url: "https://marabos.nl/atomics/"
    },
    {
        title: "Rust API Guidelines",
        description: "Community-maintained guidelines for designing consistent, ergonomic and idiomatic Rust APIs.",
        url: "https://rust-lang.github.io/api-guidelines/"
    },
    {
        title: "Rust Cargo Book",
        description: "Official documentation for Cargo, Rust's build system and package manager, including workspaces, dependencies and publishing.",
        url: "https://doc.rust-lang.org/cargo/"
    },
    {
        title: "Rust Clippy",
        description: "Official documentation for Rust's linter and its collection of correctness, style and performance diagnostics.",
        url: "https://doc.rust-lang.org/clippy/"
    },
    {
        title: "Rust Edition Guide",
        description: "Official documentation explaining Rust editions and language changes across editions.",
        url: "https://doc.rust-lang.org/edition-guide/"
    },
    {
        title: "Rust Unsafe Code Guidelines",
        description: "Project documentation for understanding the rules and invariants surrounding unsafe Rust and low-level memory behavior.",
        url: "https://rust-lang.github.io/unsafe-code-guidelines/"
    },
    {
        title: "Rustonomicon FFI",
        description: "Advanced documentation for designing safe boundaries between Rust and foreign languages.",
        url: "https://doc.rust-lang.org/nomicon/ffi.html"
    }
);



var asmSources = [
    {
        category: "Architecture",
        title: "Intel 64 and IA-32 Architectures Software Developer Manuals",
        description: "Intel's primary architectural manuals covering instruction sets, system programming, memory management, interrupts, virtualization and processor behavior.",
        url: "https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html"
    },
    {
        category: "Architecture",
        title: "AMD64 Architecture Programmer's Manuals",
        description: "AMD's architecture manuals covering AMD64 instructions, system programming, memory management and processor architecture.",
        url: "https://www.amd.com/en/resources/developer-guides-manuals.html"
    },
    {
        category: "ABI",
        title: "System V AMD64 ABI",
        description: "The x86-64 application binary interface defining calling conventions, data representation, register usage and executable interoperability.",
        url: "https://gitlab.com/x86-psABIs/x86-64-ABI"
    },
    {
        category: "Assembler",
        title: "NASM Documentation",
        description: "Documentation for the Netwide Assembler including syntax, directives, object formats and instruction encoding.",
        url: "https://www.nasm.us/doc/"
    },
    {
        category: "Assembler",
        title: "GNU Assembler",
        description: "Official GNU assembler documentation covering assembly syntax, directives, sections, symbols and object generation.",
        url: "https://sourceware.org/binutils/docs/as/"
    },
    {
        category: "Tooling",
        title: "GNU GDB",
        description: "Debugger documentation for registers, memory, breakpoints, stack inspection, disassembly and low-level debugging.",
        url: "https://sourceware.org/gdb/documentation/"
    },
    {
        category: "Tooling",
        title: "GNU Binutils",
        description: "Binary utilities including objdump, readelf, nm, linker tools and other ELF analysis utilities.",
        url: "https://sourceware.org/binutils/docs/"
    },
    {
        category: "Linux",
        title: "Linux syscall",
        description: "Linux system-call interface documentation and low-level process/kernel interaction reference.",
        url: "https://man7.org/linux/man-pages/man2/syscall.2.html"
    },
    {
        category: "ELF",
        title: "System V ABI ELF Specification",
        description: "Reference material describing ELF files, object files, program headers, sections and executable representation.",
        url: "https://refspecs.linuxbase.org/elf/gabi4+/contents.html"
    },
    {
        category: "Operating Systems",
        title: "OSDev Wiki",
        description: "Extensive low-level operating-system development material covering bootloaders, CPU modes, interrupts, paging and hardware.",
        url: "https://wiki.osdev.org/"
    },
    {
        category: "Performance",
        title: "Agner Fog Optimization Manuals",
        description: "Detailed processor optimization manuals covering instruction tables, microarchitecture, calling conventions and performance.",
        url: "https://www.agner.org/optimize/"
    },
    {
        category: "SIMD",
        title: "Intel Intrinsics Guide",
        description: "Reference for Intel SIMD and vector intrinsics corresponding to low-level processor instructions.",
        url: "https://www.intel.com/content/www/us/en/docs/intrinsics-guide/index.html"
    }
];
