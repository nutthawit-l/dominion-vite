import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AvatarPickerModal from './AvatarPickerModal'
import ProfileBadge from './ProfileBadge'

export default function Lobby() {
  const { player, createRoom, joinRoom, logout } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    setError('')
    try {
      await createRoom()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (joinCode.trim().length !== 4) {
      setError('Room code must be 4 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      await joinRoom(joinCode.trim().toUpperCase())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-8 p-6">
        {/* Header */}
        <div className="text-5xl font-black tracking-widest text-white">DOMINION</div>

        {/* Player Profile */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="group relative"
          >
            <ProfileBadge player={player} size="lg" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold uppercase tracking-wider">Edit</span>
            </div>
          </button>
          <div className="text-white font-bold text-lg">{player?.name}</div>
          <div className="text-stone-500 text-sm">{player?.email}</div>
        </div>

        {/* Room Actions */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-sm hover:bg-stone-200 transition-colors disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Creating...' : 'Create New Room'}
          </button>

          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-stone-700" />
            <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-stone-700" />
          </div>

          <div className="flex gap-2 w-full">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="ROOM CODE"
              maxLength={4}
              className="flex-1 py-3 px-4 bg-stone-800 text-white border border-stone-600 focus:border-white outline-none rounded-sm font-black text-center tracking-[0.5em] uppercase text-lg placeholder:text-stone-600 placeholder:text-sm placeholder:tracking-widest"
            />
            <button
              onClick={handleJoin}
              disabled={loading || joinCode.length !== 4}
              className="px-6 py-3 bg-stone-700 text-white font-black uppercase tracking-wider text-sm rounded-sm hover:bg-stone-600 transition-colors disabled:opacity-40"
            >
              Join
            </button>
          </div>

          {error && (
            <div className="text-red-400 text-sm font-bold uppercase tracking-wider">{error}</div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="text-stone-600 hover:text-stone-400 text-xs uppercase tracking-widest font-bold transition-colors mt-4"
        >
          Sign Out
        </button>
      </div>

      {showAvatarPicker && (
        <AvatarPickerModal onClose={() => setShowAvatarPicker(false)} />
      )}
    </>
  )
}
