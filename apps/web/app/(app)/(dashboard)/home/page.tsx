import { redirect } from "next/navigation"
import { api } from "@/lib/api/api"
import {
  CheckCircleIcon,
  FlameIcon,
  HeartIcon,
} from "@phosphor-icons/react/dist/ssr"
import { WordActions } from "./components/word-actions"
import { Header } from "./components/header"
import { ProfileData } from "@/types/profile"
import { LearnedWord, SavedWord, Word } from "@/types/word"
import { SessionData } from "@/types/auth"

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

  const stats = [
    {
      label: "Streak",
      icon: FlameIcon,
      iconColor: "text-orange-500",
      value: profile?.streak?.currentStreak ?? 0,
    },
    {
      label: "Saved",
      icon: HeartIcon,
      iconColor: "text-blue-500",
      value: savedWords.length,
    },
    {
      label: "Learned",
      icon: CheckCircleIcon,
      iconColor: "text-green-500",
      value: learnedWords.length,
    },
  ]

  return (
    <div className="pb-24">
      <div className="space-y-6 p-4">
        <Header fullName={user.name} />

        <div className="divide-y divide-border rounded-md border">
          <div className="grid grid-cols-3 divide-x divide-border py-3">
            {stats.map(({ label, icon: Icon, iconColor, value }) => (
              <div key={label} className="px-3 text-center">
                <span className="block text-[10px] font-medium uppercase opacity-60">
                  {label}
                </span>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <Icon size={18} weight="fill" className={iconColor} />
                  <span className="text-3xl font-bold">{value}</span>
                </div>
              </div>
            ))}
          </div>
          {profile?.streak?.longestStreak ? (
            <div className="px-4 py-2 text-center text-xs opacity-70">
              Longest streak: {profile?.streak?.longestStreak} days
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-md border p-4">
          <div>
            <span className="block text-[10px] font-medium uppercase opacity-60">
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
                    <span className="block text-[10px] font-medium uppercase opacity-60">
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
            <WordActions
              wordId={todayWord.id}
              isTodayCompleted={isTodayCompleted}
              isTodaySaved={isTodaySaved}
              isTodayLearned={isTodayLearned}
            />
          )}
        </div>
      </div>
    </div>
  )
}
