import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  Gamepad2, 
  Flame,
  ThumbsUp,
  Search,
  User,
  Zap,
  Trophy
} from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'

export const Route = createFileRoute('/arena')({
  component: ArenaPage,
})

function ArenaPage() {
  const { data: entries } = (useSuspenseQuery as any)(convexQuery((api as any).competitions.listCompetitionEntries, {}))
  const { data: activeChallenge } = (useSuspenseQuery as any)(convexQuery((api as any).competitions.getActiveChallenge, {}))
  const { data: challengeEntries } = (useSuspenseQuery as any)(convexQuery((api as any).competitions.listChallengeEntries, { challengeId: activeChallenge?._id || "" as any }))
  
  const vote = useMutation((api as any).competitions.vote)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [tab, setTab] = useState<'global' | 'challenge'>('challenge')

  const handleVote = async (setupId: any) => {
    setVotingId(setupId)
    try {
      await vote({ setupId })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setVotingId(null)
    }
  }

  const currentEntries = tab === 'global' ? entries : challengeEntries

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 font-sans pb-20">
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />

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
          <Link to="/vault" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <User className="w-3 h-3 text-neon-cyan" /> My Vault
          </Link>
          <Link to="/redesign" className="px-6 py-2 bg-neon-cyan text-black font-orbitron font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            Upgrade My Room
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
        <div className="text-center mb-20">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[10px] font-black uppercase tracking-[0.3em] mb-6">
             <Flame className="w-3 h-3 fill-neon-purple" /> Season 1: Alpha Sector
           </div>
           <h1 className="font-orbitron text-3xl sm:text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-6">
             SETUP <span className="text-neon-cyan text-shadow-glow">ARENA</span>
           </h1>
           <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-xs font-black leading-relaxed">
             The battlefield of battlestations. Vote for your favorite AI transformations or enter your own to claim the legendary setup of the month.
           </p>
        </div>

        {activeChallenge && (
          <div className="mb-20 p-8 sm:p-12 bg-gradient-to-br from-neon-purple/20 via-dark-card to-dark-card rounded-[3rem] border border-neon-purple/30 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
               <Trophy className="w-64 h-64 text-neon-purple" />
             </div>
             
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="max-w-xl">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-neon-purple rounded-lg">
                      <Zap className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-purple">Daily Mission</span>
                 </div>
                 <h2 className="font-orbitron text-3xl sm:text-4xl font-black text-white italic uppercase mb-4 tracking-tighter">
                   {activeChallenge.title}
                 </h2>
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                   {activeChallenge.description}
                 </p>
               </div>
               
               <div className="flex flex-col items-end gap-2">
                 <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">REWARD XP</div>
                 <div className="text-white font-orbitron font-black text-2xl italic tracking-tighter">+500 CREDITS</div>
                 <Link to="/redesign" className="mt-4 px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-neon-purple hover:text-white transition-all shadow-xl">
                    Accept Mission
                 </Link>
               </div>
             </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mb-12">
           <button 
             onClick={() => setTab('challenge')}
             className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${tab === 'challenge' ? 'bg-neon-purple text-white shadow-[0_0_20px_rgba(188,19,254,0.3)]' : 'bg-white/5 text-gray-500 hover:text-white'}`}
           >
             Challenge Entries
           </button>
           <button 
             onClick={() => setTab('global')}
             className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${tab === 'global' ? 'bg-neon-cyan text-black shadow-[0_0_20px_rgba(0,243,255,0.3)]' : 'bg-white/5 text-gray-500 hover:text-white'}`}
           >
             Global Leaderboard
           </button>
        </div>

        {currentEntries.length === 0 ? (
           <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-dark-card/30">
              <Zap className="w-16 h-16 text-gray-700 mb-6 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2 uppercase italic font-orbitron">No Entries Yet</h3>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-8 text-center px-6">Be the first to deploy your setup to this sector.</p>
              <Link to="/redesign" className="px-10 py-5 bg-neon-cyan text-black font-orbitron font-black text-sm uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,243,255,0.2)]">
                Deploy Entry
              </Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {currentEntries.map((entry: any, index: number) => (
              <div 
                key={entry._id} 
                className="group relative flex flex-col bg-dark-card border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-neon-purple/30 transition-all shadow-2xl"
              >
                {/* Rank Badge for Top 3 */}
                {index < 3 && (
                   <div className="absolute top-6 left-6 z-20 w-12 h-12 bg-neon-cyan text-black rounded-xl flex items-center justify-center font-orbitron font-black italic text-xl shadow-2xl rotate-[-10deg]">
                     #{index + 1}
                   </div>
                )}

                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={entry.resultImageUrl || entry.originalImageUrl || ""} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
                    <ThumbsUp className="w-3 h-3 text-neon-cyan" />
                    <span className="text-sm font-black text-white">{entry.voteCount || 0}</span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-purple mb-1 drop-shadow-lg">{entry.style} Class</div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter truncate drop-shadow-lg">{entry.games}</h3>
                  </div>
                </div>

                <div className="p-8 flex items-center justify-between gap-4">
                  <button 
                    onClick={() => handleVote(entry._id)}
                    disabled={votingId === entry._id}
                    className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-neon-cyan hover:text-black rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {votingId === entry._id ? <Zap className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                    Upvote Setup
                  </button>
                  <Link 
                    to="/results" 
                    search={{ setupId: entry._id }}
                    className="w-14 h-14 bg-white/5 border border-white/10 hover:border-neon-purple rounded-2xl flex items-center justify-center text-gray-500 hover:text-neon-purple transition-all"
                  >
                    <Search className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-32 border-t border-white/5 pt-20 pb-10 text-center max-w-4xl mx-auto px-6">
        <h2 className="font-orbitron text-2xl font-black text-white mb-8 italic uppercase tracking-widest">WANT TO CLAIM THE CROWN?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left mb-20">
           {[
             { title: "Redesign", desc: "Upload your room and apply an aesthetic class." },
             { title: "Deploy", desc: "Submit your final evolution to the Setup Arena." },
             { title: "Win", desc: "Gather votes from the community to rank up." }
           ].map((step, i) => (
             <div key={i} className="p-6 bg-dark-card rounded-2xl border border-white/5">
                <div className="text-neon-cyan font-orbitron font-black italic text-3xl mb-4 opacity-30">0{i+1}</div>
                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">{step.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed uppercase font-black tracking-widest">{step.desc}</p>
             </div>
           ))}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-800">ARENA V1.0 // POWERED BY AI</p>
      </footer>
    </div>
  )
}
