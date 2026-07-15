import Link from "next/link"
import Image from "next/image"

export default function ServicesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-primary/5">

            {/* Hero / Header */}
            <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-serif text-3xl font-bold text-primary sm:text-4xl text-balance uppercase tracking-widest mb-6">
                        Ways to Connect with Soulhome
                    </h1>
                </div>

                <div className="grid md:grid-cols-2 gap-16 md:gap-8 max-w-5xl mx-auto mt-16">
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
                                    className="px-6 py-2 bg-primary text-white text-xs uppercase tracking-widest font-bold rounded-full hover:bg-primary/90 transition-all active:scale-95"
                                >
                                    BOOK HERE
                                </Link>
                                <Link 
                                    href="/live-sessions" 
                                    className="px-6 py-2 border border-primary text-primary text-xs uppercase tracking-widest font-bold rounded-full hover:bg-primary/5 transition-all"
                                >
                                    Learn more
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Self-Healing Portal */}
                    <div className="flex flex-col items-center text-center space-y-6 h-full">
                        <div className="relative aspect-square w-full max-w-[300px] rounded-full overflow-hidden shadow-xl border-4 border-white">
                            <Image
                                src="/school (1).jpg"
                                alt="Self-Healing Portal"
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
                                    Explore Library
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
