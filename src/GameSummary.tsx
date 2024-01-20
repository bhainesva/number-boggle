import toast from "solid-toast";
import { TOTAL_TIME, WINNING_SCORE } from "./const";
import { IoShareSocialSharp } from "solid-icons/io";

export default function GameSummary(props: { completed: Record<string, { expr: string, onTime: boolean }>, numbersSolved: number, time: number }) {
  const score = () => props.numbersSolved === WINNING_SCORE
    ? `${Math.floor((TOTAL_TIME - props.time) / 60)}:${String((TOTAL_TIME - props.time) % 60).padStart(2, "0")}`
    : `${props.numbersSolved}/${WINNING_SCORE}`;

  const scoreSummaryString = () => Object.entries(props.completed).reduce((out, cur, i) => {
    const space = i % 5 === 4 ? " " : ''
    const char = cur[1].expr && cur[1].onTime
      ? '🟩'
      : (cur[1].expr && !cur[1].onTime ? '🟨' : '⬜')
    return `${out}${char}${space}`;
  }, "");

  const clipboardScore = () => props.numbersSolved === WINNING_SCORE
    ? `${score()}`
    : `${score()} - ${scoreSummaryString()}`

  return (
    <div class="flex items-center mb-2 text-xl">
      <div class="mr-4">
        Game over!{props.numbersSolved === WINNING_SCORE ? ' You win! ' : ' '}Your score was: <span class="font-bold">{score()}</span>
      </div>
      <button onClick={() => {
        navigator.clipboard.writeText(`${window.location} - ${clipboardScore()}`)
          .then(() => toast.success("Copied results to clipboard"));
      }} class="flex items-center bg-green-600 font-semibold rounded py-1 px-3">Share <IoShareSocialSharp class="ml-2" /></button>
    </div>
  )
}