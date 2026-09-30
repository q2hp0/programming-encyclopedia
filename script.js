var currentPage = "home";
var currentLanguage = "cpp";
var cppTopics = null;
var rustTopicsNormalized = null;
var selectedTopic = 0;
var topicBackPage = "home";

function normalizeSection(section, index) {
    if (Array.isArray(section)) {
        return {
            title: section[0] || "Section " + (index + 1),
            content: section[1] || "",
            code: section[2] || ""
        };
    }

    if (section && typeof section === "object") {
        return {
            title: section.title || section.name || section.heading || "Section " + (index + 1),
            content: section.content || section.description || section.text || "",
            code: section.code || ""
        };
    }

    return {
        title: "Section " + (index + 1),
        content: String(section || ""),
        code: ""
    };
}

function normalizeTopic(topic, index) {
    if (Array.isArray(topic)) {
        return {
            id: String(topic[0] != null ? topic[0] : index),
            title: topic[1] || "Topic " + (index + 1),
            sections: Array.isArray(topic[2])
                ? topic[2].map(normalizeSection)
                : []
        };
    }

    if (topic && typeof topic === "object") {
        var sections = topic.sections || topic.content || [];

        return {
            id: String(topic.id != null ? topic.id : index),
            title: topic.title || topic.name || topic.heading || "Topic " + (index + 1),
            sections: Array.isArray(sections)
                ? sections.map(normalizeSection)
                : []
        };
    }

    return null;
}

function buildTopics() {
    var result = [];
    var groups = [];

    if (typeof topics !== "undefined" && Array.isArray(topics)) {
        groups.push(topics);
    }

    if (typeof topics2 !== "undefined" && Array.isArray(topics2)) {
        groups.push(topics2);
    }

    if (typeof topics3 !== "undefined" && Array.isArray(topics3)) {
        groups.push(topics3);
    }

    if (typeof topics4 !== "undefined" && Array.isArray(topics4)) {
        groups.push(topics4);
    }

    groups.forEach(function(group) {
        group.forEach(function(topic) {
            var normalized = normalizeTopic(topic, result.length);

            if (normalized && normalized.title) {
                result.push(normalized);
            }
        });
    });

    return result;
}

cppTopics = buildTopics();
var rustSource = [];

if (typeof rustTopics !== "undefined" && Array.isArray(rustTopics)) {
    rustSource = rustSource.concat(rustTopics);
}

if (typeof rustData !== "undefined" && Array.isArray(rustData)) {
    rustSource = rustSource.concat(rustData);
}

rustTopicsNormalized = rustSource.map(normalizeTopic).filter(Boolean);

asmTopicsNormalized = typeof asmTopics !== "undefined" && Array.isArray(asmTopics)
    ? asmTopics.map(normalizeTopic).filter(Boolean)
    : [];

var allTopics = cppTopics;

function openLanguage(language) {
    currentLanguage = (language === "rust" || language === "asm") ? language : "cpp";
    allTopics = currentLanguage === "rust" ? rustTopicsNormalized : (currentLanguage === "asm" ? asmTopicsNormalized : cppTopics);
    selectedTopic = 0;
    topicBackPage = "home";
    showPage("encyclopedia");
}

function openSources(language) {
    currentLanguage = (language === "rust" || language === "asm") ? language : "cpp";
    allTopics = currentLanguage === "rust" ? rustTopicsNormalized : (currentLanguage === "asm" ? asmTopicsNormalized : cppTopics);
    showPage("sources");
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(function(element) {
        element.classList.remove("active");
    });

    var target = document.getElementById(page);

    if (!target) {
        return;
    }

    target.classList.add("active");
    currentPage = page;
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (page === "home") {
        renderFeaturedTopics();
    }

    if (page === "encyclopedia") {
        renderTopics();

        if (allTopics.length) {
            selectTopic(selectedTopic);
        }
    }

    if (page === "sources") {
        renderSources();
    }
}

