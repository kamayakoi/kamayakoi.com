import type { Metadata } from "next";
import { Suspense } from "react";
import PrivacyClientPage from "./privacy-client";
import LoadingComponent from "@/components/ui/loader";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Learn how Kamayakoi protects and manages your personal information in accordance with our privacy practices.",
};

export default function Page() {
    return (
        <Suspense fallback={<LoadingComponent />}>
            <PrivacyClientPage />
        </Suspense>
    );
} 