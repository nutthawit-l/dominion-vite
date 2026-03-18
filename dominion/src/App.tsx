import { useState } from 'react'
import artisanImg from './assets/kingdoms/Artisan.jpg'
import banditImg from './assets/kingdoms/Bandit.jpg'
import cellarImg from './assets/kingdoms/Cellar.jpg'
import chapelImg from './assets/kingdoms/Chapel.jpg'
import gardensImg from './assets/kingdoms/Gardens.jpg'
import laboratoryImg from './assets/kingdoms/Laboratory.jpg'
import remodelImg from './assets/kingdoms/Remodel.jpg'
import sentryImg from './assets/kingdoms/Sentry.jpg'
import vassalImg from './assets/kingdoms/Vassal.jpg'
import workshopImg from './assets/kingdoms/Workshop.jpg'

import copperImg from './assets/basics/Copper.jpg'
import silverImg from './assets/basics/Silver.jpg'
import goldImg from './assets/basics/Gold.jpg'
import estateImg from './assets/basics/Estate.jpg'
import duchyImg from './assets/basics/Duchy.jpg'
import provinceImg from './assets/basics/Province.jpg'
import curseImg from './assets/basics/Curse.jpg'

import './App.css'

const KINGDOM_CARDS = [
  { name: 'Artisan', cost: 6, type: 'Action', count: 10, img: artisanImg },
  { name: 'Bandit', cost: 5, type: 'Action-Attack', count: 10, img: banditImg },
  { name: 'Cellar', cost: 2, type: 'Action', count: 10, img: cellarImg },
  { name: 'Chapel', cost: 2, type: 'Action', count: 10, img: chapelImg },
  { name: 'Gardens', cost: 4, type: 'Victory', count: 10, img: gardensImg },
  { name: 'Laboratory', cost: 5, type: 'Action', count: 10, img: laboratoryImg },
  { name: 'Remodel', cost: 4, type: 'Action', count: 10, img: remodelImg },
  { name: 'Sentry', cost: 5, type: 'Action', count: 10, img: sentryImg },
  { name: 'Vassal', cost: 3, type: 'Action', count: 10, img: vassalImg },
  { name: 'Workshop', cost: 3, type: 'Action', count: 10, img: workshopImg },
];

const BASIC_CARDS = [
  { name: 'Province', cost: 8, count: 8, img: provinceImg, type: 'Victory' },
  { name: 'Gold', cost: 6, count: 20, img: goldImg, type: 'Treasure' },
  { name: 'Duchy', cost: 5, count: 8, img: duchyImg, type: 'Victory' },
  { name: 'Silver', cost: 3, count: 30, img: silverImg, type: 'Treasure' },
  { name: 'Estate', cost: 2, count: 12, img: estateImg, type: 'Victory' },
  { name: 'Copper', cost: 0, count: 40, img: copperImg, type: 'Treasure' },
  { name: 'Curse', cost: 0, count: 10, img: curseImg, type: 'Curse' },
];

