"use client";

import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { Calendar, User, Facebook, Twitter, Share2 } from "lucide-react";
import Tag from "@/components/blog/tag";

interface PortableTextBlock {
    _type: string;
    _key: string;
    children: Array<{
        _type: string;
        _key: string;
        text: string;
        marks?: string[];
    }>;
}

interface MockStory {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
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
    body?: PortableTextBlock[];
}

interface StoryClientProps {
    post: MockStory;
    slug: string;
}

export default function StoryClient({ post, slug }: StoryClientProps) {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/stories/${slug}` : `/stories/${slug}`;

    const handleShare = async (platform?: string) => {
        if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank');
        } else {
            // Generic share or copy to clipboard
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: post.title,
                        url: shareUrl,
                    });
                } catch {
                    navigator.clipboard.writeText(shareUrl);
                }
            } else {
                navigator.clipboard.writeText(shareUrl);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section with Cover Image */}
            {post.mainImage && (
                <div className="relative h-96 md:h-[60vh] w-full overflow-hidden">
                    <Image
                        src={post.mainImage.url}
                        alt={post.mainImage.alt || post.title}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />

                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Social Sharing Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="sticky top-8">
                            <div className="flex lg:flex-col gap-4 justify-center lg:justify-start mb-8">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide hidden lg:block mb-2">Share</span>
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                                    aria-label="Share on Twitter"
                                >
                                    <Twitter className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleShare()}
                                    className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                                    aria-label="Share story"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Advertisement Space */}
                            <div className="bg-muted border border-border rounded-lg p-6 text-center mb-8">
                                <div className="text-2xl font-bold mb-2 text-primary">AD</div>
                                <p className="text-sm text-muted-foreground mb-4">Your advertisement here</p>
                                <p className="text-xs text-muted-foreground">Contact us for advertising opportunities</p>
                            </div>

                            {/* Story Metadata */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                {post.author && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span>{post.author.name}</span>
                                    </div>
                                )}
                                {post.categories && post.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {post.categories.map((category: { title: string }, index: number) => (
                                            <Tag key={index} text={category.title} variant="outline" size="sm" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        <article>
                            {/* Article Header */}
                            <header className="mb-8">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6">
                                    {post.title}
                                </h1>

                                {post.excerpt && (
                                    <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                                        {post.excerpt}
                                    </p>
                                )}
                            </header>

                            {/* Article Content */}
                            <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-primary prose-code:text-primary prose-pre:bg-muted">
                                {post.body ? (
                                    <PortableText value={post.body} />
                                ) : (
                                    <div className="space-y-6">
                                        <p className="text-muted-foreground leading-relaxed text-lg">
                                            {post.excerpt}
                                        </p>
                                        <p className="text-muted-foreground leading-relaxed">
                                            This is placeholder content for the story. In a real implementation, this would be rich text content from your CMS.
                                        </p>
                                        <div className="my-8">
                                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                                <p className="text-muted-foreground">Story image placeholder</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Image caption would appear here in a real implementation.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </article>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 order-3">
                        <div className="sticky top-8">
                            {/* Related Stories */}
                            <div className="mb-8">
                                <div className="flex items-center mb-6">
                                    <div className="w-8 h-0.5 bg-primary mr-4"></div>
                                    <h3 className="text-primary text-lg font-medium tracking-wide">RELATED STORIES</h3>
                                </div>
                                <div className="space-y-4">
                                    <article className="group cursor-pointer border-b border-border pb-4 last:border-b-0">
                                        <h4 className="text-sm font-medium group-hover:text-primary transition-colors leading-tight mb-2">
                                            The Birth of Kamayakoi: A Journey Through Sound
                                        </h4>
                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                    </article>
                                    <article className="group cursor-pointer border-b border-border pb-4 last:border-b-0">
                                        <h4 className="text-sm font-medium group-hover:text-primary transition-colors leading-tight mb-2">
                                            Behind the Decks: Meet Our Resident DJs
                                        </h4>
                                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                                    </article>
                                    <article className="group cursor-pointer border-b border-border pb-4 last:border-b-0">
                                        <h4 className="text-sm font-medium group-hover:text-primary transition-colors leading-tight mb-2">
                                            Festival Season: Kamayakoi Takes the Stage
                                        </h4>
                                        <p className="text-xs text-muted-foreground">1 day ago</p>
                                    </article>
                                </div>
                            </div>

                            {/* Newsletter Signup */}
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                                <h4 className="font-bold mb-3">Stay Updated</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Get the latest stories and updates from Kamayakoi delivered to your inbox.
                                </p>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm mb-3"
                                />
                                <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
