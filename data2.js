var topics2=[
["abstract classes","abstract classes",[
["what makes a class abstract","a class becomes abstract the moment it declares at least one pure virtual function, a virtual function with no body, marked by setting it equal to zero. an abstract class cannot be instantiated directly, since the compiler has no implementation to run for that function if an object were created.",
"class shape{\npublic:\n    virtual double area() = 0;\n};"],
["pure virtual functions","a pure virtual function only declares a signature and forces every non abstract derived class to supply its own implementation. a class can still mix pure virtual functions with normal virtual or non virtual functions, so an abstract class can provide some shared behavior alongside the parts it forces subclasses to define.",
"class shape{\npublic:\n    virtual double area() = 0;\n    void label(){ std::cout<<\"a shape\"<<std::endl; }\n};"],
["interfaces via abstract classes","c++ has no dedicated interface keyword, so an abstract class with only pure virtual functions and no data members is used to play that role, defining a contract of behavior that unrelated classes can implement without sharing any actual code between them.",
"class drawable{\npublic:\n    virtual void draw() = 0;\n    virtual ~drawable() = default;\n};\nclass circle : public drawable{\npublic:\n    void draw() override{ std::cout<<\"circle\"<<std::endl; }\n};"],
["abstract vs concrete classes","a concrete class implements every function it declares and can be instantiated freely, while an abstract class leaves at least one function unfinished on purpose. code is often written against the abstract base type so it can work with any concrete class that fulfills that contract.",
"drawable* d = new circle();\nd->draw();\ndelete d;"],
["mixing abstract and concrete inheritance","a derived class does not have to implement every pure virtual function it inherits, but if it leaves any unimplemented, it remains abstract itself and still cannot be instantiated, meaning the obligation to finish the contract simply passes further down the inheritance chain.",
"class shape{ public: virtual double area()=0; virtual void draw()=0; };\nclass partial : public shape{ public: double area() override{ return 0; } };"]
]],
["templates","templates",[
["function templates","a function template lets the compiler generate a separate version of a function for each type it is used with, based on a single generic definition. the compiler deduces the type from the arguments passed in, so the caller usually does not need to specify it explicitly.",
"template<typename t>\nt add(t a, t b){\n    return a + b;\n}\nstd::cout << add(2,3) << std::endl;\nstd::cout << add(1.5,2.5) << std::endl;"],
["class templates","a class template generalizes an entire class over one or more types, which is how containers like std::vector work internally. when the template is used, the caller supplies the concrete type in angle brackets, and the compiler generates a version of the class for that type.",
"template<typename t>\nclass box{\n    t value;\npublic:\n    box(t v) : value(v) {}\n    t get(){ return value; }\n};\nbox<int> b(5);"],
["template specialization","sometimes the generic version of a template is not appropriate for a specific type, so c++ allows a specialization that provides a completely separate implementation just for that type, which the compiler will prefer whenever that exact type is used instead of the general template.",
"template<typename t>\nvoid printit(t v){ std::cout<<v<<std::endl; }\ntemplate<>\nvoid printit<bool>(bool v){ std::cout<<(v?\"true\":\"false\")<<std::endl; }"],
["variadic templates","a variadic template accepts an arbitrary number of arguments of possibly different types, using a parameter pack. this is the mechanism behind functions like std::make_unique and std::vector's emplace_back, which forward an unknown number of constructor arguments through to another function.",
"template<typename t, typename... args>\nt make(args... a){\n    return t(a...);\n}"],
["type constraints","before c++20 concepts existed, templates often used std::enable_if to restrict which types a template could be used with, based on type traits like is_integral. concepts later gave a cleaner, more readable way to express the same kind of requirement directly in the template declaration.",
"#include <type_traits>\ntemplate<typename t>\ntypename std::enable_if<std::is_integral<t>::value, t>::type\ndoubleit(t v){\n    return v * 2;\n}"]
]],
["stl vectors","stl vectors",[
["basic vector operations","std::vector manages a resizable array on the heap, automatically growing its capacity as elements are added with push_back. it supports random access with the subscript operator in constant time, which makes it the default choice for a general purpose sequence container in most c++ code.",
"std::vector<int> v;\nv.push_back(1);\nv.push_back(2);\nstd::cout << v[0] << \" \" << v.size() << std::endl;"],
["iterators","an iterator is an object that behaves like a pointer and lets code walk through a container's elements without needing to know how that container is implemented internally. begin returns an iterator to the first element and end returns one just past the last element.",
"std::vector<int> v = {1,2,3};\nfor(auto it = v.begin(); it != v.end(); ++it){\n    std::cout << *it << std::endl;\n}"],
["capacity vs size","size is the number of elements currently stored, while capacity is how much space has actually been allocated, which can be larger than size to avoid reallocating on every single insertion. reserve can be called ahead of time to avoid repeated reallocations when the final size is roughly known.",
"std::vector<int> v;\nv.reserve(100);\nstd::cout << v.capacity() << \" \" << v.size() << std::endl;"],
["inserting and erasing","insert and erase let you add or remove elements at an arbitrary position rather than only at the end, but both operations can be relatively expensive on a vector since every element after that position has to shift to keep the array contiguous in memory.",
"std::vector<int> v = {1,2,4};\nv.insert(v.begin()+2, 3);\nv.erase(v.begin());\nfor(int x : v) std::cout << x << std::endl;"],
["vector of vectors","a vector can hold any type, including another vector, which is a common way to represent a 2d grid or matrix. each inner vector is independent and can even have a different length than the others, unlike a fixed size 2d array.",
"std::vector<std::vector<int>> grid(3, std::vector<int>(3,0));\ngrid[1][1] = 5;\nstd::cout << grid[1][1] << std::endl;"]
]],
["smart pointers","smart pointers",[
["unique_ptr","std::unique_ptr owns a heap allocated object exclusively and automatically deletes it when the unique_ptr itself is destroyed, which happens when it goes out of scope. it cannot be copied, only moved, which guarantees that exactly one unique_ptr owns the object at any given time.",
"#include <memory>\nstd::unique_ptr<int> p = std::make_unique<int>(10);\nstd::cout << *p << std::endl;"],
["shared_ptr","std::shared_ptr allows multiple smart pointers to share ownership of the same object using an internal reference count. the object is only deleted once the last shared_ptr referring to it is destroyed, which makes shared ownership scenarios safe without manual tracking of who is responsible for deleting it.",
"#include <memory>\nstd::shared_ptr<int> a = std::make_shared<int>(5);\nstd::shared_ptr<int> b = a;\nstd::cout << a.use_count() << std::endl;"],
["weak_ptr","a std::weak_ptr observes an object managed by a shared_ptr without contributing to its reference count, which means it does not keep the object alive on its own. this is used to break reference cycles that would otherwise prevent shared_ptr objects from ever reaching a count of zero.",
"std::shared_ptr<int> sp = std::make_shared<int>(7);\nstd::weak_ptr<int> wp = sp;\nif(auto locked = wp.lock()){\n    std::cout << *locked << std::endl;\n}"],
["custom deleters","by default a smart pointer calls delete on the object it owns, but a custom deleter can be supplied to run different cleanup logic instead, which is useful for resources that are not created with new, such as file handles or objects from a c style api.",
"#include <cstdio>\nauto deleter = [](FILE* f){ fclose(f); };\nstd::unique_ptr<FILE, decltype(deleter)> fp(fopen(\"a.txt\",\"r\"), deleter);"],
["avoiding cycles","two objects each holding a shared_ptr to the other creates a reference cycle where neither count ever reaches zero, causing a memory leak despite using smart pointers correctly elsewhere. the usual fix is to make one direction of the relationship a weak_ptr instead of a shared_ptr.",
"struct node{\n    std::shared_ptr<node> next;\n    std::weak_ptr<node> prev;\n};"]
]],
["lambda expressions","lambda expressions",[
["basic syntax","a lambda begins with a capture list in square brackets, followed by an optional parameter list and a body, producing an unnamed function object right where it is written. this is convenient for short pieces of logic that are only needed once and do not deserve a separate named function.",
"auto add = [](int a, int b){ return a + b; };\nstd::cout << add(2,3) << std::endl;"],
["capture by value vs reference","the capture list controls how a lambda accesses variables from the enclosing scope. capturing by value copies the variable's current value into the lambda, while capturing by reference lets the lambda read and modify the original variable, which matters if that variable changes after the lambda is created.",
"int x = 10;\nauto byval = [x](){ std::cout << x << std::endl; };\nauto byref = [&x](){ x++; };\nbyref();\nbyval();"],
["mutable lambdas","a lambda that captures by value normally cannot modify its own copies of those captured variables, since the generated call operator is const by default. adding the mutable keyword removes that restriction, allowing the lambda to change its internal copies without affecting the original variables outside.",
"int x = 5;\nauto f = [x]() mutable{ x++; std::cout << x << std::endl; };\nf();\nstd::cout << x << std::endl;"],
["lambdas with stl algorithms","lambdas are frequently passed directly into standard library algorithms like sort, find_if, and for_each as the comparison or predicate function, avoiding the need to write and name a separate small function purely to satisfy the algorithm's interface.",
"std::vector<int> v = {5,3,1,4};\nstd::sort(v.begin(), v.end(), [](int a, int b){ return a > b; });"],
["generic lambdas","since c++14, a lambda parameter can be declared with auto instead of a specific type, letting the same lambda body work with several different argument types, similar in spirit to a function template but written inline as an unnamed function object.",
"auto printit = [](auto v){ std::cout << v << std::endl; };\nprintit(5);\nprintit(3.14);"]
]],
["operator overloading","operator overloading",[
["arithmetic operators","overloading an arithmetic operator like plus lets objects of a custom class be combined with familiar syntax instead of calling a named function like add. the overloaded operator is usually written to return a new object rather than modifying either of the two operands it was given.",
"class vec2{\npublic:\n    int x,y;\n    vec2 operator+(const vec2& o) const{\n        return {x+o.x, y+o.y};\n    }\n};"],
["comparison operators","overloading comparison operators like equals or less than lets objects of a class be compared directly, and also lets them be used with standard algorithms and containers that rely on comparisons internally, such as sorting a vector of custom objects.",
"class point{\npublic:\n    int x,y;\n    bool operator==(const point& o) const{\n        return x==o.x && y==o.y;\n    }\n};"],
["stream insertion operator","overloading operator<< as a free function, usually declared a friend of the class, lets an object be printed directly with std::cout in the same style as built in types, which is one of the most common overloads written for custom classes used in everyday code.",
"class point{\npublic:\n    int x,y;\n    friend std::ostream& operator<<(std::ostream& os, const point& p){\n        os << p.x << \",\" << p.y;\n        return os;\n    }\n};"],
["subscript operator","overloading operator[] lets a custom class be indexed with square brackets just like an array or a vector, which is how classes that wrap raw arrays or implement their own containers provide familiar element access syntax to the code that uses them.",
"class arraywrap{\n    int data[5];\npublic:\n    int& operator[](int i){ return data[i]; }\n};"],
["assignment operator and rule of three","if a class manually manages a resource like heap memory, it usually needs to define its own copy constructor, copy assignment operator, and destructor together, known as the rule of three, since the default versions the compiler generates would copy the raw pointer rather than the data it points to.",
"class buffer{\n    int* data;\npublic:\n    buffer(int size){ data = new int[size]; }\n    ~buffer(){ delete[] data; }\n    buffer& operator=(const buffer& o){\n        delete[] data;\n        data = new int[1];\n        *data = *o.data;\n        return *this;\n    }\n};"]
]],
["exception handling","exception handling",[
["throw and catch basics","a function signals a failure by throwing an exception object rather than returning a special error value that a caller might forget to check. control immediately leaves the current function and unwinds up the call stack until it finds a matching catch block able to handle that type of exception.",
"try{\n    throw std::runtime_error(\"something failed\");\n} catch(std::exception& e){\n    std::cout << e.what() << std::endl;\n}"],
["the std::exception hierarchy","the standard library defines a base class std::exception with a virtual what function returning a description, and several derived exception types like std::runtime_error and std::logic_error for common categories of failure, which lets code catch broad or specific categories of error depending on what it needs.",
"try{\n    std::vector<int> v;\n    v.at(10);\n} catch(std::out_of_range& e){\n    std::cout << e.what() << std::endl;\n}"],
["multiple catch blocks","a single try block can be followed by several catch blocks, each handling a different exception type, and they are checked in order from top to bottom. a catch block for the base std::exception type placed last acts as a catch all for anything not matched earlier.",
"try{\n    throw std::out_of_range(\"bad index\");\n} catch(std::out_of_range& e){\n    std::cout << \"range\" << std::endl;\n} catch(std::exception& e){\n    std::cout << \"other\" << std::endl;\n}"],
["custom exception classes","a program can define its own exception type by inheriting from std::exception or one of its derived classes, overriding the what function to provide a message specific to that failure, which lets calling code catch application specific error categories rather than only generic ones.",
"class myerror : public std::exception{\npublic:\n    const char* what() const noexcept override{\n        return \"custom failure\";\n    }\n};"],
["raii and exception safety","wrapping a resource in a class that acquires it in the constructor and releases it in the destructor, a pattern called raii, ensures the resource is still released correctly even if an exception is thrown partway through a function, since stack unwinding still calls local destructors.",
"class lockguard{\n    std::mutex& m;\npublic:\n    lockguard(std::mutex& mtx) : m(mtx){ m.lock(); }\n    ~lockguard(){ m.unlock(); }\n};"]
]],
["multithreading","multithreading",[
["creating threads","std::thread starts a new thread of execution that runs a given function concurrently with the rest of the program. the thread begins running as soon as the object is constructed, and extra arguments passed after the function are forwarded to it just like a normal function call.",
"#include <thread>\nvoid task(int id){ std::cout << \"thread \" << id << std::endl; }\nstd::thread t(task, 1);\nt.join();"],
["joining and detaching","join blocks the calling thread until the started thread finishes, which is the usual way to make sure a thread completes before the program continues. detach lets the thread run independently in the background, but then no other code can wait for it or retrieve information from it afterward.",
"std::thread t([](){ std::cout << \"running\" << std::endl; });\nt.detach();"],
["mutex and race conditions","when multiple threads read and write the same variable without coordination, a race condition can occur, producing unpredictable results depending on timing. a std::mutex is used to ensure only one thread can access a protected section of code at a time, avoiding those conflicting updates.",
"std::mutex m;\nint counter = 0;\nvoid increment(){\n    m.lock();\n    counter++;\n    m.unlock();\n}"],
["lock_guard","manually calling lock and unlock is error prone, especially if an exception is thrown between them, leaving the mutex locked forever. std::lock_guard acquires the mutex in its constructor and releases it automatically in its destructor, tying the lock's lifetime to a scope instead of manual calls.",
"std::mutex m;\nvoid safeincrement(int& counter){\n    std::lock_guard<std::mutex> guard(m);\n    counter++;\n}"],
["condition variables","a condition variable lets one thread sleep until another thread signals that some condition has become true, which avoids wastefully checking a flag in a loop over and over. it is typically used together with a mutex to protect the shared condition being waited on.",
"std::condition_variable cv;\nstd::mutex m;\nbool ready=false;\nvoid waiter(){\n    std::unique_lock<std::mutex> lk(m);\n    cv.wait(lk, [](){ return ready; });\n}"]
]],
["move semantics","move semantics",[
["lvalues and rvalues","an lvalue refers to an object with a persistent identity, such as a named variable, while an rvalue is typically a temporary value with no name, like the result of an expression. this distinction matters because move semantics is specifically designed to take advantage of rvalues, which are safe to steal resources from.",
"int x = 5;\nint y = x + 1;"],
["move constructor","a move constructor transfers ownership of a resource, such as a heap allocated buffer, from a temporary or explicitly moved from object into a new object, typically by copying just a pointer and setting the source pointer to null instead of allocating and copying the entire underlying data.",
"class buffer{\n    int* data;\npublic:\n    buffer(buffer&& o) noexcept : data(o.data){\n        o.data = nullptr;\n    }\n};"],
["move assignment operator","similar to the move constructor, a move assignment operator transfers ownership into an already existing object, first releasing whatever resource that object currently holds, then taking the resource from the source object and leaving the source in a valid but empty state.",
"buffer& operator=(buffer&& o) noexcept{\n    if(this != &o){\n        delete[] data;\n        data = o.data;\n        o.data = nullptr;\n    }\n    return *this;\n}"],
["std::move","std::move does not actually move anything by itself, it simply casts its argument to an rvalue reference, which tells the compiler that the caller is willing to let that object's resources be taken. the actual transfer only happens if a move constructor or move assignment operator is invoked afterward.",
"std::vector<int> a = {1,2,3};\nstd::vector<int> b = std::move(a);\nstd::cout << b.size() << std::endl;"],
["rule of five","once a class defines a move constructor or move assignment operator, it is generally expected to also define the copy constructor, copy assignment operator, and destructor, together known as the rule of five, since defining any one of these usually implies the class manages a resource that needs consistent handling everywhere.",
"class resource{\npublic:\n    resource(const resource&);\n    resource& operator=(const resource&);\n    resource(resource&&) noexcept;\n    resource& operator=(resource&&) noexcept;\n    ~resource();\n};"]
]],
["const correctness","const correctness",[
["const variables","declaring a variable const tells the compiler it should never be reassigned after initialization, which lets the compiler catch accidental modifications at compile time rather than allowing a silent bug to appear later. it also documents to anyone reading the code that the value is meant to stay fixed.",
"const double pi = 3.14159;\nstd::cout << pi << std::endl;"],
["const parameters","passing a parameter as a const reference gives a function read only access to a caller's data without copying it, which combines the efficiency of pass by reference with a compile time guarantee that the function will not modify the argument it was given.",
"void printname(const std::string& name){\n    std::cout << name << std::endl;\n}"],
["const member functions","marking a member function const promises that calling it will not modify the object, which allows that function to be called on const objects and const references to the class. attempting to modify a data member inside a const function is a compile time error.",
"class box{\n    int width;\npublic:\n    int getwidth() const{ return width; }\n};"],
["const pointers vs pointers to const","a pointer to const data cannot be used to modify what it points to, but the pointer itself can be reassigned to point elsewhere. a const pointer is the opposite, it always points to the same address, but the data at that address can still be modified through it.",
"int x=1, y=2;\nconst int* p1 = &x;\np1 = &y;\nint* const p2 = &x;\n*p2 = 5;"],
["const and overloading","a class can define two versions of the same member function, one const and one not, and the compiler will automatically choose the const version when called on a const object, allowing different behavior or return types depending on whether the object itself is const.",
"class arr{\n    int data[3]={1,2,3};\npublic:\n    int& operator[](int i){ return data[i]; }\n    const int& operator[](int i) const{ return data[i]; }\n};"]
]]
];
for(var ti=0;ti<topics2.length;ti++){ topics.push(topics2[ti]); }
