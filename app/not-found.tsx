"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen px-4 bg-background text-foreground">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md text-center">
        <h1 className="text-9xl font-extrabold mb-4 text-foreground">404</h1>
        <p className="text-lg text-muted-foreground mb-6">Page not found</p>
        <div className="flex gap-4 justify-center items-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="h-10"
          >
            Go Back
          </Button>
          <Button asChild className="h-10">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
