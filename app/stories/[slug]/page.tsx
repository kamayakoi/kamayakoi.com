import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/sanity/queries";
import LoadingComponent from "@/components/ui/loader";
import Header from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import StoryClient from "./story-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return {
        title: "Story Not Found",
      };
    }

    return {
      title: `${post.title} | Stories | Kamayakoi`,
      description: post.excerpt,
    };
  } catch {
    return {
      title: "Story Not Found",
    };
  }
}

async function StoryPage({ params }: PageProps) {
  try {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      notFound();
    }

    return (
      <div className="min-h-screen">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main>
          <Suspense fallback={<LoadingComponent />}>
            <StoryClient post={post} slug={slug} />
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    );
  } catch {
    notFound();
  }
}

export default StoryPage;
