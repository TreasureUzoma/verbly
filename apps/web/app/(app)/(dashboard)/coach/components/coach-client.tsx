"use client"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageThinking,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import { useChat } from "@ai-sdk/react"
import { ListIcon, PlusIcon, SquareIcon } from "@phosphor-icons/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { createCoachConversation } from "../actions"
import { CoachSidebar } from "./coach-sidebar"
import { Button } from "@workspace/ui/components/button"

type StoredMessage = { id: number; role: "user" | "assistant"; content: string }
type Thread = {
  id: string
  title: string
  updatedAt: string
  messages: StoredMessage[]
}

const chatTransport = new DefaultChatTransport({ api: "/api/chat/stream" })
const toUiMessages = (messages: StoredMessage[]): UIMessage[] =>
  messages.map((message) => ({
    id: String(message.id),
    role: message.role,
    parts: [{ type: "text", text: message.content }],
  }))

export const CoachPageClient = ({
  initialThreads,
}: {
  initialThreads: Thread[]
}) => {
  const [input, setInput] = useState("")
  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const starterHandled = useRef(false)
  const router = useRouter()
  const starter = useSearchParams().get("starter")?.trim()
  const { messages, sendMessage, setMessages, status, error, stop } = useChat({
    transport: chatTransport,
  })

  useEffect(() => {
    if (error)
      toast.error("Something went wrong", { description: error.message })
  }, [error])

  const createThread = async () => {
    const createdThread = (await createCoachConversation()) as Omit<
      Thread,
      "messages"
    >
    const thread = { ...createdThread, messages: [] } as Thread
    setThreads((threads) => [thread, ...threads])
    setActiveThreadId(thread.id)
    setMessages([])
    return thread.id
  }

  const selectThread = (threadId: string) => {
    if (status !== "ready") return
    const thread = threads.find((thread) => thread.id === threadId)
    if (!thread) return
    setActiveThreadId(threadId)
    setMessages(toUiMessages(thread.messages))
    setIsSidebarOpen(false)
  }

  const handleThreadDeleted = (threadId: string) => {
    setThreads((threads) => threads.filter((t) => t.id !== threadId))
    if (activeThreadId === threadId) {
      setActiveThreadId(null)
      setMessages([])
    }
  }

  const handleThreadUpdated = (threadId: string, title: string) => {
    setThreads((threads) =>
      threads.map((t) => (t.id === threadId ? { ...t, title } : t))
    )
  }

  const send = async (text: string) => {
    if (status !== "ready") return
    try {
      const threadId = activeThreadId || (await createThread())
      sendMessage({ text }, { body: { threadId } })
      setInput("")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start a conversation."
      )
    }
  }

  useEffect(() => {
    if (!starter || starterHandled.current) return
    starterHandled.current = true
    send(starter)
    router.replace("/coach")
  }, [router, starter])

  const isStreaming = status === "streaming" || status === "submitted"

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <CoachSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={selectThread}
        onThreadDeleted={handleThreadDeleted}
        onThreadUpdated={handleThreadUpdated}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <Button
            variant="outline"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle sidebar"
          >
            <ListIcon className="size-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              createThread().catch((error) => toast.error(error.message))
            }
            type="button"
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4">
          <Conversation className="min-h-0 flex-1 pb-2">
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<SquareIcon className="size-12" />}
                  title="Start a conversation"
                  description="Ask Verbly Coach about vocabulary, grammar, or speaking practice."
                />
              ) : (
                messages.map((message) => {
                  const hasText = message.parts.some(
                    (part) => part.type === "text" && part.text.trim()
                  )
                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        {message.parts.map((part, index) =>
                          part.type === "text" ? (
                            <MessageResponse key={`${message.id}-${index}`}>
                              {part.text}
                            </MessageResponse>
                          ) : null
                        )}
                        {isStreaming &&
                          message.role === "assistant" &&
                          message.id === messages.at(-1)?.id &&
                          !hasText && <MessageThinking />}
                      </MessageContent>
                    </Message>
                  )
                })
              )}
              {isStreaming && messages.at(-1)?.role === "user" && (
                <Message from="assistant">
                  <MessageContent>
                    <MessageThinking />
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="shrink-0 bg-background pt-0 pb-8">
            <PromptInput
              onSubmit={(message: PromptInputMessage) =>
                send(message.text.trim())
              }
              className="relative w-full rounded-lg border-primary/10 bg-background/95 shadow-xl"
            >
              <PromptInputTextarea
                value={input}
                placeholder="Ask Verbly a question..."
                onChange={(event) => setInput(event.currentTarget.value)}
                className="pr-12"
              />
              <PromptInputSubmit
                status={isStreaming ? "streaming" : "ready"}
                disabled={!input.trim() && !isStreaming}
                onClick={isStreaming ? stop : undefined}
                className="absolute right-1 bottom-1"
              />
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  )
}
