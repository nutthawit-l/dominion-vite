import copperImg from './assets/Copper.jpg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-stone-100 p-4 grid place-items-center">
      <div className="grid border-4 border-black w-full max-w-7xl aspect-4/3 grid-cols-[repeat(32,1fr)] grid-rows-[repeat(24,1fr)] shadow-2xl overflow-hidden bg-stone-900 text-[10px] font-bold uppercase tracking-tighter">
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
        <div className="[grid-area:18/6/25/28] bg-blue-700/5 flex items-end justify-center relative overflow-visible group/hand">
          <span className="absolute top-2 left-1/2 -translate-x-1/2 opacity-30 text-white pointer-events-none">Player Hand</span>
          <div className="flex justify-center items-end relative w-full h-50 -mb-5">
            {Array.from({ length: 7 }).map((_, i) => {
              const total = 7;
              const index = i - (total - 1) / 2;
              return (
                <div
                  key={i}
                  className="absolute bottom-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform group/card"
                  style={{
                    transform: `translateX(calc(${index * 42}px + var(--spread, 0px))) translateY(${Math.abs(index) * 6}px)`,
                    zIndex: 10 + i,
                    // @ts-ignore
                    '--index': index,
                    // @ts-ignore
                    '--spread': '0px'
                  }}
                >
                  <div className="transition-all duration-300 ease-out hover:-translate-y-24 hover:scale-125 hover:rotate-0 hover:z-100 group-hover/hand:[--spread:calc(var(--index)*15px)]"
                    style={{ transform: `rotate(${index * 6}deg)` }}>
                    <Card />
                  </div>
                </div>
              );
            })}
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
        <div className="[grid-area:21/29/23/33] bg-olive-700 flex items-center justify-center text-white cursor-pointer hover:bg-olive-800">End Buys</div>
        <div className="[grid-area:19/29/21/33] bg-violet-900 flex items-center justify-center text-white cursor-pointer hover:bg-[rebeccapurple]">Play Treasures</div>
      </div>
    </div>
  )
}

function Card({ className = "" }: { className?: string }) {
  return (
    <div className={`w-[clamp(80px,15vw,160px)] aspect-5/8 rounded-[4%] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out bg-[#333] cursor-pointer border border-white/10 ${className}`}>
      <img src={copperImg} alt="Copper Card" className="w-full h-full object-cover block" />
    </div>
  )
}

export default App
