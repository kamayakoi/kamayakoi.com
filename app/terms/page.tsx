import type { Metadata } from "next";
import TermsClientPage from "./terms-client";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Understand the Terms and Conditions for engaging with Kamayakoi, Abidjan's pioneering alternative Hip-Hop & Electronic music collective and event organizer.",
};

export default function Page() {
  return <TermsClientPage />;
}
