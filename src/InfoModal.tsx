import { IoCloseCircleOutline } from 'solid-icons/io'
import { Heading, Tile } from './utils'

interface Props {
	onClose: () => void,
}

export default function InfoModal(props: Props) {
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
					<Heading>How To Play</Heading>
					<p class="mb-2">Combine the four provided digits to make numbers between 1 and 20. You must use all four digits. It's not guaranteed to be possible to make every number.</p>
					<p class="mb-2">Permitted operations are addition (+), subtraction (-), multiplication (*), division (/), exponentiation (^), and factorial (!).</p>
					<p class="mb-2">When you solve a number, the corresponding square will turn green. Clicking the square will copy the expression into the input.</p>
					<p class="mb-2">You can continue playing after time runs out, but your answers will show up yellow instead of green.</p>

					<Heading>Examples</Heading>
					<div class="mb-1">
						Given <Tile>1</Tile> <Tile>4</Tile> <Tile>5</Tile> <Tile>6</Tile> you might do:
					</div>
					<ul>
						<li class="mb-1 font-mono"><Tile color="bg-green-600">1</Tile> = <Tile>1</Tile>^(<Tile>4</Tile>+<Tile>5</Tile>+<Tile>6</Tile>)</li>
						<li class="mb-1 font-mono"><Tile color="bg-green-600">2</Tile> = <Tile>1</Tile>^<Tile>4</Tile>+(<Tile>6</Tile>-<Tile>5</Tile>)</li>
						<li class="mb-1 font-mono"><Tile color="bg-green-600">3</Tile> = <Tile>6</Tile>!/<Tile>5</Tile>!-<Tile>4</Tile>+<Tile>1</Tile></li>
						<li class="mb-1">etc.</li>
					</ul>

					<Heading>Other Features</Heading>
					<p>
						If you share a url with a `game` query parameter anyone who opens it will get the same numbers as you.
					</p>

					<Heading>Tips</Heading>
					<ul>
						<li class="list-disc list-inside">It's helpful to make 1</li>
						<li class="list-disc list-inside">1^x = 1</li>
						<li class="list-disc list-inside">n!/(n-1)! = n</li>
					</ul>
				</div>
			</div>
		</>
	)
}