function renderFeaturedTopics() {
    var container = document.getElementById("featuredTopics");

    if (!container) {
        return;
    }

    var asmNames = [
        "Assembly Language Fundamentals",
        "x86-64 Architecture and Instruction Set",
        "Memory, Stack and Calling Conventions",
        "Assembly and the Compiler",
        "CPU Execution and Microarchitecture",
        "SIMD and Vector Programming",
        "Atomics, Memory Ordering and Lock-Free Assembly",
        "ELF, Linking and Relocation",
        "System Calls and Linux Kernel Interface",
        "Interrupts, Exceptions and Privilege Levels",
        "Bootloaders and Bare-Metal Assembly",
        "Virtual Memory and Paging",
        "Reverse Engineering and Binary Analysis",
        "Debugging Assembly",
        "Performance Engineering with Assembly",
        "Advanced Assembly Programming",
        "Assembly Projects"
    ];

    var cppNames = [
        "Memory Model, Object Representation and Undefined Behavior",
        "Allocators, Memory Resources and Custom Memory Management",
        "C++ Security, Defensive Programming and Safe Systems Design",
        "Object Model, ABI and Virtual Dispatch",
        "Cache Locality and Data-Oriented Design",
        "Plugin Architecture and Dynamic Libraries",
        "Building a High-Performance C++ Runtime",
        "Designing a Concurrent C++ System",
        "Building a Custom Task Scheduler",
        "C++ Memory Architecture and Object Lifetime",
        "Building a C++ Networking Stack",
        "Project: Building a Multi-Threaded HTTP Server from Raw Sockets"
    ];

    var rustNames = [
        "Ownership, Borrowing and Lifetimes",
        "Unsafe Rust and Raw Memory",
        "Memory Layout and Data Representation",
        "Send, Sync and Concurrent Ownership",
        "Atomics and Lock-Free Programming",
        "Async Rust and Runtime Architecture",
        "Pin, Unpin and Self-Referential State",
        "Zero-Cost Abstractions",
        "Custom Allocators and Memory Pools",
        "Lock-Free Queues and Work Scheduling",
        "Compiler and Parser Architecture",
        "Building a Lock-Free Rust Runtime",
        "Building a Rust Compiler and Virtual Machine"
    ,
        "Atomic Memory Ordering and Lock-Free Rust"
    ,
        "Zero-Cost Abstractions and Monomorphization"
    ,
        "Procedural Macros and Compile-Time Programming",
        "Rust Trait Object and VTable Architecture",
        "Rust Kernel and OS-Level Systems Programming"
    ];

    var selected = [];

    cppNames.forEach(function(name) {
        var topic = cppTopics.find(function(item) {
            return item.title === name;
        });

        if (topic) {
            selected.push({
                topic: topic,
                language: "cpp"
            });
        }
    });

    asmNames.forEach(function(name) {
        var topic = asmTopicsNormalized.find(function(item) {
            return item.title === name;
        });
        if (topic) {
            selected.push({
                topic: topic,
                language: "asm"
            });
        }
    });

    rustNames.forEach(function(name) {
        var topic = rustTopicsNormalized.find(function(item) {
            return item.title === name;
        });

        if (topic) {
            selected.push({
                topic: topic,
                language: "rust"
            });
        }
    });

    container.innerHTML = selected.map(function(item) {
        var index = item.language === "rust"
            ? rustTopicsNormalized.indexOf(item.topic)
            : item.language === "asm"
                ? asmTopicsNormalized.indexOf(item.topic)
                : cppTopics.indexOf(item.topic);

        return '<button class="featured-topic" onclick="openFeaturedTopic(' +
            index + ', \'' + item.language + '\')">' +
            '<strong>' + escapeHtml(item.topic.title) + '</strong>' +
            '<span>' + item.language.toUpperCase() + ' · ' +
            item.topic.sections.length + ' sections</span>' +
            '</button>';
    }).join("");

    if (!selected.length) {
        container.innerHTML = '<div class="empty-state">No advanced sections available.</div>';
    }
}

function openFeaturedTopic(index, language) {
    currentLanguage = (language === "rust" || language === "asm") ? language : "cpp";
    allTopics = currentLanguage === "rust" ? rustTopicsNormalized : (currentLanguage === "asm" ? asmTopicsNormalized : cppTopics);
    openTopic(index, "home");
}

function renderTopics(filter) {
    var list = document.getElementById("topicList");

    if (!list) {
        return;
    }

    var query = String(filter || "").toLowerCase().trim();

    var visible = allTopics.filter(function(topic) {
        return !query || topic.title.toLowerCase().includes(query);
    });

    if (!visible.length) {
        list.innerHTML = '<div class="empty-state">No topics found.</div>';
        return;
    }

    list.innerHTML = visible.map(function(topic) {
        var index = allTopics.indexOf(topic);
        var active = index === selectedTopic ? " active" : "";

        return '<button class="topic-item' + active + '" onclick="selectTopic(' + index + ')">' +
            '<span>' + escapeHtml(topic.title) + '</span>' +
            '<small>' + topic.sections.length + ' sections</small>' +
        '</button>';
    }).join("");
}

