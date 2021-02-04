import './Game.css'
import {useState} from 'react';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


function Tile(num) {
  return (
    <div className="Tile">
      {num}
    </div>
  )
}

const numbers = [...Array(4)].map(row => Array(4));
for (const row of numbers) {
  for (let i = 0; i < row.length; i++) {
    row[i] = getRandomInt(0, 10)
  }
}

function Game() {
  const [seen, setSeen] = useState([]);
  const [val, setVal] = useState('');

  return (
    <div className="Game">
      <div className="Grid">
        {numbers.map(x => x.map(Tile))}
      </div>
      <br />
      <div>
        <input value={val} onKeyPress={(e) => {
          if (e.key === "Enter") {
            setSeen(seen => [...seen, val])
            setVal('')
          }
        }} onChange={e => setVal(e.target.value)} type="text" />
      </div>
      <div>
        {seen.map(x => <div>{x}</div>)}
      </div>
    </div>
  );
}

export default Game;
