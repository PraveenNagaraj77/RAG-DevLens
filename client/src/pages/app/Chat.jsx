
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  FileText,
  MessageSquare,
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

  /*
   * Load projects
   */
  useEffect(() => {
    const fetchProjects = async () => {
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

        setError(
          error.message || "Unable to load your projects.",
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  /*
   * Scroll to latest message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  /*
   * Create conversation
   */
  const createNewConversation = async (projectId) => {
    const response = await conversationsApi.create({
      projectId,
      title: "DevLens AI Chat",
    });

    return response?.data;
  };

  /*
   * Auto resize textarea
   */
  const handleInputChange = (event) => {
    setInput(event.target.value);

    const textarea = event.target;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      140,
    )}px`;
  };

  /*
   * Send message
   */
  const handleSendMessage = async (event) => {
    event?.preventDefault();

    const trimmedMessage = input.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    if (!selectedProjectId) {
      setError("Please select a project first.");
      return;
    }

    try {
      setSending(true);
      setError("");

      /*
       * Show user message immediately
       */
      setMessages((current) => [
        ...current,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: trimmedMessage,
        },
      ]);

      setInput("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      /*
       * Create conversation if required
       */
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        const conversation =
          await createNewConversation(
            selectedProjectId,
          );

        activeConversationId = conversation?.id;

        if (!activeConversationId) {
          throw new Error(
            "Failed to create conversation.",
          );
        }

        setConversationId(activeConversationId);
      }

      /*
       * Send message
       */
      const response = await messagesApi.send(
        activeConversationId,
        {
          message: trimmedMessage,
        },
      );

      console.log(
        "AI message response:",
        response,
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
            sources:
              response?.data?.sources || [],
          },
        ]);
      }
    } catch (error) {
      console.error(
        "Failed to send message:",
        error,
      );

      setError(
        error.message ||
          "Unable to process your message.",
      );
    } finally {
      setSending(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  /*
   * Change project
   */
  const handleProjectChange = (projectId) => {
    setSelectedProjectId(projectId);
    setConversationId(null);
    setMessages([]);
    setError("");

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  /*
   * Suggested question
   */
  const handleSuggestedQuestion = (question) => {
    setInput(question);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  const suggestedQuestions = [
    "What is this project about?",
    "Explain the project architecture.",
    "How does authentication work?",
    "Which files are related to this feature?",
  ];

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0 w-full flex-col bg-background">
      {/* Chat Header */}
      <header className="shrink-0 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-10">
              <Sparkles className="size-4 sm:size-5" />
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
          <div className="relative w-auto max-w-[190px] sm:max-w-[240px]">
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
              className="h-9 w-full appearance-none rounded-lg border bg-card py-2 pl-3 pr-9 text-xs font-medium outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:text-sm"
              aria-label="Select project"
            >
              {loadingProjects ? (
                <option value="">
                  Loading projects...
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
        <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pt-3 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
            <p className="text-xs text-destructive sm:text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Main Chat */}
      <main className="min-h-0 flex-1">
        <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
          {/* Messages Area */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:py-8">
            {messages.length === 0 ? (
              <div className="flex min-h-full items-center justify-center">
                <div className="w-full max-w-2xl text-center">
                  {/* Empty Icon */}
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm sm:size-16">
                    <Bot className="size-7 text-primary sm:size-8" />
                  </div>

                  <h2 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
                    Ask DevLens
                  </h2>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    Ask questions about your code,
                    documentation, architecture, and
                    project files.
                  </p>

                  {/* Selected project */}
                  {selectedProject && (
                    <div className="mx-auto mt-4 inline-flex max-w-full items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                      <MessageSquare className="size-3.5 shrink-0" />

                      <span className="truncate">
                        Searching in{" "}
                        <span className="font-medium text-foreground">
                          {selectedProject.name}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="mt-7 grid gap-2 sm:grid-cols-2">
                    {suggestedQuestions.map(
                      (question) => (
                        <button
                          key={question}
                          type="button"
                          onClick={() =>
                            handleSuggestedQuestion(
                              question,
                            )
                          }
                          className="rounded-xl border bg-card p-3.5 text-left text-xs leading-5 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground hover:shadow-sm sm:text-sm"
                        >
                          {question}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-7 pb-4">
                {messages.map((message) => {
                  const isUser =
                    message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex w-full gap-2.5 sm:gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {/* AI Avatar */}
                      {!isUser && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Bot className="size-4" />
                        </div>
                      )}

                      <div
                        className={`min-w-0 max-w-[88%] sm:max-w-[78%] ${
                          isUser
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        {/* Message */}
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 sm:px-4 sm:py-3 ${
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
                          message.sources?.length >
                            0 && (
                            <div className="mt-3 w-full">
                              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                <FileText className="size-3.5" />
                                Sources
                              </div>

                              <div className="grid gap-1.5">
                                {message.sources.map(
                                  (
                                    source,
                                    index,
                                  ) => (
                                    <div
                                      key={
                                        source.id ||
                                        index
                                      }
                                      className="flex min-w-0 items-center gap-2 rounded-lg border bg-card px-2.5 py-2"
                                    >
                                      <FileText className="size-3.5 shrink-0 text-muted-foreground" />

                                      <span className="truncate text-xs text-muted-foreground">
                                        {source.file_name ||
                                          source.filename ||
                                          source.name ||
                                          source.document_name ||
                                          `Source ${
                                            index +
                                            1
                                          }`}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="size-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* AI Loading */}
                {sending && (
                  <div className="flex gap-2.5 sm:gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="size-4" />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3">
                      <div className="flex items-center gap-1">
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
          <div className="shrink-0 border-t bg-background px-3 py-3 sm:px-6 sm:py-4">
            <form
              onSubmit={handleSendMessage}
              className="mx-auto w-full"
            >
              <div className="relative flex items-end rounded-2xl border bg-card p-1.5 shadow-sm transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      handleSendMessage(event);
                    }
                  }}
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
                  className="max-h-[140px] min-h-10 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-sm leading-5 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    sending ||
                    !input.trim() ||
                    !selectedProjectId
                  }
                  className="size-10 shrink-0 rounded-xl"
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </Button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 px-1">
                <p className="text-[10px] text-muted-foreground sm:text-[11px]">
                  DevLens uses your project context to
                  answer questions.
                </p>

                <p className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
                  Enter to send · Shift + Enter for newline
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chat;