function selectTopic(index) {
    if (!allTopics.length) {
        return;
    }

    if (index < 0 || index >= allTopics.length) {
        index = 0;
    }

    selectedTopic = index;

    var topic = allTopics[index];
    var content = document.getElementById("topicContent");

    if (!content) {
        return;
    }

    content.innerHTML = renderTopic(topic);
    highlightCodeBlocks();

    renderTopics(document.getElementById("topicSearch")?.value || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openTopic(index, backPage) {
    if (!allTopics.length || index < 0 || index >= allTopics.length) {
        return;
    }

    selectedTopic = index;
    topicBackPage = backPage || "home";

    var content = document.getElementById("standaloneTopicContent");

    if (!content) {
        return;
    }

    content.innerHTML = renderTopic(allTopics[index]);
    highlightCodeBlocks();
    showPage("topic");
}

function backFromTopic() {
    showPage(topicBackPage || "home");
}

function renderTopic(topic) {
    return (
        '<div class="topic-header">' +
            '<h1>' + escapeHtml(topic.title) + '</h1>' +
        '</div>' +
        '<div class="section-stack">' +
            topic.sections.map(function(section, sectionIndex) {
                return renderSection(section, sectionIndex);
            }).join("") +
        '</div>'
    );
}

function renderSection(section, index) {
    var content = formatText(section.content);
    var code = section.code
        ? renderCode(section.code)
        : "";

    return (
        '<article class="topic-section">' +
            '<div class="section-body">' +
                '<h2>' + escapeHtml(section.title) + '</h2>' +
                content +
                code +
            '</div>' +
        '</article>'
    );
}

function formatText(text) {
    var source = String(text || "").replace(/\r/g, "");
    var lines = source.split("\n");
    var html = "";
    var textBuffer = [];
    var codeBuffer = [];
    var mode = null;
    var parenDepth = 0;
    var braceDepth = 0;

    function flushText() {
        if (!textBuffer.length) {
            return;
        }

        var value = textBuffer.join("\n").trim();

        if (value) {
            value.split(/\n\s*\n/).forEach(function(paragraph) {
                var paragraphValue = paragraph.trim();

                if (paragraphValue) {
                    html += "<p>" +
                        escapeHtml(paragraphValue).replace(/\n/g, "<br>") +
                        "</p>";
                }
            });
        }

        textBuffer = [];
    }

    function flushCode() {
        if (!codeBuffer.length) {
            return;
        }

        var code = codeBuffer.join("\n").trim();

        if (code) {
            html += renderCode(code);
        }

        codeBuffer = [];
        mode = null;
        parenDepth = 0;
        braceDepth = 0;
    }

    function count(value, token) {
        return (value.match(new RegExp("\\" + token, "g")) || []).length;
    }

    function isCmakeStart(value) {
        return /^(cmake_minimum_required|project|add_executable|add_library|add_subdirectory|target_link_libraries|target_include_directories|target_compile_definitions|target_compile_options|target_compile_features|target_sources|target_link_options|target_precompile_headers|set|option|find_package|find_program|find_library|find_path|find_file|include|install|configure_file|enable_testing|add_test|file|message|include_directories|link_directories|add_compile_options|add_definitions|add_custom_command|add_custom_target)\s*\(/.test(value);
    }

    function isCppStart(value) {
        return (
            /^#\s*(include|define|if|ifdef|ifndef|elif|else|endif|pragma)\b/.test(value) ||
            /^(class|struct|namespace|template|concept|enum|union)\b/.test(value) ||
            /^(public|private|protected)\s*:/.test(value) ||
            /^(if|else|for|while|switch|case|default|try|catch)\b/.test(value) ||
            /^(using|typedef|static_assert)\b/.test(value) ||
            /^(int|void|char|float|double|bool|auto|long|short|unsigned|signed|const|constexpr|static|extern|inline|virtual|typename)\b/.test(value)
        );
    }

    function isSingleCodeLine(value) {
        return (
            /^std::/.test(value) ||
            /^[A-Za-z_][A-Za-z0-9_]*(::|->|\.)[A-Za-z_][A-Za-z0-9_]*/.test(value) ||
            /^(return|throw)\b/.test(value) ||
            /^(const|constexpr|static|auto|int|void|bool|char|float|double)\b.*;\s*$/.test(value) ||
            /^#\s*(include|define|pragma)\b/.test(value)
        );
    }

    function updateDepth(line) {
        parenDepth += count(line, "(");
        parenDepth -= count(line, ")");
        braceDepth += count(line, "{");
        braceDepth -= count(line, "}");
    }

    function finishStructuredBlock(value) {
        if (mode === "cmake") {
            return parenDepth <= 0 && value.endsWith(")");
        }

        if (mode === "cpp") {
            return braceDepth <= 0 && (
                value.endsWith("}") ||
                value.endsWith(";")
            );
        }

        return false;
    }

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();

        if (/^```/.test(trimmed)) {
            if (mode === "fenced") {
                flushCode();
            } else {
                flushText();
                mode = "fenced";
            }
            continue;
        }

        if (mode === "fenced") {
            codeBuffer.push(line);
            continue;
        }

        if (mode === "cmake" || mode === "cpp") {
            if (!trimmed) {
                if (mode === "cmake" && parenDepth <= 0) {
                    flushCode();
                } else if (mode === "cpp" && braceDepth <= 0) {
                    flushCode();
                } else {
                    codeBuffer.push(line);
                }
                continue;
            }

            codeBuffer.push(line);
            updateDepth(line);

            if (finishStructuredBlock(trimmed)) {
                flushCode();
            }

            continue;
        }

        if (isCmakeStart(trimmed)) {
            flushText();
            mode = "cmake";
            codeBuffer.push(line);
            updateDepth(line);

            if (finishStructuredBlock(trimmed)) {
                flushCode();
            }

            continue;
        }

        if (isCppStart(trimmed)) {
            flushText();
            mode = "cpp";
            codeBuffer.push(line);
            updateDepth(line);

            if (
                braceDepth <= 0 &&
                (
                    trimmed.endsWith(";") ||
                    trimmed.endsWith("}")
                )
            ) {
                flushCode();
            }

            continue;
        }

        if (isSingleCodeLine(trimmed)) {
            flushText();
            html += renderCode(trimmed);
            continue;
        }

        textBuffer.push(line);
    }

    if (mode === "cmake" || mode === "cpp" || mode === "fenced") {
        flushCode();
    }

    flushText();

    return html;
}

function renderCode(code) {
    var id = "code-" + Math.random().toString(36).slice(2);

    return (
        '<div class="code-block">' +
            '<button class="copy-code" onclick="copyCode(\'' + id + '\')">Copy</button>' +
            '<pre><code id="' + id + '">' + escapeHtml(code) + '</code></pre>' +
        '</div>'
    );
}

function copyCode(id) {
    var element = document.getElementById(id);

    if (!element) {
        return;
    }

    navigator.clipboard.writeText(element.textContent).then(function() {
        var button = element.closest(".code-block").querySelector(".copy-code");

        if (!button) {
            return;
        }

        button.textContent = "Copied";

        setTimeout(function() {
            button.textContent = "Copy";
        }, 1200);
    });
}

function filterTopics(value) {
    renderTopics(value);
}

function renderSources(filter) {
    var grid = document.getElementById("sourcesGrid");

    if (!grid) {
        return;
    }

    var cppSources = typeof programmingSources !== "undefined"
        ? programmingSources
        : [];

    var rustSourceData = typeof rustSources !== "undefined" ? rustSources : [];

    var asmSourceData = typeof asmSources !== "undefined" ? asmSources : [];

    var sources = currentLanguage === "rust"
        ? rustSources
        : (currentLanguage === "asm" ? asmSourceData : cppSources);

    var query = String(filter || "").toLowerCase().trim();

    var visible = sources.filter(function(source) {
        return JSON.stringify(source).toLowerCase().includes(query);
    });

    grid.innerHTML = visible.map(function(source) {
        var name = source.name || source.title || "Programming Source";
        var description = source.description || source.desc || "";
        var url = source.url || source.link || "#";

        return '<a class="source-card" href="' +
            escapeAttribute(url) +
            '" target="_blank" rel="noopener noreferrer">' +
            '<div>' +
            '<h3>' + escapeHtml(name) + '</h3>' +
            '<p>' + escapeHtml(description) + '</p>' +
            '</div>' +
            '</a>';
    }).join("");

    if (!visible.length) {
        grid.innerHTML = '<div class="empty-state">No sources found.</div>';
    }
}

function filterSources(value) {
    renderSources(value);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function applyTheme() {
    var dark = localStorage.getItem("cpp-theme-v3") !== "light";
    document.body.classList.toggle("dark", dark);

    var button = document.getElementById("themeToggle");

    if (button) {
        button.textContent = dark ? "☀" : "☾";
        button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
}

function toggleTheme() {
    var dark = document.body.classList.toggle("dark");
    localStorage.setItem("cpp-theme-v3", dark ? "dark" : "light");
    applyTheme();
}

document.addEventListener("DOMContentLoaded", function() {
    renderFeaturedTopics();
    renderTopics();

    if (allTopics.length) {
        selectTopic(0);
    }

    renderSources();
    applyTheme();
});
window.addEventListener('load', applyTheme);

function highlightCodeBlocks() {
    if (typeof hljs === "undefined") {
        return;
    }
    document.querySelectorAll(".code-block pre code").forEach(function(block) {
        if (!block.dataset.highlighted) {
            hljs.highlightElement(block);
        }
    });
}
