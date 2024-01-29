import { For, createEffect, createSignal, Show } from 'solid-js'
import { IoWarning } from 'solid-icons/io'
import classNames from 'classnames';
import { Toaster } from 'solid-toast';
import {
  Route,
  Router,
  useSearchParams,
} from "@solidjs/router";
import './App.css'
import Header from './Header';
import InfoModal from './InfoModal';
import { STORAGE_KEY, TOTAL_TIME, WINNING_SCORE } from './const';
import { getRandomArbitrary, hash, preParseExpression } from './utils';
import GameSummary from './GameSummary';
import { cyrb128, splitmix32 } from './rand';
import SettingsModal from './SettingsModal';
import { Parser } from 'expr-eval';

const defaultCompleted = [...new Array(20)].reduce((out, _, i) => { out[i + 1] = ""; return out }, {})

type Setting = "+" | "-" | "*" | "/" | "^" | "x!" | "!x (sf)" | "44" | "." | "' (mi)" | "√ (sqrt)" | "Γ (g)"

const settingValidators: Record<Setting, RegExp> = {
  "+": /\+/,
  "-": /-/,
  "*": /\*/,
  "/": /\//,
  "^": /\^/,
  "x!": /\!/,
  "!x (sf)": /sf/,
  "44": /\d{2}/,
  ".": /\./,
  "' (mi)": /mi/,
  "√ (sqrt)": /sqrt/,
  "Γ (g)": /g/,
} as const;

const defaultSettings: Record<Setting, boolean> = {
  "+": true,
  "-": true,
  "*": true,
  "/": true,
  "^": true,
  "x!": true,
  "!x (sf)": false,
  "44": false,
  ".": false,
  "' (mi)": false,
  "√ (sqrt)": false,
  "Γ (g)": false,
} as const;

const gamma = (arg1: number) => {
  const n = arg1 - 1;
  if (n <= 0) return 1;
  let tot = 1;
  for (let i = n; i > 1; i--) {
    tot *= i;
  }
  return tot;
}

const factDiv = function (x: number, k: number): number {
  return (k >= x) ? 1 : (x * factDiv(x - 1, k));
}

// Copied from: https://stackoverflow.com/a/36994144
const subfactorial = (x: number) => {
  let p = 1;
  let sum = 0;
  for (let k = 0; k <= x; k++) {
    sum += p * factDiv(x, k);
    p *= -1;
  }
  return sum;
}

const parser = new Parser();
parser.functions.sf = subfactorial;

parser.functions.mi = function (arg1: number) {
  return 1 / arg1;
}

parser.functions.sqrt = function (arg1: number) {
  return Math.sqrt(arg1);
}

parser.functions.g = gamma;

function App() {
  return (
    <Router>
      <Route path="/*" component={InnerApp} />
    </Router>
  )
}

function getTodaysNumbers(): string[] {
  const seed = (new Date()).toDateString();
  const rand = splitmix32(cyrb128(seed)[0]);

  return [...(new Array(4))].map(_ => String(
    Math.floor(rand() * (10 - 1) + 1)
  ))
}

