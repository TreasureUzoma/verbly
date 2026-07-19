import { z } from "zod"
import { generateObject } from "ai"
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
  const prompt = `Generate a single unique English vocabulary word for ${date}. Return only valid JSON with these fields: word, definition, pronunciation, and examples. Provide exactly 3 example sentences.`

  const result = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    schema: DailyWordSchema,
    prompt,
  })

  return result.object
}
