import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { 
  Sparkles, 
  ArrowLeft, 
  Share2, 
  Download, 
  ShoppingCart, 
  Lightbulb, 
  Monitor, 
  Gamepad2, 
  ShoppingBag,
  Zap,
  Copy,
  Loader2,
  Check,
  ArrowRight,
  Flame,
  ThumbsUp,
  Search,
  Plus
} from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { z } from 'zod'
import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'

const resultsSearchSchema = z.object({
  setupId: z.string().transform((val) => val as Id<"setups">),
})

export const Route = createFileRoute('/results')({
  validateSearch: (search) => resultsSearchSchema.parse(search),
  component: ResultsPage,
})

function ResultsPage() {
  const { setupId } = Route.useSearch()
  const { data: setup } = useSuspenseQuery(convexQuery(api.setups.getSetup, { setupId }))
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const enterArena = useMutation(api.competitions.enterCompetition)
  const addToWishlist = useMutation((api as any).wishlist.addToWishlist)
  const { data: wishlist } = (useSuspenseQuery as any)(convexQuery((api as any).wishlist.listWishlist, {}))
  const [enteringArena, setEnteringArena] = useState(false)
  const [savingWishlist, setSavingWishlist] = useState<string | null>(null)
  const navigate = useNavigate()

  if (!setup) {
    return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white font-orbitron">Setup Not Found</div>
  }

  const isPending = setup.status === 'pending'

  if (isPending) {
     return (
       <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-white font-orbitron p-6 text-center">
         <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mb-6" />
         <h1 className="text-2xl font-black italic mb-4">FINALIZING TRANSFORMATION...</h1>
         <p className="text-gray-500 uppercase tracking-widest text-xs">Our AI is polishing your new battlestation</p>
       </div>
     )
  }

  const analysis = setup.analysis || {
    rating: 'S-Rank',
    feedback: "Generating feedback...",
    totalCost: '0',
    recommendations: [],
  }

  const handleShopAll = () => {
    analysis.recommendations.forEach((item: any) => {
      window.open(item.link, '_blank');
    });
  }

  const socialCaptions = setup.socialCaptions || {
    tiktok: "",
    instagram: "",
  }

  const handleDownloadCard = async () => {
    if (cardRef.current === null) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true })
      const link = document.createElement('a')
      link.download = `respawn-room-${setupId}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to download card', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Respawn Room Transformation',
      text: `Check out my ${setup.style} setup redesign on Respawn Room! Rating: ${analysis.rating}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setCopied('url')
        setTimeout(() => setCopied(null), 2000)
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const { data: activeChallenge } = (useSuspenseQuery as any)(convexQuery((api as any).competitions.getActiveChallenge, {}))
  const handleEnterArena = async () => {
    setEnteringArena(true)
    try {
      await enterArena({ 
        setupId,
        challengeId: activeChallenge?._id
      })
      navigate({ to: '/arena' })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setEnteringArena(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 font-sans pb-20">
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-white/5 bg-dark-bg/80 backdrop-blur-md sticky top-0">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Gamepad2 className="text-black w-5 h-5" />
          </div>
          <span className="font-orbitron text-lg font-black tracking-tighter text-white uppercase italic text-shadow-glow">
            RESPAWN<span className="text-neon-cyan">ROOM</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/arena" className="text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
            <Flame className="w-3 h-3 text-neon-purple" /> Arena
          </Link>
          <Link to="/redesign" className="text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Start Over
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
        {/* Main Result Display */}
        <div className="grid lg:grid-cols-12 gap-12 mb-12">
          
          {/* Left: Transformation Visuals */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative group rounded-3xl overflow-hidden border border-neon-cyan/20 bg-dark-card shadow-[0_0_50px_rgba(0,243,255,0.1)]">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={setup.resultImageUrl || setup.originalImageUrl || "https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&q=80&w=2000"} 
                  alt="Transformed Setup" 
                  className={`w-full h-full object-cover transition-all duration-700 ${!setup.resultImageUrl ? 'opacity-40 grayscale blur-sm' : 'hover:scale-105'}`}
                />
                
                <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md border border-neon-cyan/30 rounded-xl">
                  <div className="text-xs font-bold text-neon-cyan uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Class: {setup.style}
                  </div>
                </div>

                <div className="absolute top-6 right-6 px-6 py-3 bg-neon-cyan text-black rounded-2xl font-orbitron font-black text-2xl italic shadow-lg">
                  {analysis.rating}
                </div>

                {!setup.resultImageUrl && (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="bg-black/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-center">
                        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin mx-auto mb-2" />
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-white">Visualizing Style...</div>
                     </div>
                   </div>
                )}
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-4">
                  <button 
                    onClick={handleDownloadCard}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-2 bg-neon-cyan text-black hover:bg-white rounded-lg text-sm font-black transition-all disabled:opacity-50"
                  >
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download Battle Card
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors"
                  >
                    {copied === 'url' ? <Check className="w-4 h-4 text-neon-cyan" /> : <Share2 className="w-4 h-4" />}
                    {copied === 'url' ? 'URL Copied' : 'Share Results'}
                  </button>
                </div>
                <div className="text-xs text-gray-500 uppercase font-black tracking-widest italic">
                  AI RENDERING COMPLETE // {setup.status === 'completed' ? 'SUCCESS' : 'SYNCING'}
                </div>
              </div>
            </div>

            {/* AI Feedback Section */}
            <div className="p-8 bg-dark-card rounded-3xl border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Zap className="w-24 h-24 text-neon-purple" />
               </div>
               <h3 className="font-orbitron text-xl font-black text-white mb-6 uppercase tracking-tighter italic flex items-center gap-3">
                 AI ANALYSIS <span className="text-gray-600">//</span> PROTOCOL
               </h3>
               <p className="text-lg text-gray-400 leading-relaxed italic relative z-10">
                 "{analysis.feedback}"
               </p>
            </div>

            {/* AI Asset Scan Section */}
            {analysis.scannedHardware && analysis.scannedHardware.length > 0 && (
              <div className="p-8 bg-dark-card rounded-3xl border border-white/5 relative overflow-hidden group">
                 <h3 className="font-orbitron text-sm font-black text-neon-cyan mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Search className="w-4 h-4" /> AI ASSET SCAN
                 </h3>
                 <div className="flex flex-wrap gap-3">
                    {analysis.scannedHardware.map((item: string, i: number) => (
                      <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                         {item}
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* AI Roast Mode Section */}
            {analysis.roast && (
              <div className="p-8 bg-gradient-to-br from-red-500/10 to-transparent rounded-3xl border border-red-500/20 relative overflow-hidden group shadow-[0_0_40px_rgba(239,68,68,0.05)]">
                 <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                   <Flame className="w-32 h-32 text-red-500" />
                 </div>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <Flame className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="font-orbitron text-xl font-black text-red-500 uppercase tracking-tighter italic">
                      SETUP ROAST <span className="text-red-900 font-normal">MOD ACTIVATED</span>
                    </h3>
                 </div>
                 <p className="text-xl text-white font-black italic leading-relaxed relative z-10 drop-shadow-sm uppercase tracking-tight">
                   "{analysis.roast}"
                 </p>
                 <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-red-900 uppercase tracking-[0.3em]">
                   Critique Level: SAVAGE
                 </div>
              </div>
            )}

            {/* Hidden Battle Card for Export */}
            <div className="fixed left-[-9999px] top-[-9999px]">
               <div 
                 ref={cardRef} 
                 className="w-[1200px] h-[630px] bg-dark-bg p-12 relative flex flex-col justify-between overflow-hidden"
                 style={{ backgroundImage: 'linear-gradient(to bottom right, #050505, #0f0f12)' }}
               >
                 <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                 <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/20 rounded-full blur-[120px]" />
                 <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/20 rounded-full blur-[120px]" />
                 
                 <div className="relative z-10 flex justify-between items-start">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-2xl flex items-center justify-center">
                       <Gamepad2 className="text-black w-10 h-10" />
                     </div>
                     <div>
                       <div className="font-orbitron text-3xl font-black text-white uppercase italic tracking-tighter">RESPAWN ROOM</div>
                       <div className="text-neon-cyan text-sm font-black uppercase tracking-[0.3em]">AI SETUP EVOLUTION</div>
                     </div>
                   </div>
                   <div className="px-8 py-4 bg-neon-cyan text-black rounded-3xl font-orbitron font-black text-4xl italic shadow-2xl">
                     {analysis.rating}
                   </div>
                 </div>

                 <div className="relative z-10 grid grid-cols-2 gap-8 h-[350px]">
                   <div className="relative rounded-3xl overflow-hidden border-4 border-white/10">
                     <img src={setup.originalImageUrl || ""} className="w-full h-full object-cover" />
                     <div className="absolute bottom-4 left-4 px-4 py-1 bg-black/80 rounded-lg text-xs font-black text-white uppercase tracking-widest border border-white/20">BEFORE</div>
                   </div>
                   <div className="relative rounded-3xl overflow-hidden border-4 border-neon-cyan/50">
                     <img src={setup.resultImageUrl || setup.originalImageUrl || ""} className="w-full h-full object-cover" />
                     <div className="absolute bottom-4 left-4 px-4 py-1 bg-neon-cyan text-black rounded-lg text-xs font-black uppercase tracking-widest">AFTER</div>
                   </div>
                 </div>

                 <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-8">
                    <div>
                      <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">AESTHETIC CLASS</div>
                      <div className="text-white font-orbitron text-2xl font-black italic uppercase text-neon-purple">{setup.style}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">PROCESSED BY</div>
                      <div className="text-neon-cyan font-orbitron text-lg font-black italic">RESPAWNROOM.SPACE</div>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Right: Recommendations & Loot */}
          <div className="lg:col-span-4 space-y-8">
            <section className="p-8 bg-dark-card rounded-3xl border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-orbitron text-sm font-black text-neon-cyan uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> RECOMMENDED LOOT
                </h3>
                <div className="text-right">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EST. TOTAL</div>
                  <div className="text-white font-orbitron font-black text-lg">${analysis.totalCost}</div>
                </div>
              </div>
              
              <div className="space-y-6">
                {analysis.recommendations.map((item: any, i: number) => {
                  const isInWishlist = wishlist?.some((w: any) => w.link === item.link)

                  const handleSaveItem = async () => {
                    if (isInWishlist) return
                    setSavingWishlist(item.link)
                    try {
                      await addToWishlist({
                        item: item.item,
                        category: item.category,
                        price: item.price,
                        link: item.link,
                        source: item.source,
                        setupId: setupId
                      })
                    } catch (err: any) {
                      alert(err.message)
                    } finally {
                      setSavingWishlist(null)
                    }
                  }

                  return (
                    <div key={i} className="group p-4 bg-white/5 rounded-2xl border border-transparent hover:border-neon-cyan/20 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2 py-0.5 bg-black/40 rounded">{item.category}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleSaveItem}
                            disabled={isInWishlist || savingWishlist === item.link}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isInWishlist
                              ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                              : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {savingWishlist === item.link ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          </button>
                          <span className="text-neon-cyan font-bold">{item.price}</span>
                        </div>
                      </div>
                      <div className="text-white font-bold mb-1">{item.item}</div>
                      {item.why && (
                        <p className="text-[10px] text-gray-500 italic mb-4 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                          "{item.why}"
                        </p>
                      )}
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2 font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
                          item.link.includes('amazon.com')
                          ? 'bg-[#FF9900]/10 hover:bg-[#FF9900] text-[#FF9900] hover:text-black border border-[#FF9900]/20'
                          : 'bg-neon-cyan/10 hover:bg-neon-cyan text-neon-cyan hover:text-black border border-neon-cyan/20'
                        }`}
                      >
                        <ShoppingCart className="w-3 h-3" /> {item.link.includes('amazon.com') ? 'View on Amazon' : 'Shop Gapo Goods'}
                      </a>
                    </div>
                  )
                })}
              </div>
              
              <button 
                onClick={handleShopAll}
                className="w-full mt-8 py-4 bg-neon-cyan text-black hover:bg-white font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(0,243,255,0.2)]"
              >
                Deploy Full Loadout <Zap className="w-4 h-4 fill-black group-hover:scale-110 transition-transform" />
              </button>
            </section>

            {/* Social Share Section */}
            <section className="p-8 bg-gradient-to-br from-neon-purple/20 to-transparent rounded-3xl border border-neon-purple/20">
              <h3 className="font-orbitron text-sm font-black text-neon-purple mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap className="w-4 h-4" /> SOCIAL XP
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-xl text-sm border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-neon-purple font-bold uppercase text-[10px] tracking-widest">TikTok / X</div>
                    {copied === 'tiktok' && <Check className="w-3 h-3 text-neon-cyan" />}
                  </div>
                  <p className="text-gray-400 text-xs italic mb-4">"{socialCaptions.tiktok}"</p>
                  <button 
                    onClick={() => copyToClipboard(socialCaptions.tiktok, 'tiktok')}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-neon-cyan transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copy Caption
                  </button>
                </div>
                
                <div className="p-4 bg-black/40 rounded-xl text-sm border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-neon-pink font-bold uppercase text-[10px] tracking-widest">Instagram</div>
                    {copied === 'instagram' && <Check className="w-3 h-3 text-neon-cyan" />}
                  </div>
                  <p className="text-gray-400 text-xs italic mb-4">"{socialCaptions.instagram}"</p>
                  <button 
                    onClick={() => copyToClipboard(socialCaptions.instagram, 'instagram')}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-neon-cyan transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copy Caption
                  </button>
                </div>
              </div>
            </section>

            {!setup.inCompetition ? (
              <section className="p-8 bg-dark-card rounded-3xl border border-neon-cyan/20 shadow-[0_0_30px_rgba(0,243,255,0.05)]">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-neon-cyan/10 rounded-lg">
                     <Flame className="w-5 h-5 text-neon-cyan" />
                   </div>
                   <h3 className="font-orbitron text-sm font-black text-white uppercase tracking-[0.2em]">
                     SETUP ARENA
                   </h3>
                </div>
                <p className="text-xs text-gray-500 font-bold mb-8 uppercase tracking-widest leading-relaxed italic">
                  Deploy this transformation to the community leaderboard and battle for the legendary crown.
                </p>
                <button 
                  onClick={handleEnterArena}
                  disabled={enteringArena}
                  className="w-full py-4 bg-neon-cyan text-black hover:bg-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {enteringArena ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Enter Arena
                </button>
              </section>
            ) : (
              <section className="p-8 bg-neon-purple/5 rounded-3xl border border-neon-purple/20 shadow-[0_0_30px_rgba(188,19,254,0.05)]">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-neon-purple/20 rounded-lg">
                       <Flame className="w-5 h-5 text-neon-purple" />
                     </div>
                     <h3 className="font-orbitron text-sm font-black text-white uppercase tracking-[0.2em]">
                       ARENA ACTIVE
                     </h3>
                   </div>
                   <div className="px-3 py-1 bg-neon-purple text-white text-[10px] font-black rounded-full">
                     LIVE
                   </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 mb-6">
                   <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Votes</div>
                   <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-neon-cyan" />
                      <span className="text-white font-orbitron font-black text-lg">{setup.voteCount || 0}</span>
                   </div>
                </div>
                <Link 
                  to="/arena"
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border border-white/10"
                >
                  View Leaderboard <ArrowRight className="w-4 h-4" />
                </Link>
              </section>
            )}
          </div>

        </div>

        {/* Upgrade Features Preview */}
        <div className="grid md:grid-cols-2 gap-8 mt-20">
           <div className="p-10 bg-dark-card rounded-[2rem] border border-white/5 flex flex-col justify-between group overflow-hidden relative">
             <div className="relative z-10">
               {setup.wallpaperImageUrl ? (
                 <div className="relative mb-8 rounded-2xl overflow-hidden border border-white/10 aspect-video group/wallpaper shadow-2xl">
                    <img src={setup.wallpaperImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/wallpaper:scale-110" alt="AI Wallpaper" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                       <div className="px-2 py-1 bg-neon-cyan text-black text-[8px] font-black uppercase tracking-widest rounded">4K RENDERING</div>
                    </div>
                 </div>
               ) : (
                 <div className="w-12 h-12 bg-neon-cyan/10 rounded-xl flex items-center justify-center text-neon-cyan mb-6 group-hover:scale-110 transition-transform">
                   <Monitor className="w-6 h-6" />
                 </div>
               )}
               <h3 className="font-orbitron text-2xl font-black text-white mb-4 italic uppercase">Wallpapers & VFX</h3>
               <p className="text-gray-400 mb-8">Download custom AI-generated 4K wallpapers that perfectly match your new room's aesthetic.</p>
             </div>
             
             {setup.wallpaperImageUrl ? (
               <a 
                 href={setup.wallpaperImageUrl} 
                 target="_blank"
                 download={`respawn-wallpaper-${setupId}.png`}
                 className="w-fit relative z-10 px-8 py-4 bg-neon-cyan text-black hover:bg-white rounded-xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)]"
               >
                 Download Assets <Download className="w-4 h-4" />
               </a>
             ) : (
               <button className="w-fit px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-2 transition-all">
                 Coming Soon <Zap className="w-3 h-3 fill-neon-cyan text-neon-cyan" />
               </button>
             )}

             {setup.wallpaperImageUrl && (
               <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
             )}
           </div>

           <div className="p-10 bg-dark-card rounded-[2rem] border border-white/5 flex flex-col justify-between group">
             <div>
               <div className="w-12 h-12 bg-neon-purple/10 rounded-xl flex items-center justify-center text-neon-purple mb-6 group-hover:scale-110 transition-transform">
                 <Lightbulb className="w-6 h-6" />
               </div>
               <h3 className="font-orbitron text-2xl font-black text-white mb-4 italic uppercase">Lighting Config</h3>
               <p className="text-gray-400 mb-8">Get the exact RGB hex codes and gradient patterns for your smart lights.</p>

               <div className="space-y-4">
                 {setup.lightingConfig?.map((config: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 group/color">
                      <div className="flex items-center gap-4">
                         <div
                           className="w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10"
                           style={{ backgroundColor: config.hex, boxShadow: `0 0 20px ${config.hex}33` }}
                         />
                         <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white">{config.name}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase">{config.hex}</div>
                         </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(config.hex, `hex-${i}`)}
                        className="text-[10px] font-black uppercase tracking-widest text-neon-purple hover:text-white transition-colors"
                      >
                        {copied === `hex-${i}` ? <Check className="w-3 h-3" /> : 'Copy Hex'}
                      </button>
                   </div>
                 ))}
                 {!setup.lightingConfig && (
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center py-4 border-2 border-dashed border-white/5 rounded-2xl">
                      Configuration Syncing...
                    </div>
                 )}
               </div>
             </div>
           </div>
        </div>
      </main>

      {/* Final CTA */}
      <section className="mt-32 px-6 text-center max-w-3xl mx-auto">
        <h2 className="font-orbitron text-4xl font-black text-white mb-6 italic uppercase tracking-tighter">HAPPY WITH THE <span className="text-neon-cyan">RESPAWN?</span></h2>
        <p className="text-gray-400 mb-8 text-lg">Join 12,000+ gamers on Discord to show off your transformation and compete for 'Setup of the Month'.</p>
        <button className="group px-10 py-5 bg-white text-black font-orbitron font-black text-lg uppercase tracking-[0.2em] rounded-2xl hover:bg-neon-cyan hover:scale-105 transition-all flex items-center justify-center gap-4 mx-auto">
          Join the Discord <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </button>
      </section>
    </div>
  )
}
