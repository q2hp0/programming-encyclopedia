var topics=[
["pointers","pointers",[
["what a pointer is","a pointer is a variable whose value is a memory address rather than an ordinary value. the type of the pointer tells the compiler how to interpret the bytes at that address, which matters because dereferencing a pointer of the wrong type reads memory incorrectly.",
"int x = 10;\nint* p = &x;\nstd::cout << p << std::endl;\nstd::cout << *p << std::endl;"],
["pointer arithmetic and arrays","incrementing a pointer does not add 1 to the raw address, it moves forward by the size of the pointed to type. this is why array indexing and pointer arithmetic are interchangeable in c++: an array name decays into a pointer to its first element in most expressions.",
"int arr[3] = {10,20,30};\nint* p = arr;\nfor(int i=0;i<3;i++){\n    std::cout << *(p+i) << std::endl;\n}"],
["pointers to pointers","a pointer can itself be stored at an address, which is what a pointer to a pointer represents. this is used for things like modifying a caller's pointer from inside a function, or building structures like dynamic 2d arrays where each row is itself a pointer.",
"int x = 5;\nint* p = &x;\nint** pp = &p;\nstd::cout << **pp << std::endl;"],
["function pointers","a function itself has an address in memory, and a function pointer stores that address so a function can be passed around, stored in a variable, or chosen at runtime, which is the basis of simple callback systems in c code and older c++ code before lambdas existed.",
"void greet(){ std::cout << \"hello\" << std::endl; }\nint main(){\n    void (*fp)() = greet;\n    fp();\n}"],
["void pointers","a void pointer can hold the address of any type but carries no information about what that type actually is, so it must be cast to a concrete pointer type before it can be dereferenced. it is mainly used in low level or generic c style interfaces.",
"int x = 42;\nvoid* vp = &x;\nint* ip = static_cast<int*>(vp);\nstd::cout << *ip << std::endl;"],
["dangling and wild pointers","a dangling pointer still holds the address of memory that has already been freed or gone out of scope, and dereferencing it produces undefined behavior even though the code may appear to compile and run correctly. setting a pointer to nullptr after deleting it helps catch accidental reuse.",
"int* p = new int(5);\ndelete p;\np = nullptr;\nif(p != nullptr){\n    std::cout << *p << std::endl;\n}"]
]],
["references","references",[
["basic references","a reference is bound permanently to the object it is initialized with and behaves as an alias for it, sharing the same memory rather than pointing to it separately. unlike a pointer it cannot be null and cannot be reseated to refer to a different object later.",
"int a = 5;\nint& r = a;\nr = 10;\nstd::cout << a << std::endl;"],
["references as function parameters","passing by reference avoids copying large objects and lets a function modify the caller's variable directly. combining this with const, as in a const reference parameter, gives the efficiency of passing by reference while still preventing the function from changing the original value.",
"void increase(int& n){ n++; }\nvoid printval(const std::string& s){ std::cout << s << std::endl; }"],
["reference vs pointer","references and pointers both let you avoid copying data, but a reference cannot be reassigned once bound and always refers to a valid object, while a pointer can be reassigned, can be null, and requires explicit dereferencing with the star operator every time it is used.",
"int a=1,b=2;\nint& r=a;\nr=b;\nstd::cout<<a<<std::endl;\nint* p=&a;\np=&b;\nstd::cout<<*p<<std::endl;"],
["returning references","a function can return a reference to let the caller modify the underlying data directly, which is how operator[] on containers like std::vector works. returning a reference to a local variable is a common bug, since that variable is destroyed the moment the function ends.",
"std::vector<int> v={1,2,3};\nint& first = v[0];\nfirst = 99;\nstd::cout << v[0] << std::endl;"],
["rvalue references","an rvalue reference, written with two ampersands, binds to a temporary value rather than an existing named variable, and is the mechanism behind move semantics, allowing a function to detect when it has been handed something disposable that can be taken from instead of copied.",
"void handle(int&& x){ std::cout << \"rvalue \" << x << std::endl; }\nint main(){\n    handle(5);\n}"]
]],
["classes and objects","classes and objects",[
["defining a class","a class groups related data members and member functions into a single type. access specifiers like public and private control which parts are visible from outside the class, letting a class hide its internal representation while exposing only the operations it wants to allow.",
"class point{\nprivate:\n    int x, y;\npublic:\n    void set(int a,int b){ x=a; y=b; }\n    void show(){ std::cout<<x<<\",\"<<y<<std::endl; }\n};"],
["constructors and destructors","a constructor runs automatically when an object is created and is typically used to set up initial state, while a destructor runs automatically when the object is destroyed and is typically used to release resources such as memory or open files that the object owns.",
"class file{\npublic:\n    file(){ std::cout<<\"opened\"<<std::endl; }\n    ~file(){ std::cout<<\"closed\"<<std::endl; }\n};\nint main(){\n    file f;\n}"],
["the this pointer","inside a non static member function, this is an implicit pointer to the object the function was called on. it is mainly useful for disambiguating a member from a parameter with the same name, or for returning the current object by reference to allow chained method calls.",
"class counter{\n    int n=0;\npublic:\n    counter& add(int v){ this->n += v; return *this; }\n    int get(){ return n; }\n};"],
["static members","a static data member is shared across every object of the class rather than each object having its own copy, and a static member function can be called without any object at all. this is useful for tracking information that belongs to the class as a whole.",
"class widget{\n    static int count;\npublic:\n    widget(){ count++; }\n    static int getcount(){ return count; }\n};\nint widget::count = 0;"],
["encapsulation","keeping data members private and exposing controlled access through public getter and setter functions lets a class change its internal representation later without breaking code that uses it, since outside code only ever depends on the public interface rather than the internal layout.",
"class account{\n    double balance=0;\npublic:\n    void deposit(double amt){ if(amt>0) balance+=amt; }\n    double getbalance() const{ return balance; }\n};"]
]],
["inheritance","inheritance",[
["basic inheritance","a derived class inherits the public and protected members of a base class, letting related types share common code instead of duplicating it. the derived class can add new members of its own and is considered a more specific version of the base type.",
"class animal{\npublic:\n    void breathe(){ std::cout<<\"breathing\"<<std::endl; }\n};\nclass fish : public animal{\npublic:\n    void swim(){ std::cout<<\"swimming\"<<std::endl; }\n};"],
["protected access","a protected member is hidden from code outside the class hierarchy but remains visible to derived classes, unlike a private member which is hidden even from them. this lets a base class expose implementation details to its subclasses without making them part of the public interface.",
"class base{\nprotected:\n    int secret=5;\n};\nclass derived : public base{\npublic:\n    void reveal(){ std::cout<<secret<<std::endl; }\n};"],
["constructor chaining","when a derived object is created, the base class constructor runs first to set up the inherited part of the object before the derived class constructor body runs. a derived constructor can explicitly choose which base constructor to call using an initializer list.",
"class base{\npublic:\n    base(int x){ std::cout<<\"base \"<<x<<std::endl; }\n};\nclass derived : public base{\npublic:\n    derived(int x) : base(x){ std::cout<<\"derived\"<<std::endl; }\n};"],
["multiple inheritance","c++ allows a class to inherit from more than one base class at once, combining members from each. this is powerful but can introduce ambiguity if two base classes define a member with the same name, which must then be resolved explicitly using the base class name.",
"class flyer{ public: void fly(){ std::cout<<\"flying\"<<std::endl; } };\nclass swimmer{ public: void swim(){ std::cout<<\"swimming\"<<std::endl; } };\nclass duck : public flyer, public swimmer{};"],
["the diamond problem","when two base classes both inherit from the same common ancestor and a fourth class inherits from both, the ancestor's members can end up duplicated. virtual inheritance solves this by ensuring only one shared copy of the common base exists in the final object.",
"class base{ public: int x=1; };\nclass a : virtual public base{};\nclass b : virtual public base{};\nclass c : public a, public b{};"]
]],
["polymorphism","polymorphism",[
["virtual functions","marking a base class function virtual tells the compiler that calls through a base pointer or reference should use the actual derived class version at runtime rather than the base version, which is what allows one piece of code to work correctly across many different derived types.",
"class shape{ public: virtual void draw(){ std::cout<<\"shape\"<<std::endl; } };\nclass circle : public shape{ public: void draw() override{ std::cout<<\"circle\"<<std::endl; } };"],
["how virtual dispatch works","under the hood, a class with virtual functions typically has a hidden pointer to a virtual table, an array of function pointers for that specific type. a call through a base pointer looks up the correct function in that table at runtime instead of being decided at compile time.",
"shape* s = new circle();\ns->draw();\ndelete s;"],
["virtual destructors","if a class is meant to be used polymorphically and deleted through a base class pointer, its destructor must be virtual. otherwise deleting through the base pointer only runs the base destructor, skipping any cleanup the derived class destructor was supposed to perform.",
"class base{ public: virtual ~base(){ std::cout<<\"base destroyed\"<<std::endl; } };\nclass derived : public base{ public: ~derived(){ std::cout<<\"derived destroyed\"<<std::endl; } };"],
["overriding vs overloading","overriding replaces a base class virtual function with a new implementation in a derived class using the same signature, resolved at runtime. overloading defines multiple functions with the same name but different parameter lists in the same scope, resolved at compile time based on the arguments used.",
"class base{ public: virtual void speak(){ std::cout<<\"base\"<<std::endl; } };\nvoid print(int x){ std::cout<<x<<std::endl; }\nvoid print(double x){ std::cout<<x<<std::endl; }"],
["runtime type checks","dynamic_cast can safely attempt to convert a base class pointer to a derived class pointer, returning nullptr if the object is not actually of that derived type. this lets code check the concrete type of a polymorphic object at runtime when that information is genuinely needed.",
"shape* s = new circle();\ncircle* c = dynamic_cast<circle*>(s);\nif(c != nullptr){ std::cout<<\"is a circle\"<<std::endl; }"]
]]
];
