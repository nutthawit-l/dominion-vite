import copperImg from './assets/Copper.jpg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-stone-100 p-4 grid place-items-center">
      <div className="grid border-4 border-black w-full max-w-7xl aspect-[4/3] grid-cols-[repeat(32,1fr)] grid-rows-[repeat(24,1fr)] shadow-2xl overflow-hidden bg-stone-900 text-[10px] font-bold uppercase tracking-tighter">
        {/* Board */}
        <div className="[grid-area:3/1/13/7] bg-yellow-400 border border-black/20 flex items-center justify-center text-black">Gold/Province</div>
        <div className="[grid-area:3/7/13/33] bg-gray-400 border border-black/20 flex items-center justify-center text-black">Kingdoms</div>
        <div className="[grid-area:1/25/13/33] bg-fuchsia-400 border-l border-b border-black/20 flex items-center justify-center text-white z-10">Game Logs</div>
        <div className="[grid-area:13/1/18/33] bg-emerald-600 border-y border-black/20 flex items-center justify-center text-white">Playground</div>

        {/* Opponent */}
        <div className="[grid-area:1/7/3/9] bg-amber-900 flex items-center justify-center text-white">Profile</div>
        <div className="[grid-area:1/9/3/11] bg-red-600 flex items-center justify-center text-white">Victory Point</div>
        <div className="[grid-area:1/11/3/13] bg-cyan-400 flex items-center justify-center text-black">Deck</div>
        <div className="[grid-area:1/13/3/15] bg-emerald-300 flex items-center justify-center text-black">Hand</div>
        <div className="[grid-area:1/15/3/17] bg-sky-700 flex items-center justify-center text-white">Discard</div>

        {/* Player */}
        <div className="[grid-area:23/1/25/3] bg-blue-400 flex items-center justify-center text-white">Deck</div>
        <div className="[grid-area:18/6/25/28] bg-blue-700/30 flex items-end justify-center relative overflow-visible">
          <span className="absolute top-2 left-1/2 -translate-x-1/2 opacity-50 text-white">Player Hand</span>
          <div className="card-fan-container">
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
            <div className="card-fan-item"><Card /></div>
          </div>
        </div>
        <div className="[grid-area:23/29/25/31] bg-gray-200 flex items-center justify-center text-black">Discard</div>
        <div className="[grid-area:23/31/25/33] bg-black flex items-center justify-center text-white border border-white/20">Trash</div>
        <div className="[grid-area:21/1/23/3] bg-lime-400 flex items-center justify-center text-black">Profile</div>
        <div className="[grid-area:21/3/23/5] bg-sky-700 flex items-center justify-center text-white">Victory Point</div>
        <div className="[grid-area:19/1/21/5] bg-orange-400 flex items-center justify-center text-black">Action/Gold/Buy Counter</div>

        {/* Buttons */}
        <div className="[grid-area:1/1/3/3] bg-pink-300 flex items-center justify-center text-black cursor-pointer hover:bg-pink-400">Menu</div>
        <div className="[grid-area:1/3/3/5] bg-purple-600 flex items-center justify-center text-white cursor-pointer hover:bg-purple-700">Zoom</div>
        <div className="[grid-area:23/3/25/5] bg-violet-600 flex items-center justify-center text-white cursor-pointer hover:bg-violet-700">Undo</div>
        <div className="[grid-area:21/29/23/33] bg-olive-700 flex items-center justify-center text-white cursor-pointer hover:bg-olive-800 bg-[olivedrab]">End Buys</div>
        <div className="[grid-area:19/29/21/33] bg-violet-900 flex items-center justify-center text-white cursor-pointer hover:bg-[rebeccapurple] bg-[rebeccapurple]">Play Treasures</div>
      </div>
    </div>
  )
}

function Card() {
  return (
    <div className="dominion-card">
      <img src={copperImg} alt="Copper Card" />
    </div>
  )
}

export default App
