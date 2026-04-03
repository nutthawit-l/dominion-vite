import { KINGDOM_CARDS, BASIC_CARDS } from './Card'

export interface AvatarOption {
  key: string
  label: string
  img: string | null
}

export const CARD_AVATARS: AvatarOption[] = [...KINGDOM_CARDS, ...BASIC_CARDS].map(card => ({
  key: card.name,
  label: card.name,
  img: card.img,
}))

export const ALL_AVATAR_OPTIONS: AvatarOption[] = [
  { key: 'google', label: 'Google Photo', img: null },
  ...CARD_AVATARS,
]

export function getAvatarOption(key: string): AvatarOption | undefined {
  return ALL_AVATAR_OPTIONS.find(a => a.key === key)
}
