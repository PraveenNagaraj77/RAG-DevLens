import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  FileText,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { projectsApi } from "@/api/projects.api";
import { conversationsApi } from "@/api/conversations.api";
import { messagesApi } from "@/api/messages.api";
import { Button } from "@/components/ui/button";

const SUGGESTED_QUESTIONS = [
  "What is this project about?",
  "Explain the project architecture.",
  "How does authentication work?",
  "Which files are related to this feature?",
];

const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-1 text-xl font-semibold">{children}</h1>
  ),

  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 text-lg font-semibold">{children}</h2>
  ),

  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold">{children}</h3>
  ),

  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,

  ul: ({ children }) => (
    <ul className="mb-3 ml-5 list-disc space-y-1">{children}</ul>
  ),

  ol: ({ children }) => (
    <ol className="mb-3 ml-5 list-decimal space-y-1">{children}</ol>
  ),

  li: ({ children }) => <li className="pl-1">{children}</li>,

  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),

  code: ({ inline, className, children }) => {
    if (inline) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
          {children}
        </code>
      );
    }

    return (
      <pre className="my-3 overflow-x-auto rounded-lg border bg-muted p-4">
        <code
          className={`font-mono text-xs leading-5 ${
            className || ""
          }`}
        >
          {children}
        </code>
      </pre>
    );
  },

  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 pl-4 text-muted-foreground">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="my-4 border-border" />,
};

