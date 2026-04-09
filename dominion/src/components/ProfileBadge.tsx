import { getAvatarOption } from '../lib/Avatars'
import type { PlayerInfo } from '../contexts/AuthContext'

interface Props {
  player: PlayerInfo | null
  size?: 'sm' | 'lg'
  className?: string
}

export default function ProfileBadge({ player, size = 'sm', className = '' }: Props) {
  if (!player) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 ${className}`}>
        <div className={`
          ${size === 'lg' ? 'w-24 h-24' : 'w-full h-full'}
          bg-stone-800 rounded-sm border border-white/10 flex items-center justify-center
        `}>
          <span className="text-stone-600 text-xs font-bold uppercase tracking-wider">
            {size === 'lg' ? 'No Player' : '?'}
          </span>
        </div>
        {size === 'lg' && (
          <span className="text-stone-600 text-xs font-bold uppercase tracking-widest">
            Waiting...
          </span>
        )}
      </div>
    )
  }

  const avatar = getAvatarOption(player.chosenAvatar)
  const isGoogle = player.chosenAvatar === 'google'
  const imgSrc = isGoogle ? player.googleAvatar : avatar?.img

  return (
    <div className={`flex flex-col items-center justify-center gap-1 ${className}`}>
      <div className={`
        ${size === 'lg' ? 'w-24 h-24' : 'w-full h-full min-h-0'}
        overflow-hidden rounded-sm border border-white/20 shadow-lg
        flex-shrink-0
      `}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={player.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-stone-700 flex items-center justify-center">
            <span className="text-white font-black text-lg">
              {player.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      {size === 'lg' && (
        <span className="text-white text-sm font-bold tracking-wider truncate max-w-[96px]">
          {player.name.split(' ')[0]}
        </span>
      )}
      {size === 'sm' && (
        <span className="text-white/70 text-[8px] font-bold tracking-wider truncate max-w-full leading-tight">
          {player.name.split(' ')[0]}
        </span>
      )}
    </div>
  )
}
