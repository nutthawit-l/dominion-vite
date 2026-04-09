import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3000/api/v1'

export interface PlayerInfo {
  id: string
  name: string
  email: string
  googleAvatar: string
  chosenAvatar: string
}

export interface RoomInfo {
  code: string
  status: string
  kickedPlayerID?: string
  player1: PlayerInfo | null
  player2: PlayerInfo | null
}

interface AuthContextType {
  player: PlayerInfo | null
  sessionToken: string | null
  room: RoomInfo | null
  loading: boolean
  login: (idToken: string) => Promise<void>
  logout: () => void
  updateAvatar: (avatar: string) => Promise<void>
  createRoom: () => Promise<void>
  joinRoom: (code: string) => Promise<void>
  kickPlayer: (targetId: string) => Promise<void>
  startGame: () => Promise<void>
  refreshRoom: () => Promise<void>
  leaveRoom: () => Promise<void>
  closeRoom: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerInfo | null>(() => {
    try { return JSON.parse(localStorage.getItem('dom_player') || 'null') } catch { return null }
  })
  const [sessionToken, setSessionToken] = useState<string | null>(
    () => localStorage.getItem('dom_token')
  )
  const [room, setRoom] = useState<RoomInfo | null>(() => {
    try { return JSON.parse(localStorage.getItem('dom_room') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const authFetch = useCallback(async (path: string, opts?: RequestInit) => {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
        ...opts?.headers,
      },
    })
    if (res.status === 401) {
      logout()
      throw new Error('Session expired')
    }
    return res
  }, [sessionToken])

  // Restore room state on load
  useEffect(() => {
    if (!sessionToken || !room?.code) return
    fetch(`${API}/rooms/${room.code}`, {
      headers: { 'Authorization': `Bearer ${sessionToken}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && !data.error) {
          const restored: RoomInfo = { code: data.code, status: data.status, player1: data.player1, player2: data.player2 }
          setRoom(restored)
          localStorage.setItem('dom_room', JSON.stringify(restored))
        } else {
          setRoom(null)
          localStorage.removeItem('dom_room')
        }
      })
      .catch(() => {
        setRoom(null)
        localStorage.removeItem('dom_room')
      })
  }, []) // only on mount

  const login = useCallback(async (idToken: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlayer(data.player)
      setSessionToken(data.sessionToken)
      localStorage.setItem('dom_player', JSON.stringify(data.player))
      localStorage.setItem('dom_token', data.sessionToken)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setPlayer(null)
    setSessionToken(null)
    setRoom(null)
    localStorage.removeItem('dom_player')
    localStorage.removeItem('dom_token')
    localStorage.removeItem('dom_room')
  }, [])

  const updateAvatar = useCallback(async (avatar: string) => {
    const res = await authFetch('/auth/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar }),
    })
    const data = await res.json()
    if (data.player) {
      setPlayer(data.player)
      localStorage.setItem('dom_player', JSON.stringify(data.player))
    }
  }, [authFetch])

  const createRoom = useCallback(async () => {
    const res = await authFetch('/rooms', { method: 'POST' })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    const r: RoomInfo = { code: data.code, status: data.status, kickedPlayerID: data.kickedPlayerID, player1: data.player1, player2: data.player2 }
    setRoom(r)
    localStorage.setItem('dom_room', JSON.stringify(r))
  }, [authFetch])

  const joinRoom = useCallback(async (code: string) => {
    const res = await authFetch('/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    const r: RoomInfo = { code: data.code, status: data.status, kickedPlayerID: data.kickedPlayerID, player1: data.player1, player2: data.player2 }
    setRoom(r)
    localStorage.setItem('dom_room', JSON.stringify(r))
  }, [authFetch])

  const kickPlayer = useCallback(async (targetId: string) => {
    if (!room?.code) return
    const res = await authFetch(`/rooms/${room.code}/kick`, {
      method: 'POST',
      body: JSON.stringify({ targetId }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
  }, [authFetch, room?.code])

  const refreshRoom = useCallback(async () => {
    if (!room?.code) return
    try {
      const res = await authFetch(`/rooms/${room.code}`)
      if (res.ok) {
        const data = await res.json()
        if (!data.error) {
          const r: RoomInfo = { code: data.code, status: data.status, kickedPlayerID: data.kickedPlayerID, player1: data.player1, player2: data.player2 }
          setRoom(r)
          localStorage.setItem('dom_room', JSON.stringify(r))
          return
        }
      }
    } catch (err) {
      console.error('Failed to refresh room:', err)
    }
    // If not successful or error returned, clear room.
    setRoom(null)
    localStorage.removeItem('dom_room')
  }, [authFetch, room?.code])

  const startGame = useCallback(async () => {
    if (!room?.code) return
    const res = await authFetch(`/rooms/${room.code}/start`, { method: 'POST' })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    const r: RoomInfo = { code: data.code, status: data.status, kickedPlayerID: data.kickedPlayerID, player1: data.player1, player2: data.player2 }
    setRoom(r)
    localStorage.setItem('dom_room', JSON.stringify(r))
  }, [authFetch, room?.code])

  const leaveRoom = useCallback(async () => {
    if (room?.code) {
      try {
        await authFetch(`/rooms/${room.code}/leave`, { method: 'POST' })
      } catch (err) {
        console.error('Failed to voluntarily leave room on backend:', err)
      }
    }
    setRoom(null)
    localStorage.removeItem('dom_room')
  }, [authFetch, room?.code])

  const closeRoom = useCallback(async () => {
    if (room?.code) {
      try {
        await authFetch(`/rooms/${room.code}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Failed to close room on backend:', err)
      }
    }
    setRoom(null)
    localStorage.removeItem('dom_room')
  }, [authFetch, room?.code])

  return (
    <AuthContext.Provider value={{
      player, sessionToken, room, loading,
      login, logout, updateAvatar,
      createRoom, joinRoom, kickPlayer, startGame, refreshRoom, leaveRoom, closeRoom,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
