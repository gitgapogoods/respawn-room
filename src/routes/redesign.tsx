import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Upload, Gamepad2, Monitor, Maximize2, Sparkles, ChevronLeft, Check, Wand2, Lock } from 'lucide-react'
import { useMutation, useConvexAuth } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/redesign')({
  component: RedesignPage,
})

type Step = 'upload' | 'preferences' | 'processing'

// Key used to stash an in-progress redesign while the user signs in, so the
// uploaded image and form selections survive the round-trip to /login instead
// of dropping the user back at the empty upload step.
const DRAFT_KEY = 'respawn:redesign-draft'

type RedesignDraft = {
  preview: string
  fileName: string
  fileType: string
  preferences: {
    games: string
    vibe: string
    budget: string
    platform: string
  }
}

// Rebuild a File from the base64 preview so we can upload it after the user
// returns from authenticating (the original File object is lost on navigation).
function dataUrlToFile(dataUrl: string, fileName: string, fileType: string): File {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], fileName, { type: fileType })
}

function RedesignPage() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const navigate = useNavigate()

  const generateUploadUrl = useMutation(api.setups.generateUploadUrl)
  const createSetup = useMutation(api.setups.createSetup)

  // Form State
  const [preferences, setPreferences] = useState({
    games: '',
    vibe: 'cyberpunk',
    budget: 'mid-tier',
    platform: 'pc',
  })

  // After the user comes back from /login authenticated, restore the redesign
  // they were working on so they continue from the form instead of starting over.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return
    sessionStorage.removeItem(DRAFT_KEY)
    try {
      const draft = JSON.parse(raw) as RedesignDraft
      setPreferences(draft.preferences)
      setPreview(draft.preview)
      setFile(dataUrlToFile(draft.preview, draft.fileName, draft.fileType))
      setStep('preferences')
    } catch {
      // Corrupt draft — ignore and let the user start fresh.
    }
  }, [isLoading, isAuthenticated])


  const styles = [
    { id: 'cyberpunk', name: 'Cyberpunk', icon: '🏙️', img: 'https://i.pinimg.com/736x/2a/36/b0/2a36b00de204310d67ae66c6404ea6d7.jpg' },
    { id: 'cozy-rpg', name: 'Cozy RPG', icon: '🌿', img: 'https://i.pinimg.com/originals/99/7e/95/997e95d471156dc5243430cdb9b78eba.jpg' },
    { id: 'dark-fantasy', name: 'Dark Fantasy', icon: '⚔️', img: 'https://cdn.ashley.com/assets/H600001072_1.jpg?fit=bounds&width=1080&height=810&quality=90&format=webp' },
    { id: 'tactical-fps', name: 'Tactical FPS', icon: '🎯', img: 'https://preview.redd.it/mrs-left-me-alone-for-a-week-she-told-me-to-tidy-up-but-v0-itt0ujue2bib1.jpg?width=1080&crop=smart&auto=webp&s=84865182e2d03fc6a85f8259c7466016166a52d1' },
    { id: 'retro-arcade', name: 'Retro Arcade', icon: '🕹️', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400' },
    { id: 'minimalist-rgb', name: 'Minimalist RGB', icon: '⚪', img: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&q=80&w=400' },
    { id: 'sci-fi', name: 'Sci-Fi Command', icon: '🚀', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400' },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setStep('preferences')
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleStartTransformation = async () => {
    if (!file) return

    if (!isAuthenticated) {
      // Preserve the upload + form selections across the sign-in round-trip so
      // the user lands back on the form instead of an empty upload step.
      if (preview) {
        const draft: RedesignDraft = {
          preview,
          fileName: file.name,
          fileType: file.type,
          preferences,
        }
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        } catch {
          // Storage full/unavailable — fall through and just send them to login.
        }
      }
      navigate({ to: '/login' })
      return
    }

    setStep('processing')

    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl()

      // 2. Upload file to Convex Storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // 3. Create Setup record
      const setupId = await createSetup({
        originalImageId: storageId,
        style: preferences.vibe,
        games: preferences.games,
        budget: preferences.budget,
        platform: preferences.platform,
      })

      // 4. Navigate to results with setupId
      navigate({ 
        to: '/results', 
        search: { setupId } 
      })
    } catch (error) {
      console.error("Transformation failed:", error)
      setStep('preferences')
      alert("Quest Failed: Could not connect to the Respawn Server. Try again later.")
    }
  }

  if (isLoading) return null

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 font-sans pb-20">
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-white/5 bg-dark-bg/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center">
            <Gamepad2 className="text-black w-5 h-5" />
          </div>
          <span className="font-orbitron text-lg font-black tracking-tighter text-white">
            RESPAWN<span className="text-neon-cyan italic">ROOM</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`h-1 w-12 rounded-full ${step === 'upload' ? 'bg-neon-cyan' : 'bg-neon-cyan/20'}`} />
          <div className={`h-1 w-12 rounded-full ${step === 'preferences' ? 'bg-neon-purple' : 'bg-neon-purple/20'}`} />
          <div className={`h-1 w-12 rounded-full ${step === 'processing' ? 'bg-neon-pink' : 'bg-neon-pink/20'}`} />
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-12 text-left">
        {step === 'upload' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="text-center mb-12">
              <h1 className="font-orbitron text-3xl md:text-5xl font-black text-white mb-4 italic uppercase">
                INITIATING <span className="text-neon-cyan">SCAN</span>
              </h1>
              <p className="text-gray-400 text-lg uppercase tracking-widest text-xs font-bold">Upload a photo of your current setup to start the transformation.</p>
            </div>

            <label className="group relative block aspect-video md:aspect-[21/9] bg-dark-card border-2 border-dashed border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:border-neon-cyan/50 transition-all shadow-2xl">
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 group-hover:scale-110 transition-transform">
                <div className="p-6 bg-white/5 rounded-full text-neon-cyan group-hover:bg-neon-cyan group-hover:text-black transition-colors shadow-lg">
                  <Upload className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1 uppercase tracking-wider italic font-orbitron">Drag & Drop or Click</div>
                  <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">PNG, JPG up to 10MB</div>
                </div>
              </div>
            </label>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
               <div className="p-6 bg-dark-card border border-white/5 rounded-2xl group hover:border-neon-cyan/30 transition-colors">
                 <div className="text-neon-cyan mb-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <Sparkles className="w-3 h-3" /> Pro Tip
                 </div>
                 <div className="text-sm text-gray-500 font-bold leading-relaxed italic">Turn on all your current lights for the best AI depth analysis.</div>
               </div>
               <div className="p-6 bg-dark-card border border-white/5 rounded-2xl group hover:border-neon-purple/30 transition-colors">
                 <div className="text-neon-purple mb-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <Maximize2 className="w-3 h-3" /> Angle
                 </div>
                 <div className="text-sm text-gray-500 font-bold leading-relaxed italic">Take the photo from your doorway or seating position for full context.</div>
               </div>
               <div className="p-6 bg-dark-card border border-white/5 rounded-2xl group hover:border-neon-pink/30 transition-colors">
                 <div className="text-neon-pink mb-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <Monitor className="w-3 h-3" /> Gear
                 </div>
                 <div className="text-sm text-gray-500 font-bold leading-relaxed italic">Don't worry about clutter—our AI can 'virtually' clean Sector 7.</div>
               </div>
            </div>
          </div>
        )}

        {step === 'preferences' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button 
              onClick={() => setStep('upload')}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-widest"
            >
              <ChevronLeft className="w-3 h-3" /> Back to Upload
            </button>

            <div className="mb-12 text-center">
              {preview && (
                <div className="inline-block relative mb-8 rounded-2xl overflow-hidden border border-white/10 h-32 aspect-video shadow-2xl">
                  <img src={preview} className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest bg-black/40">Current Setup Locked</div>
                </div>
              )}
              <h1 className="font-orbitron text-3xl font-black text-white mb-2 italic uppercase tracking-tighter">
                LOADOUT <span className="text-neon-purple text-shadow-glow">CUSTOMIZATION</span>
              </h1>
              <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Tell the AI what kind of vibe you're grinding for.</p>
            </div>

            <div className="space-y-12">
              <section>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neon-purple mb-6 ml-1">1. Choose Aesthetic Class</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setPreferences({ ...preferences, vibe: style.id })}
                      className={`relative aspect-[4/3] rounded-xl border transition-all text-left overflow-hidden group ${
                        preferences.vibe === style.id 
                        ? 'bg-neon-purple/10 border-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.2)]' 
                        : 'bg-dark-card border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img 
                        src={style.img} 
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                          preferences.vibe === style.id ? 'opacity-40 scale-110' : 'opacity-10 grayscale group-hover:opacity-30 group-hover:grayscale-0'
                        }`} 
                      />
                      <div className="relative z-10 p-4 h-full flex flex-col justify-end">
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{style.icon}</div>
                        <div className="font-black text-[10px] uppercase tracking-wider text-white italic">{style.name}</div>
                      </div>
                      {preferences.vibe === style.id && (
                        <div className="absolute top-2 right-2 z-20">
                          <Check className="w-4 h-4 text-neon-purple" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-12 text-left">
                <section>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neon-cyan mb-4 ml-1">2. Favorite Games</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cyberpunk 2077, Elden Ring..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none transition-all placeholder:text-gray-700 text-sm italic font-bold"
                    value={preferences.games}
                    onChange={(e) => setPreferences({ ...preferences, games: e.target.value })}
                  />
                </section>
                <section>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neon-pink mb-4 ml-1">3. Gaming Platform</label>
                  <div className="flex gap-4">
                    {['pc', 'console', 'both'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPreferences({ ...preferences, platform: p })}
                        className={`flex-1 py-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                          preferences.platform === p 
                          ? 'bg-neon-pink/10 border-neon-pink text-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.1)]' 
                          : 'bg-dark-card border-white/5 text-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <section>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neon-cyan mb-6 ml-1">4. Budget Level</label>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { id: 'budget', name: 'Starter', price: '$', desc: 'DIY & Budget Gear' },
                    { id: 'mid-tier', name: 'Pro', price: '$$', desc: 'Performance Setup' },
                    { id: 'ultimate', name: 'God Tier', price: '$$$', desc: 'Ultimate Battlestation' }
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setPreferences({ ...preferences, budget: b.id })}
                      className={`p-6 rounded-2xl border transition-all text-left group ${
                        preferences.budget === b.id 
                        ? 'bg-neon-cyan/10 border-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.1)]' 
                        : 'bg-dark-card border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="font-black text-xl text-white mb-1 italic uppercase font-orbitron group-hover:text-neon-cyan transition-colors">{b.name}</div>
                      <div className="text-neon-cyan text-[10px] font-black mb-3 tracking-widest">{b.price}</div>
                      <p className="text-gray-600 text-[10px] leading-relaxed font-black uppercase tracking-tighter">{b.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              <button 
                onClick={handleStartTransformation}
                disabled={!file}
                className="w-full py-6 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink text-black font-orbitron font-black text-xl uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_20px_50px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
              >
                {isAuthenticated ? (
                   <>Start Transformation <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" /></>
                ) : (
                   <>Authenticate to Upgrade <Lock className="w-6 h-6" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-1000 text-center">
            <div className="relative w-48 h-48 mb-12">
              <div className="absolute inset-0 border-4 border-neon-cyan/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-neon-cyan rounded-full animate-spin shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
              <div className="absolute inset-4 border-4 border-transparent border-b-neon-purple rounded-full animate-[spin_2s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>

            <div>
              <h2 className="font-orbitron text-4xl font-black text-white mb-6 italic animate-pulse tracking-tighter">
                RESPAWNING <span className="text-neon-cyan">SECTOR 7</span>
              </h2>
              <div className="space-y-4 max-w-sm mx-auto">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                  <span>Uploading setup data</span>
                  <span className="text-neon-cyan">DONE</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                  <span>Analyzing lighting mesh</span>
                  <span className="text-neon-cyan font-black">DONE</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                  <span>Injecting {preferences.vibe} aesthetics</span>
                  <span className="text-neon-purple animate-pulse font-black italic">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600 opacity-30">
                  <span>Optimizing gear layout</span>
                  <span>WAITING</span>
                </div>
              </div>
              
              <div className="mt-16 p-6 bg-white/5 rounded-2xl border border-white/10 italic text-gray-500 font-bold text-xs max-w-md mx-auto">
                "Our AI is currently tackling your cable management raid boss. This might take a few moments..."
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
