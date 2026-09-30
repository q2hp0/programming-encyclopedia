asmTopics.push({
    title: 'Complex Algorithms and Data Structures in Assembly',
    sections: [
        {
            title: 'Recursive Fibonacci with Stack Frames',
            content: 'Recursion in assembly has no hidden support from the language: every call has to push a return address, and every level of recursion has to preserve whatever registers it still needs after the recursive call returns. This function computes fib(n) by saving n across the two recursive calls using the stack, which is exactly what a compiler-generated stack frame does under the hood in a language like C.',
            code: 'fib:\n    push rbp\n    mov rbp, rsp\n    cmp rdi, 1\n    jle base_case\n    push rdi\n    dec rdi\n    call fib\n    pop rdi\n    push rax\n    sub rdi, 2\n    call fib\n    pop rbx\n    add rax, rbx\n    jmp fib_done\nbase_case:\n    mov rax, rdi\nfib_done:\n    pop rbp\n    ret'
        },
        {
            title: 'Partitioning for Quicksort',
            content: 'The partition step is the part of quicksort that actually does the work; the recursive calls around it are bookkeeping. This routine implements a Lomuto partition over a 64-bit integer array: rdi is the array base, rsi is the low index, rdx is the high index, and the pivot is the value at the high index. It walks the range once, swapping any element smaller than the pivot into the growing left region.',
            code: 'partition:\n    mov r8, [rdi + rdx*8]\n    mov r9, rsi\n    dec r9\n    mov rcx, rsi\npartition_loop:\n    cmp rcx, rdx\n    jge partition_end\n    mov r10, [rdi + rcx*8]\n    cmp r10, r8\n    jge partition_skip\n    inc r9\n    mov r11, [rdi + r9*8]\n    mov [rdi + r9*8], r10\n    mov [rdi + rcx*8], r11\npartition_skip:\n    inc rcx\n    jmp partition_loop\npartition_end:\n    inc r9\n    mov r10, [rdi + r9*8]\n    mov r11, [rdi + rdx*8]\n    mov [rdi + r9*8], r11\n    mov [rdi + rdx*8], r10\n    mov rax, r9\n    ret'
        },
        {
            title: 'Singly Linked List Insertion',
            content: 'A node here is two 8-byte fields: a value and a next pointer, so each node is 16 bytes. This routine inserts a new node at the head of the list. It receives the address of the head pointer variable in rdi, the value to store in rsi, and the address of a pre-allocated 16-byte node in rdx. It writes the value and links the new node in front of whatever the head pointer currently references.',
            code: 'list_push_front:\n    mov [rdx], rsi\n    mov r8, [rdi]\n    mov [rdx + 8], r8\n    mov [rdi], rdx\n    ret'
        },
        {
            title: 'Open-Addressing Hash Table Lookup',
            content: 'A minimal open-addressing table stores keys in a fixed-size array and resolves collisions by scanning forward to the next free or matching slot, which is simpler to implement in assembly than a chained table since it needs no pointers. This lookup takes a table base in rdi, table size in rsi, and a key in rdx, computes a simple multiplicative hash, and scans linearly until it finds the key or an empty slot marked by zero.',
            code: 'hash_lookup:\n    mov rax, rdx\n    imul rax, 2654435761\n    and rax, rsi\n    dec rsi\n    and rax, rsi\n    inc rsi\nlookup_loop:\n    mov r8, [rdi + rax*8]\n    cmp r8, 0\n    je not_found\n    cmp r8, rdx\n    je found\n    inc rax\n    cmp rax, rsi\n    jl lookup_loop\n    xor rax, rax\n    jmp lookup_loop\nfound:\n    mov rax, 1\n    ret\nnot_found:\n    xor rax, rax\n    ret'
        }
    ]
});
