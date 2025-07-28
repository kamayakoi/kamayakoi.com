"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { type EventParallaxData } from "@/lib/sanity/queries"

interface ParallaxGalleryProps {
    events: EventParallaxData[];
}

export default function ParallaxGallery({ events }: ParallaxGalleryProps) {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

    // Limit to 5 events max for parallax display and ensure we always have an array
    const displayEvents = events?.slice(0, 5) || []

    // Create individual transform hooks for each potential event slot (up to 5)
    const transform1 = useTransform(scrollYProgress, [0, 0.2], [-400, 400])
    const transform2 = useTransform(scrollYProgress, [0.2, 0.4], [-400, 400])
    const transform3 = useTransform(scrollYProgress, [0.4, 0.6], [-400, 400])
    const transform4 = useTransform(scrollYProgress, [0.6, 0.8], [-400, 400])
    const transform5 = useTransform(scrollYProgress, [0.8, 1], [-400, 400])

    const transforms = [transform1, transform2, transform3, transform4, transform5]

    const handleImageClick = (slug: string) => {
        if (slug) {
            router.push(`/events/${slug}`)
        }
    }

    if (displayEvents.length === 0) {
        return <div>No events available</div>
    }

    return (
        <div ref={containerRef} className="parallax-container">
            {displayEvents.map((event, index) => {
                return (
                    <section key={event._id} className="img-container">
                        <div>
                            <Image
                                src={event.featuredImage || "/placeholder.webp"}
                                alt={event.title}
                                width={300}
                                height={400}
                                className="event-image"
                                onClick={() => handleImageClick(event.slug)}
                                style={{ cursor: "pointer" }}
                                quality={85}
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                            />
                            <motion.h2
                                style={{
                                    y: transforms[index]
                                }}
                            >
                                #{event.number || String(index + 1).padStart(3, '0')}
                            </motion.h2>
                        </div>
                    </section>
                )
            })}

            <motion.div
                className="progress"
                style={{ width: progressWidth }}
            />

            <style jsx>{`
                :global(html) {
                    scroll-snap-type: y mandatory;
                }

                .parallax-container {
                    min-height: 500vh;
                }

                .img-container {
                    height: 100vh;
                    scroll-snap-align: start;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }

                .img-container > div {
                    width: 300px;
                    height: 400px;
                    margin: 20px;
                    background: #f5f5f5;
                    overflow: hidden;
                    position: relative;
                }

                .event-image {
                    width: 300px;
                    height: 400px;
                    object-fit: cover;
                }

                .img-container h2 {
                    color: var(--accent, #ff6b6b);
                    margin: 0;
                    font-family: "Azeret Mono", monospace;
                    font-size: 50px;
                    font-weight: 700;
                    letter-spacing: -3px;
                    line-height: 1.2;
                    position: absolute;
                    display: inline-block;
                    top: calc(50% - 25px);
                    left: calc(50% + 120px);
                }

                .progress {
                    position: fixed;
                    left: 0;
                    top: 0;
                    height: 5px;
                    background: var(--accent, #ff6b6b);
                    z-index: 1000;
                }
            `}</style>
        </div>
    )
}
