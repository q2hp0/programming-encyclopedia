var topics6 = [
    {
        title: "Building a Real C++ Application from Scratch",
        sections: [
            {
                title: "The difference between learning C++ and engineering with C++",
                content: `Knowing individual C++ features does not automatically mean knowing how to build a C++ application.

A real program combines language features, ownership rules, error handling, interfaces, testing, build configuration and project structure.

A useful way to approach a new project is to avoid starting with classes immediately.

First define what the program actually needs to do.

Then identify the major responsibilities.

For example, imagine building a small command-line task manager.

The program needs to load tasks, represent tasks, modify them, save them and expose those operations through a user interface.

Those are different responsibilities even though they belong to the same application.

A practical design could therefore separate:

domain objects
storage
application services
user interface

The important idea is that C++ gives you the tools for this separation, but it does not automatically create a good architecture.

My recommendation is to start with the smallest useful architecture and introduce additional abstractions only when a real responsibility requires them.

Do not create ten interfaces for a program that currently has two operations.

The goal is not maximum abstraction.

The goal is making change predictable.

A useful mental model is:

data represents state
functions perform operations
classes enforce invariants
modules define boundaries
tests protect behavior
the build system connects everything

Once these responsibilities are separated, individual C++ features become much easier to reason about.`
            },
            {
                title: "Designing the domain model",
                content: `Suppose the task manager needs a Task object.

The task has an identifier, title and completion state.

The first version can be intentionally small.

The object should protect its own invariants instead of allowing every part of the application to modify its internal state directly.

For example, an empty title might be considered invalid.

The application should therefore establish that rule when a Task is created rather than hoping every caller remembers it.

This is an important object-oriented design principle.

An object should make invalid states difficult to represent.`,
                code: `class Task {
    int id_;
    std::string title_;
    bool completed_ = false;

public:
    Task(int id, std::string title)
        : id_(id),
          title_(std::move(title)) {
        if (title_.empty()) {
            throw std::invalid_argument("task title cannot be empty");
        }
    }

    int id() const {
        return id_;
    }

    const std::string& title() const {
        return title_;
    }

    bool completed() const {
        return completed_;
    }

    void complete() {
        completed_ = true;
    }
};`
            },
            {
                title: "Connecting storage and application logic",
                content: `The next design question is where tasks should be stored.

A beginner solution might place a vector directly inside main and perform all operations there.

That works for a tiny program but creates a problem when storage changes.

If tasks are later stored in a file or database, the application logic becomes coupled to that implementation.

A better design introduces a small repository boundary.

The repository describes what the application needs rather than how the data is physically stored.

This is one place where an interface can be justified because there is an actual replaceable responsibility.`,
                code: `class TaskRepository {
public:
    virtual ~TaskRepository() = default;

    virtual std::vector<Task> load() = 0;
    virtual void save(const std::vector<Task>& tasks) = 0;
};

class MemoryTaskRepository : public TaskRepository {
    std::vector<Task> tasks_;

public:
    std::vector<Task> load() override {
        return tasks_;
    }

    void save(const std::vector<Task>& tasks) override {
        tasks_ = tasks;
    }
};`
            },
            {
                title: "Mini project: task manager core",
                content: `Now the domain object and repository can be connected through an application service.

The service owns the workflow.

This is an important architectural distinction.

The repository knows how to store data.

The Task knows its own state.

The service coordinates operations.

The command-line interface should not need to know how persistence works.`,
                code: `class TaskService {
    TaskRepository& repository_;

public:
    explicit TaskService(TaskRepository& repository)
        : repository_(repository) {}

    void add_task(int id, std::string title) {
        auto tasks = repository_.load();

        tasks.emplace_back(id, std::move(title));

        repository_.save(tasks);
    }

    void complete_task(int id) {
        auto tasks = repository_.load();

        for (auto& task : tasks) {
            if (task.id() == id) {
                task.complete();
                repository_.save(tasks);
                return;
            }
        }

        throw std::runtime_error("task not found");
    }

    std::vector<Task> list_tasks() {
        return repository_.load();
    }
};`
            },
            {
                title: "My recommended evolution path",
                content: `For a real project, I would evolve this design gradually.

Version one can use an in-memory repository.

Version two can add file persistence.

Version three can add tests around the service.

Version four can introduce a command-line interface.

Version five can add a database only if the application's requirements justify it.

This progression is important because architecture should respond to requirements.

Starting with a database abstraction, plugin system, event bus and dependency injection framework before the program has a problem to solve usually creates more code than value.

A good architecture should make the next change easier.

That is a much more useful definition of maintainability than simply having many classes.`
            }
        ]
    },

    {
        title: "Designing a Small Event System in Modern C++",
        sections: [
            {
                title: "The idea behind events",
                content: `An event system allows one part of an application to announce that something happened without directly knowing which components are interested in the event.

This creates a useful form of decoupling.

For example, a media application might produce:

TrackStarted
TrackStopped
VolumeChanged
DeviceConnected

The playback system should not need to know whether logging, statistics or a user interface is listening.

The event system becomes the connection between these responsibilities.

This is useful in games, GUI applications, editors, servers and tools.

My recommendation is to keep an event system small.

An event bus should not become a universal replacement for ordinary function calls.

If component A directly needs the result of component B, a normal function call is usually clearer.

Events are most useful when one action can have multiple independent observers.`
            },
            {
                title: "Representing events with types",
                content: `C++ types can represent different event payloads.

A simple event might contain only an identifier.

A richer event can contain additional information.

Using concrete types gives the compiler an opportunity to check the payload instead of passing loosely structured strings or maps.`,
                code: `struct TrackStarted {
    int track_id;
};

struct TrackStopped {
    int track_id;
};

struct VolumeChanged {
    float volume;
};`
            },
            {
                title: "Building the event dispatcher",
                content: `A small dispatcher can store handlers associated with event types.

std::type_index can identify the concrete event type at runtime.

std::function can store handlers with different callable types.

This combines runtime type identification with type-erased callbacks.`,
                code: `class EventBus {
    using Handler = std::function<void(const void*)>;

    std::unordered_map<
        std::type_index,
        std::vector<Handler>
    > handlers_;

public:
    template <typename Event, typename Function>
    void subscribe(Function&& function) {
        handlers_[typeid(Event)].push_back(
            [handler = std::forward<Function>(function)](
                const void* event
            ) {
                handler(*static_cast<const Event*>(event));
            }
        );
    }

    template <typename Event>
    void publish(const Event& event) {
        auto it = handlers_.find(typeid(Event));

        if (it == handlers_.end()) {
            return;
        }

        for (auto& handler : it->second) {
            handler(&event);
        }
    }
};`
            },
            {
                title: "Mini project: logging and statistics subscribers",
                content: `Now the event bus can connect independent parts of the application.

The playback system only publishes an event.

The logger subscribes to it.

The statistics subsystem can independently subscribe to the same event.

Neither subscriber needs to be known by the playback system.`,
                code: `EventBus bus;

bus.subscribe<TrackStarted>(
    [](const TrackStarted& event) {
        std::cout
            << "started track "
            << event.track_id
            << '\\n';
    }
);

bus.subscribe<TrackStarted>(
    [](const TrackStarted& event) {
        std::cout
            << "statistics: track "
            << event.track_id
            << '\\n';
    }
);

TrackStarted event{42};

bus.publish(event);`
            },
            {
                title: "Where this design should and should not be used",
                content: `The event approach becomes attractive when many independent components react to the same state transition.

It becomes less attractive when events create long chains that are difficult to follow.

A function call has an obvious caller and callee.

An event can have an unknown number of consumers.

That flexibility is useful but also makes debugging harder.

For a small application, I would therefore prefer explicit calls until multiple independent consumers appear.

For a larger application, events can become an effective architectural boundary when their names, payloads and ownership rules remain clear.`
            }
        ]
    },

    {
        title: "Building a Thread Pool and Connecting It to Futures",
        sections: [
            {
                title: "Why a thread pool exists",
                content: `Creating a new operating-system thread for every small task is expensive and can create unnecessary scheduling overhead.

A thread pool creates a fixed group of worker threads and reuses them.

Tasks are placed into a queue.

Workers wait for work.

When a task becomes available, one worker removes it and executes it.

This design is common in servers, asset processors, build systems and background task frameworks.

The important engineering question is not simply how to create threads.

It is how to define ownership, synchronization, shutdown and exception propagation.`
            },
            {
                title: "The work queue",
                content: `The queue is shared by producers and workers.

A mutex protects the queue.

A condition variable allows workers to sleep while there is no work.

The stop state must also be synchronized.

This is a good example of several C++ concepts working together:

std::thread
std::mutex
std::condition_variable
std::queue
RAII
lambda expressions
templates`,
                code: `class ThreadPool {
    std::vector<std::thread> workers_;
    std::queue<std::function<void()>> tasks_;

    std::mutex mutex_;
    std::condition_variable condition_;
    bool stopping_ = false;

public:
    explicit ThreadPool(std::size_t count) {
        for (std::size_t i = 0; i < count; ++i) {
            workers_.emplace_back([this] {
                worker_loop();
            });
        }
    }

    ~ThreadPool() {
        {
            std::lock_guard lock(mutex_);
            stopping_ = true;
        }

        condition_.notify_all();

        for (auto& worker : workers_) {
            worker.join();
        }
    }

private:
    void worker_loop() {
        while (true) {
            std::function<void()> task;

            {
                std::unique_lock lock(mutex_);

                condition_.wait(lock, [this] {
                    return stopping_ || !tasks_.empty();
                });

                if (stopping_ && tasks_.empty()) {
                    return;
                }

                task = std::move(tasks_.front());
                tasks_.pop();
            }

            task();
        }
    }
};`
            },
            {
                title: "Returning results with futures",
                content: `A useful thread pool should not only execute fire-and-forget tasks.

Callers often need a result.

std::future provides a way for the producer to submit work and later retrieve its result.

The pool can use std::packaged_task to connect a callable with a future.`,
                code: `template <typename Function>
auto submit(Function&& function) {
    using Result = std::invoke_result_t<Function>;

    std::packaged_task<Result()> task(
        std::forward<Function>(function)
    );

    auto future = task.get_future();

    {
        std::lock_guard lock(mutex_);

        if (stopping_) {
            throw std::runtime_error("thread pool is stopping");
        }

        tasks_.emplace(
            [task = std::move(task)]() mutable {
                task();
            }
        );
    }

    condition_.notify_one();

    return future;
}`
            },
            {
                title: "Mini project: parallel computation",
                content: `Once submit returns a future, the same abstraction can execute independent calculations.

This example submits several calculations and waits for their results.

The caller does not need to manage individual worker threads.`,
                code: `ThreadPool pool(4);

auto first = pool.submit([] {
    return 20 * 20;
});

auto second = pool.submit([] {
    return 30 * 30;
});

auto third = pool.submit([] {
    return 40 * 40;
});

int result =
    first.get() +
    second.get() +
    third.get();

std::cout << result << '\\n';`
            },
            {
                title: "My engineering recommendations for concurrency",
                content: `Threading should be introduced because the workload benefits from concurrency, not because multiple threads look more advanced.

Before adding a thread pool, measure the workload.

Small tasks can be dominated by synchronization overhead.

A pool also needs an explicit shutdown policy.

Should pending tasks finish during destruction?

Should cancellation exist?

Can submitted tasks submit additional tasks?

What happens when a task throws?

These questions become part of the API design.

For production systems, these semantics should be documented before optimizing the implementation.

Concurrency is difficult primarily because of shared state and unclear ownership.

The safest concurrent design is often the one that shares the least mutable state.`
            }
        ]
    },

    {
        title: "Designing a Configuration System for a C++ Application",
        sections: [
            {
                title: "Configuration is an architectural boundary",
                content: `Configuration looks simple until an application grows.

A small program may read one integer from a file.

A larger application may have command-line arguments, environment variables, configuration files, defaults and runtime overrides.

If every subsystem reads configuration independently, the application becomes difficult to reason about.

A better design is to parse configuration at the boundary and convert it into a validated application configuration object.

The rest of the application should receive typed values instead of repeatedly parsing strings.`
            },
            {
                title: "Typed configuration",
                content: `A configuration object should represent the values the application actually understands.

For example, a server might require:

host
port
worker count
logging level
timeout

These values should have appropriate C++ types.

The configuration layer is responsible for validating them.`,
                code: `struct ServerConfig {
    std::string host;
    std::uint16_t port;
    std::size_t workers;
    std::chrono::milliseconds timeout;
};

ServerConfig make_default_config() {
    return {
        "127.0.0.1",
        8080,
        4,
        std::chrono::seconds(5)
    };
}`
            },
            {
                title: "Validation and normalization",
                content: `Parsing and validation should happen before the configuration reaches the rest of the program.

For example, port zero might have a special meaning depending on the application.

A worker count of zero may be invalid.

A timeout might need to remain within an acceptable range.

This creates a strong boundary.

After configuration creation, other components can trust the invariants instead of repeatedly checking them.`,
                code: `ServerConfig validate(ServerConfig config) {
    if (config.workers == 0) {
        throw std::invalid_argument(
            "worker count must be greater than zero"
        );
    }

    if (config.timeout <= std::chrono::milliseconds::zero()) {
        throw std::invalid_argument(
            "timeout must be positive"
        );
    }

    if (config.port == 0) {
        throw std::invalid_argument(
            "port must not be zero"
        );
    }

    return config;
}`
            },
            {
                title: "Mini project: command-line configuration",
                content: `A simple command-line parser can convert arguments into the typed configuration object.

The important architectural idea is that the command-line interface does not become the configuration model.

It is only one source of configuration.`,
                code: `ServerConfig parse_arguments(
    int argc,
    char** argv
) {
    ServerConfig config = make_default_config();

    for (int i = 1; i < argc; ++i) {
        std::string_view argument = argv[i];

        if (argument == "--workers" && i + 1 < argc) {
            config.workers =
                std::stoul(argv[++i]);
        } else if (
            argument == "--port" &&
            i + 1 < argc
        ) {
            config.port =
                static_cast<std::uint16_t>(
                    std::stoul(argv[++i])
                );
        }
    }

    return validate(std::move(config));
}`
            },
            {
                title: "A practical configuration hierarchy",
                content: `For a serious application, I recommend defining a clear precedence order.

For example:

built-in defaults
configuration file
environment variables
command-line arguments

Later sources override earlier ones.

The exact hierarchy is a project decision, but it should be explicit.

Another useful principle is to keep secrets separate from ordinary configuration.

Passwords, API keys and tokens should not accidentally become part of a configuration file committed to source control.

The configuration system should also make it easy to print safe diagnostics without exposing secrets.

Configuration is therefore not just parsing.

It is the process of converting external, untrusted and possibly incomplete input into a valid internal application state.`
            }
        ]
    },

    {
        title: "Building a Command-Line Tool with a Real Architecture",
        sections: [
            {
                title: "From a main function to an application",
                content: `Command-line programs are often written as one large main function.

That is acceptable for a small experiment.

Once the program has multiple commands, configuration, errors and reusable logic, main should become an entry point rather than the entire application.

A useful structure is:

argument parsing
command dispatch
application service
domain logic
output formatting

This allows the core functionality to be tested without launching the executable.`
            },
            {
                title: "Command dispatch",
                content: `A command can be represented by a function or callable object.

The command name is used to select the operation.

The implementation can remain independent of terminal formatting.`,
                code: `using Command =
    std::function<int(const std::vector<std::string>&)>;

std::unordered_map<std::string, Command> commands;

commands["hello"] = [](const auto&) {
    std::cout << "hello\\n";
    return 0;
};

commands["version"] = [](const auto&) {
    std::cout << "1.0.0\\n";
    return 0;
};`
            },
            {
                title: "Mini project: a file information tool",
                content: `The following example demonstrates the architectural idea using the filesystem library.

The command receives a path and reports basic information.

The filesystem operation itself is independent from argument parsing.`,
                code: `int file_info(
    const std::vector<std::string>& arguments
) {
    if (arguments.size() != 1) {
        std::cerr << "usage: file-info <path>\\n";
        return 1;
    }

    std::filesystem::path path = arguments[0];

    if (!std::filesystem::exists(path)) {
        std::cerr << "path does not exist\\n";
        return 1;
    }

    std::cout
        << "path: " << path << '\\n'
        << "size: " << std::filesystem::file_size(path)
        << '\\n';

    return 0;
}

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "usage: tool <command> [arguments]\\n";
        return 1;
    }

    std::unordered_map<std::string, Command> commands{
        {"file-info", file_info}
    };

    std::string command = argv[1];

    auto it = commands.find(command);

    if (it == commands.end()) {
        std::cerr << "unknown command\\n";
        return 1;
    }

    std::vector<std::string> arguments;

    for (int i = 2; i < argc; ++i) {
        arguments.emplace_back(argv[i]);
    }

    return it->second(arguments);
}`
            },
            {
                title: "Connecting the CLI to a reusable library",
                content: `The next step is to move the actual application logic out of main and the command handler.

For example, a FileInfo class or service could provide a typed result.

The CLI would then only translate that result into human-readable output.

This becomes particularly useful when the same functionality later needs a graphical interface, HTTP endpoint or automated test.`,
                code: `struct FileInfo {
    std::filesystem::path path;
    std::uintmax_t size;
};

FileInfo inspect_file(
    const std::filesystem::path& path
) {
    if (!std::filesystem::exists(path)) {
        throw std::runtime_error("file does not exist");
    }

    return {
        path,
        std::filesystem::file_size(path)
    };
}`
            },
            {
                title: "My recommendation for serious CLI projects",
                content: `Keep the command-line layer thin.

Do not make business logic depend on std::cout.

Do not make core classes parse argv.

Do not spread exit codes throughout the entire application.

Instead, let the core produce values or throw meaningful exceptions, then translate those results into CLI behavior at the outer boundary.

This creates a clean separation between application logic and presentation.

It also makes testing dramatically easier because the important behavior can be tested without spawning a process for every test case.`
            }
        ]
    },

    {
        title: "From Prototype to Production C++ Architecture",
        sections: [
            {
                title: "The prototype is allowed to be ugly",
                content: `A prototype has a different purpose from a production system.

The prototype exists to answer questions.

Can the algorithm work?

Is the idea fast enough?

Is the external API usable?

Does the problem actually need this feature?

Trying to make the first prototype perfectly abstract can slow down discovery.

However, once the design becomes understood, the prototype should not automatically become the production architecture.

The transition is where engineering decisions matter.

Identify which parts proved stable and which parts were only temporary experiments.

Keep validated ideas.

Remove accidental complexity.

Then introduce boundaries where future change is actually expected.`
            },
            {
                title: "A practical refactoring strategy",
                content: `A large rewrite is often riskier than incremental refactoring.

A safer process is:

identify one responsibility
write tests around its current behavior
extract the responsibility
compile
run tests
repeat

This keeps the program working while the architecture changes.

For example, if a large class handles networking, parsing and persistence, do not immediately redesign the entire application.

First identify which methods belong to each responsibility.

Then extract one coherent part.

The compiler becomes a useful tool during this process because type errors reveal places where the old coupling still exists.`
            },
            {
                title: "Mini project: evolving a simple cache",
                content: `Consider a prototype cache implemented directly with an unordered_map.

The first version can be extremely small.`,
                code: `class Cache {
    std::unordered_map<std::string, std::string> values_;

public:
    void set(std::string key, std::string value) {
        values_[std::move(key)] = std::move(value);
    }

    std::optional<std::string> get(
        const std::string& key
    ) const {
        auto it = values_.find(key);

        if (it == values_.end()) {
            return std::nullopt;
        }

        return it->second;
    }
};`
            },
            {
                title: "Adding policy without destroying simplicity",
                content: `Suppose the application later requires expiration.

Do not immediately create a generic policy framework.

First represent the actual requirement.

A cache entry can contain a value and expiration time.`,
                code: `struct CacheEntry {
    std::string value;
    std::chrono::steady_clock::time_point expires;
};

class TimedCache {
    std::unordered_map<std::string, CacheEntry> values_;

public:
    void set(
        std::string key,
        std::string value,
        std::chrono::seconds lifetime
    ) {
        values_[std::move(key)] = {
            std::move(value),
            std::chrono::steady_clock::now() + lifetime
        };
    }

    std::optional<std::string> get(
        const std::string& key
    ) {
        auto it = values_.find(key);

        if (it == values_.end()) {
            return std::nullopt;
        }

        if (
            std::chrono::steady_clock::now() >=
            it->second.expires
        ) {
            values_.erase(it);
            return std::nullopt;
        }

        return it->second.value;
    }
};`
            },
            {
                title: "Connecting the cache to concurrency",
                content: `If the cache becomes shared between worker threads, a new requirement appears.

The data structure is no longer only a storage problem.

It is now a synchronization problem.

A mutex can provide correctness for the first implementation.`,
                code: `class ThreadSafeCache {
    std::unordered_map<std::string, std::string> values_;
    mutable std::shared_mutex mutex_;

public:
    void set(std::string key, std::string value) {
        std::unique_lock lock(mutex_);
        values_[std::move(key)] = std::move(value);
    }

    std::optional<std::string> get(
        const std::string& key
    ) const {
        std::shared_lock lock(mutex_);

        auto it = values_.find(key);

        if (it == values_.end()) {
            return std::nullopt;
        }

        return it->second;
    }
};`
            },
            {
                title: "The bigger lesson",
                content: `This small cache demonstrates an important pattern in software engineering.

The design evolved because requirements changed.

The first version solved storage.

The second version solved expiration.

The third version solved concurrent access.

At each stage, the new abstraction was introduced because a real requirement appeared.

This is how I recommend approaching C++ architecture in general.

Start with a correct model.

Measure real requirements.

Add ownership boundaries when ownership becomes complicated.

Add interfaces when implementations actually need to vary.

Add concurrency when parallelism provides measurable value.

Add custom allocation when allocation behavior is a measured problem.

Add abstractions when they remove complexity rather than merely moving it around.

A good C++ codebase is not the one containing the most advanced language features.

It is the one where each advanced feature has a reason to exist.`
            }
        ]
    }
];

if (typeof topics4 !== "undefined") {
    topics4 = topics4.concat(topics6);
} else {
    var topics4 = topics6;
}
