import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ProfileBadge from './ProfileBadge'

export default function WaitingRoom() {
  const { player, room, sessionToken, startGame, refreshRoom, leaveRoom, closeRoom, kickPlayer } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Listen to WebSocket for status updates
  useEffect(() => {
    if (!room?.code || !sessionToken) return
    const ws = new WebSocket(`ws://localhost:3000/api/v1/rooms/${room.code}/ws?token=${sessionToken}`)
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.kickedPlayerID === player?.id) {
          alert("You were removed from the room")
          leaveRoom()
          return
        }
        if (data.status === 'CLOSED') {
          alert("The Host has left")
          leaveRoom()
          return
        }
        // Always refresh room when state changes
        refreshRoom()
      } catch (err) {
        console.error('WS parse error:', err)
      }
    }
    return () => ws.close()
  }, [room?.code, sessionToken, refreshRoom])

  const handleStart = async () => {
    setLoading(true)
    setError('')
    try {
      await startGame()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const isHost = player?.id === room?.player1?.id

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-8 p-6">
      {/* Header */}
      <div className="text-5xl font-black tracking-widest text-white">DOMINION</div>
      
      <div className="text-stone-400 font-bold uppercase tracking-wider text-xl flex items-center gap-4">
        <span>Room Code:</span>
        <span className="text-white text-3xl font-black bg-stone-800 px-6 py-2 rounded-sm border border-stone-700 tracking-[0.3em]">{room?.code}</span>
      </div>

      <div className="flex items-center gap-12 mt-8">
        {/* Player 1 (Host) */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-yellow-500 font-black tracking-widest uppercase text-sm mb-2">Host</div>
          <ProfileBadge player={room?.player1 ?? null} size="lg" className="ring-4 ring-yellow-500/50" />
          <div className="text-white font-bold text-lg">{room?.player1?.name}</div>
        </div>

        <div className="text-stone-600 font-black text-4xl">VS</div>

        {/* Player 2 */}
        <div className="flex flex-col items-center gap-4 relative">
          <div className="text-stone-500 font-black tracking-widest uppercase text-sm mb-2">Player 2</div>
          {room?.player2 ? (
            <>
              <div className="relative">
                <ProfileBadge player={room.player2} size="lg" className="ring-4 ring-emerald-500/50" />
                {isHost && (
                  <button
                    onClick={() => kickPlayer(room.player2!.id)}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-black shadow-lg hover:bg-red-400 hover:scale-110 transition-all border-2 border-stone-950"
                    title="Kick Player"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="text-white font-bold text-lg">{room.player2.name}</div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-stone-800 flex items-center justify-center bg-stone-900/50">
                <span className="text-stone-600 text-3xl animate-pulse">?</span>
              </div>
              <div className="text-stone-500 font-bold text-lg animate-pulse">Waiting...</div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs mt-8">
        {isHost ? (
          <button
            onClick={handleStart}
            disabled={loading || !room?.player2}
            className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-sm rounded-sm hover:bg-emerald-400 transition-colors disabled:opacity-30 disabled:hover:bg-emerald-500 shadow-lg"
          >
            {loading ? 'Starting...' : room?.player2 ? 'Start Game' : 'Waiting for players...'}
          </button>
        ) : (
          <div className="w-full py-4 bg-stone-800 text-stone-400 font-black uppercase tracking-widest text-sm rounded-sm text-center border border-stone-700 animate-pulse border-dashed">
            Waiting for Host to Start
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm font-bold uppercase tracking-wider">{error}</div>
        )}
      </div>

      <button
        onClick={isHost ? closeRoom : leaveRoom}
        className="text-stone-600 hover:text-stone-400 text-xs uppercase tracking-widest font-bold transition-colors mt-4"
      >
        {isHost ? 'Close Room' : 'Leave Room'}
      </button>
    </div>
  )
}
