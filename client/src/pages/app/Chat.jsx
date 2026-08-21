import { useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  FileText,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { projectsApi } from "@/api/projects.api";
import { conversationsApi } from "@/api/conversations.api";
import { messagesApi } from "@/api/messages.api";
import { Button } from "@/components/ui/button";

function Chat() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  const suggestedQuestions = [
    "What is this project about?",
    "Explain the project architecture.",
    "How does authentication work?",
    "Which files are related to this feature?",
  ];

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        setError("");

        const response = await projectsApi.getAll();
        const projectList = Array.isArray(response?.data)
          ? response.data
          : [];

        setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0].id);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
        setError(error.message || "Unable to load projects.");
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  // Create conversation
  const createConversation = async () => {
    const response = await conversationsApi.create({
      projectId: selectedProjectId,
      title: "DevLens AI Chat",
    });

    return response?.data;
  };

  // Resize textarea
  const handleInputChange = (event) => {
    const value = event.target.value;
    const textarea = event.target;

    setInput(value);

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      140,
    )}px`;
  };

  // Send message
  const handleSendMessage = async (event) => {
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

      // Show user message immediately
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

      // Create conversation when needed
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        const conversation = await createConversation();

        activeConversationId = conversation?.id;

        if (!activeConversationId) {
          throw new Error("Failed to create conversation.");
        }

        setConversationId(activeConversationId);
      }

      // Send message
      const response = await messagesApi.send(
        activeConversationId,
        {
          message,
        },
      );

      const assistantMessage =
        response?.data?.assistantMessage;

      if (assistantMessage) {
        setMessages((current) => [
          ...current,
          {
            id: assistantMessage.id,
            role: "assistant",
            content: assistantMessage.content,
            sources: response?.data?.sources || [],
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      setError(
        error.message || "Unable to process your message.",
      );
    } finally {
      setSending(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  // Enter to send
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(event);
    }
  };

  // Change project
  const handleProjectChange = (projectId) => {
    setSelectedProjectId(projectId);
    setConversationId(null);
    setMessages([]);
    setError("");

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // Suggested question
  const handleSuggestedQuestion = (question) => {
    setInput(question);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

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
                handleProjectChange(event.target.value)
              }
              disabled={
                loadingProjects ||
                projects.length === 0 ||
                sending
              }
              className="h-9 w-full appearance-none rounded-lg border bg-card px-3 pr-8 text-xs font-medium outline-none focus:border-primary sm:h-10 sm:text-sm"
            >
              {loadingProjects ? (
                <option value="">Loading...</option>
              ) : projects.length === 0 ? (
                <option value="">No projects</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
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
              /* Empty State */
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

                  {/* Suggestions */}
                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {suggestedQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          handleSuggestedQuestion(question)
                        }
                        className="rounded-lg border bg-card p-3 text-left text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:text-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Messages List */
              <div className="space-y-6 pb-4">
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
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

                      <div
                        className={`min-w-0 max-w-[85%] sm:max-w-[75%]`}
                      >
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 sm:px-4 ${
                            isUser
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md border bg-card"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>

                        {/* Sources */}
                        {!isUser &&
                          message.sources?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.sources.map(
                                (source, index) => (
                                  <div
                                    key={
                                      source.id || index
                                    }
                                    className="flex items-center gap-2 text-xs text-muted-foreground"
                                  >
                                    <FileText className="size-3.5 shrink-0" />

                                    <span className="truncate">
                                      {source.file_name ||
                                        source.filename ||
                                        source.name ||
                                        source.document_name ||
                                        `Source ${index + 1}`}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                      </div>

                      {isUser && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="size-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing */}
                {sending && (
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
                Enter to send · Shift + Enter for newline
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chat;