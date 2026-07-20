import { redirect } from "next/navigation"
import { api } from "@/lib/api/api"
import {
  FlameIcon,
  CheckCircleIcon,
  CalendarIcon,
} from "@phosphor-icons/react/dist/ssr"
import { LogoutButton } from "./components/logout-button"
import { NotificationSettings } from "./components/notification-settings"
import { ProfileData } from "@/types/profile"
import { LearnedWord } from "@/types/word"
import { SessionData } from "@/types/auth"

export default async function ProfilePage() {
  let user: SessionData
  try {
    user = await api.get<SessionData>("/session")
  } catch {
    redirect("/auth")
  }

  const [profile, learnedWordsResponse] = await Promise.all([
    api.get<ProfileData>("/profile", { tags: ["profile"] }).catch(() => ({
      streak: { currentStreak: 0, longestStreak: 0 },
      learning: {
        completedDaysCount: 0,
        savedWordsCount: 0,
        learnedWordsCount: 0,
      },
    })),
    api
      .get<LearnedWord[]>("/words/learned", { tags: ["learned-words"] })
      .catch(() => []),
  ])

  const learnedWords = learnedWordsResponse ?? []

  return (
    <div className="pb-24">
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between rounded-md border p-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-xs opacity-70">{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wider uppercase opacity-60">
            Learning Progress
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border p-3 text-center">
              <span className="block text-[10px] font-medium uppercase opacity-60">
                Current Streak
              </span>
              <div className="mt-1.5 flex items-center justify-center gap-1">
                <FlameIcon
                  size={18}
                  weight="fill"
                  className="text-orange-500"
                />
                <span className="text-xl font-bold">
                  {profile?.streak?.currentStreak ?? 0} days
                </span>
              </div>
            </div>
            <div className="rounded-md border p-3 text-center">
              <span className="block text-[10px] font-medium uppercase opacity-60">
                Longest Streak
              </span>
              <div className="mt-1.5 flex items-center justify-center gap-1">
                <FlameIcon
                  size={18}
                  weight="regular"
                  className="text-orange-500"
                />
                <span className="text-xl font-bold">
                  {profile?.streak?.longestStreak ?? 0} days
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border p-3 text-center">
              <span className="block text-[10px] font-medium uppercase opacity-60">
                Days Done
              </span>
              <span className="mt-1 block text-lg font-bold">
                {profile?.learning?.completedDaysCount ?? 0}
              </span>
            </div>
            <div className="rounded-md border p-3 text-center">
              <span className="block text-[10px] font-medium uppercase opacity-60">
                Saved
              </span>
              <span className="mt-1 block text-lg font-bold">
                {profile?.learning?.savedWordsCount ?? 0}
              </span>
            </div>
            <div className="rounded-md border p-3 text-center">
              <span className="block text-[10px] font-medium uppercase opacity-60">
                Learned
              </span>
              <span className="mt-1 block text-lg font-bold">
                {profile?.learning?.learnedWordsCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wider uppercase opacity-60">
            Notifications
          </h2>
          <div className="rounded-md border p-4">
            <NotificationSettings />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wider uppercase opacity-60">
            Learned Vocabulary
          </h2>
          {learnedWords.length === 0 ? (
            <div className="space-y-2 rounded-md border border-dashed p-8 text-center">
              <CheckCircleIcon
                size={24}
                weight="regular"
                className="mx-auto opacity-50"
              />
              <p className="text-xs font-medium">No words mastered yet</p>
              <p className="mx-auto max-w-xs text-[10px] opacity-60">
                Mark words as <q>learned</q> from your Saved page to grow your
                history list here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-md border">
              {learnedWords.map((word) => (
                <div key={word.id} className="space-y-1 p-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-bold tracking-tight">
                      {word.word}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] opacity-65">
                      <CalendarIcon size={12} />
                      <span>
                        {new Date(word.learnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="font-mono text-xs italic opacity-70">
                    {word.pronunciation}
                  </p>
                  <p className="mt-1 text-xs opacity-90">{word.definition}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
