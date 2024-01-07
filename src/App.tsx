import { For, createEffect, createSignal, Show } from 'solid-js'
import Mexp from 'math-expression-evaluator';
import {
  createInputMask,
} from "@solid-primitives/input-mask";
import { IoWarning } from 'solid-icons/io'
import classNames from 'classnames';
import { tippy, useTippy } from 'solid-tippy';
import './App.css'

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

const validCharacters = /[^\s!\/\^\*\+\-()]/g
const defaultCompleted = [...new Array(20)].reduce((out, _, i) => {out[i+1] = ""; return out}, {})

function App() {
  const [digits, setDigits] = createSignal<string[]>(["?", "?", "?", "?"]);
  const [inProgress, setInProgress] = createSignal(false);
  const [time, setTime] = createSignal(0);
  const [output, setOutput] = createSignal(" ");
  const [completed, setCompleted] = createSignal<Record<number, string>>(defaultCompleted)
  const [expressionIsValid, setExpressionIsValid] = createSignal(true);
  const [tooltipShown, setTooltipShown] = createSignal(false);

  const expectedCounts = () => {
    const m: Record<string, number> = {}
    for (const digit of digits()) {
      m[digit] = m[String(digit)] ? m[String(digit)] + 1 : 1;
    }
    return m
  }

  setInterval(() => setTime(time => inProgress() ? time - 1 : time), 1000)

  createEffect(() => {
    if (time() === 0) {
      setInProgress(false);
    }
  })

  let ref: HTMLInputElement;
  const mask = createInputMask([validCharacters, (value) => digits().includes(value) ? value : '']);

  const handle = () => {
    const newDigits = [...new Array(4)].map(_ => String(getRandomArbitrary(1, 10)));
    setDigits(newDigits);
    setCompleted(defaultCompleted);
    setExpressionIsValid(true);
    setInProgress(true);
    setTime(180);
  }

  const handle2 = (e: InputEvent | ClipboardEvent) => {
    const input = ref.value || '';
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
      setExpressionIsValid(isValid || !ref.value)
      const o = m.eval(ref.value);
      setOutput(String(o));
      console.log(o, isValid, completed())
      if (isValid && !completed()[o] && o >= 1 && o <= 20) {
        setCompleted(prev => ({...prev, [String(o)]: ref.value}))
      } 
    } catch (e) {
      setExpressionIsValid(false);
      setOutput("");
    }
  }

  return (
    <div class="container my-4 flex flex-col items-center">
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

      <div class="flex justify-between h-[60px] w-full max-w-[800px] my-10">
        <input class="text-2xl rounded p-3 text-black w-[500px] bg-slate-300" ref={ref} type="text" onInput={handle2} onPaste={handle2} />
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
        <div class="flex h-full items-center justify-center basis-1/4 text-2xl text-black bg-slate-300 rounded p-4">
          {output()}
        </div>
      </div>

      <ol class="AnswerGrid gap-2 w-full max-w-[800px]">
        <For each={Object.entries(completed())}>{(item, i) => 
          {
          console.log("For loop iterator: ", item);
          const hasSolution = () => {
            console.log("inside has sol signal?")
            return !!item[1];
          }

          return (
            <li class={classNames("flex w-full shrink-0 grow-0 rounded justify-center items-center transition-all", hasSolution() ? "bg-green-500" : "bg-slate-500")}>
              <button onClick={_ => ref.value = item[1]} disabled={!hasSolution()} class="w-full h-full font-bold p-3">
                {item[0]}{hasSolution() && <span> = {item[1]}</span>}
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

export default App
