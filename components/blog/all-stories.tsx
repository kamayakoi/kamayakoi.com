"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface Story {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    publishedAt: string;
    author?: {
        name: string;
    };
    mainImage?: {
        url: string;
        alt?: string;
    };
    categories?: {
        title: string;
    }[];
}

interface AllStoriesProps {
    stories: Story[];
    heading?: string;
}

const AllStories = ({ stories, heading = "All Stories" }: AllStoriesProps) => {
    if (!stories || stories.length === 0) {
        return (
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-8 h-0.5 bg-primary mr-4"></div>
                        <h2 className="text-primary text-lg font-medium tracking-wide">{heading.toUpperCase()}</h2>
                    </div>
                    <p className="text-muted-foreground">No stories available yet.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                {/* Header with accent line */}
                <div className="flex items-center justify-center mb-12">
                    <div className="w-8 h-0.5 bg-primary mr-4"></div>
                    <h2 className="text-primary text-lg font-medium tracking-wide">{heading.toUpperCase()}</h2>
                </div>

                {/* Stories List */}
                <div className="space-y-8">
                    {stories.map((story) => (
                        <Link key={story._id} href={`/stories/${story.slug}`}>
                            <article className="group cursor-pointer">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                                            <Image
                                                src={story.mainImage?.url || "/placeholder.webp"}
                                                alt={story.mainImage?.alt || story.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                quality={90}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex flex-col justify-center">
                                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                                            <span>{format(new Date(story.publishedAt), "MMM d, yyyy")}</span>
                                            <span className="mx-2">•</span>
                                            <span className="uppercase tracking-wide">
                                                {story.categories?.[0]?.title || "Story"}
                                            </span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                                            {story.title}
                                        </h3>
                                        <p className="text-muted-foreground mb-4 line-clamp-3">
                                            {story.excerpt}
                                        </p>
                                        {story.author && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                <span>By {story.author.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}

                    {/* Load More Button */}
                    <div className="flex justify-center pt-8">
                        <Button
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                        >
                            Load More Stories
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AllStories;
