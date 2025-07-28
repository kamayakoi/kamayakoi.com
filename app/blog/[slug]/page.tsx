import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { CalendarDays, User, Tag } from "lucide-react";

import { getBlogPostBySlug } from "@/lib/sanity/queries";
import { Separator } from "@/components/ui/separator";
import LoadingComponent from "@/components/ui/loader";

interface Category {
  title: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Kamayakoi Blog`,
    description: post.excerpt,
  };
}

async function BlogPostContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

      <div className="flex flex-wrap gap-4 text-muted-foreground mb-8">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
        {post.author && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{post.author.name}</span>
          </div>
        )}
        {post.categories && post.categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>
              {post.categories.map((cat: Category) => cat.title).join(", ")}
            </span>
          </div>
        )}
      </div>

      {post.excerpt && (
        <p className="text-lg text-muted-foreground mb-8">{post.excerpt}</p>
      )}

      {post.mainImage && (
        <div className="relative aspect-video mb-8 rounded-sm overflow-hidden">
          <Image
            src={post.mainImage.url}
            alt={post.mainImage.alt || post.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      <Separator className="my-8" />

      <div className="bg-muted p-6 rounded-sm">
        <div className="prose prose-lg max-w-none">
          <PortableText value={post.body} />
        </div>
      </div>
    </article>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <BlogPostContent params={params} />
    </Suspense>
  );
}

// Optional: Generate static paths
// export async function generateStaticParams() {
//   const posts = await getAllBlogPosts();
//   return posts.map((post: any) => ({ slug: post.slug?.current || post.slug }));
// }
