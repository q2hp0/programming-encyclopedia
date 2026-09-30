var asmTopics = [
    {
        title: 'Assembly Language Fundamentals',
        sections: [
            {
                title: 'Registers and Machine State',
                content: 'Assembly exposes the processor state directly. General-purpose registers hold integers, addresses and intermediate values while RIP identifies the next instruction and RFLAGS records arithmetic and control state. A useful mental model is that an assembly routine is a transformation of explicit machine state: registers, flags, memory and control flow. Unlike a high-level language, there is no implicit object model or automatic variable lifetime. Every value that matters has to exist somewhere observable by the processor.',
                code: 'global _start\nsection .text\n_start:\n    mov rax, 41\n    mov rbx, 1\n    add rax, rbx\n    mov rcx, rax\n    xor rdx, rdx\n    mov r8, rcx\n    sub r8, 10\n    mov r9, r8\n    imul r9, 4\n    mov r10, r9\n    shr r10, 1\n    mov r11, r10\n    and r11, 15\n    mov r12, r11\n    or r12, 64\n    mov r13, r12\n    xor r13, rax\n    mov r14, r13\n    not r14\n    mov r15, r14\n    test r15, r15\n    jz done\n    mov rax, 60\n    xor rdi, rdi\n    syscall\ndone:\n    mov rax, 60\n    mov rdi, 1\n    syscall'
            },
            {
                title: 'Instruction Encoding',
                content: 'An x86 instruction is not simply an opcode followed by an operand. Encoding may contain prefixes, an opcode, ModR/M, SIB, displacement and immediate fields. Understanding this matters when reading disassembly, reasoning about instruction size, building assemblers and understanding why two instructions that appear semantically similar can have different machine-code representations.',
                code: 'mov rax, 0x1122334455667788\nmov rbx, rax\nmov rcx, [rsp+32]\nmov rdx, [rax+rbx*8+16]\nadd rdx, 0x20\ncmp rdx, rcx\njne different\nlea r8, [rax+rbx*4]\nxor r9d, r9d\ninc r9\ndifferent:\nnop\nret'
            },
            {
                title: 'Flags and Conditional Control Flow',
                content: 'Arithmetic instructions often modify flags instead of returning a separate status object. ZF represents a zero result, SF reflects the sign bit, CF represents unsigned carry or borrow and OF represents signed overflow. Conditional branches consume these flags. This makes flags part of the hidden data flow of a routine and is essential when translating compiler output back into source-level logic.',
                code: 'mov rax, 100\ncmp rax, 200\nja unsigned_greater\njg signed_greater\nje equal\njl signed_less\njb unsigned_less\nequal:\n    mov rbx, 1\n    jmp finish\nsigned_greater:\n    mov rbx, 2\n    jmp finish\nunsigned_greater:\n    mov rbx, 3\n    jmp finish\nsigned_less:\n    mov rbx, 4\n    jmp finish\nunsigned_less:\n    mov rbx, 5\nfinish:\n    ret'
            }
        ]
    },
    {
        title: 'x86-64 Architecture and Instruction Set',
        sections: [
            {
                title: 'General Purpose Registers',
                content: 'x86-64 provides sixteen 64-bit general-purpose registers. Each register also has smaller architectural views such as 32-bit, 16-bit and selected 8-bit forms. Writing a 32-bit register clears the upper half of the corresponding 64-bit register, a property heavily used by compilers for efficient zero extension.',
                code: 'mov rax, -1\nmov eax, 123\nmov bx, 42\nmov cl, 7\nmov r8d, 100\nmov r9w, 200\nmov r10b, 3\nadd eax, r8d\nsub r9d, eax\nimul r10d, r9d\nxor edx, edx\ndiv r10d\nmov r11, rax\nmov r12, rdx\nret'
            },
            {
                title: 'Addressing Modes',
                content: 'Memory operands can combine a base register, index register, scale and displacement. The effective address is conceptually base + index * scale + displacement. This mechanism is the foundation of arrays, structures, pointer arithmetic, jump tables and many compiler-generated addressing patterns.',
                code: 'mov rax, [rdi]\nmov rbx, [rdi+8]\nmov rcx, [rdi+16]\nmov rdx, [rsi+rcx*8]\nmov r8, [rdi+rsi*4+32]\nlea r9, [rdi+rsi*8+64]\nlea r10, [r9+16]\nmov r11, [r10]\nadd r11, r8\nsub r11, rdx\nmov [rdi+24], r11\nret'
            },
            {
                title: 'Bit Manipulation',
                content: 'Bit operations are fundamental in systems software because permissions, CPU state, packed data structures and protocol fields are commonly represented as individual bits. AND masks fields, OR sets bits, XOR toggles or combines state, while shifts and rotates move bit fields without requiring memory accesses.',
                code: 'mov eax, edi\nand eax, 0xff\nmov ecx, edi\nshr ecx, 8\nand ecx, 0xff\nshl ecx, 16\nor eax, ecx\nmov edx, edi\nrol edx, 7\nxor eax, edx\nbsf ecx, edi\nbsr edx, edi\npopcnt r8d, edi\nmov r9d, edi\nbtc r9d, 3\nbts r9d, 5\nbtr r9d, 7\nret'
            }
        ]
    },
    {
        title: 'Memory, Stack and Calling Conventions',
        sections: [
            {
                title: 'Stack Frames',
                content: 'The stack is both ordinary memory and a convention used by software to preserve return addresses, saved registers and local state. A conventional function may establish a frame, reserve local storage, preserve callee-saved registers and later restore the stack pointer. Optimized code may omit a frame pointer and address locals directly from RSP.',
                code: 'push rbp\nmov rbp, rsp\npush rbx\npush r12\nsub rsp, 64\nmov qword [rbp-16], rdi\nmov qword [rbp-24], rsi\nmov rbx, [rbp-16]\nmov r12, [rbp-24]\nadd rbx, r12\nmov [rbp-32], rbx\nmov rax, [rbp-32]\nadd rsp, 64\npop r12\npop rbx\npop rbp\nret'
            },
            {
                title: 'System V AMD64 ABI',
                content: 'On Linux and other System V AMD64 environments, integer and pointer arguments are primarily passed in RDI, RSI, RDX, RCX, R8 and R9, with the return value normally in RAX. Floating-point arguments use vector registers. The ABI also defines caller-saved and callee-saved registers, stack alignment and rules for aggregates.',
                code: 'global add_pair\nsection .text\nadd_pair:\n    mov rax, rdi\n    add rax, rsi\n    ret\n\nglobal combine\ncombine:\n    push rbx\n    mov rbx, rdi\n    imul rbx, rsi\n    add rbx, rdx\n    mov rax, rbx\n    pop rbx\n    ret'
            },
            {
                title: 'C and C++ Interoperability',
                content: 'Assembly can be linked with C and C++ code when symbol names, calling conventions, object representation and ownership rules agree. extern declarations establish the language-level contract while the assembler implementation follows the ABI. C++ adds name mangling, overloads, classes and exceptions, so an extern C boundary is commonly used for a stable low-level interface.',
                code: 'global asm_sum\nglobal asm_scale\nsection .text\nasm_sum:\n    mov rax, rdi\n    add rax, rsi\n    add rax, rdx\n    add rax, rcx\n    ret\n\nasm_scale:\n    mov rax, rdi\n    imul rax, rsi\n    ret'
            }
        ]
    },
    {
        title: 'Assembly and the Compiler',
        sections: [
            {
                title: 'From Source to Machine Code',
                content: 'A modern compiler transforms source code through parsing, semantic analysis, an intermediate representation, optimization and instruction selection before the assembler and linker produce an executable. Assembly is therefore an observable representation of compiler decisions rather than the original program structure.',
                code: 'int compute(int a, int b) {\n    int x = a + b;\n    int y = x * 7;\n    return y - 3;\n}\n\n/*\ngcc -O2 -S example.c\n*/\n\n/* Typical conceptual result:\nlea eax, [rdi+rsi]\nlea eax, [rax+rax*8]\nsub eax, 3\nret\n*/'
            },
            {
                title: 'Optimization Levels',
                content: 'At low optimization levels the compiler tends to preserve source-level structure, while higher optimization levels perform constant propagation, dead-code elimination, inlining, common-subexpression elimination, loop transformations and register allocation. Comparing generated assembly at different optimization levels is one of the clearest ways to study compiler behavior.',
                code: 'mov eax, edi\nadd eax, esi\nmov DWORD PTR [rbp-4], eax\nmov eax, DWORD PTR [rbp-4]\nimul eax, eax, 7\nmov DWORD PTR [rbp-8], eax\nmov eax, DWORD PTR [rbp-8]\nsub eax, 3\nret'
            },
            {
                title: 'Inlining and Register Allocation',
                content: "Inlining replaces a call with the callee's operations when profitable. Register allocation then decides which live values remain in registers and which must be spilled to memory. These transformations can eliminate function-call overhead but may also increase code size and register pressure.",
                code: 'mov eax, edi\nlea ecx, [rsi+rsi*2]\nadd eax, ecx\nlea edx, [rax+rax*4]\nadd edx, 11\nmov eax, edx\nret'
            }
        ]
    },
    {
        title: 'CPU Execution and Microarchitecture',
        sections: [
            {
                title: 'Pipeline and Out-of-Order Execution',
                content: 'Modern x86 processors decode instructions into internal operations and execute independent work out of program order while preserving architectural correctness. Dependencies constrain this freedom: a consumer cannot use a value before its producer has made that value available. Understanding dependency chains explains why instruction count alone is not a sufficient performance metric.',
                code: 'mov rax, [rdi]\nadd rax, 7\nimul rax, 13\nadd rax, 5\nmov [rdi], rax\n\nmov rcx, [rsi]\nadd rcx, 3\nimul rcx, 9\nsub rcx, 4\nmov [rsi], rcx'
            },
            {
                title: 'Branch Prediction',
                content: 'Conditional branches create control-flow uncertainty. Modern CPUs predict branch direction and often predict target addresses so fetching and execution can continue speculatively. Predictable loops behave differently from irregular branches, which is why branch structure can matter even when both paths perform similar amounts of work.',
                code: 'cmp edi, 0\nje zero\ncmp edi, 1\nje one\ncmp edi, 2\nje two\ncmp edi, 3\nje three\nmov eax, 4\nret\nzero:\nxor eax, eax\nret\none:\nmov eax, 1\nret\ntwo:\nmov eax, 2\nret\nthree:\nmov eax, 3\nret'
            },
            {
                title: 'Latency and Throughput',
                content: 'Latency describes how long a dependent operation must wait for a result, while throughput describes how frequently independent operations can be completed. A loop with a long dependency chain can be latency-bound even when the processor has sufficient execution resources for many independent instructions.',
                code: 'xor eax, eax\nxor ecx, ecx\n.loop:\n    add eax, edi\n    add ecx, esi\n    add eax, edi\n    add ecx, esi\n    add eax, edi\n    add ecx, esi\n    add eax, edi\n    add ecx, esi\n    dec edx\n    jnz .loop\nadd eax, ecx\nret'
            }
        ]
    },
    {
        title: 'SIMD and Vector Programming',
        sections: [
            {
                title: 'SSE and AVX Registers',
                content: 'SIMD instructions process several values in parallel. XMM registers hold 128-bit vectors, YMM registers extend them to 256 bits and AVX-512 introduces wider ZMM registers. Vector code is useful when the same arithmetic operation applies independently to many data elements.',
                code: 'vmovups ymm0, [rdi]\nvmovups ymm1, [rsi]\nvaddps ymm0, ymm0, ymm1\nvmulps ymm0, ymm0, ymm2\nvsubps ymm0, ymm0, ymm3\nvmovups [rdx], ymm0\nvzeroupper\nret'
            },
            {
                title: 'Vectorized Loops',
                content: 'A scalar loop handles one element per iteration. A vectorized loop handles a group of elements and usually finishes with a scalar remainder loop. Alignment, aliasing, trip count and data layout influence whether vectorization is profitable.',
                code: 'xor rcx, rcx\n.loop:\n    cmp rcx, r8\n    jae .done\n    vmovups ymm0, [rdi+rcx*4]\n    vmovups ymm1, [rsi+rcx*4]\n    vaddps ymm0, ymm0, ymm1\n    vmovups [rdx+rcx*4], ymm0\n    add rcx, 8\n    jmp .loop\n.done:\n    vzeroupper\n    ret'
            },
            {
                title: 'Horizontal and Packed Operations',
                content: 'Packed instructions operate on lanes independently while horizontal operations combine values within a vector. Understanding lane semantics is important for reductions, dot products, image processing and numeric kernels.',
                code: 'vmovups ymm0, [rdi]\nvmovups ymm1, [rdi+32]\nvaddps ymm0, ymm0, ymm1\nvextractf128 xmm1, ymm0, 1\nvaddps xmm0, xmm0, xmm1\nvhaddps xmm0, xmm0, xmm0\nvhaddps xmm0, xmm0, xmm0\nvmovss [rsi], xmm0\nvzeroupper\nret'
            }
        ]
    },
    {
        title: 'Atomics, Memory Ordering and Lock-Free Assembly',
        sections: [
            {
                title: 'LOCK and Atomic Read-Modify-Write',
                content: 'Atomic operations require the processor to make a read-modify-write sequence indivisible with respect to competing threads. x86 provides instructions such as LOCK XADD and LOCK CMPXCHG. The LOCK prefix is not merely a compiler keyword: it changes the architectural synchronization semantics of the instruction.',
                code: 'mov eax, 1\nlock xadd [rdi], eax\nmov ecx, eax\nmov eax, 2\nlock xadd [rdi], eax\nadd ecx, eax\nret'
            },
            {
                title: 'Compare-and-Swap',
                content: 'CAS reads the current value and replaces it only when it equals an expected value. Software repeatedly loads the current state, computes a new state and attempts CMPXCHG. If another thread changes the value first, the operation fails and the loop retries.',
                code: 'mov rax, [rdi]\n.retry:\n    mov rcx, rax\n    add rcx, rsi\n    lock cmpxchg [rdi], rcx\n    jne .retry\nmov rax, rcx\nret'
            },
            {
                title: 'Spinlocks',
                content: 'A spinlock repeatedly attempts to acquire a lock without sleeping. It can be appropriate for extremely short critical sections where the owner is expected to release quickly, but excessive contention wastes CPU resources. The assembly primitive is only one component of the overall synchronization design.',
                code: 'mov eax, 1\n.try:\n    xchg eax, [rdi]\n    test eax, eax\n    jnz .wait\n    ret\n.wait:\n    pause\n    mov eax, 1\n    jmp .try'
            }
        ]
    },
    {
        title: 'ELF, Linking and Relocation',
        sections: [
            {
                title: 'ELF Structure',
                content: 'Linux executables and shared objects commonly use ELF. Headers describe the file and program layout, sections organize link-time information and program headers describe runtime segments. Symbols connect names to addresses while relocation records describe places that the linker or loader must adjust.',
                code: 'section .text\nglobal main\nextern puts\n\nmain:\n    lea rdi, [rel message]\n    call puts\n    xor eax, eax\n    ret\n\nsection .rodata\nmessage db "hello from ELF", 0'
            },
            {
                title: 'Relocations',
                content: 'A relocation represents an address-dependent value that cannot be finalized until the linker knows where relevant symbols will reside. Position-independent code uses RIP-relative addressing and indirection mechanisms such as the GOT to reduce dependence on a fixed load address.',
                code: 'default rel\nglobal read_value\nextern external_value\n\nsection .text\nread_value:\n    mov rax, [rel external_value]\n    add rax, 17\n    ret'
            },
            {
                title: 'PLT and GOT',
                content: 'Dynamic calls may use the Procedure Linkage Table and Global Offset Table. The GOT contains runtime-resolved addresses while the PLT provides call stubs. This architecture allows shared libraries to be loaded at addresses selected by the runtime loader.',
                code: 'default rel\nglobal call_external\nextern puts\nsection .text\ncall_external:\n    lea rdi, [rel message]\n    call puts\n    xor eax, eax\n    ret\nsection .rodata\nmessage db "dynamic call", 0'
            }
        ]
    },
    {
        title: 'System Calls and Linux Kernel Interface',
        sections: [
            {
                title: 'x86-64 Syscall ABI',
                content: "The Linux x86-64 syscall interface places the syscall number in RAX and arguments in registers according to the kernel ABI. Unlike a normal user-space function call, SYSCALL transfers execution through the kernel's system-call entry mechanism.",
                code: 'global _start\nsection .text\n_start:\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [rel message]\n    mov rdx, message_len\n    syscall\n\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\nsection .rodata\nmessage db "hello from a syscall", 10\nmessage_len equ $-message'
            },
            {
                title: 'File Descriptors',
                content: 'Unix I/O uses integer file descriptors. Standard input, output and error are conventionally represented by 0, 1 and 2. System calls such as read, write and close operate on these descriptors and form the basis of many higher-level I/O abstractions.',
                code: 'mov rax, 0\nmov rdi, 0\nlea rsi, [rel buffer]\nmov rdx, 128\nsyscall\ntest rax, rax\njle done\nmov rdx, rax\nmov rax, 1\nmov rdi, 1\nlea rsi, [rel buffer]\nsyscall\ndone:\nmov rax, 60\nxor rdi, rdi\nsyscall\nsection .bss\nbuffer resb 128'
            },
            {
                title: 'mmap and Memory',
                content: 'Memory can be requested from the kernel using mmap. The resulting virtual mapping becomes part of the process address space and can be configured with protection and mapping flags. Low-level runtimes, allocators and language implementations often build abstractions on top of these primitives.',
                code: 'mov rax, 9\nxor rdi, rdi\nmov rsi, 4096\nmov rdx, 3\nmov r10, 34\nmov r8, -1\nxor r9, r9\nsyscall\ntest rax, rax\njs failed\nmov r12, rax\nmov byte [r12], 65\nmov byte [r12+1], 66\nmov byte [r12+2], 67\nmov rax, 11\nmov rdi, r12\nmov rsi, 4096\nsyscall\nfailed:\nret'
            }
        ]
    },
    {
        title: 'Interrupts, Exceptions and Privilege Levels',
        sections: [
            {
                title: 'Privilege Rings',
                content: 'x86 defines privilege levels that separate code with different authority. Operating systems normally execute application code at a less privileged level and kernel code at a privileged level. The CPU enforces access restrictions through paging permissions, descriptor state and controlled transition mechanisms.',
                code: 'mov rax, cr3\nmov rbx, cr0\nand rbx, 0xffffffff\nmov rcx, rflags\nret'
            },
            {
                title: 'Interrupt Descriptor Table',
                content: 'The IDT maps interrupt and exception vectors to handler entry points. Hardware interrupts, processor exceptions and software-generated interrupts use architectural mechanisms that allow the operating system to transfer control to privileged handlers.',
                code: 'global interrupt_stub\nsection .text\ninterrupt_stub:\n    push rax\n    push rcx\n    push rdx\n    mov rax, 0\n    mov rcx, 0\n    mov rdx, 0\n    pop rdx\n    pop rcx\n    pop rax\n    iretq'
            },
            {
                title: 'User to Kernel Transition',
                content: 'A user process cannot simply jump into arbitrary kernel code. Controlled instructions such as SYSCALL establish a processor-defined transition where the operating system validates the requested service and arguments before operating on behalf of the process.',
                code: 'mov eax, 60\nxor edi, edi\nsyscall'
            }
        ]
    },
    {
        title: 'Bootloaders and Bare-Metal Assembly',
        sections: [
            {
                title: 'Real Mode',
                content: 'Legacy x86 firmware begins execution in a constrained environment derived from the original 16-bit architecture. Boot code must establish enough processor state to load additional code and eventually transition into a modern execution mode.',
                code: 'bits 16\norg 0x7c00\nstart:\n    xor ax, ax\n    mov ds, ax\n    mov es, ax\n    mov ss, ax\n    mov sp, 0x7c00\n    mov si, message\n.print:\n    lodsb\n    test al, al\n    jz halt\n    mov ah, 0x0e\n    int 0x10\n    jmp .print\nhalt:\n    cli\n    hlt\n    jmp halt\nmessage db "booting", 0\ntimes 510-($-$$) db 0\ndw 0xaa55'
            },
            {
                title: 'Entering Protected and Long Mode',
                content: 'A modern boot path establishes descriptor tables, enables paging and selects the processor mode required by the operating system. Long mode requires suitable page tables and control-register configuration before 64-bit code can execute.',
                code: 'bits 16\ncli\nlgdt [gdt_descriptor]\nmov eax, cr0\nor eax, 1\nmov cr0, eax\njmp 0x08:protected_mode\n\nbits 32\nprotected_mode:\n    mov ax, 0x10\n    mov ds, ax\n    mov es, ax\n    mov ss, ax\n    mov eax, cr4\n    or eax, 1 << 5\n    mov cr4, eax\n    mov eax, cr0\n    or eax, 1 << 31\n    mov cr0, eax\n    ret'
            },
            {
                title: 'Minimal Bare-Metal Runtime',
                content: "Bare-metal programs cannot assume an operating system, C runtime or initialized stack. Startup code establishes the execution environment explicitly and then transfers control to the program's main logic.",
                code: 'bits 64\nglobal _start\nsection .text\n_start:\n    lea rsp, [stack_top]\n    xor rbp, rbp\n    call kernel_main\n.hang:\n    cli\n    hlt\n    jmp .hang\nkernel_main:\n    mov rax, 0xb8000\n    mov word [rax], 0x1f41\n    ret\nsection .bss\nalign 16\nstack resb 4096\nstack_top:'
            }
        ]
    },
    {
        title: 'Virtual Memory and Paging',
        sections: [
            {
                title: 'Four-Level Page Tables',
                content: 'Typical x86-64 operating systems translate virtual addresses through multiple page-table levels. A virtual address is divided into indexes and an offset; the processor walks the hierarchy using the root referenced by CR3. Permissions are enforced during translation.',
                code: 'mov rax, cr3\nmov rbx, rdi\nshr rbx, 39\nand rbx, 0x1ff\nmov rcx, rdi\nshr rcx, 30\nand rcx, 0x1ff\nmov rdx, rdi\nshr rdx, 21\nand rdx, 0x1ff\nmov r8, rdi\nshr r8, 12\nand r8, 0x1ff\nmov r9, rdi\nand r9, 0xfff\nret'
            },
            {
                title: 'TLB',
                content: 'Page-table walks are expensive compared with a translation-cache hit. The Translation Lookaside Buffer stores recently used virtual-to-physical translations. Memory access patterns therefore affect not only data-cache behavior but also address-translation behavior.',
                code: 'mov rax, [rdi]\nmov rbx, [rdi+4096]\nmov rcx, [rdi+8192]\nmov rdx, [rdi+12288]\nadd rax, rbx\nadd rax, rcx\nadd rax, rdx\nret'
            },
            {
                title: 'Page Faults and Permissions',
                content: 'A page fault occurs when an access cannot be completed under the current virtual-memory rules. The kernel can inspect the fault reason, determine whether the mapping is valid and either repair the mapping or terminate the process.',
                code: 'mov rax, cr2\nmov rbx, [rsp]\ntest rbx, 1\njz not_present\ntest rbx, 2\njnz write_fault\ntest rbx, 4\njnz user_fault\nnot_present:\nxor eax, eax\nret\nwrite_fault:\nmov eax, 1\nret\nuser_fault:\nmov eax, 2\nret'
            }
        ]
    },
    {
        title: 'Reverse Engineering and Binary Analysis',
        sections: [
            {
                title: 'Reading Disassembly',
                content: 'Reverse engineering begins by reconstructing higher-level intent from machine instructions. Registers, memory references and control-flow edges provide evidence about parameters, local variables and return values. The goal is to identify stable semantic relationships rather than merely translate every instruction literally.',
                code: 'push rbp\nmov rbp, rsp\nmov eax, edi\nimul eax, esi\nadd eax, edx\ncmp eax, 100\njle .small\nsub eax, 25\njmp .done\n.small:\nadd eax, 5\n.done:\npop rbp\nret'
            },
            {
                title: 'Control Flow Graphs',
                content: 'A function can be represented as basic blocks connected by branches. Conditional jumps create edges and loops create cycles. A control-flow graph helps identify loops, switch dispatch, early exits and error paths in stripped binaries.',
                code: 'cmp edi, 0\nje .zero\ncmp edi, 10\njl .low\ncmp edi, 100\njl .medium\njmp .high\n.zero:\nxor eax, eax\nret\n.low:\nmov eax, 1\nret\n.medium:\nmov eax, 2\nret\n.high:\nmov eax, 3\nret'
            },
            {
                title: 'Compiler Fingerprints',
                content: 'Compilers leave recognizable patterns in binaries through prologues, epilogues, switch lowering, stack alignment, register allocation and instruction selection. These patterns can help distinguish hand-written assembly from compiler-generated code and can reveal optimization choices.',
                code: 'lea eax, [rdi+rdi*4]\nlea eax, [rdi+rax*2]\nret'
            }
        ]
    },
    {
        title: 'Debugging Assembly',
        sections: [
            {
                title: 'GDB Registers and Memory',
                content: 'A debugger provides a controlled view of architectural state. Register inspection shows the current machine state while memory examination reveals stack frames, objects, pointers and raw instruction data. Debugging assembly is largely the process of correlating those observations with control flow.',
                code: 'push rbp\nmov rbp, rsp\nsub rsp, 32\nmov [rbp-8], rdi\nmov [rbp-16], rsi\nmov rax, [rbp-8]\nadd rax, [rbp-16]\nmov [rbp-24], rax\nmov rax, [rbp-24]\nleave\nret'
            },
            {
                title: 'Breakpoints and Single Stepping',
                content: 'Instruction-level stepping exposes the exact state transition caused by each instruction. Breakpoints can be placed at function boundaries or specific addresses, while conditional breakpoints help isolate rare execution paths.',
                code: 'mov rax, rdi\ntest rax, rax\njz .zero\nimul rax, rsi\nadd rax, 42\nret\n.zero:\nxor eax, eax\nret'
            },
            {
                title: 'Core Dumps',
                content: 'A core dump preserves process state after a crash. Register values, stack memory and instruction pointers can be inspected to reconstruct the failing path. At the assembly level, the instruction pointer and stack are often the first pieces of evidence.',
                code: 'mov rax, [rdi]\nmov rbx, [rax]\nmov rcx, [rbx+8]\nmov rdx, [rcx+16]\nmov rax, [rdx+24]\nret'
            }
        ]
    },
    {
        title: 'Performance Engineering with Assembly',
        sections: [
            {
                title: 'Cycle Measurement',
                content: 'Low-level performance work requires measurement rather than assumptions. Timestamp instructions can measure elapsed processor cycles, although serialization and scheduling effects must be considered. Repeated measurements and controlled environments are necessary for meaningful results.',
                code: 'lfence\nrdtsc\nshl rdx, 32\nor rax, rdx\nmov r8, rax\nlfence\n\ncall workload\n\nlfence\nrdtsc\nshl rdx, 32\nor rax, rdx\nsub rax, r8\nret'
            },
            {
                title: 'Cache Behavior',
                content: 'Caches exploit spatial and temporal locality. Sequential accesses usually expose predictable locality while pointer chasing can create dependent cache misses. Assembly makes memory access patterns explicit, which makes it useful for studying cache-sensitive algorithms.',
                code: 'xor eax, eax\nxor ecx, ecx\n.loop:\n    add eax, [rdi+rcx*64]\n    add ecx, 1\n    cmp ecx, esi\n    jl .loop\nret'
            },
            {
                title: 'Branch and Memory Tradeoffs',
                content: 'Performance often involves a tradeoff between branch-heavy code and branchless transformations. Conditional moves, arithmetic masks and lookup tables can sometimes reduce control-flow uncertainty, but they may increase instruction or memory pressure.',
                code: 'mov eax, edi\ncmp eax, esi\ncmovg eax, esi\ncmp eax, edx\ncmovl eax, edx\nret'
            }
        ]
    },
    {
        title: 'Advanced Assembly Programming',
        sections: [
            {
                title: 'Position Independent Routines',
                content: 'Position-independent code avoids absolute addresses that depend on a fixed load location. RIP-relative addressing provides a convenient mechanism on x86-64 for accessing nearby constants and global data.',
                code: 'default rel\nglobal get_value\nsection .text\nget_value:\n    mov rax, [rel value]\n    add rax, 7\n    ret\nsection .data\nvalue dq 35'
            },
            {
                title: 'Jump Tables and Dispatch',
                content: 'Compilers commonly lower dense switch statements into jump tables. The selector is range checked, scaled to an entry size and used to load an indirect branch target. This creates compact dispatch code for many cases.',
                code: 'cmp edi, 3\nja .default\nlea rax, [rel .table]\nmovsxd rcx, dword [rax+rdi*4]\nadd rcx, rax\njmp rcx\n.table:\ndd .case0-.table\ndd .case1-.table\ndd .case2-.table\ndd .case3-.table\n.case0:\nmov eax, 10\nret\n.case1:\nmov eax, 20\nret\n.case2:\nmov eax, 30\nret\n.case3:\nmov eax, 40\nret\n.default:\nxor eax, eax\nret'
            },
            {
                title: 'Custom Memory Copy',
                content: 'A custom copy routine illustrates how address generation, vector operations and loop structure interact. Real implementations must additionally handle overlap, alignment, size thresholds and architecture-specific instruction sets.',
                code: 'mov rcx, rdx\ncmp rcx, 32\njb .small\n.loop:\n    vmovdqu ymm0, [rsi]\n    vmovdqu ymm1, [rsi+32]\n    vmovdqu [rdi], ymm0\n    vmovdqu [rdi+32], ymm1\n    add rsi, 64\n    add rdi, 64\n    sub rcx, 64\n    cmp rcx, 64\n    jae .loop\n.small:\n    test rcx, rcx\n    jz .done\n.byte:\n    mov al, [rsi]\n    mov [rdi], al\n    inc rsi\n    inc rdi\n    dec rcx\n    jnz .byte\n.done:\n    vzeroupper\n    ret'
            }
        ]
    },
    {
        title: 'Assembly Projects',
        sections: [
            {
                title: 'Linux Syscall-Only Program',
                content: 'A syscall-only program removes the normal language runtime and directly exercises the kernel ABI. Such a project demonstrates process startup, register conventions, system calls, sections, linking and executable layout in one small artifact.',
                code: 'global _start\nsection .text\n_start:\n    mov eax, 1\n    mov edi, 1\n    lea rsi, [rel text]\n    mov edx, text_len\n    syscall\n    mov eax, 60\n    xor edi, edi\n    syscall\nsection .rodata\ntext db "assembly project", 10\ntext_len equ $-text'
            },
            {
                title: 'ELF Parser',
                content: 'An ELF parser project can read an executable as bytes and decode its ELF header, program headers, section headers and symbol information. The project connects binary representation with operating-system loading semantics.',
                code: 'mov eax, dword [rdi]\ncmp eax, 0x464c457f\njne invalid\nmovzx eax, word [rdi+16]\nmovzx ecx, word [rdi+18]\nmov rdx, [rdi+32]\nmov r8w, [rdi+56]\nmov r9w, [rdi+58]\nret\ninvalid:\nmov eax, -1\nret'
            },
            {
                title: 'Lock-Free Queue Primitive',
                content: 'A lock-free queue project combines atomic operations, memory ordering, cache behavior and data ownership. The core challenge is not writing CMPXCHG itself but designing a state machine whose concurrent transitions remain valid under contention.',
                code: 'mov rax, [rdi]\n.retry:\n    mov rcx, rax\n    mov rdx, [rsi]\n    mov [rsi+8], rdx\n    lock cmpxchg [rdi], rcx\n    jne .retry\nmov rax, 1\nret'
            },
            {
                title: 'Mini Assembler and Disassembler',
                content: 'A small assembler can tokenize instruction mnemonics, parse registers and immediates, construct instruction encodings and emit machine-code bytes. A disassembler performs the inverse process by decoding bytes into structured instructions.',
                code: 'cmp byte [rdi], 0x90\nje nop\ncmp byte [rdi], 0xc3\nje ret_instruction\ncmp byte [rdi], 0xcc\nje breakpoint\nmov eax, -1\nret\nnop:\nmov eax, 1\nret\nret_instruction:\nmov eax, 2\nret\nbreakpoint:\nmov eax, 3\nret'
            }
        ]
    }
];