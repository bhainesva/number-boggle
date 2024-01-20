import { children, ParentComponent } from 'solid-js'
import classNames from 'classnames';

export const Tile: ParentComponent<{ color?: string }> = (props) => {
  const c = children(() => props.children);

  const cls = classNames("rounded py-1 px-1.5", props.color || "bg-slate-500")

  return (
    <span class={cls}>{c()}</span>
  )
}

export const Heading: ParentComponent = (props) => {
  const c = children(() => props.children);

  return (
    <h2 class="my-2 text-2xl font-bold">{c()}</h2>
  )
}

export function hash(n: any): number {
  return ((0x0000FFFF & n) << 16) + ((0xFFFF0000 & n) >> 16)
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}
