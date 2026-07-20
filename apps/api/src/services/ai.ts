import { z } from "zod"
import { generateObject, generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { env } from "../env.js"

const DailyWordSchema = z.object({
  word: z.string().min(1),
  definition: z.string().min(1),
  pronunciation: z.string().min(1),
  examples: z.array(z.string()).min(3),
})

export type GeneratedDailyWord = z.infer<typeof DailyWordSchema>

export async function generateDailyWord(
  date: string
): Promise<GeneratedDailyWord> {
  const prompt = `Generate a single unique English vocabulary word for ${date}.
  Instead of giving dry dictionary definitions, provide a clear and concise definition that is easy to understand.
  Return only valid JSON with these fields: word, definition, pronunciation, and examples. Provide exactly 3 example sentences.
  
  Rules:
  - The word must be a real English word, not a made-up one.
  - Prefer words that educated native English speakers knows but don't use every day.
  - Avoid words that are too common (eg. happy, important, good) or too obscure (eg. sesquipedalian, defenestrate). 
  - Pritorize words that improve writing, communication and critical thinking skills.   
  - Include a mix of words from psychology, philosophy, literature, business, technology, science, and everyday life.
  `

  const result = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    schema: DailyWordSchema,
    prompt,
  })

  return result.object
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Generate a short, concise title (max 50 characters) for a conversation that starts with: "${firstMessage}"\n\nOnly return the title, nothing else.`,
      maxTokens: 20,
    })

    return (
      result.text.trim().replace(/^["']|["']$/g, "") ||
      firstMessage.slice(0, 50)
    )
  } catch (error) {
    // Fallback to simple title generation
    return (
      firstMessage.split(/[.!?]/)[0].trim().slice(0, 50) || "New conversation"
    )
  }
}
