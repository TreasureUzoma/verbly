import { greetings } from "@/data/greetings"
import { generateDeterministicNumber } from "@/lib/deterministic-hash"
import React from "react"
export const Header = ({ fullName }: { fullName: string }) => {
  const getNewGreeting = () => {
    const date = new Date()
    const hour = date.getHours()
    const newGreetIdx =
      generateDeterministicNumber(
        hour.toString() + date.getDate().toString(),
        greetings.length
      ) - 1
    return greetings[newGreetIdx]
  }
  const firstName = fullName.split(" ")[0]
  const getTimeGreeting = () => {
    const currentHour = new Date().getHours()
    if (currentHour < 12) return "Good Morning"
    else if (currentHour < 18) return "Good Afternoon"
    return "Good Evening"
  }
  const time = getTimeGreeting()
  return (
    <header>
      <div className="mt-3 space-y-3">
        <h3 className="opcaity-90">
          {getNewGreeting()}, {firstName}!
        </h3>
        <h1 className="max-w-[250px] text-4xl font-bold">{time}.</h1>
      </div>
    </header>
  )
}
