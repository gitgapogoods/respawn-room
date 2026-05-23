import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { Gamepad2, Mail, Lock, Loader2, ChevronRight, Sparkles, Zap } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn('email', { email })
      setStep('otp')
    } catch (err) {
      setError('System Failure: Could not transmit magic link. Check your comms.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn('email', { email, code })
      navigate({ to: '/redesign' })
    } catch (err) {
      setError('Invalid Access Code: Tactical sync failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(0,243,255,0.3)]">
              <Gamepad2 className="text-black w-8 h-8" />
            </div>
            <span className="font-orbitron text-2xl font-black tracking-tighter text-white">
              RESPAWN<span className="text-neon-cyan italic">ROOM</span>
            </span>
          </div>
          <h1 className="font-orbitron text-3xl font-black text-white italic uppercase tracking-tight">
            AUTHENTICATE <span className="text-neon-purple">PILOT</span>
          </h1>
          <p className="text-gray-500 mt-2 uppercase tracking-widest text-xs font-bold">Access your setup vault</p>
        </div>

        <div className="bg-dark-card border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap className="w-24 h-24 text-white" />
          </div>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6 relative z-10">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 ml-1">Comm Channel (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input 
                    type="email" 
                    required
                    placeholder="pilot@battlestation.com"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none transition-all placeholder:text-gray-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold italic">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-neon-cyan text-black font-orbitron font-black text-lg uppercase tracking-wider rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_10px_30px_rgba(0,243,255,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>Transmitting <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6 relative z-10">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 ml-1">Access Code (OTP)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input 
                    type="text" 
                    required
                    placeholder="Enter 6-digit code"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all placeholder:text-gray-700 tracking-[0.5em] font-mono text-center"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold italic text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-neon-purple text-white font-orbitron font-black text-lg uppercase tracking-wider rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_10px_30px_rgba(188,19,254,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>Initiate Sync <Sparkles className="w-5 h-5" /></>
                )}
              </button>

              <button 
                type="button" 
                onClick={() => setStep('email')}
                className="w-full text-center text-gray-600 hover:text-gray-400 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Change Comm Channel
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-12 text-gray-600 text-xs uppercase tracking-widest leading-relaxed">
          By authenticating, you agree to the <br />
          <span className="text-gray-400 cursor-pointer hover:text-neon-cyan transition-colors font-bold text-[10px]">Respawn Room Protocols (ToS)</span>
        </p>
      </div>
    </div>
  )
}