function Chat() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [expandedSources, setExpandedSources] = useState({});

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingCancelledRef = useRef(false);
  const scrollFrameRef = useRef(null);

  const selectedProject = useMemo(
    () =>
      projects.find(
        (project) => project.id === selectedProjectId,
      ),
    [projects, selectedProjectId],
  );

  // --------------------------------------------------
  // Load projects
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        setError("");

        const response = await projectsApi.getAll();

        if (cancelled) return;

        const projectList = Array.isArray(response?.data)
          ? response.data
          : [];

        setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0].id);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load projects:", error);

        setError(
          error?.message || "Unable to load projects.",
        );
      } finally {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // Scroll to latest message
  // --------------------------------------------------

  useEffect(() => {
    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

    return () => {
      if (scrollFrameRef.current) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [messages.length, sending]);

  // --------------------------------------------------
  // Create conversation
  // --------------------------------------------------

  const createConversation = useCallback(async () => {
    const response = await conversationsApi.create({
      projectId: selectedProjectId,
      title: "DevLens AI Chat",
    });

    return response?.data;
  }, [selectedProjectId]);

  // --------------------------------------------------
  // Resize textarea
  // --------------------------------------------------

  const handleInputChange = useCallback((event) => {
    const value = event.target.value;
    const textarea = event.target;

    setInput(value);

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      140,
    )}px`;
  }, []);

  // --------------------------------------------------
  // Fast typewriter effect
  // --------------------------------------------------

  const typeAssistantMessage = useCallback(async (message) => {
    typingCancelledRef.current = false;

    const messageId = message.id;
    const text = message.content || "";

    setMessages((current) => [
      ...current,
      {
        id: messageId,
        role: "assistant",
        content: "",
        sources: message.sources || [],
        isTyping: true,
      },
    ]);

    if (!text) {
      setMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? {
                ...item,
                isTyping: false,
              }
            : item,
        ),
      );

      return;
    }

    const characters = Array.from(text);

    let currentIndex = 0;

    while (
      currentIndex < characters.length &&
      !typingCancelledRef.current
    ) {
      const nextIndex = Math.min(
        currentIndex + 8,
        characters.length,
      );

      const currentText = characters
        .slice(0, nextIndex)
        .join("");

      setMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? {
                ...item,
                content: currentText,
              }
            : item,
        ),
      );

      currentIndex = nextIndex;

      await new Promise((resolve) =>
        setTimeout(resolve, 16),
      );
    }

    if (!typingCancelledRef.current) {
      setMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? {
                ...item,
                content: text,
                isTyping: false,
              }
            : item,
        ),
      );
    }
  }, []);

  // --------------------------------------------------
  // Send message
  // --------------------------------------------------

  const handleSendMessage = useCallback(
    async (event) => {
      event?.preventDefault();

      const message = input.trim();

      if (!message || sending) return;

      if (!selectedProjectId) {
        setError("Please select a project first.");
        return;
      }

      try {
        setSending(true);
        setError("");

        setMessages((current) => [
          ...current,
          {
            id: `user-${Date.now()}`,
            role: "user",
            content: message,
          },
        ]);

        setInput("");

        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }

        let activeConversationId = conversationId;

        if (!activeConversationId) {
          const conversation =
            await createConversation();

          activeConversationId = conversation?.id;

          if (!activeConversationId) {
            throw new Error(
              "Failed to create conversation.",
            );
          }

          setConversationId(activeConversationId);
        }

        const response = await messagesApi.send(
          activeConversationId,
          {
            message,
          },
        );

        const assistantMessage =
          response?.data?.assistantMessage;

        if (assistantMessage) {
          await typeAssistantMessage({
            id: assistantMessage.id,
            content: assistantMessage.content,
            sources: response?.data?.sources || [],
          });
        }
      } catch (error) {
        console.error(
          "Failed to send message:",
          error,
        );

        setError(
          error?.message ||
            "Unable to process your message.",
        );
      } finally {
        setSending(false);

        requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      }
    },
    [
      input,
      sending,
      selectedProjectId,
      conversationId,
      createConversation,
      typeAssistantMessage,
    ],
  );

  // --------------------------------------------------
  // Enter to send
  // --------------------------------------------------

  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        handleSendMessage(event);
      }
    },
    [handleSendMessage],
  );

  // --------------------------------------------------
  // Change project
  // --------------------------------------------------

  const handleProjectChange = useCallback(
    (projectId) => {
      typingCancelledRef.current = true;

      setSelectedProjectId(projectId);
      setConversationId(null);
      setMessages([]);
      setExpandedSources({});
      setError("");

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    },
    [],
  );

  // --------------------------------------------------
  // Suggested question
  // --------------------------------------------------

  const handleSuggestedQuestion = useCallback(
    (question) => {
      setInput(question);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    },
    [],
  );

  const showTypingIndicator =
    sending &&
    !messages.some(
      (message) =>
        message.role === "assistant" &&
        message.isTyping,
    );

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                DevLens AI
              </h1>

              <p className="hidden text-xs text-muted-foreground sm:block">
                RAG-powered code assistant
              </p>
            </div>
          </div>

          {/* Project Selector */}
          <div className="relative w-[160px] sm:w-[220px]">
            <select
              value={selectedProjectId}
              onChange={(event) =>
                handleProjectChange(
                  event.target.value,
                )
              }
              disabled={
                loadingProjects ||
                projects.length === 0 ||
                sending
              }
              className="h-9 w-full appearance-none rounded-lg border bg-card px-3 pr-8 text-xs font-medium outline-none focus:border-primary sm:h-10 sm:text-sm"
            >
              {loadingProjects ? (
                <option value="">
                  Loading...
                </option>
              ) : projects.length === 0 ? (
                <option value="">
                  No projects
                </option>
              ) : (
                projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ))
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mx-auto w-full max-w-5xl px-4 pt-3">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive sm:text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Chat */}
      <main className="min-h-0 flex-1">
        <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
            {messages.length === 0 ? (
              <EmptyChat
                selectedProject={selectedProject}
                onQuestionClick={
                  handleSuggestedQuestion
                }
              />
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    expanded={
                      !!expandedSources[message.id]
                    }
                    onToggleSources={() =>
                      setExpandedSources(
                        (current) => ({
                          ...current,
                          [message.id]:
                            !current[
                              message.id
                            ],
                        }),
                      )
                    }
                  />
                ))}

                {showTypingIndicator && (
                  <TypingIndicator />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t bg-background px-3 py-3 sm:px-4 sm:py-4">
            <form onSubmit={handleSendMessage}>
              <div className="flex items-end rounded-xl border bg-card p-1.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedProject
                      ? `Ask about ${selectedProject.name}...`
                      : "Ask DevLens..."
                  }
                  disabled={
                    sending ||
                    loadingProjects ||
                    !selectedProjectId
                  }
                  rows={1}
                  className="max-h-[140px] min-h-10 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    sending ||
                    !input.trim() ||
                    !selectedProjectId
                  }
                  className="size-9 shrink-0 rounded-lg"
                >
                  <Send className="size-4" />
                </Button>
              </div>

              <p className="mt-2 text-center text-[10px] text-muted-foreground sm:text-[11px]">
                Enter to send · Shift + Enter for
                newline
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

// --------------------------------------------------
// Empty Chat
// --------------------------------------------------

const EmptyChat = memo(function EmptyChat({
  selectedProject,
  onQuestionClick,
}) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border bg-card">
          <Bot className="size-7 text-primary" />
        </div>

        <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
          Ask DevLens
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Ask questions about your code,
          architecture, documentation, and files.
        </p>

        {selectedProject && (
          <p className="mt-3 text-xs text-muted-foreground">
            Searching in{" "}
            <span className="font-medium text-foreground">
              {selectedProject.name}
            </span>
          </p>
        )}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {SUGGESTED_QUESTIONS.map(
            (question) => (
              <button
                key={question}
                type="button"
                onClick={() =>
                  onQuestionClick(question)
                }
                className="rounded-lg border bg-card p-3 text-left text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:text-sm"
              >
                {question}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
});

// --------------------------------------------------
// Chat Message
// --------------------------------------------------

const ChatMessage = memo(function ChatMessage({
  message,
  expanded,
  onToggleSources,
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" />
        </div>
      )}

      <div className="min-w-0 max-w-[90%] sm:max-w-[80%]">
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm leading-6 text-primary-foreground sm:px-4"
              : "text-sm leading-7 text-foreground"
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none break-words dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={
                  MARKDOWN_COMPONENTS
                }
              >
                {message.content}
              </ReactMarkdown>

              {message.isTyping && (
                <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-foreground align-middle" />
              )}
            </div>
          )}
        </div>

        {!isUser &&
          !message.isTyping &&
          message.sources?.length > 0 && (
            <SourceList
              sources={message.sources}
              expanded={expanded}
              onToggle={onToggleSources}
            />
          )}
      </div>

      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
});

// --------------------------------------------------
// Sources
// --------------------------------------------------

const SourceList = memo(function SourceList({
  sources,
  expanded,
  onToggle,
}) {
  const groupedSources = useMemo(() => {
    const groups = {};

    sources.forEach((source, index) => {
      const fileName =
        source.file_name ||
        source.filename ||
        source.name ||
        source.document_name ||
        `Document ${index + 1}`;

      if (!groups[fileName]) {
        groups[fileName] = [];
      }

      groups[fileName].push(source);
    });

    return Object.entries(groups);
  }, [sources]);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
      >
        {expanded ? (
          <ChevronDown className="size-3.5" />
        ) : (
          <ChevronRight className="size-3.5" />
        )}

        <FileText className="size-3.5" />

        {sources.length}{" "}
        {sources.length === 1
          ? "Source"
          : "Sources"}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          {groupedSources.map(
            ([fileName, chunks]) => (
              <div
                key={fileName}
                className="rounded-lg border bg-card"
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />

                    <span className="truncate text-xs font-medium">
                      {fileName}
                    </span>
                  </div>

                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {chunks.length}{" "}
                    {chunks.length === 1
                      ? "chunk"
                      : "chunks"}
                  </span>
                </div>

                <div className="border-t px-3 py-1.5">
                  {chunks.map(
                    (source, index) => (
                      <div
                        key={
                          source.id ||
                          `${source.documentId}-${source.chunkIndex}-${index}`
                        }
                        className="flex items-center justify-between gap-3 py-1.5 text-[11px] text-muted-foreground"
                      >
                        <span>
                          Chunk{" "}
                          {source.chunkIndex ??
                            index + 1}
                        </span>

                        {typeof source.score ===
                          "number" && (
                          <span className="text-[10px] opacity-70">
                            {Math.round(
                              source.score * 100,
                            )}
                            %
                          </span>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
});

// --------------------------------------------------
// Typing Indicator
// --------------------------------------------------

const TypingIndicator = memo(
  function TypingIndicator() {
    return (
      <div className="flex gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" />
        </div>

        <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3">
          <div className="flex gap-1">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />

            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />

            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    );
  },
);

export default Chat;