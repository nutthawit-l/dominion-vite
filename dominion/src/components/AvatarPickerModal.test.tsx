import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AvatarPickerModal from './AvatarPickerModal'
import type { PlayerInfo } from '../contexts/AuthContext'

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('../lib/Avatars', () => ({
  ALL_AVATAR_OPTIONS: [
    { key: 'google', label: 'Google Photo', img: null },
    { key: 'Village', label: 'Village', img: '/cards/village.png' },
    { key: 'Smithy', label: 'Smithy', img: '/cards/smithy.png' },
  ],
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

import { useAuth } from '../contexts/AuthContext'

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function buildPlayer(overrides: Partial<PlayerInfo> = {}): PlayerInfo {
  return {
    id: 'player-1',
    name: 'Test User',
    email: 'test@example.com',
    googleAvatar: 'https://example.com/avatar.jpg',
    chosenAvatar: 'google',
    ...overrides,
  }
}

function setupAuth(playerOverrides: Partial<PlayerInfo> | null = {}, updateAvatar = vi.fn()) {
  const player = playerOverrides === null ? null : buildPlayer(playerOverrides)
  mockUseAuth.mockReturnValue({ player, updateAvatar })
  return { player, updateAvatar }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AvatarPickerModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ── 1. Happy path ──────────────────────────────────────────────────────────

  describe('Happy path', () => {
    it('should render the heading and subtitle', () => {
      setupAuth()
      render(<AvatarPickerModal onClose={vi.fn()} />)

      expect(screen.getByRole('heading', { name: /choose your profile/i })).toBeInTheDocument()
      expect(screen.getByText(/pick a card character as your profile picture/i)).toBeInTheDocument()
    })

    it('should render all avatar options as buttons', () => {
      setupAuth()
      render(<AvatarPickerModal onClose={vi.fn()} />)

      expect(screen.getByRole('button', { name: /google photo/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /village/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /smithy/i })).toBeInTheDocument()
    })

    it('should render Cancel and Save Profile buttons', () => {
      setupAuth()
      render(<AvatarPickerModal onClose={vi.fn()} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument()
    })

    it('should call updateAvatar and then onClose on save', async () => {
      const updateAvatar = vi.fn().mockResolvedValue(undefined)
      const onClose = vi.fn()
      setupAuth({ chosenAvatar: 'Village' }, updateAvatar)

      render(<AvatarPickerModal onClose={onClose} />)
      await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

      await waitFor(() => {
        expect(updateAvatar).toHaveBeenCalledWith('Village')
        expect(onClose).toHaveBeenCalledTimes(1)
      })
    })

    it('should call onClose immediately when Cancel is clicked', async () => {
      const onClose = vi.fn()
      setupAuth()
      render(<AvatarPickerModal onClose={onClose} />)

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  // ── 2. Props & conditional rendering ──────────────────────────────────────

  describe('Props & conditional rendering', () => {
    it('should initialise selected avatar from player.chosenAvatar', () => {
      setupAuth({ chosenAvatar: 'Smithy' })
      render(<AvatarPickerModal onClose={vi.fn()} />)

      // The selected avatar button should have the scale class (scale-105 without opacity-70)
      const smithyBtn = screen.getByRole('button', { name: /smithy/i })
      expect(smithyBtn.className).toContain('scale-105')
      expect(smithyBtn.className).not.toContain('opacity-70')
    })

    it('should default to "google" when player is null', () => {
      setupAuth(null)
      render(<AvatarPickerModal onClose={vi.fn()} />)

      const googleBtn = screen.getByRole('button', { name: /google photo/i })
      expect(googleBtn.className).toContain('scale-105')
    })

    it('should default to "google" when player.chosenAvatar is not set', () => {
      setupAuth({ chosenAvatar: '' })
      render(<AvatarPickerModal onClose={vi.fn()} />)

      // empty string is falsy so ?? 'google' kicks in
      const googleBtn = screen.getByRole('button', { name: /google photo/i })
      expect(googleBtn.className).toContain('scale-105')
    })

    it('should show Google avatar img when player.googleAvatar is set', () => {
      setupAuth({ googleAvatar: 'https://example.com/pic.jpg', chosenAvatar: 'google' })
      render(<AvatarPickerModal onClose={vi.fn()} />)

      const img = screen.getByAltText('Google')
      expect(img).toHaveAttribute('src', 'https://example.com/pic.jpg')
    })

    it('should show fallback "G" text when player.googleAvatar is empty', () => {
      setupAuth({ googleAvatar: '', chosenAvatar: 'google' })
      render(<AvatarPickerModal onClose={vi.fn()} />)

      expect(screen.queryByAltText('Google')).not.toBeInTheDocument()
      expect(screen.getByText('G')).toBeInTheDocument()
    })

    it('should show fallback "G" text when player is null', () => {
      setupAuth(null)
      render(<AvatarPickerModal onClose={vi.fn()} />)

      expect(screen.getByText('G')).toBeInTheDocument()
    })

    it('should render card avatar images with alt text equal to label', () => {
      setupAuth()
      render(<AvatarPickerModal onClose={vi.fn()} />)

      expect(screen.getByAltText('Village')).toHaveAttribute('src', '/cards/village.png')
      expect(screen.getByAltText('Smithy')).toHaveAttribute('src', '/cards/smithy.png')
    })
  })

  // ── 3. User interactions ───────────────────────────────────────────────────

  describe('User interactions', () => {
    it('should update selected avatar when a different avatar is clicked', async () => {
      setupAuth({ chosenAvatar: 'google' })
      render(<AvatarPickerModal onClose={vi.fn()} />)

      const villageBtn = screen.getByRole('button', { name: /village/i })
      expect(villageBtn.className).toContain('opacity-70') // not selected yet

      await userEvent.click(villageBtn)

      expect(villageBtn.className).toContain('scale-105')
      expect(villageBtn.className).not.toContain('opacity-70')
    })

    it('should pass the newly selected avatar to updateAvatar on save', async () => {
      const updateAvatar = vi.fn().mockResolvedValue(undefined)
      const onClose = vi.fn()
      setupAuth({ chosenAvatar: 'google' }, updateAvatar)

      render(<AvatarPickerModal onClose={onClose} />)

      await userEvent.click(screen.getByRole('button', { name: /smithy/i }))
      await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

      await waitFor(() => {
        expect(updateAvatar).toHaveBeenCalledWith('Smithy')
      })
    })

    it('should deselect the previous avatar when a new one is clicked', async () => {
      setupAuth({ chosenAvatar: 'Village' })
      render(<AvatarPickerModal onClose={vi.fn()} />)

      const villageBtn = screen.getByRole('button', { name: /village/i })
      expect(villageBtn.className).toContain('scale-105')

      await userEvent.click(screen.getByRole('button', { name: /smithy/i }))

      expect(villageBtn.className).toContain('opacity-70')
    })

    it('should allow clicking the same avatar again without side effects', async () => {
      const updateAvatar = vi.fn().mockResolvedValue(undefined)
      setupAuth({ chosenAvatar: 'Village' }, updateAvatar)
      render(<AvatarPickerModal onClose={vi.fn()} />)

      const villageBtn = screen.getByRole('button', { name: /village/i })
      await userEvent.click(villageBtn)
      await userEvent.click(villageBtn)

      expect(villageBtn.className).toContain('scale-105')
    })
  })

  // ── 4. Edge cases ──────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('should call updateAvatar with "google" when no avatar selection has been changed', async () => {
      const updateAvatar = vi.fn().mockResolvedValue(undefined)
      setupAuth({ chosenAvatar: 'google' }, updateAvatar)
      render(<AvatarPickerModal onClose={vi.fn()} />)

      await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

      await waitFor(() => {
        expect(updateAvatar).toHaveBeenCalledWith('google')
      })
    })

    it('should handle rapid avatar switches before saving', async () => {
      const updateAvatar = vi.fn().mockResolvedValue(undefined)
      const onClose = vi.fn()
      setupAuth({ chosenAvatar: 'google' }, updateAvatar)
      render(<AvatarPickerModal onClose={onClose} />)

      await userEvent.click(screen.getByRole('button', { name: /village/i }))
      await userEvent.click(screen.getByRole('button', { name: /smithy/i }))
      await userEvent.click(screen.getByRole('button', { name: /village/i }))
      await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

      await waitFor(() => {
        expect(updateAvatar).toHaveBeenCalledTimes(1)
        expect(updateAvatar).toHaveBeenCalledWith('Village')
      })
    })
  })

  // ── 5. Error handling ──────────────────────────────────────────────────────

  describe('Error handling', () => {
    it('should not call onClose when updateAvatar rejects', async () => {
      const updateAvatar = vi.fn().mockRejectedValue(new Error('Network error'))
      const onClose = vi.fn()
      setupAuth({}, updateAvatar)

      render(<AvatarPickerModal onClose={onClose} />)
      await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

      await waitFor(() => {
        expect(updateAvatar).toHaveBeenCalledTimes(1)
      })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should re-enable Save button after updateAvatar rejects', async () => {
      const updateAvatar = vi.fn().mockRejectedValue(new Error('Server error'))
      setupAuth({}, updateAvatar)

      render(<AvatarPickerModal onClose={vi.fn()} />)
      const saveBtn = screen.getByRole('button', { name: /save profile/i })

      await userEvent.click(saveBtn)

      await waitFor(() => {
        expect(saveBtn).not.toBeDisabled()
        expect(saveBtn).toHaveTextContent('Save Profile')
      })
    })
  })

  // ── 6. Async behaviour ─────────────────────────────────────────────────────

  describe('Async behaviour', () => {
    it('should show "Saving..." and disable Save button while saving', async () => {
      let resolve!: () => void
      const updateAvatar = vi.fn().mockImplementation(
        () => new Promise<void>(r => { resolve = r })
      )
      setupAuth({}, updateAvatar)

      render(<AvatarPickerModal onClose={vi.fn()} />)
      const saveBtn = screen.getByRole('button', { name: /save profile/i })

      await userEvent.click(saveBtn)

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()

      resolve()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save profile/i })).not.toBeDisabled()
      })
    })

    it('should prevent double submission while saving', async () => {
      let resolve!: () => void
      const updateAvatar = vi.fn().mockImplementation(
        () => new Promise<void>(r => { resolve = r })
      )
      setupAuth({}, updateAvatar)

      render(<AvatarPickerModal onClose={vi.fn()} />)
      const saveBtn = screen.getByRole('button', { name: /save profile/i })

      await userEvent.click(saveBtn)
      // Button is now disabled — a second click should be a no-op
      await userEvent.click(saveBtn)

      resolve()
      await waitFor(() => expect(updateAvatar).toHaveBeenCalledTimes(1))
    })

    it('should call onClose after updateAvatar resolves', async () => {
      const onClose = vi.fn()
      const updateAvatar = vi.fn().mockResolvedValue(undefined)
      setupAuth({}, updateAvatar)

      render(<AvatarPickerModal onClose={onClose} />)
      await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    })
  })

  // ── 7. Accessibility ───────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have an accessible name for every avatar button', () => {
      setupAuth()
      render(<AvatarPickerModal onClose={vi.fn()} />)

      const buttons = screen.getAllByRole('button')
      // Filter out Cancel and Save Profile
      const avatarButtons = buttons.filter(
        b => b.textContent !== 'Cancel' && !/save profile/i.test(b.textContent ?? '')
      )
      avatarButtons.forEach(btn => {
        expect(btn).toHaveAccessibleName()
      })
    })

    it('should disable Save button when saving is in progress', async () => {
      const updateAvatar = vi.fn().mockImplementation(() => new Promise(() => {}))
      setupAuth({}, updateAvatar)

      render(<AvatarPickerModal onClose={vi.fn()} />)
      await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })

    it('should keep Cancel button enabled while saving', async () => {
      const updateAvatar = vi.fn().mockImplementation(() => new Promise(() => {}))
      setupAuth({}, updateAvatar)

      render(<AvatarPickerModal onClose={vi.fn()} />)
      await userEvent.click(screen.getByRole('button', { name: /save profile/i }))

      expect(screen.getByRole('button', { name: /cancel/i })).not.toBeDisabled()
    })

    it('should trigger save via keyboard Enter on Save button', async () => {
      const updateAvatar = vi.fn().mockResolvedValue(undefined)
      const onClose = vi.fn()
      setupAuth({}, updateAvatar)

      render(<AvatarPickerModal onClose={onClose} />)
      screen.getByRole('button', { name: /save profile/i }).focus()
      await userEvent.keyboard('{Enter}')

      await waitFor(() => expect(updateAvatar).toHaveBeenCalledTimes(1))
    })

    it('should trigger onClose via keyboard Enter on Cancel button', async () => {
      const onClose = vi.fn()
      setupAuth()

      render(<AvatarPickerModal onClose={onClose} />)
      screen.getByRole('button', { name: /cancel/i }).focus()
      await userEvent.keyboard('{Enter}')

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
