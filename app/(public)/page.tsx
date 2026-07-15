import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sparkles,
  BookOpen,
  Headphones,
  Play,
  Heart,
  ArrowRight,
  CheckCircle2,
  Star
} from "lucide-react"
import { DecorativeArch } from "@/components/decorative-arch"
import { DecorativeCircle } from "@/components/decorative-circle"
import { TestimonialMasonry } from "@/components/testimonial-masonry"
import { LatestResources } from "@/components/latest-resources"
import Image from "next/image"


const testimonials = [
  {
    quote: "A client who began to slowly find peace in her life's rhythm. I loved how she took a feminine approach and digitally scrap-booked to share her experiences.",
    name: "Sarah M.",
    location: "London"
  },
  {
    quote: "A client who felt the instant shift, when she began allowing her true self to unfold.",
    name: "Priya K.",
    location: "Mumbai"
  },
  {
    quote: "A client who finally felt seen, marking the journey of coaching to understand more of herself through self-love.",
    name: "Emma T.",
    location: "Manchester"
  },
  {
    quote: "A divine masculine who followed our session(s) with a heart-calling, and began to find something that can't be described in words.",
    name: "James R.",
    location: "Edinburgh"
  },
  {
    quote: "A client who found a safe space, to just exist and be.",
    name: "Aisha N.",
    location: "Dubai"
  },
  {
    quote: "A client who fully committed to their own healing, such a wonderful experience to witness their growth.",
    name: "Maya S.",
    location: "New York"
  }
]

const benefits = [
  "Unlimited access to our entire resource library",
  "New teachings and practices added weekly",
  "Downloadable content for offline practice",
  "Structured learning paths for all levels",
  "Direct connection to ancient wisdom traditions"
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden h-[700px] sm:h-[800px] lg:h-[900px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/HOMEPAGE4 (2).jpg"
            alt="Soulhome Homepage"
            fill
            className="object-cover"
            priority
            quality={85}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="Soulhome Logo"
              width={100}
              height={100}
              className="object-contain mb-6 drop-shadow-2xl"
              priority
            />
            <h1 className="font-serif text-3xl sm:text-6xl font-bold uppercase tracking-[0.2em] text-white lg:text-8xl text-balance mb-6 drop-shadow-2xl">
              Soulhome
            </h1>

            <p className="text-2xl sm:text-3xl text-white leading-relaxed text-balance mb-12 font-light drop-shadow-lg">
              A sacred journey of remembrance and return to Source
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-xl">
                <Link href="https://calendly.com/soulhome-love" target="_blank" rel="noopener noreferrer">
                  Book a Session
                </Link>
              </Button>
              <Button size="lg" asChild className="text-lg px-8 py-6 bg-primary/80 backdrop-blur-sm text-white border border-primary/50 hover:bg-primary shadow-xl">
                <Link href="/kundalini-school">
                  Explore Resources
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm text-white border-white/50 hover:bg-white/20 shadow-xl">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Soulhome Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-secondary/10 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Image Placeholder */}
            {/* Circular Image Cutout */}
            <div className="relative aspect-square w-full max-w-[500px] mx-auto rounded-full overflow-hidden border-[8px] border-primary/50 shadow-2xl">
              <Image
                  src="/IMG_20210814_1736212.jpg"
                  alt="Soulhome spirit"
                  fill
                  className="object-cover object-center"
                  quality={85}
                />
            </div>

            {/* Text Content */}
            <div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-6 uppercase tracking-widest">
                About Soulhome
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-transparent mb-8"></div>

              <div className="space-y-6 text-foreground leading-relaxed">
                <p className="text-lg">
                  Soulhome is a space to return to the source of who you truly are. It is the frequency of coming home to your original soul blueprint and reconnecting with the divine presence that flows through all of creation.
                </p>

                <p className="text-lg">
                  Here, <span className="font-semibold text-primary">love is gentle and fierce</span>, tender and unwavering. Your heart finds safety, your body aligns with your soul, and you remember your inherent divinity.
                </p>

                <p className="text-lg">
                  Through sacred sessions and soul attunement, we help you remember the truth that already lives within you. As patterns become conscious, your energy shifts. Wounds are reframed into wisdom, old stories dissolve, and your soul remembers its power.
                </p>

                <p className="text-lg">
                  Each session is held in a protected space where your energy is honored with care and intention. Together, we unravel deep-rooted patterns through guidance from higher realms, creating space for real healing and transformation to naturally unfold.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Connect Section */}
      <section className="py-20 sm:py-28 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl text-balance uppercase tracking-widest mb-16">
            Ways to Connect with Soulhome
          </h2>

          <div className="grid md:grid-cols-2 gap-16 md:gap-8 max-w-5xl mx-auto">
            {/* 1:1 Live Sessions */}
            <div className="flex flex-col items-center text-center space-y-6 h-full">
              <div className="relative aspect-square w-full max-w-[300px] rounded-full overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="/livesession.jpg"
                  alt="1:1 Live Sessions"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4 flex flex-col flex-grow w-full">
                <h3 className="font-serif text-2xl italic text-primary">1:1 Live Sessions</h3>
                <div className="w-full h-[1px] bg-primary/20"></div>
                <p className="text-muted-foreground leading-relaxed text-balance text-sm max-w-sm mx-auto flex-grow">
                  Live video call sessions that only open seasonally. These sessions are curated with love for true healing and transformation, and are based on the energetic current of Earth.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 mt-auto">
                  <Link 
                    href="https://calendly.com/soulhome-love" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-6 py-2 bg-primary text-white text-xs uppercase tracking-widest font-bold rounded-full hover:bg-primary/90 transition-all active:scale-95 text-center"
                  >
                    BOOK HERE
                  </Link>
                  <Link 
                    href="/live-sessions" 
                    className="px-6 py-2 border border-primary text-primary text-xs uppercase tracking-widest font-bold rounded-full hover:bg-primary/5 transition-all text-center"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            </div>

            {/* Kundalini School */}
            <div className="flex flex-col items-center text-center space-y-6 h-full">
              <div className="relative aspect-square w-full max-w-[300px] rounded-full overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="/school (1).jpg"
                  alt="Kundalini School"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4 flex flex-col flex-grow w-full">
                <h3 className="font-serif text-2xl italic text-primary">Kundalini School</h3>
                <div className="w-full h-[1px] bg-primary/20"></div>
                <p className="text-muted-foreground leading-relaxed text-balance text-sm max-w-sm mx-auto flex-grow">
                  A sacred online portal providing access to self-healing resources that enhance your spiritual journey through profound integration practices. If you resonate with my Instagram content, this is your next step toward a deeper connection with your soul.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 mt-auto">
                  <Link 
                    href="/kundalini-school" 
                    className="px-6 py-2 bg-primary text-white text-xs uppercase tracking-widest font-bold rounded-full hover:bg-primary/90 transition-all active:scale-95 text-center"
                  >
                    View Resources
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Resources Section */}
      <LatestResources />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-primary font-serif font-bold text-sm uppercase tracking-[0.2em] mb-4">
              TESTIMONIALS
            </p>
            <h2 className="font-serif text-4xl font-bold text-foreground sm:text-5xl mb-4 uppercase tracking-widest">
              What Our Clients Say
            </h2>
          </div>

          <TestimonialMasonry />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-4xl font-bold text-primary-foreground sm:text-5xl text-balance uppercase tracking-widest mb-6">
              Begin Your Transformation Today
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-10">
              Explore our library of self-paced healing resources and teachings to start your journey.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg rounded-full font-bold uppercase tracking-widest">
              <Link href="/kundalini-school">Explore Library</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
