import toast from "solid-toast";
import { STORAGE_KEY, TOTAL_TIME, WINNING_SCORE } from "./const";
import { IoShareSocialSharp } from "solid-icons/io";
import { createSignal, Show } from "solid-js";
import classNames from "classnames";
import { submitScore } from "./api";
import Spinner from "./Spinner";
import { mergeStorage } from "./storage";

export default function GameSummary(props: {
  completed: Record<string, { expr: string; onTime: boolean }>;
  numbersSolved: number;
  time: number;
  name: string;
  digits: string[];
  isTodaysGame: boolean;
}) {
  const [submitted, setSubmitted] = createSignal(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").submitted || false
  );

  const [tooltipOpen, setTooltipOpen] = createSignal(false);
  const [submitting, setSubmitting] = createSignal(false);

  const score = () =>
    props.numbersSolved === WINNING_SCORE
      ? `${Math.floor((TOTAL_TIME - props.time) / 60)}:${String(
          (TOTAL_TIME - props.time) % 60
        ).padStart(2, "0")}`
      : `${props.numbersSolved}/${WINNING_SCORE}`;

  const scoreSummaryString = () =>
    Object.entries(props.completed).reduce((out, cur, i) => {
      const space = i % 5 === 4 ? " " : "";
      const char =
        cur[1].expr && cur[1].onTime
          ? "🟩"
          : cur[1].expr && !cur[1].onTime
          ? "🟨"
          : "⬜";
      return `${out}${char}${space}`;
    }, "");

  const clipboardScore = () =>
    props.numbersSolved === WINNING_SCORE
      ? `${score()}`
      : `${score()} - ${scoreSummaryString()}`;

  const submitDisabled = () => !props.name || submitted();
  const submitText = () =>
    submitted() ? "Scores Submitted" : "Submit to Leaderboard";

  return (
    <div class="flex items-center mb-2 text-xl">
      <div class="mr-4">
        Game over!{props.numbersSolved === WINNING_SCORE ? " You win! " : " "}
        Your score was: <span class="font-bold">{score()}</span>
      </div>
      <button
        onClick={() => {
          navigator.clipboard
            .writeText(`${window.location} - ${clipboardScore()}`)
            .then(() => toast.success("Copied results to clipboard"));
        }}
        class="flex items-center bg-green-600 font-semibold rounded py-1 px-3"
      >
        Share <IoShareSocialSharp class="ml-2" />
      </button>
      {props.isTodaysGame && (
        <button
          disabled={submitDisabled()}
          onMouseEnter={() => setTooltipOpen(!props.name && true)}
          onMouseLeave={() => setTooltipOpen(!props.name && false)}
          onClick={async () => {
            setSubmitting(true);
            const submission = {
              name: props.name,
              date: new Date().toISOString().split("T")[0],
              digits: props.digits,
              solutions: Object.fromEntries(
                Object.entries(props.completed).map(([k, { expr, onTime }]) => [
                  k,
                  onTime ? expr || "" : "",
                ])
              ),
              time: TOTAL_TIME - props.time,
              score: props.numbersSolved,
            };
            Promise.all([
              new Promise((r) => setTimeout(r, 800)),
              submitScore(submission).then(() => {
                mergeStorage({
                  submitted: true,
                });
                toast.success("Submitted!");
                setSubmitted(true);
              }),
            ]).then(() => setSubmitting(false));
          }}
          class={classNames(
            "relative min-w-[150px] ml-3 flex justify-center items-center bg-green-600 font-semibold rounded py-1 px-3",
            { "cursor-not-allowed bg-slate-500": submitDisabled() }
          )}
        >
          <Show when={tooltipOpen()}>
            <div class="shadow-lg rounded absolute bg-slate-500 p-2 text-sm -top-[30%] left-[50%] -translate-x-1/2 -translate-y-[105%]">
              Set a name in settings in order to submit your scores.
              <div class="absolute top-full left-[50%] -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-500"></div>
            </div>
          </Show>
          <div class="absolute left-1/2 top-[5px] translate-x-[-50%]">
            {submitting() && <Spinner />}
          </div>
          <div class={submitting() ? "invisible" : ""}>{submitText()}</div>
        </button>
      )}
    </div>
  );
}
