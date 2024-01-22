import { IoCloseCircleOutline } from 'solid-icons/io'
import { Heading } from './utils'
import { For, ParentComponent, children } from 'solid-js'
import classNames from 'classnames';

interface Props {
	onClose: () => void,
	onUpdateSetting: (setting: string, value: boolean) => void,
	onReset: () => void,
	settings: Record<string, boolean>
}

export default function SettingsModal(props: Props) {

	return (
		<>
			<button onClick={props.onClose} class="fixed left-0 right-0 top-0 w-full bottom-0 bg-slate-700 bg-opacity-80"></button>
			<div class="z-10 fixed flex flex-col bg-slate-800 w-[650px] h-[80vh] top-1/2 -translate-y-1/2 rounded drop-shadow-lg text-lg text-left px-8">
				<div class="w-full flex pt-4 justify-end">
					<button onClick={props.onClose} class="">
						<IoCloseCircleOutline size={32} />
					</button>
				</div>

				<div class="overflow-y-scroll pb-8">
					<Heading class="mb-4">Operations (not currently saved across sessions)</Heading>

					<div class="grid grid-cols-4 gap-4">
						<For each={Object.entries(props.settings)}>{([setting, enabled]) => 
							<SettingToggle onClick={() => props.onUpdateSetting(setting, !enabled)} enabled={enabled}>{setting}</SettingToggle>
						}
						</For>
					</div>

					<button class="bg-green-600 rounded p-3 mt-8 font-semibold" onClick={props.onReset}>Reset to Default</button>
				</div>
			</div>
		</>
	)
}

const SettingToggle: ParentComponent<{enabled: boolean, onClick: () => void}> = (props) => {
	const c = children(() => props.children);

	return (
		<button onClick={props.onClick} class={classNames("aspect-square p-4 font-bold text-2xl rounded flex justify-center items-center", props.enabled ? "bg-green-600" : "bg-slate-500")}>
			{c()}
		</button>
	)
}