function App() {
  const [hand, setHand] = useState([
    { id: '1', name: 'Copper' },
    { id: '2', name: 'Copper' },
    { id: '3', name: 'Copper' },
    { id: '4', name: 'Copper' },
    { id: '5', name: 'Copper' },
    { id: '6', name: 'Copper' },
    { id: '7', name: 'Copper' },
  ]);
  const [played, setPlayed] = useState<{ id: string, name: string }[]>([]);
  const [isOver, setIsOver] = useState(false);

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("cardId", cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const cardId = e.dataTransfer.getData("cardId");
    const cardIndex = hand.findIndex(c => c.id === cardId);

    if (cardIndex !== -1) {
      const card = hand[cardIndex];
      setHand(hand.filter(c => c.id !== cardId));
      setPlayed([...played, card]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4 grid place-items-center">
      <div className="grid border-4 border-black w-full max-w-7xl aspect-4/3 grid-cols-[repeat(32,1fr)] grid-rows-[repeat(24,1fr)] shadow-2xl overflow-hidden bg-stone-900 text-[10px] font-bold uppercase tracking-tighter">
        {/* Board */}
        <div className="[grid-area:3/1/13/7] bg-stone-800/80 border border-black/20 grid grid-cols-2 grid-rows-4 gap-1 p-1">
          {BASIC_CARDS.map((card) => (
            <KingdomCard key={card.name} {...card} />
          ))}
        </div>

        {/* Kingdom Area */}
        <div className="[grid-area:3/7/13/25] bg-stone-800/50 border border-black/20 grid grid-cols-5 grid-rows-2 gap-2 p-3">
          {KINGDOM_CARDS.map((card) => (
            <KingdomCard key={card.name} {...card} />
          ))}
        </div>

        <div className="[grid-area:1/25/13/33] bg-fuchsia-400 border-l border-b border-black/20 flex items-center justify-center text-white z-10 font-black">Game Logs</div>

        <div
          className={`[grid-area:13/1/18/33] border-y border-black/20 flex flex-wrap items-center justify-center p-4 gap-2 text-white transition-all duration-200 ${isOver ? 'bg-emerald-500 scale-[1.01] z-20 shadow-inner' : 'bg-emerald-600'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {played.length === 0 ? (
            <span className={`transition-opacity duration-200 font-black ${isOver ? 'opacity-100 text-3xl' : 'opacity-40 text-2xl'}`}>
              {isOver ? "Drop to Play" : "Playground Area"}
            </span>
          ) : (
            <div className="flex -space-x-12 hover:-space-x-8 transition-all duration-300">
              {played.map((card) => (
                <Card key={card.id} className="scale-75 hover:scale-100 hover:z-50 hover:-translate-y-4 shadow-xl pointer-events-none" />
              ))}
            </div>
          )}
        </div>

        {/* Opponent */}
        <div className="[grid-area:1/7/3/9] bg-amber-900 flex items-center justify-center text-white">Profile</div>
        <div className="[grid-area:1/9/3/11] bg-red-600 flex items-center justify-center text-white">Victory Point</div>
        <div className="[grid-area:1/11/3/13] bg-cyan-400 flex items-center justify-center text-black">Deck</div>
        <div className="[grid-area:1/13/3/15] bg-emerald-300 flex items-center justify-center text-black">Hand</div>
        <div className="[grid-area:1/15/3/17] bg-sky-700 flex items-center justify-center text-white">Discard</div>

        {/* Player */}
        <div className="[grid-area:23/1/25/3] bg-blue-400 flex items-center justify-center text-white">Deck</div>
        <div className="[grid-area:18/6/25/28] bg-blue-700/5 flex items-end justify-center relative overflow-visible group/hand">
          <div className="flex justify-center items-end relative w-full h-50 -mb-5">
            {hand.map((card, i) => {
              const total = hand.length;
              const index = i - (total - 1) / 2;
              return (
                <div
                  key={card.id}
                  className="absolute bottom-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform group/card"
                  style={{
                    transform: `translateX(calc(${index * 42}px + var(--spread, 0px))) translateY(${Math.abs(index) * 6}px)`,
                    zIndex: 10 + i,
                    // @ts-ignore
                    '--index': index,
                    // @ts-ignore
                    '--spread': '0px'
                  }}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, card.id)}
                >
                  <div className="transition-all duration-300 ease-out hover:-translate-y-24 hover:scale-125 hover:rotate-0 hover:z-100 group-hover/hand:[--spread:calc(var(--index)*15px)] active:opacity-40"
                    style={{ transform: `rotate(${index * 6}deg)` }}>
                    <Card />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="[grid-area:23/29/25/31] bg-gray-200 flex items-center justify-center text-black font-black">Discard</div>
        <div className="[grid-area:23/31/25/33] bg-black flex items-center justify-center text-white border border-white/20 font-black">Trash</div>
        <div className="[grid-area:21/1/23/3] bg-lime-400 flex items-center justify-center text-black">Profile</div>
        <div className="[grid-area:21/3/23/5] bg-sky-700 flex items-center justify-center text-white">Victory Point</div>
        <div className="[grid-area:19/1/21/5] bg-orange-400 flex items-center justify-center text-black font-black">Action/Gold/Buy Counter</div>

        {/* Buttons */}
        <div className="[grid-area:1/1/3/3] bg-pink-300 flex items-center justify-center text-black cursor-pointer hover:bg-pink-400 font-black">Menu</div>
        <div className="[grid-area:1/3/3/5] bg-purple-600 flex items-center justify-center text-white cursor-pointer hover:bg-purple-700 font-black">Zoom</div>
        <div className="[grid-area:23/3/25/5] bg-violet-600 flex items-center justify-center text-white cursor-pointer hover:bg-violet-700 font-black">Undo</div>
        <div className="[grid-area:21/29/23/33] bg-olive-700 flex items-center justify-center text-white cursor-pointer hover:bg-olive-800 font-black">End Buys</div>
        <div className="[grid-area:19/29/21/33] bg-violet-900 flex items-center justify-center text-white cursor-pointer hover:bg-[rebeccapurple] font-black">Play Treasures</div>
      </div>
    </div>
  )
}

function KingdomCard({ name, cost, count, type, img }: { name: string, cost: number, count: number, type: string, img: string }) {
  const isAttack = type.includes('Attack');
  return (
    <div className="relative group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95">
      <div className="w-full h-full rounded-sm overflow-hidden border border-white/10 shadow-lg bg-stone-900 flex flex-col">
        {/* Card Image Area (Cropped) */}
        <div className="relative flex-1 overflow-hidden">
          <img src={img} alt={name} className="w-full h-full object-cover object-top scale-110 group-hover:scale-100 transition-transform duration-500" />

          {/* Information Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between px-1.5 pb-1">
            {/* Cost Circle */}
            <div className="w-8 h-8 rounded-full bg-yellow-400 border border-yellow-600 flex items-center justify-center text-black text-[16px] font-black shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              {cost}
            </div>

            {/* Attack Symbol */}
            {isAttack && (
              <div className="mb-0.5 animate-pulse">
                <span className="text-red-500 text-xs filter drop-shadow-[0_0_2px_rgba(0,0,0,1)]">⚔️</span>
              </div>
            )}

            {/* Count */}
            <div className="text-white text-[16px] font-black tracking-normal drop-shadow-[0_1px_2px_rgba(0,0,0,1)] bg-black/50 px-1 rounded-sm border border-white/10">
              {count}
            </div>
          </div>
        </div>
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

