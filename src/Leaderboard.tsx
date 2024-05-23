import { For, createEffect, createSignal, Show, JSX } from "solid-js";
import { fetchScores } from "./api";
import classNames from "classnames";
import { IoChevronForward, IoReload } from "solid-icons/io";
import "./Leaderboard.css";
import { STORAGE_KEY } from "./const";
import Spinner from "./Spinner";
import { mergeStorage } from "./storage";
import { currentDateString } from "./utils";

const oneToTwenty = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
];

export default function Leaderboard() {
  const [scores, setScores] = createSignal<any>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").leaderboard || null
  );
  const [loading, setLoading] = createSignal(false);
  const [expandedRows, setExpandedRows] = createSignal<any>(new Set());
  const [date, setDate] = createSignal(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").leaderboardDate ||
      currentDateString()
  );

  const refreshScores = async () => {
    setLoading(true);
    Promise.all([
      new Promise((r) => setTimeout(r, 800)),
      fetchScores(date()).then((scores) => {
        mergeStorage({
          leaderboard: scores,
          leaderboardDate: date(),
        });
        setScores(scores);
      }),
    ]).then(() => setLoading(false));
  };

  createEffect(async () => {
    if (scores()) return;

    refreshScores();
  });

  const sorts = () =>
    (scores()?.Items || []).toSorted(
      (
        a: { Score: { N: string }; Time: { N: string } },
        b: { Score: { N: string }; Time: { N: string } }
      ) => {
        if (a.Score.N !== b.Score.N)
          return Number(b.Score.N) - Number(a.Score.N);

        return Number(a.Time.N) - Number(b.Time.N);
      }
    );

  const scoreSummaryString = (score: Record<string, { S?: string }>) =>
    oneToTwenty.reduce((out, cur, i) => {
      const space = i % 5 === 4 ? " " : "";
      const char = score[cur]?.S ? "🟩" : "⬜";
      return `${out}${char}${space}`;
    }, "");

  return (
    <div class="mt-12">
      <Show when={loading()}>
        <Spinner />
      </Show>
      <Show when={!loading()}>
        <div class="LeaderboardGrid font-bold">
          <div></div>
          <div>Rank</div>
          <div>User</div>
          <div>Time</div>
          <div>Score</div>
          <div>Performance</div>

          <For each={sorts()}>
            {(item, i) => (
              <>
                <div>
                  <button
                    class="p-2 hover:bg-slate-700 rounded-full"
                    onClick={() => {
                      const curSet = new Set([...expandedRows()]);
                      if (!curSet.has(i())) {
                        curSet.add(i());
                      } else {
                        curSet.delete(i());
                      }
                      setExpandedRows(curSet);
                    }}
                  >
                    <IoChevronForward
                      class={classNames("transition-all", {
                        "rotate-90": expandedRows().has(i()),
                      })}
                    />
                    <div class="sr-only">Expand Solutions</div>
                  </button>
                </div>
                <div>{i() + 1}</div>
                <div>{item.UserID.S}</div>
                <div>
                  {item.Time.N && item.Time.N !== "0"
                    ? `${Math.floor(Number(item.Time.N) / 60)}:${String(
                        Number(item.Time.N) % 60
                      ).padStart(2, "0")}`
                    : "n/a"}
                </div>
                <div>{item.Score.N}</div>
                <div>{scoreSummaryString(item.Solutions.M)}</div>
                {expandedRows().has(i()) && (
                  <div class="col-span-6 grid grid-cols-5 gap-2">
                    {oneToTwenty.reduce<JSX.Element[]>((agg, cur) => {
                      const hasSolution = item.Solutions.M[cur]?.S;
                      agg.push(
                        <li
                          class={classNames(
                            "p-1 flex w-full shrink-0 grow-0 rounded justify-center items-center transition-all",
                            {
                              "bg-green-600": hasSolution,
                              "bg-slate-500": !hasSolution,
                            }
                          )}
                        >
                          {cur}
                          {hasSolution && (
                            <span class="ml-1"> = {hasSolution}</span>
                          )}
                        </li>
                      );
                      return agg;
                    }, [])}
                  </div>
                )}
              </>
            )}
          </For>
        </div>
      </Show>
      <div class="flex items-center justify-center mt-12 mx-auto gap-4">
        <button
          class="flex p-2 items-center justify-center gap-2 font-bold rounded bg-green-500"
          onClick={refreshScores}
        >
          Refresh <IoReload />
        </button>{" "}
        for{" "}
        <input
          class="text-black"
          value={date()}
          type="date"
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
    </div>
  );
}
