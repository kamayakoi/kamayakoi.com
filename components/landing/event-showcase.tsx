import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const showcaseEvents = [
    {
        title: "TINASHE + FRIENDS",
        description: "Buckle up! This summer saw a very special KK debut from super-starlet, Tinashe.",
        image: "/placeholder.webp",
        date: "Summer 2024"
    },
    {
        title: "NEPAL",
        description:
            "The third stop of our South Asia tour with Dialled In: Nepal. Channeling the free-spirited hill gatherings of Kathmandu's early 00s psytrance scene...",
        image: "/placeholder.webp",
        date: "March 2024"
    },
    {
        title: "PAKISTAN",
        description:
            "The third stop of our South Asia tour with Dialled In: Lahore, Pakistan. For our debut in Lahore, we showcased the city's off-grid party underground...",
        image: "/placeholder.webp",
        date: "February 2024"
    },
    {
        title: "SRI LANKA",
        description:
            "The second stop of our South Asia tour with Dialled In: Colombo, Sri Lanka. Our first time in Sri Lanka, KK's debut in Colombo took place at the city's...",
        image: "/placeholder.webp",
        date: "January 2024"
    },
    {
        title: "KENYA",
        description: "Our first East African adventure brought us to Nairobi where we connected with the vibrant underground music scene.",
        image: "/placeholder.webp",
        date: "December 2023"
    },
    {
        title: "INDIA",
        description: "From Mumbai's bustling streets to Delhi's historic venues, our Indian tour showcased the diversity of South Asian music culture.",
        image: "/placeholder.webp",
        date: "November 2023"
    },
];

export function EventShowcase() {
    return (
        <section className="py-20 md:py-28 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with navigation */}
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-6">
                        <div className="w-1 h-12 bg-white"></div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                                Featured Events
                            </h2>
                            <p className="text-white/70 text-lg">Past performances and highlights</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-2 border-white text-white hover:bg-white hover:text-black w-12 h-12 transition-all duration-300"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-2 border-white text-white hover:bg-white hover:text-black w-12 h-12 transition-all duration-300"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Events Horizontal Scroll */}
                <div className="overflow-hidden">
                    <div className="flex gap-8 pb-4 overflow-x-auto scrollbar-hide">
                        {showcaseEvents.map((event, index) => (
                            <div key={index} className="group cursor-pointer bg-black dark:bg-[#2A2522] rounded-sm overflow-hidden hover:shadow-2xl transition-all duration-500 border border-white/10 hover:border-white/30 flex-shrink-0 w-80 md:w-96">
                                <div className="relative">
                                    <div className="relative h-80 md:h-96 bg-gray-800">
                                        <Image
                                            src={event.image || "/placeholder.webp"}
                                            alt={event.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            quality={90}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 flex flex-col h-64">
                                    <h3 className="text-xl md:text-2xl font-black text-white mb-4 leading-tight flex-grow">
                                        {event.title}
                                    </h3>
                                    <p className="text-white/70 text-base leading-relaxed mb-6 flex-grow">
                                        {event.description.split('.')[0] + '.'}
                                    </p>
                                    <div className="flex justify-end">
                                        <span className="text-white font-black text-sm tracking-widest uppercase group-hover:text-white/80 transition-colors cursor-pointer">
                                            VIEW EVENT →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* View All Button */}
                <div className="text-center mt-20">
                    <Button
                        className="bg-white text-black hover:bg-black hover:text-white border-2 border-white font-black px-12 py-4 text-xl tracking-wide transition-all duration-300"
                    >
                        View All Events
                    </Button>
                </div>
            </div>
        </section>
    );
}
