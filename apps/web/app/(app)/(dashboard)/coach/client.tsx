"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  PaperPlaneRightIcon,
  SparkleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react"

interface ServerData {
  id: string
  word: string
  definition: string
  pronunciation: string
  examples: string[]
  completed: boolean
  learned: boolean
}

interface SessionData {
  id: string
  email: string
  name: string
}

interface CoachClientProps {
  user: SessionData
  todayWord: ServerData | null
  savedWords: ServerData[]
  learnedWords: ServerData[]
}

interface Message {
  id: string
  sender: "coach" | "user"
  text: string
  quiz?: {
    word: string
    options: string[]
    correctIdx: number
    selectedIdx?: number
    isCorrect?: boolean
  }
}

const COMMON_DEFINITIONS = [
  "The ability to understand and share the feelings of another.",
  "An optical phenomenon that makes objects appear distorted or displaced.",
  "A state of intense excitement and happiness.",
  "Extremely careful and precise, paying great attention to detail.",
  "Lasting for a very short time; transient or fleeting.",
  "A feeling of pensive sadness, typically with no obvious cause.",
  "Clear, logical, and convincing in an argument or speech.",
]

export function CoachClient({
  user,
  todayWord,
  savedWords,
  learnedWords,
}: CoachClientProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "coach",
      text: `Hi there! I'm your Verbly vocabulary coach. I'm here to help you practice and lock in your new words. What would you like to do?`,
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const addCoachMessage = (text: string, quiz?: Message["quiz"]) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "coach",
          text,
          quiz,
        },
      ])
    }, 1200)
  }

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "user",
        text,
      },
    ])
    setInputText("")

    const query = text.toLowerCase()
    if (
      query.includes("quiz") ||
      query.includes("test") ||
      query.includes("practice")
    ) {
      triggerQuiz()
    } else if (
      query.includes("today") ||
      query.includes("featured") ||
      query.includes("word of the day")
    ) {
      triggerExplainToday()
    } else if (
      query.includes("hi") ||
      query.includes("hello") ||
      query.includes("hey")
    ) {
      addCoachMessage(
        `Hello! Hope you're having a great day of learning. Tap one of the options below to get started or ask me a word question!`
      )
    } else if (query.includes("clear") || query.includes("reset")) {
      setMessages([
        {
          id: "welcome",
          sender: "coach",
          text: `Chat reset! Let's start fresh. What would you like to do?`,
        },
      ])
    } else {
      addCoachMessage(
        `I hear you! As your vocabulary coach, I can explain words, quiz you, or help you write sentences. Try clicking one of the quick options below for a structured session!`
      )
    }
  }

  const triggerExplainToday = () => {
    if (!todayWord) {
      addCoachMessage(
        "I couldn't find today's featured word yet. Make sure to check the Home tab!"
      )
      return
    }

    addCoachMessage(
      `Here is a breakdown of today's word, **${todayWord.word}** (${todayWord.pronunciation}):\n\n` +
        `**Definition:**\n${todayWord.definition}\n\n` +
        `**Example Sentences:**\n` +
        todayWord.examples.map((ex) => `• "${ex}"`).join("\n") +
        `\n\nTry writing your own sentence using **${todayWord.word}** and send it here to practice!`
    )
  }

  const triggerQuiz = () => {
    if (savedWords.length === 0) {
      addCoachMessage(
        "You don't have any saved words yet! To take a custom quiz, go to the Home tab and save today's word (or any previous words) to build your personal word list."
      )
      return
    }

    const target = savedWords[Math.floor(Math.random() * savedWords.length)]
    if (!target) {
      addCoachMessage(
        "Oops! I couldn't select a saved word to quiz you on. Please save a word first."
      )
      return
    }

    let options = [target.definition]
    const otherSavedDefs = savedWords
      .filter((w) => w.id !== target.id)
      .map((w) => w.definition)

    const pool = [...otherSavedDefs, ...COMMON_DEFINITIONS]
    const shuffledPool = pool.sort(() => 0.5 - Math.random())
    for (const def of shuffledPool) {
      if (options.length >= 4) break
      if (!options.includes(def)) {
        options.push(def)
      }
    }

    options = options.sort(() => 0.5 - Math.random())
    const correctIdx = options.indexOf(target.definition)

    addCoachMessage(
      `Let's test you! What is the definition of the word **${target.word}**?`,
      {
        word: target.word,
        options,
        correctIdx,
      }
    )
  }

  const handleSelectOption = (messageId: string, optionIdx: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.quiz) return msg

        const isCorrect = optionIdx === msg.quiz.correctIdx

        setTimeout(() => {
          if (isCorrect) {
            addCoachMessage(
              `✓ That's correct! Brilliant job mastering "${msg.quiz?.word}". Keep it up!`
            )
          } else {
            addCoachMessage(
              `✗ Not quite. The correct definition for "${msg.quiz?.word}" is:\n\n` +
                `"${msg.quiz?.options[msg.quiz.correctIdx]}"`
            )
          }
        }, 300)

        return {
          ...msg,
          quiz: {
            ...msg.quiz,
            selectedIdx: optionIdx,
            isCorrect,
          },
        }
      })
    )
  }

  const triggerStory = () => {
    const wordsToUse =
      savedWords.length > 0 ? savedWords : todayWord ? [todayWord] : []

    if (wordsToUse.length === 0) {
      addCoachMessage(
        "I don't have any words to write a story with yet! Save some words first."
      )
      return
    }

    const selected = wordsToUse
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((w) => w.word)

    addCoachMessage(
      `Here is a short story using: **${selected.join(", ")}**:\n\n` +
        `"Once upon a time, someone went for a walk. They felt that learning was like a journey. ` +
        `Through pure *${selected[0]}*, they stumbled upon a hidden path. It was an experience that felt ` +
        `${selected[1] ? `both *${selected[1]}* and unforgettable` : "truly magical"}. ` +
        `In the end, they realized that every step of the way was a chance to embrace *${selected[2]}* and grow."`
    )
  }

  return (
    <div className="flex h-screen max-h-screen flex-col pb-24">
      <div className="flex shrink-0 items-center justify-between border-b bg-background p-4">
        <div>
          <h1 className="flex items-center gap-1.5 text-xl font-bold tracking-tight">
            <SparkleIcon size={20} weight="fill" />
            AI Vocabulary Coach
          </h1>
          <p className="text-xs opacity-70">
            Improve your word power in real time
          </p>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleSendMessage("clear")}
          className="opacity-70 hover:opacity-100"
        >
          Reset
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isCoach = msg.sender === "coach"
          return (
            <div
              key={msg.id}
              className={`flex ${isCoach ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-md p-3 text-sm whitespace-pre-wrap ${
                  isCoach
                    ? "border bg-card text-card-foreground"
                    : "bg-foreground font-medium text-background"
                }`}
              >
                {msg.text}

                {isCoach && msg.quiz && (
                  <div className="mt-4 space-y-2 border-t border-border pt-3">
                    {msg.quiz.options.map((opt, oIdx) => {
                      const isSelected = msg.quiz?.selectedIdx === oIdx
                      const isCorrect = msg.quiz?.correctIdx === oIdx
                      const hasSelected = msg.quiz?.selectedIdx !== undefined

                      let buttonClass = hasSelected
                        ? isCorrect
                          ? "bg-foreground text-background font-bold border-foreground border-2"
                          : isSelected
                            ? "bg-foreground/10 border-foreground opacity-50"
                            : "opacity-40"
                        : "hover:bg-foreground/5 active:bg-foreground/10 border-border"

                      return (
                        <button
                          key={oIdx}
                          disabled={hasSelected}
                          onClick={() => handleSelectOption(msg.id, oIdx)}
                          className={`block w-full rounded border p-2.5 text-left text-xs transition-colors ${buttonClass}`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-md border p-3 text-sm opacity-60">
              <SpinnerGapIcon className="animate-spin" size={16} />
              <span>Coach is drafting response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="scrollbar-none flex shrink-0 gap-2 overflow-x-auto border-t bg-background px-4 py-2 whitespace-nowrap">
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleSendMessage("Test me on saved words")}
          className="shrink-0 rounded-full"
        >
          🎯 Quiz Me
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={triggerExplainToday}
          className="shrink-0 rounded-full"
        >
          📖 Explain today's word
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={triggerStory}
          className="shrink-0 rounded-full"
        >
          ✍️ Write a story
        </Button>
      </div>

      <div className="shrink-0 border-t bg-background p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage(inputText)
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Type a message or ask a vocabulary question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-w-0 flex-1 rounded-md border bg-transparent px-3 text-sm focus:ring-1 focus:ring-foreground focus:outline-none"
          />
          <Button type="submit" size="icon" disabled={!inputText.trim()}>
            <PaperPlaneRightIcon size={18} weight="fill" />
          </Button>
        </form>
      </div>
    </div>
  )
}
