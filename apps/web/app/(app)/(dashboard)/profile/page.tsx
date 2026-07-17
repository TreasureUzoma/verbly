"use client"

import { useGetSession } from "@/hooks/use-session"
import { useGetProfile, useGetLearnedWords, useLogout } from "@/hooks/use-words"
import { Button } from "@workspace/ui/components/button"
import {
  SignOutIcon,
  FlameIcon,
  CheckCircleIcon,
  UserIcon,
  CalendarIcon
} from "@phosphor-icons/react"

export default function ProfilePage() {
  const { data: user, isLoading: isUserLoading } = useGetSession()
  const { data: profile, isLoading: isProfileLoading } = useGetProfile()
  const { data: learnedWords = [], isLoading: isLearnedLoading } = useGetLearnedWords()
  const logoutMutation = useLogout()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const isLoading = isUserLoading || isProfileLoading || isLearnedLoading

  if (isLoading) {
    return (
      <div className="pb-24 p-4 space-y-6">
        <div className="h-24 w-full bg-foreground/10 animate-pulse rounded" />
        <div className="h-32 w-full bg-foreground/10 animate-pulse rounded" />
        <div className="h-48 w-full bg-foreground/10 animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="pb-24">
      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="border rounded-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="border rounded-full p-2.5 bg-foreground/5">
              <UserIcon size={24} weight="regular" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{user?.name}</h1>
              <p className="text-xs opacity-70">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="gap-1.5"
          >
            <SignOutIcon size={16} />
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-60">Learning Progress</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-md p-3 text-center">
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">Current Streak</span>
              <div className="mt-1.5 flex items-center justify-center gap-1">
                <FlameIcon size={18} weight="fill" />
                <span className="text-xl font-bold">{profile?.streak?.currentStreak ?? 0} days</span>
              </div>
            </div>
            <div className="border rounded-md p-3 text-center">
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">Longest Streak</span>
              <div className="mt-1.5 flex items-center justify-center gap-1">
                <FlameIcon size={18} weight="regular" />
                <span className="text-xl font-bold">{profile?.streak?.longestStreak ?? 0} days</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="border rounded-md p-3 text-center">
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">Days Done</span>
              <span className="block mt-1 text-lg font-bold">{profile?.learning?.completedDaysCount ?? 0}</span>
            </div>
            <div className="border rounded-md p-3 text-center">
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">Saved</span>
              <span className="block mt-1 text-lg font-bold">{profile?.learning?.savedWordsCount ?? 0}</span>
            </div>
            <div className="border rounded-md p-3 text-center">
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">Learned</span>
              <span className="block mt-1 text-lg font-bold">{profile?.learning?.learnedWordsCount ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Learned History */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-60">Learned Vocabulary</h2>
          {learnedWords.length === 0 ? (
            <div className="border border-dashed rounded-md p-8 text-center space-y-2">
              <CheckCircleIcon size={24} weight="regular" className="mx-auto opacity-50" />
              <p className="text-xs font-medium">No words mastered yet</p>
              <p className="text-[10px] opacity-60 max-w-xs mx-auto">
                Mark words as "learned" from your Saved page to grow your history list here.
              </p>
            </div>
          ) : (
            <div className="border rounded-md divide-y divide-border">
              {learnedWords.map((word) => (
                <div key={word.id} className="p-4 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-bold tracking-tight">{word.word}</h3>
                    <div className="flex items-center gap-1 text-[10px] opacity-65">
                      <CalendarIcon size={12} />
                      <span>{new Date(word.learnedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-xs italic opacity-70 font-mono">{word.pronunciation}</p>
                  <p className="text-xs mt-1 opacity-90">{word.definition}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
