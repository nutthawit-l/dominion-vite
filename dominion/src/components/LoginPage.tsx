import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login, loading } = useAuth()

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-10">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl font-black tracking-widest text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
          DOMINION
        </div>
        <div className="text-stone-400 text-sm tracking-[0.4em] uppercase font-bold">
          Card Game
        </div>
      </div>

      {/* Login Card */}
      <div className="flex flex-col items-center gap-6 bg-stone-900 border border-white/10 rounded-2xl p-10 shadow-2xl w-full max-w-sm">
        <div className="text-white/80 text-lg font-bold text-center">
          Sign in to play
        </div>
        <div className="text-stone-500 text-sm text-center leading-relaxed">
          Login with your Google account to create or join a multiplayer game.
        </div>
        {loading ? (
          <div className="text-stone-400 text-sm animate-pulse">Signing in...</div>
        ) : (
          <GoogleLogin
            onSuccess={(cred) => {
              if (cred.credential) login(cred.credential)
            }}
            onError={() => alert('Google login failed. Please try again.')}
            theme="filled_black"
            size="large"
            shape="pill"
            width="280"
          />
        )}
      </div>

      <div className="text-stone-600 text-xs">
        Your Google account is used only for authentication.
      </div>
    </div>
  )
}
