"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";

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

interface FeaturedStoriesProps {
    stories: Story[];
}

const FeaturedStories = ({ stories }: FeaturedStoriesProps) => {
    if (!stories || stories.length === 0) {
        return null;
    }

    const featuredStory = stories[0];
    const otherStories = stories.slice(1, 4); // Get next 3 stories

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Featured Story */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden h-full group hover:shadow-lg transition-shadow">
                            <div className="relative h-80 md:h-96 overflow-hidden">
                                <Image
                                    src={featuredStory.mainImage?.url || "/placeholder.webp"}
                                    alt={featuredStory.mainImage?.alt || featuredStory.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    quality={90}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>
                            <CardContent className="p-6">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {featuredStory.categories?.slice(0, 2).map((category, index) => (
                                        <Badge key={index} variant="secondary">
                                            {category.title}
                                        </Badge>
                                    ))}
                                </div>

                                <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {featuredStory.title}
                                </h3>

                                <p className="text-muted-foreground mb-4 line-clamp-3">
                                    {featuredStory.excerpt}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{format(new Date(featuredStory.publishedAt), "MMM d, yyyy")}</span>
                                    </div>
                                    {featuredStory.author && (
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span>{featuredStory.author.name}</span>
                                        </div>
                                    )}
                                </div>

                                <Button asChild className="group-hover:translate-x-1 transition-transform">
                                    <Link href={`/stories/${featuredStory.slug}`} className="flex items-center gap-2">
                                        Read Full Story
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Other Stories */}
                    <div className="space-y-6">
                        {otherStories.map((story) => (
                            <Card key={story._id} className="overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={story.mainImage?.url || "/placeholder.webp"}
                                        alt={story.mainImage?.alt || story.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        quality={90}
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {story.categories?.slice(0, 2).map((category, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {category.title}
                                            </Badge>
                                        ))}
                                    </div>

                                    <h4 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                        {story.title}
                                    </h4>

                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {story.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(story.publishedAt), "MMM d")}
                                        </span>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/stories/${story.slug}`} className="flex items-center gap-1">
                                                Read
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedStories;
