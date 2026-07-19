import { api } from "@/lib/api/api"
import { HeartIcon } from "@phosphor-icons/react/dist/ssr"
import { SavedWordItem } from "./components/saved-word-item"
import { LearnedWord } from "@/types/word"

interface SavedWord {
  id: number
  wordId: number
  word: string
  pronunciation: string
  definition: string
  examples: string[]
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
              <SavedWordItem
                key={word.id}
                word={word}
                isAlreadyLearned={isAlreadyLearned}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
