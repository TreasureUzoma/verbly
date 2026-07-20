import { and, asc, desc, eq, inArray, lt } from "drizzle-orm"
import { db } from "../db/index.js"
import { coachConversations, coachMessages } from "../db/schema.js"
import { generateChatTitle } from "./ai.js"

export class ChatService {
  // Get a single conversation by ID and user ID
  static async getConversation(conversationId: string, userId: string) {
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

    return conversation || null
  }

  // Get all conversations for a user with pagination
  static async getUserConversations(
    userId: string,
    limit: number = 20,
    cursor?: string
  ) {
    const sanitizedLimit = Math.min(Math.max(limit, 1), 50)

    const conversations = await db
      .select()
      .from(coachConversations)
      .where(
        cursor
          ? and(
              eq(coachConversations.userId, userId),
              lt(coachConversations.updatedAt, new Date(cursor))
            )
          : eq(coachConversations.userId, userId)
      )
      .orderBy(desc(coachConversations.updatedAt))
      .limit(sanitizedLimit + 1)

    const hasMore = conversations.length > sanitizedLimit
    const page = conversations.slice(0, sanitizedLimit)

    return {
      conversations: page,
      hasMore,
      nextCursor: hasMore ? page.at(-1)?.updatedAt.toISOString() : null,
    }
  }

  // Get conversations with their messages
  static async getUserConversationsWithMessages(
    userId: string,
    limit: number = 20,
    cursor?: string
  ) {
    const { conversations, hasMore, nextCursor } =
      await this.getUserConversations(userId, limit, cursor)

    if (conversations.length === 0) {
      return { conversations: [], nextCursor: null }
    }

    const messages = await db
      .select()
      .from(coachMessages)
      .where(
        inArray(
          coachMessages.conversationId,
          conversations.map((conversation) => conversation.id)
        )
      )
      .orderBy(asc(coachMessages.id))

    return {
      conversations: conversations.map((conversation) => ({
        ...conversation,
        messages: messages.filter(
          (message) => message.conversationId === conversation.id
        ),
      })),
      nextCursor,
    }
  }

  // Create a new conversation
  static async createConversation(userId: string, title?: string) {
    const [conversation] = await db
      .insert(coachConversations)
      .values({
        userId,
        title: title || "New conversation",
      })
      .returning()

    return conversation
  }

  // Get messages for a conversation
  static async getConversationMessages(conversationId: string) {
    return await db
      .select()
      .from(coachMessages)
      .where(eq(coachMessages.conversationId, conversationId))
      .orderBy(asc(coachMessages.id))
  }

  // Add a message to a conversation
  static async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) {
    const [message] = await db
      .insert(coachMessages)
      .values({
        conversationId,
        role,
        content,
      })
      .returning()

    return message
  }

  // Update conversation title and timestamp
  static async updateConversation(
    conversationId: string,
    data: { title?: string; updatedAt?: Date }
  ) {
    const [updatedConversation] = await db
      .update(coachConversations)
      .set(data)
      .where(eq(coachConversations.id, conversationId))
      .returning()

    return updatedConversation
  }

  // Delete a conversation
  static async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.getConversation(conversationId, userId)
    if (!conversation) {
      return null
    }

    // Delete messages first (due to foreign key constraints)
    await db
      .delete(coachMessages)
      .where(eq(coachMessages.conversationId, conversationId))

    // Delete conversation
    await db
      .delete(coachConversations)
      .where(eq(coachConversations.id, conversationId))

    return conversation
  }

  // Generate a title for a conversation based on the first message
  static async generateTitle(firstMessage: string): Promise<string> {
    return await generateChatTitle(firstMessage)
  }
}
