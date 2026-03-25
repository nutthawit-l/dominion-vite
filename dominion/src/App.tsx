import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { KINGDOM_CARDS, BASIC_CARDS } from './lib/Card'
import type { Card } from './lib/Card'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import RoomLobby from './components/RoomLobby'
import ProfileBadge from './components/ProfileBadge'
import AvatarPickerModal from './components/AvatarPickerModal'
import type { PlayerInfo } from './contexts/AuthContext'

const API = 'http://localhost:3000/api/v1'

const mapCardImg = (backendCard: any): Card & { id: string } => {
  const template = [...BASIC_CARDS, ...KINGDOM_CARDS].find(c => c.name === backendCard.name)
  return { ...backendCard, img: template?.img }
}

function App() {
  const { player, sessionToken, room } = useAuth()

  if (!player || !sessionToken) return <LoginPage />
  if (!room) return <RoomLobby />

  return <GameBoard />
}

function GameBoard() {
  const { sessionToken, room, leaveRoom } = useAuth()
  const [hand, setHand] = useState<(Card & { id: string })[]>([])
  const [played, setPlayed] = useState<(Card & { id: string })[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [isOver, setIsOver] = useState(false)
  const [isOverHand, setIsOverHand] = useState(false)
  const [showKingdomModal, setShowKingdomModal] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [roomPlayer1, setRoomPlayer1] = useState<PlayerInfo | null>(room?.player1 ?? null)
  const [roomPlayer2, setRoomPlayer2] = useState<PlayerInfo | null>(room?.player2 ?? null)

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`,
  }

  const fetchGameState = useCallback(async () => {
    if (!room?.code) return
    try {
      const res = await fetch(`${API}/rooms/${room.code}`, { headers: authHeaders })
      const data = await res.json()
      if (data.state?.deckManager) {
        setHand(data.state.deckManager.hand.map(mapCardImg))
        setPlayed(data.state.deckManager.playGround.map(mapCardImg))
      }
      if (data.state?.logs) setLogs(data.state.logs)
      if (data.player1) setRoomPlayer1(data.player1)
      if (data.player2 !== undefined) setRoomPlayer2(data.player2)
    } catch (err) {
      console.error('Failed to fetch game state:', err)
    }
  }, [room?.code, sessionToken])

  useEffect(() => {
    fetchGameState()
    const interval = setInterval(fetchGameState, 2000)
    return () => clearInterval(interval)
  }, [fetchGameState])

  // Hand to Playground
  const handleDragStartFromHand = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('text', cardId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropOnPlayground = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    const cardId = e.dataTransfer.getData('text')
    if (cardId) playCard(cardId)
  }

  const handleDragOverPlayground = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeavePlayground = () => setIsOver(false)

  const playCard = async (cardId: string) => {
    try {
      await fetch(`${API}/rooms/${room!.code}/play`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ cardId }),
      })
      fetchGameState()
    } catch (err) {
      console.error('Failed to play card:', err)
    }
  }

  // Playground to Hand
  const handleDragStartFromPlayground = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('pg-card', cardId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropOnHand = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOverHand(false)
    const cardId = e.dataTransfer.getData('pg-card')
    if (cardId) returnCard(cardId)
  }

  const handleDragOverHand = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('pg-card')) {
      e.preventDefault()
      setIsOverHand(true)
      e.dataTransfer.dropEffect = 'move'
    }
  }

  const handleDragLeaveHand = () => setIsOverHand(false)

  const returnCard = async (cardId: string) => {
    try {
      await fetch(`${API}/rooms/${room!.code}/return`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ cardId }),
      })
      fetchGameState()
    } catch (err) {
      console.error('Failed to return card:', err)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 p-4 grid place-items-center">
      <div className="grid border-4 border-black w-full max-w-7xl aspect-4/3 grid-cols-[repeat(32,1fr)] grid-rows-[repeat(24,1fr)] shadow-2xl overflow-hidden bg-stone-900 text-[10px] font-bold uppercase tracking-tighter">

        {/* Basic Cards area */}
        <div className="[grid-area:3/1/13/7] bg-stone-800/80 border border-black/20 grid grid-cols-2 grid-rows-4 gap-1 p-1">
          {BASIC_CARDS.map((card) => (
            <PlaceCard key={card.name} {...card} />
          ))}
        </div>

        {/* Kingdom Cards area */}
        <div className="[grid-area:3/7/13/25] bg-stone-800/50 border border-black/20 grid grid-cols-5 grid-rows-2 gap-2 p-3">
          {KINGDOM_CARDS.map((card) => (
            <PlaceCard key={card.name} {...card} />
          ))}
        </div>

        {/* Logs area */}
        <div className="[grid-area:1/25/13/33] bg-fuchsia-400 border-l border-b border-black/20 flex flex-col items-start justify-start overflow-y-auto p-4 text-white z-10 shadow-inner">
          <div className="font-black text-[16px] mb-3 sticky top-0 bg-fuchsia-400/90 w-full py-1 border-b border-white/20">GAME LOGS</div>
          <div className="flex flex-col gap-1 w-full text-[12px] font-bold tracking-normal uppercase">
            {logs.map((log, i) => (
              <div key={i} className="bg-black/20 rounded-sm px-2 py-1.5 animate-in fade-in slide-in-from-left-2 duration-300 shadow-sm border border-black/10">
                <span className="text-white/60 mr-2 text-[10px]">[{i + 1}]</span>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Playground area */}
        <div
          className={`[grid-area:13/1/18/33] border-y border-black/20 flex flex-wrap items-center justify-center p-4 gap-2 text-white transition-all duration-200 ${isOver ? 'bg-emerald-500 scale-[1.01] z-20 shadow-inner' : 'bg-emerald-600'}`}
          onDragOver={handleDragOverPlayground}
          onDragLeave={handleDragLeavePlayground}
          onDrop={handleDropOnPlayground}
        >
          {played.length === 0 ? (
            <span className={`transition-opacity duration-200 font-black ${isOver ? 'opacity-100 text-3xl' : 'opacity-40 text-2xl'}`}>
              {isOver ? 'Drop to Play' : 'Playground Area'}
            </span>
          ) : (
            <div className="flex justify-center items-center gap-4 h-full py-2 overflow-x-auto">
              {played.reduce((acc, card) => {
                const existing = acc.find(p => p.name === card.name)
                if (existing) {
                  existing.quantity = (existing.quantity || 0) + 1
                } else {
                  acc.push({ ...card, quantity: 1 })
                }
                return acc
              }, [] as (Card & { id: string, quantity: number })[]).map((card) => (
                <div
                  key={card.name}
                  draggable="true"
                  onDragStart={(e) => handleDragStartFromPlayground(e, card.id)}
                  className="h-full cursor-grab active:cursor-grabbing"
                >
                  <DisplayCard {...card} count={card.quantity} className="h-full shadow-lg" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opponent profile (Player 2) */}
        <div className="[grid-area:1/7/3/9] bg-stone-800 border border-black/20 overflow-hidden">
          <ProfileBadge player={roomPlayer2} className="w-full h-full p-1" />
        </div>

        <div className="[grid-area:1/9/3/11] bg-red-600 flex items-center justify-center text-white">Victory Point</div>
        <div className="[grid-area:1/11/3/13] bg-cyan-400 flex items-center justify-center text-black">Deck</div>
        <div className="[grid-area:1/13/3/15] bg-emerald-300 flex items-center justify-center text-black">Hand</div>
        <div className="[grid-area:1/15/3/17] bg-sky-700 flex items-center justify-center text-white">Discard</div>

        {/* Player hand area */}
        <div
          className={`[grid-area:18/6/25/28] flex items-end justify-center relative overflow-visible group/hand transition-all duration-200 ${isOverHand ? 'bg-blue-400/30 ring-2 ring-blue-400 ring-inset' : 'bg-blue-700/5'}`}
          onDragOver={handleDragOverHand}
          onDragLeave={handleDragLeaveHand}
          onDrop={handleDropOnHand}
        >
          <div className="flex justify-center items-end relative w-full h-50 -mb-5">
            {hand.map((card, i) => {
              const total = hand.length
              const index = i - (total - 1) / 2
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
                  onDragStart={(e) => handleDragStartFromHand(e, card.id)}
                >
                  <div className="transition-all duration-300 ease-out hover:-translate-y-24 hover:scale-125 hover:rotate-0 hover:z-100 group-hover/hand:[--spread:calc(var(--index)*15px)] active:opacity-40 cursor-pointer"
                    style={{ transform: `rotate(${index * 6}deg)` }}
                    onClick={() => playCard(card.id)}
                  >
                    <DisplayCard img={card.img} name={card.name} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Player profile (Player 1 / you) */}
        <div className="[grid-area:21/1/23/3] bg-stone-800 border border-black/20 overflow-hidden cursor-pointer group"
          onClick={() => setShowAvatarPicker(true)}
        >
          <div className="relative w-full h-full">
            <ProfileBadge player={roomPlayer1} className="w-full h-full p-1" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[8px] font-black uppercase tracking-wider">Edit</span>
            </div>
          </div>
        </div>

        <div className="[grid-area:23/1/25/3] bg-blue-400 flex items-center justify-center text-white">Deck</div>
        <div className="[grid-area:23/29/25/31] bg-gray-200 flex items-center justify-center text-black font-black">Discard</div>
        <div className="[grid-area:23/31/25/33] bg-black flex items-center justify-center text-white border border-white/20 font-black">Trash</div>
        <div className="[grid-area:21/3/23/5] bg-sky-700 flex items-center justify-center text-white">Victory Point</div>
        <div className="[grid-area:19/1/21/5] bg-orange-400 flex items-center justify-center text-black font-black">Action/Gold/Buy Counter</div>

        {/* Buttons */}
        <div className="[grid-area:1/1/3/3] bg-pink-300 flex items-center justify-center text-black cursor-pointer hover:bg-pink-400 font-black"
          onClick={leaveRoom}
        >
          Leave
        </div>
        <div
          className="[grid-area:1/3/3/5] bg-purple-600 flex items-center justify-center text-white cursor-pointer hover:bg-purple-700 font-black"
          onClick={() => setShowKingdomModal(true)}
        >
          Zoom
        </div>

        {/* Room code display */}
        <div className="[grid-area:1/17/3/25] bg-stone-800 flex items-center justify-center gap-2 border border-black/20">
          <span className="text-stone-400 text-[10px] uppercase tracking-wider font-bold">Room</span>
          <span className="text-white text-[14px] font-black tracking-[0.3em]">{room?.code}</span>
          {!roomPlayer2 && (
            <span className="text-yellow-400 text-[9px] uppercase tracking-wider font-bold animate-pulse ml-1">Waiting...</span>
          )}
        </div>

        <div className="[grid-area:23/3/25/5] bg-violet-600 flex items-center justify-center text-white cursor-pointer hover:bg-violet-700 font-black">Undo</div>
        <div className="[grid-area:21/29/23/33] bg-olive-700 flex items-center justify-center text-white cursor-pointer hover:bg-olive-800 font-black">End Buys</div>
        <div className="[grid-area:19/29/21/33] bg-violet-900 flex items-center justify-center text-white cursor-pointer hover:bg-[rebeccapurple] font-black">Play Treasures</div>
      </div>

      {/* Kingdom Zoom Modal */}
      {showKingdomModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-6xl p-10 bg-stone-950 border-4 border-purple-600/50 rounded-xl shadow-[0_0_50px_rgba(147,51,234,0.3)] animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowKingdomModal(false)}
              className="absolute top-6 right-6 text-white/50 text-4xl hover:text-white transition-all hover:rotate-90"
            >
              ✕
            </button>
            <h2 className="text-4xl text-purple-400 font-black uppercase tracking-[0.2em] text-center mb-12 drop-shadow-[0_0_10px_rgba(147,51,234,0.5)]">
              Kingdom Expansion
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-x-12 gap-y-16 justify-items-center">
              {KINGDOM_CARDS.map(card => (
                <div key={card.name} className="flex flex-col items-center group/modal-card scale-110 hover:scale-125 transition-all">
                  <DisplayCard {...card} className="w-48 shadow-2xl border-white/20" />
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-white text-lg font-black tracking-widest">{card.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black text-xs font-black">{card.cost}</span>
                      <span className="text-white/40 text-[10px] font-bold uppercase">{card.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <AvatarPickerModal onClose={() => setShowAvatarPicker(false)} />
      )}
    </div>
  )
}

function PlaceCard({ name, cost, count, type, img }: { name: string, cost: number, count: number, type: string, img: string }) {
  const isAttack = type.toUpperCase().includes('ATTACK')

  return (
    <div className="relative group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95">
      <div className="w-full h-full rounded-sm overflow-hidden border border-white/10 shadow-lg bg-stone-900 flex flex-col">
        <div className="relative flex-1 overflow-hidden">
          <img src={img} alt={name} className="w-full h-full object-cover object-top scale-110 group-hover:scale-100 transition-transform duration-500" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between px-1.5 pb-1">
            <div className="w-8 h-8 rounded-full bg-yellow-400 border border-yellow-600 flex items-center justify-center text-black text-[16px] font-black shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              {cost}
            </div>
            {isAttack && (
              <div className="mb-0.5 animate-pulse">
                <span className="text-red-500 text-xs filter drop-shadow-[0_0_2px_rgba(0,0,0,1)]">⚔️</span>
              </div>
            )}
            <div className="text-white text-[16px] font-black tracking-normal drop-shadow-[0_1px_2px_rgba(0,0,0,1)] bg-black/50 px-1 rounded-sm border border-white/10">
              {count}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DisplayCard({ className, img, name, count }: { className?: string, img?: string, name?: string, count?: number }) {
  const sizeClass = className || 'w-[clamp(80px,15vw,160px)]'
  return (
    <div className={`aspect-5/8 rounded-[4%] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out bg-[#333] cursor-pointer border border-white/10 relative group ${sizeClass}`}>
      <img src={img || BASIC_CARDS.find(c => c.name === 'Copper')?.img} alt={name || 'Card'} className="w-full h-full object-cover block" />
      {count && count > 1 && (
        <div className="absolute bottom-1 right-1 bg-yellow-400 text-black text-[12px] font-black px-1.5 py-0.5 rounded-full border border-black shadow-md z-10">
          x{count}
        </div>
      )}
    </div>
  )
}

export default App
