import { For, createEffect, createSignal, Show } from 'solid-js'
import Mexp from 'math-expression-evaluator';
import { IoWarning, IoShareSocialSharp } from 'solid-icons/io'
import classNames from 'classnames';
import { Toaster, toast } from 'solid-toast';
import {
  Route,
  Router,
  useSearchParams,
} from "@solidjs/router";
import './App.css'

const WINNING_SCORE = 20;
const TOTAL_TIME = 180;

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

const defaultCompleted = [...new Array(20)].reduce((out, _, i) => {out[i+1] = ""; return out}, {})

function hash(n: any): number {
  return ((0x0000FFFF & n)<<16) + ((0xFFFF0000 & n)>>16)
}

function App() {
  return (
    <Router>
      <Route path="/*" component={InnerApp} />
    </Router>
  )
}

function InnerApp() {
  const [digits, setDigits] = createSignal<string[]>(["?", "?", "?", "?"]);
  const [inProgress, setInProgress] = createSignal(false);
  const [time, setTime] = createSignal(0);
  const [initialParamsUsed, setInitialParamsUsed] = createSignal(false);
  const [gameStarted, setGameStarted] = createSignal(false);
  const [output, setOutput] = createSignal(" ");
  const [completed, setCompleted] = createSignal<Record<number, {expr: string, onTime: boolean}>>(defaultCompleted)
  const [expressionIsValid, setExpressionIsValid] = createSignal(true);
  const [tooltipShown, setTooltipShown] = createSignal(false);
  const [params, setParams] = useSearchParams();

  const expectedCounts = () => {
    const m: Record<string, number> = {}
    for (const digit of digits()) {
      m[digit] = m[String(digit)] ? m[String(digit)] + 1 : 1;
    }
    return m
  }

  setInterval(() => setTime(time => inProgress() ? time - 1 : time), 1000);
  const numbersSolved = () => Object.entries(completed()).reduce((tot, cur) => tot + (cur[1].onTime ? 1 : 0), 0);

  createEffect(() => {
    if (time() <= 0) {
      setInProgress(false);
    }
  })
  
  createEffect(() => {
    if (numbersSolved() === WINNING_SCORE) {
      setInProgress(false);
    }
  })

  let ref: HTMLInputElement | undefined;

  const handle = () => {
    const initialGame = params['game'];
    const newDigits = (initialParamsUsed() || !initialGame)
      ? [...new Array(4)].map(_ => String(getRandomArbitrary(1, 10)))
      : String(hash(initialGame)).split("");

    setGameStarted(true);
    setDigits(newDigits);
    setParams({game: hash(newDigits.join(''))})
    setInitialParamsUsed(true);
    setCompleted(defaultCompleted);
    setExpressionIsValid(true);
    setInProgress(true);
    setTime(TOTAL_TIME);
  }

  const handle2 = () => {
    const input = ref?.value || '';
    const m = new Mexp();
    let isValid = true;

    if (!input) {
      setExpressionIsValid(true);
      setOutput(' ')
      return;
    }

    if (input.match(/\d{2}/)) {
      isValid = false;
    }

    for (const digit of digits()) {
      const count = ([...input.matchAll(new RegExp(String(digit), "g"))] || []).length;
      if (count !== expectedCounts()[digit]) {
        isValid = false;
      }
    }

    try {
      setExpressionIsValid(isValid || !ref?.value)
      //@ts-ignore library types are wrong
      const o = m.eval(ref.value);
      setOutput(String(o));
      if (isValid && String(o) in completed() && !completed()[o] && o >= 1 && o <= 20) {
        setCompleted(prev => ({...prev, [String(o)]: {expr: ref?.value, onTime: inProgress()}}))
      } 
    } catch (e) {
      setExpressionIsValid(false);
      setOutput("");
    }
  }

  return (
    <div class="container my-4 flex flex-col items-center">
      <Toaster />
      <h1 class="mb-4">{inProgress() ? <>{Math.floor(time() / 60)}: {String(time() % 60).padStart(2, "0")}</>: <>Number Boggle</>}</h1>
      <button class="w-full max-w-[350px] h-[350px]" onClick={handle}>
        <ul class="h-full font-bold text-6xl grid grid-cols-2 gap-4">
          <For each={digits()}>{(digit) => 
            <li class="flex justify-center items-center bg-slate-500 p-4 rounded">
              {digit}
            </li>
          }
          </For>
        </ul>
      </button>

      <div class="flex justify-between h-[60px] w-full max-w-[800px] mt-10 mb-6">
        <input class="text-2xl shrink-0 rounded p-3 text-black w-full max-w-[500px] bg-slate-300" ref={ref} type="text" onInput={handle2} onPaste={handle2} />
        <div class="flex flex-col items-center">
          <div class="relative basis-1/3 shrink-0">
            <Show when={!expressionIsValid()}>
              <Show when={tooltipShown()}>
                <div class="shadow-lg rounded absolute bg-slate-500 p-2 text-sm -top-[30%] left-[50%] -translate-x-1/2 -translate-y-[105%]">Not a valid number boggle expression!
                <div class="absolute top-full left-[50%] -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-500"></div>
                </div>
              </Show>
              <IoWarning onMouseEnter={() => setTooltipShown(true)} onMouseLeave={() => setTooltipShown(false)}/>
            </Show>
          </div>
          <div class="basis-1/3 text-3xl mx-4">
            =
          </div>
          <div class="shrink-0 basis-1/3"></div>
        </div>
        <div class="flex justify-start overflow-hidden h-full items-center basis-1/4 text-2xl text-black bg-slate-300 rounded p-4">
          {output()}
        </div>
      </div>

      <Show when={gameStarted() && !inProgress()}>
        <GameSummary time={time()} numbersSolved={numbersSolved()} completed={completed()}/>
      </Show>

      <ol class="AnswerGrid mt-4 gap-2 w-full max-w-[800px]">
        <For each={Object.entries(completed())}>{(item) => 
          {
          const hasSolution = () => {
            return !!item[1].expr;
          }

          const onTime = () => {
            return !!item[1].onTime;
          }


          return (
            <li class={classNames("flex w-full shrink-0 grow-0 rounded justify-center items-center transition-all", {"bg-green-600" : hasSolution() && onTime(), "bg-yellow-500": hasSolution() && !onTime(), "bg-slate-500": !hasSolution()})}>
              <button onClick={_ => {
                if (ref) {
                  ref.value = item[1].expr
                }
              }} disabled={!hasSolution()} class="w-full h-full font-bold p-3">
                {item[0]}{hasSolution() && <span> = {item[1].expr}</span>}
              </button>
            </li>
          )
          }
        }
        </For>
      </ol>

    </div>
  )
}

function GameSummary(props: {completed: Record<string, {expr: string, onTime: boolean}>, numbersSolved: number, time: number}) {
  const score = () => props.numbersSolved === WINNING_SCORE 
    ? `${Math.floor((TOTAL_TIME  - props.time) / 60)}:${String((TOTAL_TIME - props.time) % 60).padStart(2, "0")}` 
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

export default App
