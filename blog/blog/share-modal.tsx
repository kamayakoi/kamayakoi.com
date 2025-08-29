// src/components/blog/ShareModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Assuming shadcn dialog
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon as TwitterIcon } from "@/components/icons/XIcon"; // Use your XIcon
import { WhatsappIcon } from "@/components/icons/WhatsappIcon"; // Use custom WhatsApp icon
import { LinkedInIcon } from "@/components/icons/LinkedInIcon"; // Use custom LinkedIn icon
import {
  Facebook,
  Send as Telegram,
  Mail,
  Copy,
  Share2,
  Check,
} from "lucide-react"; // Removed lucide LinkedIn
import { useTranslation } from "react-i18next";
import { useToast } from "@/lib/hooks/use-toast"; // Added useToast
import { openMailto } from "@/lib/actions/email-utils"; // Import openMailto

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast(); // Initialize toast

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // Updated base classes: removed opacity transition, added color transition
  const baseButtonClasses =
    "flex items-center justify-start gap-2 text-left h-12 rounded-[5px] text-white transition-colors duration-200";

  const shareOptions = [
    {
      name: "Twitter",
      icon: <TwitterIcon className="h-5 w-5" />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      className: `${baseButtonClasses} bg-black hover:bg-zinc-800 dark:bg-black dark:text-white dark:hover:bg-black`,
    },
    {
      name: "LinkedIn",
      icon: <LinkedInIcon className="h-5 w-5" />,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      className: `${baseButtonClasses} bg-[#0A66C2] hover:bg-[#0855A0] dark:bg-[#0A66C2] dark:hover:bg-[#0E76D8]`,
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: `${baseButtonClasses} bg-[#1877F2] hover:bg-[#166FE5] dark:bg-[#1877F2] dark:hover:bg-[#3B82F6]`,
    },
    {
      name: "WhatsApp",
      icon: <WhatsappIcon className="h-5 w-5" />,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      className: `${baseButtonClasses} bg-[#128C7E] hover:bg-[#075E54] dark:bg-[#128C7E] dark:hover:bg-[#075E54]`,
    },
    {
      name: "Telegram",
      icon: <Telegram className="h-5 w-5" />,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      className: `${baseButtonClasses} bg-[#26A5E4] hover:bg-[#1E88C8] dark:bg-[#26A5E4] dark:hover:bg-[#3BADEF]`,
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      onClick: () =>
        openMailto("", encodedTitle, `Check out this post: ${encodedUrl}`),
      className: `${baseButtonClasses} bg-gray-500 hover:bg-gray-600 dark:bg-zinc-700 dark:hover:bg-zinc-900`,
    },
  ];

  const handleCopy = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        toast({
          title: t("blog.copiedTitle", "Link copied"),
          description: t(
            "blog.copiedDesc",
            "The link has been copied to your clipboard.",
          ),
          variant: "success",
        });
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: t("blog.copyErrorTitle", "Copy failed"),
          description: t(
            "blog.copyErrorDesc",
            "Could not copy link to clipboard.",
          ),
          variant: "default",
        });
      });
  };

  React.useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-4 rounded-[5px] border border-border/40 bg-background backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />{" "}
            {t("blog.shareTitle", "Share this post")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "blog.shareDescription",
              "Share this blog post on your favorite platforms.",
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          {shareOptions.map((option) =>
            option.onClick ? (
              <Button
                key={option.name}
                variant="default"
                className={option.className}
                onClick={option.onClick} // Use onClick handler
              >
                {option.icon}
                <span>{option.name}</span>
              </Button>
            ) : (
              <Button
                key={option.name}
                variant="default"
                className={option.className}
                asChild
              >
                <a href={option.url} target="_blank" rel="noopener noreferrer">
                  {option.icon}
                  <span>{option.name}</span>
                </a>
              </Button>
            ),
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 -mt-2">
          <div className="flex items-center space-x-2 flex-1">
            <Input
              id="link"
              value={url}
              readOnly
              className="flex-1 rounded-[5px]"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleCopy}
              className="rounded-[5px] hover:bg-accent/30"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">
                {copied
                  ? t("blog.copied", "Copied")
                  : t("blog.copyLink", "Copy link")}
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
