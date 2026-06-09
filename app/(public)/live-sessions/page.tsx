import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Video, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LiveSessionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="fixed top-24 left-4 sm:left-8 lg:left-12 z-40">
        <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 text-primary">
          <Link href="/services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
        </Button>
      </div>

      {/* Title Section */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary tracking-tight mb-4">
            1:1 Live Sessions
          </h1>
          <p className="text-xl font-serif italic text-primary/80" style={{ color: '#9B6FA8' }}>
            Feminine healing for the wounded soul.
          </p>
        </div>
      </section>

      {/* Hero Image Section (Large Centered Image) */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50 ring-1 ring-primary/10">
            <Image
              src="/live session.jpg"
              alt="1:1 Live Session"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Intro Text Section */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <div className="space-y-8 font-serif text-[1.1rem] leading-[1.9] text-foreground/90">
            <p className="text-center font-medium">
              My live sessions are a space where healing happens, they are spaces for{" "}
              <strong className="text-foreground">alignment to your Higher Self.</strong>
            </p>

            <div className="space-y-6">
              <p>
                When you enter as a client, we are not looking at the <em>surface story</em>. We are attuning to what sits beneath;
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex gap-3">
                  <span className="text-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <span>The patterns in your nervous system</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <span>The emotional imprints you&apos;ve been carrying,</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/40" />
                   <span>The subtle ways your energy has adapted to <em>survive</em> rather than expand.</span>
                </li>
              </ul>
            </div>

            <p className="text-center italic text-primary/70 text-2xl py-8 tracking-wide">
              This is where the work begins.
            </p>

            <p>
              Through frequency, presence, and precise guidance, the session starts to{" "}
              <strong className="text-foreground">reorganise</strong> what feels scattered or heavy. It&apos;s quiet, exact, and deeply felt. Your body finally begins to soften. Your mind stops looping. (Literally) Something within you recognises a more natural state, one that isn&apos;t driven by urgency, fear, or over-effort.
            </p>

            <p className="text-center font-medium">
              Your inner feminine begins to find <strong className="text-foreground text-xl"><em>Home.</em></strong>
            </p>
          </div>
        </div>
      </section>

      {/* About the Sessions (Split Section matching screenshot) */}
      <section className="py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: Text & Points (7/12) */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-6">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary">
                  About the Sessions
                </h2>
                <div className="space-y-6 text-foreground/80 leading-relaxed font-serif text-lg">
                  <p>
                    Live video call sessions are a unique opportunity to work with me directly. These sessions only open seasonally, as they are carefully timed with the energetic current of our planet.
                  </p>
                  <p>
                    Each session is curated with love for true healing and transformation. We dive deep into your energetic blueprint to alchemise karma into spiritual wisdom.
                  </p>
                </div>
              </div>

              {/* Grid of 4 points */}
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10 pt-4">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary/90 font-serif">Seasonal Openings</h4>
                    <p className="text-sm text-muted-foreground leading-snug">Aligned with earth&apos;s current</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary/90 font-serif">Private Video Calls</h4>
                    <p className="text-sm text-muted-foreground leading-snug">Safe and sacred virtual space</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary/90 font-serif">Personalised Healing</h4>
                    <p className="text-sm text-muted-foreground leading-snug">Based on your energetic needs</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary/90 font-serif">Limited Slots</h4>
                    <p className="text-sm text-muted-foreground leading-snug">Curated one-on-one attention</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Image with Overlay (5/12) */}
            <div className="lg:col-span-5 relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group">
              <Image
                src="/live%20session.jpg"
                alt="Krisha - Live Video Session"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-purple-800/10 to-transparent opacity-90" />
              <div className="absolute bottom-10 left-0 right-0 text-center px-6">
                <p className="font-serif italic text-white text-xl leading-relaxed drop-shadow-lg">
                  Transforming dense karma into spiritual light.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Further Content Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 space-y-12">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-10 space-y-6 font-serif">
            <p className="font-bold text-primary text-xl">You leave feeling:</p>
            <ul className="space-y-4 text-lg">
              <li className="flex gap-4 items-center">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <span>More regulated.</span>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <span>More aware.</span>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <span>More anchored in your body.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-8 font-serif text-[1.08rem] leading-[1.95] text-foreground/90">
            <p>
              And from that place, your life begins to move differently. You don&apos;t need to try harder, you work in alignment. You no longer work against your own system.
            </p>

            <div className="text-center space-y-6 py-8 border-y border-primary/10">
              <p className="italic text-lg text-muted-foreground text-foreground/60">This is why the space is held the way it is.</p>
              <p className="italic text-lg text-muted-foreground text-foreground/60">It is not for consumption.</p>
              <p className="italic text-2xl font-semibold text-primary/80 mt-4 leading-relaxed">
                It is for those who are ready to meet themselves, truthfully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center space-y-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Begin Your Journey</h2>
          <p className="text-xl opacity-90 font-serif italic max-w-2xl mx-auto leading-relaxed text-balance">
            Book your session below. Waitlist updates are available in the footer!
          </p>
          <div className="pt-4 flex flex-col items-center gap-16">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-14 py-9 text-xl font-bold transition-all shadow-xl hover:scale-105" asChild>
              <Link href="https://calendly.com/soulhome-love" target="_blank" rel="noopener noreferrer" className="no-underline">
                BOOK YOUR SESSION HERE
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
