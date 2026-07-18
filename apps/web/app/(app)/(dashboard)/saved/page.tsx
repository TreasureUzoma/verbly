import { redirect } from "next/navigation"
import { api } from "@/lib/api/api"
import { Button } from "@workspace/ui/components/button"
import { CheckCircleIcon, HeartIcon } from "@phosphor-icons/react/dist/ssr"

interface SavedWord {
  id: number
  wordId: number
  word: string
  pronunciation: string
  definition: string
  examples: string[]
}

interface LearnedWord {
  word: string
}

async function learnWordAction(formData: FormData) {
  const wordId = formData.get("wordId")
  if (!wordId) {
    redirect("/dashboard/saved")
  }

  await api.post("/words/learn", { wordId: Number(wordId) })
  redirect("/dashboard/saved")
}

export default async function SavedPage() {
  const [savedWords, learnedWords] = await Promise.all([
    api
      .get<SavedWord[]>("/words/saved", { tags: ["saved-words"] })
      .catch(() => []),
    api
      .get<LearnedWord[]>("/words/learned", { tags: ["learned-words"] })
      .catch(() => []),
  ])

  if (!savedWords.length) {
    return (
      <div className="pb-24">
        <div className="space-y-6 p-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Saved Words</h1>
            <p className="text-sm opacity-70">0 saved words to review</p>
          </div>

          <div className="space-y-3 rounded-md border border-dashed p-8 text-center">
            <HeartIcon
              size={32}
              weight="regular"
              className="mx-auto opacity-50"
            />
            <p className="text-sm font-medium">Your saved library is empty</p>
            <p className="mx-auto max-w-xs text-xs opacity-60">
              Save new words from the Home page as you encounter them to review
              them later here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <div className="space-y-6 p-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Words</h1>
          <p className="text-sm opacity-70">
            {savedWords.length === 1
              ? "1 saved word"
              : `${savedWords.length} saved words`}{" "}
            to review
          </p>
        </div>

        <div className="space-y-4">
          {savedWords.map((word) => {
            const isAlreadyLearned = learnedWords.some(
              (lw) => lw.word.toLowerCase() === word.word.toLowerCase()
            )
            return (
              <div key={word.id} className="space-y-3 rounded-md border p-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {word.word}
                  </h2>
                  <p className="font-mono text-xs italic opacity-70">
                    {word.pronunciation}
                  </p>
                </div>

                <p className="text-sm">{word.definition}</p>

                {word.examples.length > 0 && (
                  <div className="space-y-1 text-xs opacity-85">
                    <span className="block text-[9px] font-semibold tracking-wider uppercase opacity-60">
                      Examples
                    </span>
                    <ul className="list-disc space-y-0.5 pl-4">
                      {word.examples.map((ex, idx) => (
                        <li key={idx}>
                          <q>{ex}</q>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end border-t pt-2">
                  <form action={learnWordAction}>
                    <input type="hidden" name="wordId" value={word.wordId} />
                    <Button
                      variant={isAlreadyLearned ? "outline" : "default"}
                      size="sm"
                      type="submit"
                      className="gap-1.5"
                      disabled={isAlreadyLearned}
                    >
                      <CheckCircleIcon
                        size={16}
                        weight={isAlreadyLearned ? "fill" : "regular"}
                      />
                      {isAlreadyLearned ? "Learned" : "Mark as Learned"}
                    </Button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
