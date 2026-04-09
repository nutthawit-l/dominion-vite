import { useState } from 'react'
import { ALL_AVATAR_OPTIONS } from '../lib/Avatars'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  onClose: () => void
}

export default function AvatarPickerModal({ onClose }: Props) {
  const { player, updateAvatar } = useAuth()
  const [selected, setSelected] = useState(player?.chosenAvatar ?? 'google')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAvatar(selected)
      onClose()
    } catch {
      // updateAvatar failed; saving state resets via finally, no onClose called
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-stone-950/95 flex flex-col items-center justify-center p-8">
      <h2 className="text-white text-4xl font-black tracking-widest mb-2">
        Choose Your Profile
      </h2>
      <p className="text-stone-400 text-sm mb-10">Pick a card character as your profile picture</p>

      <div className="grid grid-cols-6 gap-4 max-w-4xl w-full overflow-y-auto max-h-[60vh]">
        {ALL_AVATAR_OPTIONS.map((avatar) => {
          const isSelected = selected === avatar.key
          const isGoogle = avatar.key === 'google'

          return (
            <button
              key={avatar.key}
              onClick={() => setSelected(avatar.key)}
              className={`
                group relative flex flex-col items-center gap-2 cursor-pointer
                transition-all duration-200
                ${isSelected ? 'scale-105' : 'opacity-70 hover:opacity-100 hover:scale-105'}
              `}
            >
              {/* Image */}
              <div className={`
                w-full aspect-square rounded-sm overflow-hidden
                transition-all duration-200
                ${isSelected
                  ? 'ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  : 'ring-2 ring-transparent group-hover:ring-white/50'
                }
              `}>
                {isGoogle ? (
                  <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                    {player?.googleAvatar ? (
                      <img
                        src={player.googleAvatar}
                        alt="Google"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">G</span>
                    )}
                  </div>
                ) : (
                  <img
                    src={avatar.img!}
                    alt={avatar.label}
                    className="w-full h-full object-cover object-top"
                  />
                )}
              </div>

              {/* Name */}
              <span className={`
                text-[11px] font-bold tracking-wider uppercase transition-colors
                ${isSelected ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'}
              `}>
                {avatar.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-10">
        <button
          onClick={onClose}
          className="px-8 py-3 bg-stone-700 text-white font-bold rounded-sm hover:bg-stone-600 transition-colors tracking-widest uppercase text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-white text-black font-black rounded-sm hover:bg-stone-200 transition-colors tracking-widest uppercase text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
