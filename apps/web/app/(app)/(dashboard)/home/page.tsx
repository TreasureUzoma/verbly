import { redirect } from "next/navigation"
import { api } from "@/lib/api/api"
import { Button } from "@workspace/ui/components/button"
import {
  CheckCircleIcon,
  FlameIcon,
  HeartIcon,
} from "@phosphor-icons/react/dist/ssr"
import { completeTodayAction, learnWordAction, saveWordAction } from "./actions"

interface Word {
  id: number
  word: string
  definition: string
  pronunciation: string
  examples: string[]
  completed: boolean
  learned: boolean
}

interface SavedWord {
  id: number
  wordId: number
  word: string
}

interface LearnedWord {
  id: number
  wordId: number
  word: string
}

interface ProfileData {
  streak: {
    currentStreak: number
    longestStreak: number
    completedToday: boolean
  }
}

interface SessionData {
  name: string
}

export default async function HomePage() {
  let user: SessionData
  try {
    user = await api.get<SessionData>("/session")
  } catch {
    redirect("/auth")
  }

  const [todayWord, savedWordsResponse, learnedWordsResponse, profile] =
    await Promise.all([
      api
        .get<Word | null>("/words/today", { tags: ["today-word"] })
        .catch((error) => {
          if (
            error.message.includes("404") ||
            error.message.includes("No word available for today")
          )
            return null
          throw error
        }),
      api
        .get<SavedWord[]>("/words/saved", { tags: ["saved-words"] })
        .catch(() => []),
      api
        .get<LearnedWord[]>("/words/learned", { tags: ["learned-words"] })
        .catch(() => []),
      api.get<ProfileData>("/profile", { tags: ["profile"] }).catch(() => ({
        streak: { currentStreak: 0, longestStreak: 0, completedToday: false },
      })),
    ])

  const savedWords = savedWordsResponse ?? []
  const learnedWords = learnedWordsResponse ?? []

  const isTodayCompleted =
    todayWord?.completed || profile?.streak?.completedToday
  const isTodaySaved = todayWord
    ? savedWords.some(
        (saved) => saved.word.toLowerCase() === todayWord.word.toLowerCase()
      )
    : false
  const isTodayLearned = todayWord
    ? todayWord.learned ||
      learnedWords.some(
        (learned) => learned.word.toLowerCase() === todayWord.word.toLowerCase()
      )
    : false

  return (
    <div className="pb-24">
      <div className="space-y-6 p-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hi {user.name}!</h1>
          <p className="text-sm opacity-70">
            Ready to learn your word for today?
          </p>
        </div>

        <div className="divide-y divide-border rounded-md border">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="p-3 text-center">
              <span className="block text-[10px] font-bold tracking-wider uppercase opacity-60">
                Streak
              </span>
              <div className="mt-1 flex items-center justify-center gap-1">
                <FlameIcon
                  size={16}
                  weight="fill"
                  className="text-foreground"
                />
                <span className="text-lg font-bold">
                  {profile?.streak?.currentStreak ?? 0}
                </span>
              </div>
            </div>
            <div className="p-3 text-center">
              <span className="block text-[10px] font-bold tracking-wider uppercase opacity-60">
                Saved
              </span>
              <div className="mt-1 flex items-center justify-center gap-1">
                <HeartIcon
                  size={16}
                  weight="fill"
                  className="text-foreground"
                />
                <span className="text-lg font-bold">{savedWords.length}</span>
              </div>
            </div>
            <div className="p-3 text-center">
              <span className="block text-[10px] font-bold tracking-wider uppercase opacity-60">
                Learned
              </span>
              <div className="mt-1 flex items-center justify-center gap-1">
                <CheckCircleIcon
                  size={16}
                  weight="fill"
                  className="text-foreground"
                />
                <span className="text-lg font-bold">{learnedWords.length}</span>
              </div>
            </div>
          </div>
          {profile?.streak?.longestStreak ? (
            <div className="px-4 py-2 text-center text-xs opacity-70">
              Longest streak: {profile?.streak?.longestStreak} days
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-md border p-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase opacity-60">
              Word of the Day
            </span>
            {todayWord ? (
              <>
                <h2 className="mt-1 text-3xl font-black tracking-tight">
                  {todayWord.word}
                </h2>
                <p className="mt-0.5 font-mono text-sm italic opacity-70">
                  {todayWord.pronunciation}
                </p>
                <div className="my-3 border-t" />
                <p className="text-base">{todayWord.definition}</p>
                {todayWord.examples?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="block text-[10px] font-bold tracking-wider uppercase opacity-60">
                      Example Sentences
                    </span>
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      {todayWord.examples?.map((example, idx) => (
                        <li key={idx} className="opacity-90">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="py-4 text-sm">
                No word featured for today. Come back tomorrow!
              </p>
            )}
          </div>

          {todayWord && (
            <div className="flex flex-col gap-2 pt-2">
              <form action={completeTodayAction} className="w-full">
                <Button
                  variant={isTodayCompleted ? "outline" : "default"}
                  className="w-full"
                  type="submit"
                >
                  {isTodayCompleted ? "✓ Completed Today" : "Mark as Completed"}
                </Button>
              </form>

              <div className="grid grid-cols-2 gap-2">
                <form action={saveWordAction}>
                  <input type="hidden" name="wordId" value={todayWord.id} />
                  <Button
                    variant="outline"
                    type="submit"
                    className="w-full"
                    disabled={isTodaySaved}
                  >
                    {isTodaySaved ? "♥ Saved" : "Save for Later"}
                  </Button>
                </form>
                <form action={learnWordAction}>
                  <input type="hidden" name="wordId" value={todayWord.id} />
                  <Button
                    variant="outline"
                    type="submit"
                    className="w-full"
                    disabled={isTodayLearned}
                  >
                    {isTodayLearned ? "✓ Learned" : "Mark as Learned"}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
