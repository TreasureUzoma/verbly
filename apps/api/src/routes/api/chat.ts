import { groq } from "@ai-sdk/groq"
import { streamText, validateUIMessages } from "ai"
import { and, asc, desc, eq, inArray, lt } from "drizzle-orm"
import { Hono } from "hono"
import { z } from "zod"
import { db } from "../../db/index.js"
import { coachConversations, coachMessages } from "../../db/schema.js"
import type { AuthType, AppBindings } from "../../types.js"

const chatRoute = new Hono<AppBindings>()

const chatRequestSchema = z.object({
  threadId: z.string().uuid(),
  messages: z.array(z.unknown()).min(1),
})

const createConversationSchema = z.object({
  title: z.string().trim().max(100).optional(),
})

const getConversation = async (conversationId: string, userId: string) => {
  const [conversation] = await db
    .select()
    .from(coachConversations)
    .where(
      and(
        eq(coachConversations.id, conversationId),
        eq(coachConversations.userId, userId)
      )
    )
    .limit(1)

  return conversation
}

chatRoute.get("/conversations", async (c) => {
  const user = c.get("user") as AuthType
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 20, 1), 50)
  const cursor = c.req.query("cursor")
  const conversations = await db
    .select()
    .from(coachConversations)
    .where(
      cursor
        ? and(
            eq(coachConversations.userId, user.id),
            lt(coachConversations.updatedAt, new Date(cursor))
          )
        : eq(coachConversations.userId, user.id)
    )
    .orderBy(desc(coachConversations.updatedAt))
    .limit(limit + 1)

  const hasMore = conversations.length > limit
  const page = conversations.slice(0, limit)

  if (page.length === 0) {
    return c.json({ success: true, data: { conversations: [], nextCursor: null } })
  }

  const messages = await db
    .select()
    .from(coachMessages)
    .where(
      inArray(
        coachMessages.conversationId,
        page.map((conversation) => conversation.id)
      )
    )
    .orderBy(asc(coachMessages.id))

  return c.json({
    success: true,
    data: {
      conversations: page.map((conversation) => ({
        ...conversation,
        messages: messages.filter(
          (message) => message.conversationId === conversation.id
        ),
      })),
      nextCursor: hasMore ? page.at(-1)?.updatedAt.toISOString() : null,
    },
  })
})

chatRoute.post("/conversations", async (c) => {
  const user = c.get("user") as AuthType
  const requestBody = await c.req.json().catch(() => null)
  const parsedRequest = createConversationSchema.safeParse(requestBody)

  if (!parsedRequest.success) {
    return c.json({ message: "Invalid conversation." }, 400)
  }

  const [conversation] = await db
    .insert(coachConversations)
    .values({
      userId: user.id,
      title: parsedRequest.data.title || "New conversation",
    })
    .returning()

  return c.json({ success: true, data: conversation }, 201)
})

chatRoute.get("/conversations/:id", async (c) => {
  const user = c.get("user") as AuthType
  const conversation = await getConversation(c.req.param("id"), user.id)

  if (!conversation) return c.json({ message: "Conversation not found." }, 404)

  const messages = await db
    .select()
    .from(coachMessages)
    .where(eq(coachMessages.conversationId, conversation.id))
    .orderBy(asc(coachMessages.id))

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

    const conversation = await getConversation(
      parsedRequest.data.threadId,
      user.id
    )
    if (!conversation)
      return c.json({ message: "Conversation not found." }, 404)

    await db.insert(coachMessages).values({
      conversationId: conversation.id,
      role: "user",
      content: latestText.text.trim(),
    })

    const conversationMessages = await db
      .select()
      .from(coachMessages)
      .where(eq(coachMessages.conversationId, conversation.id))
      .orderBy(asc(coachMessages.id))

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

        await db.insert(coachMessages).values({
          conversationId: conversation.id,
          role: "assistant",
          content: text,
        })
        await db
          .update(coachConversations)
          .set({
            title:
              conversation.title === "New conversation"
                ? latestText.text.trim().slice(0, 100)
                : conversation.title,
            updatedAt: new Date(),
          })
          .where(eq(coachConversations.id, conversation.id))
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat stream error:", error)
    return c.json({ message: "Unable to generate a coaching response." }, 500)
  }
})

export default chatRoute