function InnerApp() {
  const [digits, setDigits] = createSignal<string[]>(["?", "?", "?", "?"]);
  const [inProgress, setInProgress] = createSignal(false);
  const [dailyGameCompleted, setDailyGameCompleted] = createSignal(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')?.date === (new Date().toDateString()))
  const [time, setTime] = createSignal(TOTAL_TIME);
  const [infoModalOpen, setInfoModalOpen] = createSignal(false);
  const [settingsModalOpen, setSettingsModalOpen] = createSignal(false);
  const [initialParamsUsed, setInitialParamsUsed] = createSignal(false);
  const [gameStarted, setGameStarted] = createSignal(false);
  const [todaysGame, setTodaysGame] = createSignal(false);
  const [output, setOutput] = createSignal(" ");
  const [completed, setCompleted] = createSignal<Record<number, { expr: string, onTime: boolean }>>({ ...defaultCompleted })
  const [expressionIsValid, setExpressionIsValid] = createSignal(true);
  const [tooltipShown, setTooltipShown] = createSignal(false);
  const [params, setParams] = useSearchParams();
  const [settings, setSettings] = createSignal<Record<keyof typeof defaultSettings, boolean>>(defaultSettings);
  let ref: HTMLInputElement | undefined;

  const handleStartTodaysGame = () => {
    const newDigits = getTodaysNumbers();
    if (ref) {
      ref.value = '';
      setOutput('');
      ref.focus();
    }

    setTime(TOTAL_TIME);
    setGameStarted(true);
    setDigits(newDigits);
    setParams({ game: hash(newDigits.join('')) })
    setTodaysGame(true);
    setInitialParamsUsed(true);

    const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (existingData?.date === (new Date()).toDateString()) {
      setCompleted(existingData.completed)
      setInProgress(false);
      return;
    }

    setInProgress(true);
    setCompleted(defaultCompleted);
    setExpressionIsValid(true);
  }

  const expectedCounts = () => {
    const m: Record<string, number> = {}
    for (const digit of digits()) {
      m[digit] = m[String(digit)] ? m[String(digit)] + 1 : 1;
    }
    return m
  }

  const endDailyGame = () => {
    setDailyGameCompleted(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: (new Date()).toDateString(),
      completed: completed(),
    }));
  }

  setInterval(() => setTime(time => inProgress() ? time - 1 : time), 1000);
  const numbersSolved = () => Object.entries(completed()).reduce((tot, cur) => tot + (cur[1].onTime ? 1 : 0), 0);

  createEffect(() => {
    if (time() <= 0) {
      setInProgress(false);

      if (todaysGame()) {
        endDailyGame();
      }
    }
  })

  createEffect(() => {
    if (numbersSolved() === WINNING_SCORE) {
      setInProgress(false);

      if (todaysGame()) {
        endDailyGame();
      }
    }
  })

  const handleGameStart = () => {
    const initialGame = params['game'];
    const newDigits = (initialParamsUsed() || !initialGame)
      ? [...new Array(4)].map(_ => String(getRandomArbitrary(1, 10)))
      : String(hash(initialGame)).split("");

    if (ref) {
      ref?.focus();
      ref.value = '';
      setOutput('');
    }

    setGameStarted(true);
    setTodaysGame(false);
    setDigits(newDigits);
    setParams({ game: hash(newDigits.join('')) })
    setInitialParamsUsed(true);
    setCompleted(defaultCompleted);
    setExpressionIsValid(true);
    setInProgress(true);
    setTime(TOTAL_TIME);
  }

  const handleInputUpdate = () => {
    const input = ref?.value || '';
    let isValid = true;

    const leftParens = (input.match(/\(/g) || []).length;
    const rightParens = (input.match(/\)/g) || []).length;
    const correctedInput = input.padEnd(input.length + (leftParens - rightParens), ")")
    const further = preParseExpression(correctedInput, parser);

    if (!input) {
      setExpressionIsValid(true);
      setOutput(' ')
      return;
    }

    for (const [setting, enabled] of Object.entries(settings())) {
      if (enabled) continue;

      if (further.match(settingValidators[setting as Setting])) {
        isValid = false;
      }
    }

    for (const digit of digits()) {
      const count = ([...further.matchAll(new RegExp(String(digit), "g"))] || []).length;
      if (count !== expectedCounts()[digit]) {
        isValid = false;
      }
    }

    try {
      setExpressionIsValid(isValid || !ref?.value)

      const expr = parser.parse(further);
      const o = expr.evaluate();

      setOutput(String(o));
      if (isValid && String(o) in completed() && !completed()[o] && o >= 1 && o <= 20) {
        setCompleted(prev => ({ ...prev, [String(o)]: { expr: correctedInput, onTime: inProgress() } }))
      }
    } catch (e) {
      setExpressionIsValid(false);
      setOutput("");
    }
  }

  createEffect(() => {
    // want to revalidate current input when settings change
    settings();
    handleInputUpdate();
  })

  return (
    <>
      <Header
        time={time()}
        dailyGameCompleted={dailyGameCompleted()}
        isTodaysGame={todaysGame()}
        inProgress={inProgress()}
        onInfoClick={() => setInfoModalOpen(true)}
        onSettingsClick={() => setSettingsModalOpen(true)}
        onStartTodaysGame={handleStartTodaysGame}
      />
      <div class="container my-4 h-full flex flex-col flex-grow items-center">
        <button class="w-full max-w-[350px] h-[350px] short:h-[100px]" onClick={handleGameStart}>
          <ul class="h-full font-bold text-6xl grid grid-cols-2 gap-4 short:grid-cols-4">
            <For each={digits()}>{(digit) =>
              <li class="flex justify-center items-center bg-slate-500 p-4 rounded">
                {digit}
              </li>
            }
            </For>
          </ul>
        </button>

        <div class="flex justify-between h-[60px] w-full max-w-[800px] mt-10 mb-6">
          <Toaster />
          <Show when={infoModalOpen()}>
            <InfoModal onClose={() => setInfoModalOpen(false)} />
          </Show>

          <Show when={settingsModalOpen()}>
            <SettingsModal
              onReset={() => setSettings(defaultSettings)}
              settings={settings()}
              onUpdateSetting={(setting, value) => setSettings((oldSettings) => ({ ...oldSettings, [setting]: value }))}
              onRandomize={() => setSettings((oldSettings) => {
                const newSettings: Partial<Record<Setting, boolean>> = {};
                for (const setting of Object.keys(oldSettings)) {
                  newSettings[setting as Setting] = Math.random() < 0.5;
                }
                return newSettings as Record<Setting, boolean>;
              })}
              onClose={() => setSettingsModalOpen(false)}
            />
          </Show>

          <input class="text-2xl shrink-0 rounded p-3 text-black w-full max-w-[500px] bg-slate-300" ref={ref} type="text" onInput={handleInputUpdate} onPaste={handleInputUpdate} />
          <div class="flex flex-col items-center">
            <div class="relative basis-1/3 shrink-0">
              <Show when={!expressionIsValid()}>
                <Show when={tooltipShown()}>
                  <div class="shadow-lg rounded absolute bg-slate-500 p-2 text-sm -top-[30%] left-[50%] -translate-x-1/2 -translate-y-[105%]">Not a valid number boggle expression!
                    <div class="absolute top-full left-[50%] -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-500"></div>
                  </div>
                </Show>
                <IoWarning onMouseEnter={() => setTooltipShown(true)} onMouseLeave={() => setTooltipShown(false)} />
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
          <GameSummary time={time()} numbersSolved={numbersSolved()} completed={completed()} />
        </Show>

        <ol class="AnswerGrid mt-4 gap-2 w-full max-w-[800px]">
          <For each={Object.entries(completed())}>{(item) => {
            const hasSolution = () => {
              return !!item[1].expr;
            }

            const onTime = () => {
              return !!item[1].onTime;
            }

            return (
              <li class={classNames("flex w-full shrink-0 grow-0 rounded justify-center items-center transition-all", { "bg-green-600": hasSolution() && onTime(), "bg-yellow-600": hasSolution() && !onTime(), "bg-slate-500": !hasSolution() })}>
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
    </>
  )
}

export default App
