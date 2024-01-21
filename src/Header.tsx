import classNames from 'classnames'
import { IoInformationCircleOutline } from 'solid-icons/io'

export default function Header(props: { dailyGameCompleted: boolean, isTodaysGame: boolean, inProgress: boolean, time: number, onClick: () => void, onStartTodaysGame: () => void }) {
  return (
    <div class="flex justify-between items-center w-full p-4">
      <div class="basis-1/3"></div>
      <h1 class="font-semibold">{props.inProgress ? <>{Math.floor(props.time / 60)}: {String(props.time % 60).padStart(2, "0")}</> : <>Number Boggle</>}</h1>
      <div class="basis-1/3 flex justify-end">
        <button disabled={props.isTodaysGame} class={
          classNames("font-semibold rounded p-2 mr-3", props.isTodaysGame ? "bg-slate-500" : (props.dailyGameCompleted ? "bg-yellow-600" : "bg-green-600"))} onClick={props.onStartTodaysGame}>
          {props.dailyGameCompleted ? 'View Daily Results' : 'Start Daily Game'}
        </button>
        <button onClick={props.onClick}>
          <IoInformationCircleOutline size={42} />
        </button>        
      </div>
    </div>
  )
}