"use client"

import { useState } from "react"
import { List, PencilSimple, Trash, X } from "@phosphor-icons/react"
import { toast } from "sonner"
import { deleteConversation, updateConversationTitle } from "../actions"

type Thread = {
  id: string
  title: string
  updatedAt: string
}

export const CoachSidebar = ({
  threads,
  activeThreadId,
  onSelectThread,
  onThreadDeleted,
  onThreadUpdated,
  isOpen,
  onToggle,
}: {
  threads: Thread[]
  activeThreadId: string | null
  onSelectThread: (threadId: string) => void
  onThreadDeleted: (threadId: string) => void
  onThreadUpdated: (threadId: string, title: string) => void
  isOpen: boolean
  onToggle: () => void
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const handleDelete = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this conversation?")) return

    try {
      await deleteConversation(threadId)
      onThreadDeleted(threadId)
      toast.success("Conversation deleted")
    } catch (error) {
      toast.error("Failed to delete conversation")
    }
  }

  const handleEdit = (thread: Thread, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(thread.id)
    setEditingTitle(thread.title)
  }

  const handleSaveEdit = async (threadId: string) => {
    if (!editingTitle.trim()) return

    try {
      await updateConversationTitle(threadId, editingTitle.trim())
      onThreadUpdated(threadId, editingTitle.trim())
      setEditingId(null)
      toast.success("Title updated")
    } catch (error) {
      toast.error("Failed to update title")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, threadId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(threadId)
    } else if (e.key === "Escape") {
      setEditingId(null)
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:sticky md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Chat History</h2>
            <button
              onClick={onToggle}
              className="rounded-md p-1 hover:bg-accent md:hidden"
              type="button"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto p-2">
            {threads.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-1">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`group relative rounded-md transition-colors ${
                      activeThreadId === thread.id
                        ? "bg-accent"
                        : "hover:bg-accent/60"
                    }`}
                  >
                    {editingId === thread.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveEdit(thread.id)}
                        onKeyDown={(e) => handleKeyDown(e, thread.id)}
                        className="w-full rounded-md bg-background px-3 py-2 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <button
                        onClick={() => onSelectThread(thread.id)}
                        className="w-full px-3 py-2 text-left"
                        type="button"
                      >
                        <p className="truncate text-sm">{thread.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(thread.updatedAt).toLocaleDateString()}
                        </p>
                      </button>
                    )}

                    {/* Action buttons */}
                    <div
                      className={`absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 ${
                        editingId === thread.id
                          ? "hidden"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <button
                        onClick={(e) => handleEdit(thread, e)}
                        className="rounded p-1 hover:bg-background/80"
                        type="button"
                        title="Edit title"
                      >
                        <PencilSimple className="size-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(thread.id, e)}
                        className="rounded p-1 text-destructive hover:bg-background/80"
                        type="button"
                        title="Delete"
                      >
                        <Trash className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
