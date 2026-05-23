import { createFileRoute, Link } from '@tanstack/react-router'
import { Upload, Zap, Sparkles, Monitor, Gamepad2, Layout, ArrowRight, CheckCircle2, User } from 'lucide-react'
import { useConvexAuth } from 'convex/react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth()

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 font-sans selection:bg-neon-cyan selection:text-black">
      {/* Background patterns */}
      <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <Gamepad2 className="text-black w-6 h-6" />
          </div>
          <span className="font-orbitron text-xl font-black tracking-tighter text-white">
            RESPAWN<span className="text-neon-cyan italic">ROOM</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-gray-400">
          <Link to="/arena" className="hover:text-neon-cyan transition-colors">Showcase</Link>
          <a href="#" className="hover:text-neon-purple transition-colors">Styles</a>
          <Link to="/vault" className="hover:text-white transition-colors text-white/90">Vault</Link>
        </div>

        {!isLoading && (
          isAuthenticated ? (
            <Link to="/vault" className="flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors backdrop-blur-md">
              <User className="w-4 h-4 text-neon-cyan" /> Profile
            </Link>
          ) : (
            <Link to="/login" className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all backdrop-blur-md">
              Authenticate
            </Link>
          )
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-bold uppercase tracking-widest mb-8 animate-pulse">
          <Zap className="w-3 h-3 fill-neon-cyan" />
          AI-Powered Setup Evolution
        </div>
        
        <h1 className="font-orbitron text-3xl sm:text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tight text-white italic">
          LEVEL UP YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink glow-cyan">
            REAL LIFE
          </span> BATTLESTATION
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          The ultimate AI room designer for gamers. Transform your messy setup into a legendary command center in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/redesign" className="group relative px-8 py-5 bg-neon-cyan text-black font-orbitron font-black text-lg uppercase tracking-wider rounded-xl overflow-hidden hover:scale-105 transition-transform text-center min-w-[240px]">
            <span className="relative z-10 flex items-center justify-center gap-3">
              Upgrade My Room <Upload className="w-5 h-5" />
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </Link>
          
          <button className="px-8 py-5 bg-white/5 border border-white/10 rounded-xl font-orbitron font-bold text-lg uppercase tracking-wider hover:bg-white/10 transition-colors backdrop-blur-md min-w-[240px]">
            View Sample Setups
          </button>
        </div>

        {/* Hero Visual */}
        <div className="mt-24 relative max-w-5xl mx-auto group text-left">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-dark-card rounded-3xl overflow-hidden border border-white/10 aspect-video md:aspect-[21/9]">
            <img 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" 
              alt="Epic Gaming Setup" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />
            
            {/* Before/After Overlay Mockup */}
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl max-w-xs text-left">
                <div className="text-neon-cyan text-xs font-bold uppercase mb-1">Current Quest</div>
                <div className="text-white font-bold truncate">"The Dusty Dungeon"</div>
                <div className="text-gray-400 text-xs mt-2 italic">Identified 4 lighting opportunities & clutter detected in Sector 4.</div>
              </div>
              <div className="bg-neon-cyan text-black px-4 py-2 rounded-lg font-bold uppercase text-sm animate-bounce shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                AI ACTIVE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Layout className="w-8 h-8 text-neon-cyan" />,
              title: "Room Analysis",
              desc: "Our AI scans your setup to find empty spaces, lighting deadzones, and 'cable management raid bosses'."
            },
            {
              icon: <Sparkles className="w-8 h-8 text-neon-purple" />,
              title: "Style Injection",
              desc: "From Cyberpunk to Cozy RPG. We redesign your space based on the games you actually play."
            },
            {
              icon: <Monitor className="w-8 h-8 text-neon-pink" />,
              title: "Build List",
              desc: "Get a curated list of gear, lighting, and decor to bring your AI dream setup to reality."
            }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-dark-card rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
              <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white font-orbitron">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Styles Preview */}
      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white italic mb-4 uppercase">CHOOSE YOUR <span className="text-neon-purple text-shadow-glow">CLASS</span></h2>
              <p className="text-gray-400 text-lg uppercase tracking-widest text-xs font-black">Pick a vibe that fits your gaming DNA.</p>
            </div>
            <button className="flex items-center gap-2 text-neon-cyan font-bold uppercase tracking-widest text-sm hover:underline">
              Explore All Styles <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {[
              { name: "Cyberpunk", color: "neon-cyan", img: "https://i.pinimg.com/736x/2a/36/b0/2a36b00de204310d67ae66c6404ea6d7.jpg" },
              { name: "Cozy RPG", color: "neon-purple", img: "https://i.pinimg.com/originals/99/7e/95/997e95d471156dc5243430cdb9b78eba.jpg" },
              { name: "Dark Fantasy", color: "neon-pink", img: "https://cdn.ashley.com/assets/H600001072_1.jpg?fit=bounds&width=1080&height=810&quality=90&format=webp" },
              { name: "Tactical FPS", color: "white", img: "https://preview.redd.it/mrs-left-me-alone-for-a-week-she-told-me-to-tidy-up-but-v0-itt0ujue2bib1.jpg?width=1080&crop=smart&auto=webp&s=84865182e2d03fc6a85f8259c7466016166a52d1" }
            ].map((style, i) => (
              <div key={i} className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border border-white/10 shadow-2xl">
                <img src={style.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="font-orbitron text-lg font-bold text-white uppercase italic">{style.name}</div>
                  <div className={`h-1 w-0 group-hover:w-full transition-all duration-300 bg-${style.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-neon-purple/20 via-neon-cyan/10 to-transparent border border-white/10 p-12 md:p-24 shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Gamepad2 className="w-48 h-48 rotate-12" />
          </div>
          
          <h2 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-8 italic tracking-tighter">READY TO <span className="text-neon-cyan text-shadow-glow">RESPAWN?</span></h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join 12,400+ gamers who have already optimized their setup. Stop playing in a dungeon, start playing in a command center.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link to="/redesign" className="w-full sm:w-auto px-12 py-6 bg-white text-black font-orbitron font-black text-xl uppercase tracking-wider rounded-2xl hover:bg-neon-cyan hover:scale-105 transition-all text-center">
              Start Free Scan
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-400 uppercase tracking-widest font-bold">
              <CheckCircle2 className="text-neon-cyan w-5 h-5 shadow-[0_0_10px_rgba(0,243,255,0.5)]" /> No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-dark-card/50 relative overflow-hidden text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
          <div className="max-w-xs text-left">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center">
                <Gamepad2 className="text-black w-5 h-5" />
              </div>
              <span className="font-orbitron text-lg font-black tracking-tighter text-white">
                RESPAWN<span className="text-neon-cyan italic">ROOM</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              The world's first AI-powered setup optimization engine. Designed by gamers, for gamers.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-left">
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-6">System</h4>
              <ul className="space-y-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Showcase</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Styles</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-6">Company</h4>
              <ul className="space-y-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
                <li><a href="#" className="hover:text-neon-cyan transition-colors">About</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-6">Connect</h4>
              <ul className="space-y-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors">TikTok</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-[10px] uppercase tracking-[0.4em] font-black">
          &copy; {new Date().getFullYear()} Respawn Room AI. ALL RIGHTS RESERVED. // DESIGNED FOR IMMERSION.
        </div>
      </footer>
    </div>
  )
}
