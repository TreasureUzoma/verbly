import { groq } from "@ai-sdk/groq"
import { streamText, validateUIMessages } from "ai"
import { Hono } from "hono"
import { z } from "zod"
import { ChatService } from "../../services/chat.js"
import type { AuthType, AppBindings } from "../../types.js"

const chatRoute = new Hono<AppBindings>()

const chatRequestSchema = z.object({
  threadId: z.string().uuid(),
  messages: z.array(z.unknown()).min(1),
})

const createConversationSchema = z.object({
  title: z.string().trim().max(100).optional(),
})

chatRoute.get("/conversations", async (c) => {
  const user = c.get("user") as AuthType
  const limit = Number(c.req.query("limit")) || 20
  const cursor = c.req.query("cursor")

  const { conversations, nextCursor } =
    await ChatService.getUserConversationsWithMessages(user.id, limit, cursor)

  return c.json({
    success: true,
    data: { conversations, nextCursor },
  })
})

chatRoute.post("/conversations", async (c) => {
  const user = c.get("user") as AuthType
  const requestBody = await c.req.json().catch(() => null)
  const parsedRequest = createConversationSchema.safeParse(requestBody)

  if (!parsedRequest.success) {
    return c.json({ message: "Invalid conversation." }, 400)
  }

  const conversation = await ChatService.createConversation(
    user.id,
    parsedRequest.data.title
  )

  return c.json({ success: true, data: conversation }, 201)
})

chatRoute.patch("/conversations/:id", async (c) => {
  const user = c.get("user") as AuthType
  const conversationId = c.req.param("id")
  const requestBody = await c.req.json().catch(() => null)
  const parsedRequest = z
    .object({ title: z.string().trim().min(1).max(100) })
    .safeParse(requestBody)

  if (!parsedRequest.success) {
    return c.json({ message: "Invalid title." }, 400)
  }

  const conversation = await ChatService.getConversation(
    conversationId,
    user.id
  )
  if (!conversation) {
    return c.json({ message: "Conversation not found." }, 404)
  }

  const updated = await ChatService.updateConversation(conversationId, {
    title: parsedRequest.data.title,
  })

  return c.json({ success: true, data: updated })
})

chatRoute.delete("/conversations/:id", async (c) => {
  const user = c.get("user") as AuthType
  const conversationId = c.req.param("id")

  const deleted = await ChatService.deleteConversation(conversationId, user.id)
  if (!deleted) {
    return c.json({ message: "Conversation not found." }, 404)
  }

  return c.json({ success: true, data: deleted })
})

chatRoute.get("/conversations/:id", async (c) => {
  const user = c.get("user") as AuthType
  const conversation = await ChatService.getConversation(
    c.req.param("id"),
    user.id
  )

  if (!conversation) return c.json({ message: "Conversation not found." }, 404)

  const messages = await ChatService.getConversationMessages(conversation.id)

  return c.json({ success: true, data: { conversation, messages } })
})

chatRoute.post("/stream", async (c) => {
  const user = c.get("user") as AuthType
  const requestBody = await c.req.json().catch(() => null)
  const parsedRequest = chatRequestSchema.safeParse(requestBody)

  if (!parsedRequest.success) {
    return c.json({ message: "A chat message and thread are required." }, 400)
  }

  try {
    const messages = await validateUIMessages({
      messages: parsedRequest.data.messages,
    })
    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user")
    const latestText = latestUserMessage?.parts.find(
      (part) => part.type === "text"
    )

    if (!latestText || latestText.type !== "text" || !latestText.text.trim()) {
      return c.json({ message: "A chat message is required." }, 400)
    }

    const conversation = await ChatService.getConversation(
      parsedRequest.data.threadId,
      user.id
    )
    if (!conversation)
      return c.json({ message: "Conversation not found." }, 404)

    await ChatService.addMessage(
      conversation.id,
      "user",
      latestText.text.trim()
    )

    const conversationMessages = await ChatService.getConversationMessages(
      conversation.id
    )

    const result = streamText({
      model: groq("openai/gpt-oss-20b"),
      system:
        "You are Verbly Coach, a friendly language-learning coach. Help users practise vocabulary, grammar, pronunciation, and confident communication. Give concise, practical guidance and examples. Ask a focused follow-up question when it would help the learner progress.",
      messages: conversationMessages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      })),
      onFinish: async ({ text }) => {
        if (!text.trim()) return

        await ChatService.addMessage(conversation.id, "assistant", text)

        // Generate title from first message if still default
        const title =
          conversation.title === "New conversation"
            ? await ChatService.generateTitle(latestText.text.trim())
            : conversation.title

        await ChatService.updateConversation(conversation.id, {
          title,
          updatedAt: new Date(),
        })
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat stream error:", error)
    return c.json({ message: "Unable to generate a coaching response." }, 500)
  }
})

export default chatRoute
