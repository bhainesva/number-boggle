import { IoInformationCircleOutline } from 'solid-icons/io'

export default function Header(props: { inProgress: boolean, time: number, onClick: () => void }) {
  return (
    <div class="flex justify-between items-center w-full p-4">
      <div></div>
      <h1 class="font-semibold">{props.inProgress ? <>{Math.floor(props.time / 60)}: {String(props.time % 60).padStart(2, "0")}</> : <>Number Boggle</>}</h1>
      <button onClick={props.onClick}>
        <IoInformationCircleOutline size={42} />
      </button>
    </div>
  )
}