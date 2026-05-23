import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  Check,
  ArrowRight,
  Flame,
  ThumbsUp,
  Sparkles,
  Gamepad2,
  Plus,
  Clock,
  Lock,
  Layout,
  User,
  LogOut,
  Trophy
} from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useConvexAuth, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuthActions } from '@convex-dev/auth/react'

export const Route = createFileRoute('/vault')({
  component: VaultPage,
})

function VaultPage() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { signOut } = useAuthActions()
  
  if (isLoading) return null

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-600 mb-8 border border-white/10">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="font-orbitron text-3xl font-black text-white italic mb-4 uppercase">VAULT ACCESS DENIED</h1>
        <p className="text-gray-500 max-w-md mb-8 uppercase tracking-widest text-xs font-black">
          Authentication required to view setup history. Log in to your pilot account.
        </p>
        <Link to="/login" className="px-8 py-4 bg-neon-cyan text-black font-orbitron font-black text-sm uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,243,255,0.3)]">
          Authenticate Now
        </Link>
      </div>
    )
  }

  return <VaultContent signOut={signOut} />
}

function VaultContent({ signOut }: { signOut: () => void }) {
  const { data: setups } = useSuspenseQuery(convexQuery(api.setups.listUserSetups, {}))
  const enterCompetition = useMutation((api as any).competitions.enterCompetition)

  const stats = {
    totalEvolutions: setups.length,
    totalVotes: setups.reduce((acc, s) => acc + (s.voteCount || 0), 0),
    sRankCount: setups.filter(s => s.analysis?.rating === 'S-Rank').length,
    pilotRank: setups.length >= 5 ? 'COMMANDER' : setups.length >= 2 ? 'VETERAN' : 'ROOKIE'
  }

  const handleEnterCompetition = async (e: React.MouseEvent, setupId: any) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await enterCompetition({ setupId })
      alert("MISSION SUCCESS: Entry registered in Setup Arena.")
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 font-sans pb-20">
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-white/5 bg-dark-bg/80 backdrop-blur-md sticky top-0">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Gamepad2 className="text-black w-5 h-5" />
          </div>
          <span className="font-orbitron text-lg font-black tracking-tighter text-white uppercase italic">
            RESPAWN<span className="text-neon-cyan">ROOM</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/arena" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Trophy className="w-3 h-3 text-neon-purple" /> Setup Arena
          </Link>
          <button 
            onClick={() => void signOut()}
            className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" /> Disconnect
          </button>
          <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
             <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
        {/* Pilot HUD */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 p-8 bg-dark-card rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <User className="w-32 h-32 text-neon-cyan" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-neon-cyan/20 flex items-center justify-center text-neon-cyan border border-neon-cyan/30">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Pilot Status</div>
                  <div className="text-white font-orbitron font-black italic uppercase tracking-tighter text-xl">{stats.pilotRank}</div>
                </div>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-1000" 
                  style={{ width: `${Math.min((stats.totalEvolutions / 5) * 100, 100)}%` }} 
                />
              </div>
              <div className="mt-2 text-[8px] font-black uppercase tracking-widest text-gray-600 flex justify-between">
                <span>Exp: {stats.totalEvolutions} / 5</span>
                <span>Next Rank: {stats.totalEvolutions >= 5 ? 'MAX' : stats.totalEvolutions >= 2 ? 'COMMANDER' : 'VETERAN'}</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-dark-card rounded-[2.5rem] border border-white/5 flex flex-col justify-between relative group overflow-hidden">
             <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-neon-purple/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
             <div className="relative z-10">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Total Reputation</div>
               <div className="text-4xl font-orbitron font-black text-white italic tracking-tighter flex items-center gap-2">
                 {stats.totalVotes} <ThumbsUp className="w-6 h-6 text-neon-cyan" />
               </div>
             </div>
             <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mt-4 italic">Community recognition across all sectors.</p>
          </div>

          <div className="p-8 bg-dark-card rounded-[2.5rem] border border-white/5 flex flex-col justify-between relative group overflow-hidden">
             <div className="absolute bottom-[-20%] right-[-20%] w-32 h-32 bg-neon-cyan/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
             <div className="relative z-10">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Elite Evolutions</div>
               <div className="text-4xl font-orbitron font-black text-white italic tracking-tighter flex items-center gap-2">
                 {stats.sRankCount} <Sparkles className="w-6 h-6 text-neon-purple" />
               </div>
             </div>
             <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mt-4 italic">Confirmed S-Rank transformation protocols.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-8">
          <div>
            <h2 className="font-orbitron text-2xl font-black text-white italic uppercase tracking-widest">
              MISSION <span className="text-neon-cyan">LOGS</span>
            </h2>
          </div>
          
          <Link to="/redesign" className="px-8 py-4 bg-neon-cyan text-black hover:bg-white rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all group shadow-[0_0_20px_rgba(0,243,255,0.2)]">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Initiate New Scan
          </Link>
        </div>

        {setups.length === 0 ? (
           <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-dark-card/30">
              <Layout className="w-16 h-16 text-gray-700 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2 uppercase italic font-orbitron">No Data Found in Sector 7</h3>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-8">Initiate your first scan to see results here.</p>
              <Link to="/redesign" className="px-10 py-5 bg-neon-cyan text-black font-orbitron font-black text-sm uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,243,255,0.2)]">
                Start Quest
              </Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {setups.map((setup) => (
              <Link 
                key={setup._id} 
                to="/results" 
                search={{ setupId: setup._id }}
                className="group relative flex flex-col bg-dark-card border border-white/5 rounded-[2rem] overflow-hidden hover:border-neon-cyan/30 hover:shadow-[0_0_30px_rgba(0,243,255,0.1)] transition-all"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={setup.resultImageUrl || setup.originalImageUrl || ""} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60" />
                  
                  {setup.analysis?.rating && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-neon-cyan text-black rounded-lg font-orbitron font-black italic text-sm shadow-lg">
                      {setup.analysis.rating}
                    </div>
                  )}

                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest ${
                    setup.status === 'completed' ? 'bg-black/60 text-neon-cyan border border-neon-cyan/30 backdrop-blur-md' : 'bg-neon-purple text-white animate-pulse'
                  }`}>
                    {setup.status === 'completed' ? 'SECURED' : 'SYNCING'}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neon-purple italic">{setup.style} Class</span>
                       <div className="flex items-center gap-1 text-gray-500 text-[8px] font-black uppercase tracking-widest">
                          <Clock className="w-2 h-2" /> {new Date(setup._creationTime).toLocaleDateString()}
                       </div>
                    </div>
                    <h3 className="text-white font-black uppercase italic tracking-tight truncate text-lg group-hover:text-neon-cyan transition-colors">{setup.games || 'Unnamed Mission'}</h3>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between gap-4">
                     <div className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                        Total Rep: <span className="text-white">{setup.voteCount || 0}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        {setup.status === 'completed' && !setup.inCompetition && (
                          <button 
                            onClick={(e) => handleEnterCompetition(e, setup._id)}
                            className="px-3 py-2 bg-neon-purple/10 hover:bg-neon-purple text-neon-purple hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest border border-neon-purple/30 transition-all flex items-center gap-2"
                          >
                            <Flame className="w-2 h-2" /> Enter Arena
                          </button>
                        )}
                        {setup.inCompetition && (
                          <div className="px-3 py-2 bg-neon-cyan/10 text-neon-cyan rounded-xl text-[8px] font-black uppercase tracking-widest border border-neon-cyan/30 flex items-center gap-1">
                            <Trophy className="w-2 h-2" /> Arena Active
                          </div>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neon-cyan group-hover:bg-neon-cyan group-hover:text-black group-hover:border-neon-cyan transition-all">
                           <ArrowRight className="w-5 h-5" />
                        </div>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Vault Footer */}
      {setups.length > 0 && (
         <footer className="max-w-7xl mx-auto px-6 mt-20 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">
               END OF DATA STREAM // RECORDING PERSISTENT
            </p>
         </footer>
      )}
    </div>
  )
}
