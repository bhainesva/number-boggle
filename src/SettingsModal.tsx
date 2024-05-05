import { IoCloseCircleOutline, IoPencil, IoSave } from "solid-icons/io";
import { Heading } from "./utils";
import { For, ParentComponent, Show, children, createSignal } from "solid-js";
import classNames from "classnames";

interface Props {
  onClose: () => void;
  onUpdateSetting: (setting: string, value: boolean) => void;
  onUpdateName: (name: string) => void;
  onReset: () => void;
  onRandomize: () => void;
  settings: Record<string, boolean>;
  name: string;
}

export default function SettingsModal(props: Props) {
  const [nameEditable, setNameEditable] = createSignal(false);

  let ref: HTMLInputElement | undefined;

  return (
    <>
      <button
        onClick={props.onClose}
        class="fixed left-0 right-0 top-0 w-full bottom-0 bg-slate-700 bg-opacity-80"
      ></button>
      <div class="z-10 fixed flex flex-col bg-slate-800 w-[650px] h-[80vh] top-1/2 -translate-y-1/2 rounded drop-shadow-lg text-lg text-left px-8">
        <div class="w-full flex pt-4 justify-end">
          <button onClick={props.onClose} class="">
            <IoCloseCircleOutline size={32} />
          </button>
        </div>
        <div class="overflow-y-scroll pb-8">
          <Heading class="mb-4">Name for Leaderboards</Heading>
          <Show when={nameEditable()}>
            <div>
              <input
                ref={ref}
                type="text"
                class="text-2xl shrink-0 rounded px-3 py-1.5 text-black w-full max-w-[350px] bg-slate-300"
              />
              <button
                onClick={() => {
                  setNameEditable(false);
                  if (!ref) return;
                  const value = ref.value;
                  props.onUpdateName(value);
                }}
                class="ml-3 p-1 rounded bg-green-500"
              >
                <IoSave />
                <div class="sr-only">save name</div>
              </button>
            </div>
          </Show>
          <Show when={!nameEditable()}>
            <div class="flex">
              {props.name ? (
                props.name
              ) : (
                <div class="italic text-slate-400">No name set</div>
              )}
              <button
                onClick={() => {
                  setNameEditable(true);
                  if (!ref) return;
                  ref.value = props.name || "";
                }}
                class="ml-3 p-1 rounded bg-green-500"
              >
                <IoPencil />
                <div class="sr-only">edit name</div>
              </button>
            </div>
          </Show>
        </div>

        <div class="overflow-y-scroll pb-8">
          <Heading class="mb-4">
            Enabled Operations (not saved across sessions)
          </Heading>

          <div class="grid grid-cols-4 gap-4">
            <For each={Object.entries(props.settings)}>
              {([setting, enabled]) => (
                <SettingToggle
                  onClick={() => props.onUpdateSetting(setting, !enabled)}
                  enabled={enabled}
                >
                  {setting}
                </SettingToggle>
              )}
            </For>
          </div>

          <div class="flex gap-3">
            <button
              class="bg-green-600 rounded p-3 mt-8 font-semibold"
              onClick={props.onReset}
            >
              Reset to Default
            </button>
            <button
              class="bg-green-600 rounded p-3 mt-8 font-semibold"
              onClick={props.onRandomize}
            >
              Randomize
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const SettingToggle: ParentComponent<{
  enabled: boolean;
  onClick: () => void;
}> = (props) => {
  const c = children(() => props.children);

  return (
    <button
      onClick={props.onClick}
      class={classNames(
        "aspect-square p-4 font-bold text-2xl rounded flex justify-center items-center",
        props.enabled ? "bg-green-600" : "bg-slate-500"
      )}
    >
      {c()}
    </button>
  );
};
