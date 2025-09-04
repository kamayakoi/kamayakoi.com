import { client } from "./client";

// Events
export async function getLatestEvents(limit = 3) {
  return client.fetch(
    `
    *[_type == "event" && dateTime(date) >= dateTime(now())] | order(date asc) [0...$limit] {
      _id,
      title,
      slug,
      date,
      "date": dateTime(date),
      "time": coalesce(time, "TBD"),
      "location": coalesce(location, "TBD"),
      "flyer": {
        "url": flyer.asset->url
      },
      ticketsAvailable
    }
  `,
    { limit },
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ["events"],
      },
    },
  );
}

export const getAllEvents = async (): Promise<Event[]> => {
  const query = `*[_type == "event"] | order(date desc) {
    _id,
    title,
    "slug": slug.current,
    date,
    time,
    location,
    "flyer": flyer.asset->{url},
    ticketsAvailable
  }`;
  return await client.fetch(query);
};

export async function getEventBySlug(slug: string, locale: string) {
  const event = await client.fetch(
    `
    *[_type == "event" && slug.current == $slug][0] {
      _id,
      title,
      subtitle,
      slug,
      date,
      "dateFormatted": dateTime(date),
      "time": coalesce(time, "TBD"),
      "location": location,
      "flyer": {
        "url": flyer.asset->url
      },
      "promoVideoUrl": promoVideo.asset->url,
      "description": coalesce(description[$locale], description.en),
      "venueDetails": coalesce(venueDetails[$locale], venueDetails.en),
      hostedBy,
      ticketsAvailable,
      paymentLink,
      paymentProductId,
      ticketTypes[]{
        _key,
        name,
        price,
        description,
        details,
        stock,
        maxPerOrder,
        paymentLink,
        salesStart,
        salesEnd,
        active,
        productId
      },
      lineup[]->{
        _id,
        name,
        bio,
        description,
        "image": image.asset->url,
        "videoUrl": video.asset->url,
        "videoCaption": video.caption,
        socialLink,
        socialHandle,
        isResident,
        role
      },
      gallery[]{
        _key,
        "url": asset->url,
        "caption": caption
      },
      bundles[]{
        _key,
        name,
        bundleId,
        price,
        description,
        details,
        stock,
        active,
        paymentLink,
        salesStart,
        salesEnd,
        maxPerOrder,
        productId,
        ticketsIncluded
      }
    }
  `,
    { slug, locale },
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: [`event-${slug}`, "events"],
      },
    },
  );

  return event;
}

// Stories (using post schema)
export async function getLatestBlogPosts(limit = 2) {
  return client.fetch(
    `
    *[_type == "post"] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      title_fr,
      "slug": slug.current,
      publishedAt,
      excerpt,
      excerpt_fr,
      "tags": tags,
      "languages": languages,
      "image": image {
        asset->,
        alt,
        caption
      },
      "mainImage": image {
        asset->,
        alt,
        caption
      },
      "category": category,
      "categories": categories[] {
        _id,
        title,
        slug
      },
      "author": author->{
        _id,
        name,
        "image": image{
          asset->,
          alt
        },
        bio,
        role
      }
    }
  `,
    { limit },
  );
}

export async function getAllBlogPosts() {
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      title_fr,
      "slug": slug.current,
      publishedAt,
      excerpt,
      excerpt_fr,
      "tags": tags,
      "languages": languages,
      "image": image {
        asset->,
        alt,
        caption
      },
      "mainImage": image {
        asset->,
        alt,
        caption
      },
      "category": category,
      "categories": categories[] {
        _id,
        title,
        slug
      },
      "author": author->{
        _id,
        name,
        "image": image{
          asset->,
          alt
        },
        bio,
        role
      },
      body
    }
  `);
}

export async function getBlogPostBySlug(slug: string) {
  const post = await client.fetch(
    `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      title_fr,
      title_es,
      title_pt,
      title_zh,
      "slug": slug.current,
      publishedAt,
      excerpt,
      excerpt_fr,
      excerpt_es,
      excerpt_pt,
      excerpt_zh,
      "tags": tags,
      "languages": languages,
      "image": image {
        asset->,
        alt,
        caption
      },
      "mainImage": image {
        asset->,
        alt,
        caption
      },
      "category": category,
      "categories": categories[] {
        _id,
        title,
        slug
      },
      "author": author->{
        _id,
        name,
        "image": image{
          asset->,
          alt
        },
        bio,
        role
      },
      body,
      body_fr,
      body_es,
      body_pt,
      body_zh
    }
  `,
    { slug },
  );

  return post;
}

// Get featured post (latest featured post)
export async function getFeaturedPost() {
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc)[0] {
      _id,
      title,
      title_fr,
      "slug": slug.current,
      publishedAt,
      excerpt,
      excerpt_fr,
      "tags": tags,
      "languages": languages,
      "image": image {
        asset->,
        alt,
        caption
      },
      "mainImage": image {
        asset->,
        alt,
        caption
      },
      "category": category,
      "categories": categories[] {
        _id,
        title,
        slug
      },
      "author": author->{
        _id,
        name,
        "image": image{
          asset->,
          alt
        },
        bio,
        role
      },
      body
    }
  `);
}

// Get related posts (posts with same tags or categories)
export async function getRelatedPosts(
  currentSlug: string,
  tags: string[] = [],
  limit = 3,
) {
  if (!tags || tags.length === 0) {
    return client.fetch(
      `
      *[_type == "post" && slug.current != $currentSlug] | order(publishedAt desc)[0...${limit}] {
        _id,
        title,
        title_fr,
        "slug": slug.current,
        publishedAt,
        excerpt,
        excerpt_fr,
        "tags": tags,
        "languages": languages,
        "image": image {
          asset->,
          alt,
          caption
        },
        "mainImage": image {
          asset->,
          alt,
          caption
        },
        "category": category,
        "categories": categories[] {
          _id,
          title,
          slug
        },
        "author": author->{
          _id,
          name,
          "image": image{
            asset->,
            alt
          },
          bio,
          role
        }
      }
    `,
      { currentSlug },
    );
  }

  return client.fetch(
    `
    *[_type == "post" && slug.current != $currentSlug && count(tags[@ in $tags]) > 0] | order(publishedAt desc)[0...${limit}] {
      _id,
      title,
      title_fr,
      "slug": slug.current,
      publishedAt,
      excerpt,
      excerpt_fr,
      "tags": tags,
      "languages": languages,
      "image": image {
        asset->,
        alt,
        caption
      },
      "mainImage": image {
        asset->,
        alt,
        caption
      },
      "category": category,
      "categories": categories[] {
        _id,
        title,
        slug
      },
      "author": author->{
        _id,
        name,
        "image": image{
          asset->,
          alt
        },
        bio,
        role
      }
    }
  `,
    { currentSlug, tags },
  );
}

// Story
export async function getFeaturedStory() {
  return client.fetch(`
    *[_type == "story" && featured == true][0] {
      _id,
      title,
      subtitle,
      "mainImage": {
        "url": mainImage.asset->url
      },
      content
    }
  `);
}

export async function getStory() {
  return client.fetch(
    `*[_type == "story"][0]{
      title,
      subtitle,
      content,
      "image": mainImage.asset->{
        "url": url,
        "alt": alt
      }
    }`,
  );
}

// Products (New Section)
export async function getAllProducts() {
  return client.fetch(`
    *[_type == "product"] | order(name asc) {
      _id,
      name,
      slug,
      productId,
      "mainImage": images[0].asset->url, // Get the first image URL
      "price": basePrice,
      "stock": baseStock,
      description,
      images[]{
        asset->{
          url,
          metadata {
            dimensions,
            lqip
          }
        },
        alt,
        caption
      }
    }
  `);
}

export async function getProductBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      productId,
      description,
      "images": images[]{
        asset->{
          url,
          metadata {
            dimensions,
            lqip // Low Quality Image Placeholder
          }
        },
        alt,
        caption
      },
      "price": basePrice,
      "stock": baseStock,
      manageVariants,
      variantOptions,
      variantInventory,
      categories[]->{title, slug},
      tags,
      requiresShipping,
      weight,
      dimensions
    }
  `,
    { slug },
  );
}

// Define interface for the data returned by getEventsForScroller
interface EventScrollerData {
  _id: string;
  title: string;
  slug: string;
  featuredImage: string; // Matches the alias in the query
  date?: string; // Matches the optional date field in the query
  description?: string; // Add description field
  ticketsAvailable?: boolean; // <-- Add this field
}

// Define interface for parallax gallery data - export for use in components
export interface EventParallaxData {
  _id: string;
  title: string;
  slug: string;
  featuredImage: string;
  promoVideoUrl?: string; // Add video URL support
  number?: string; // Event number for parallax display
  date?: string;
  description?: string;
  ticketsAvailable?: boolean;
}

// New query for ImageScroller
export const getEventsForScroller = async (
  limit = 10,
): Promise<EventScrollerData[]> => {
  // Use the specific interface
  const query = `*[_type == "event"] | order(date desc) [0...$limit] {
    _id,
    title,
    "slug": slug.current,
    "featuredImage": flyer.asset->url, // Alias flyer URL as featuredImage
    date, // Keep date for potential use in scroller UI
    description, // Fetch the description
    ticketsAvailable // <-- Add this field to the query
    // Add other fields if ImageScroller is adapted to show them
  }`;
  // Use the specific interface in the fetch call as well for better type safety
  return await client.fetch<EventScrollerData[]>(query, { limit });
};

// New query for Parallax Gallery
export const getEventsForParallax = async (
  limit = 5,
): Promise<EventParallaxData[]> => {
  const query = `*[_type == "event"] | order(number desc, date desc) [0...$limit] {
    _id,
    title,
    "slug": slug.current,
    "featuredImage": flyer.asset->url,
    "promoVideoUrl": promoVideo.asset->url,
    number,
    date,
    description,
    ticketsAvailable
  }`;
  return await client.fetch<EventParallaxData[]>(query, { limit });
};

// ================================= Homepage ================================

// Interface for music track data
export interface MusicTrack {
  title: string;
  artist?: string;
  audioUrl: string;
  coverImageUrl?: string;
}

// Fetch music tracks from the singleton homepage document
export const getHomepageMusicTracks = async (): Promise<MusicTrack[]> => {
  try {
    // Query the single document of type 'homepage'
    // Select the music tracks with their audio files and cover images
    const query = `*[_type == "homepage"][0] {
      "musicTracks": musicTracks[]{
        title,
        artist,
        "audioUrl": audioFile.asset->url,
        "coverImageUrl": coverImage.asset->url
      }
    }`;

    const result = await client.fetch<{ musicTracks?: MusicTrack[] }>(
      query,
      {},
      {
        next: {
          revalidate: 7200, // Cache for 2 hours
          tags: ["homepage", "music"],
        },
      },
    );

    // Handle case when no homepage document exists or no musicTracks field
    if (!result || !result.musicTracks) {
      return [];
    }

    return result.musicTracks.filter((track) => track.audioUrl) ?? [];
  } catch (error) {
    console.error("Error fetching homepage music tracks:", error);
    // Return empty array instead of throwing error to prevent app crash
    return [];
  }
};

// ================================= Artists ================================

// Interface for artist data
export interface ArtistData {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  videoCaption?: string;
  socialLink?: string;
  socialHandle?: string;
  isResident: boolean;
  role?: string;
}

// Fetch all artists
export const getAllArtists = async (): Promise<ArtistData[]> => {
  const query = `*[_type == "artist"] | order(isResident desc, name asc) {
    _id,
    name,
    "slug": slug.current,
    bio,
    description,
    "imageUrl": image.asset->url,
    "videoUrl": video.asset->url,
    "videoCaption": video.caption,
    socialLink,
    socialHandle,
    isResident,
    role
  }`;
  return await client.fetch<ArtistData[]>(
    query,
    {},
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ["artists"],
      },
    },
  );
};

// Fetch artist by slug
export const getArtistBySlug = async (
  slug: string,
): Promise<ArtistData | null> => {
  const query = `*[_type == "artist" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    bio,
    description,
    "imageUrl": image.asset->url,
    "videoUrl": video.asset->url,
    "videoCaption": video.caption,
    socialLink,
    socialHandle,
    isResident,
    role
  }`;
  return await client.fetch<ArtistData | null>(
    query,
    { slug },
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: [`artist-${slug}`, "artists"],
      },
    },
  );
};

// ================================= Homepage Promo Event ================================
interface HomepagePromoEventData {
  slug?: string;
  flyerUrl?: string;
  title?: string; // Added for potential use, e.g. alt text or title attribute
}

export const getHomepagePromoEvent =
  async (): Promise<HomepagePromoEventData | null> => {
    const query = `*[_type == "homepage"][0] {
    promoEvent->{
      "slug": slug.current,
      "flyerUrl": flyer.asset->url,
      title
    }
  }`;
    const result = await client.fetch<{ promoEvent?: HomepagePromoEventData }>(
      query,
      {},
      {
        next: {
          revalidate: 3600, // Cache for 1 hour
          tags: ["homepage", "events"],
        },
      },
    );
    return result?.promoEvent ?? null;
  };

// ================================= Homepage Content ================================

// Interface for homepage hero content
export interface HomepageHeroItem {
  _key: string;
  title?: string;
  description?: string;
  type: "image" | "video";
  image?: {
    asset: { url: string };
    alt?: string;
    caption?: string;
  };
  video?: {
    asset: { url: string };
  };
  videoUrl?: string;
  isActive: boolean;
}

// Interface for article data
export interface FeaturedArticle {
  _id: string;
  title: string;
  title_fr?: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  excerpt: string;
  excerpt_fr?: string;
  image: {
    asset: {
      url: string;
    };
  };
  author: {
    _id: string;
    name: string;
    image: {
      asset: {
        url: string;
      };
    };
    bio: string;
  };
}

// Interface for media data
export interface FeaturedMedia {
  _id: string;
  title: string;
  type: string;
  url: string;
  description?: string;
  thumbnail: {
    asset: {
      url: string;
    };
  };
  duration?: string;
  artist?: string;
  genre?: string;
  isFeatured: boolean;
  tags?: string[];
  publishedAt?: string;
}

// Interface for event data
export interface ShowcaseEvent {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  date?: string;
  time?: string;
  location?: string;
  flyer: {
    asset: {
      url: string;
    };
  };
  ticketsAvailable: boolean;
  description?: string;
}

// Interface for highlighted content item (raw from Sanity query)
export interface HighlightedContentRaw {
  _key: string;
  contentType: "article" | "media" | "event" | "video";
  isActive: boolean;
  article?: FeaturedArticle;
  media?: FeaturedMedia;
  event?: ShowcaseEvent;
  customVideo?: {
    title: string;
    description?: string;
    videoUrl: string;
    thumbnail: {
      asset: {
        url: string;
      };
    };
  };
}

// Interface for highlighted content item (processed)
export interface HighlightedContentItem {
  _id: string;
  type: "article" | "media" | "event" | "video";
  title: string;
  description?: string;
  image?: string;
  videoUrl?: string;
  slug?: string;
  publishedAt?: string;
  artist?: string;
  date?: string;
  author?: {
    name: string;
    image?: string;
  };
}

// Interface for homepage data
export interface HomepageData {
  heroContent?: HomepageHeroItem[];
  featuredArticles?: FeaturedArticle[];
  featuredMedia?: FeaturedMedia[];
  showcaseEvents?: ShowcaseEvent[];
  highlightedContent?: HighlightedContentRaw[];
  highlightedContentProcessed?: HighlightedContentItem[];
}

// Fetch homepage content
export const getHomepageContent = async (): Promise<HomepageData | null> => {
  const query = `*[_type == "homepage"][0] {
    heroContent[]{
      _key,
      title,
      description,
      type,
      image{
        asset->{url},
        alt,
        caption
      },
      video{
        asset->{url}
      },
      videoUrl,
      isActive
    },
    highlightedContent[]{
      _key,
      contentType,
      isActive,
      article->{
        _id,
        title,
        excerpt,
        "slug": slug.current,
        publishedAt,
        "image": image.asset->url,
        "author": author->{
          name,
          "image": image.asset->url
        }
      },
      media->{
        _id,
        title,
        description,
        url,
        "image": thumbnail.asset->url,
        artist,
        publishedAt
      },
      event->{
        _id,
        title,
        description,
        "slug": slug.current,
        date,
        "image": flyer.asset->url
      },
      customVideo{
        title,
        description,
        videoUrl,
        "image": thumbnail.asset->url
      }
    },
    featuredArticles[]->{
      _id,
      title,
      title_fr,
      "slug": slug.current,
      publishedAt,
      excerpt,
      excerpt_fr,
      "image": image.asset->url,
      "author": author->{
        _id,
        name,
        "image": image.asset->url,
        bio
      }
    },
    featuredMedia[]->{
      _id,
      title,
      type,
      url,
      description,
      "thumbnail": thumbnail.asset->url,
      duration,
      artist,
      genre,
      isFeatured,
      tags,
      publishedAt
    },
    showcaseEvents[]->{
      _id,
      title,
      "slug": slug.current,
      date,
      time,
      location,
      "flyer": flyer.asset->url,
      ticketsAvailable,
      description
    }
  }`;

  const result = await client.fetch<HomepageData | null>(
    query,
    {},
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ["homepage"],
      },
    },
  );

  // Transform highlighted content into processed format
  if (result?.highlightedContent) {
    const processedHighlightedContent = result.highlightedContent
      .filter((item: HighlightedContentRaw) => item.isActive)
      .map((item: HighlightedContentRaw): HighlightedContentItem | null => {
        switch (item.contentType) {
          case "article":
            return item.article
              ? {
                  _id: item.article._id,
                  type: "article" as const,
                  title: item.article.title,
                  description: item.article.excerpt,
                  image: item.article.image?.asset?.url,
                  slug: item.article.slug.current,
                  publishedAt: item.article.publishedAt,
                  author: {
                    name: item.article.author.name,
                    image: item.article.author.image?.asset?.url,
                  },
                }
              : null;
          case "media":
            return item.media
              ? {
                  _id: item.media._id,
                  type: "media" as const,
                  title: item.media.title,
                  description: item.media.description,
                  image: item.media.thumbnail?.asset?.url,
                  videoUrl: item.media.url,
                  artist: item.media.artist,
                  publishedAt: item.media.publishedAt,
                }
              : null;
          case "event":
            return item.event
              ? {
                  _id: item.event._id,
                  type: "event" as const,
                  title: item.event.title,
                  description: item.event.description,
                  image: item.event.flyer?.asset?.url,
                  slug: item.event.slug.current,
                  date: item.event.date,
                }
              : null;
          case "video":
            return item.customVideo
              ? {
                  _id: item._key,
                  type: "video" as const,
                  title: item.customVideo.title,
                  description: item.customVideo.description,
                  image: item.customVideo.thumbnail?.asset?.url,
                  videoUrl: item.customVideo.videoUrl,
                }
              : null;
          default:
            return null;
        }
      })
      .filter((item): item is HighlightedContentItem => item !== null);

    // Replace the raw highlighted content with the processed version
    (result as HomepageData).highlightedContentProcessed =
      processedHighlightedContent;
  }

  return result;
};

// ================================= Media Queries ================================

// Interface for media data
export interface MediaItem {
  _id: string;
  title: string;
  type:
    | "youtube"
    | "soundcloud"
    | "soundcloud_playlist"
    | "audio_url"
    | "video_url";
  url: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  artist?: string;
  genre?: string;
  isFeatured: boolean;
  tags?: string[];
  publishedAt?: string;
}

// Fetch all media items
export const getAllMedia = async (): Promise<MediaItem[]> => {
  const query = `*[_type == "media"] | order(publishedAt desc, _createdAt desc) {
    _id,
    title,
    type,
    url,
    description,
    "thumbnail": thumbnail.asset->url,
    duration,
    artist,
    genre,
    isFeatured,
    tags,
    publishedAt
  }`;

  return await client.fetch<MediaItem[]>(
    query,
    {},
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ["media"],
      },
    },
  );
};

// Fetch featured media items
export const getFeaturedMedia = async (limit = 10): Promise<MediaItem[]> => {
  const query = `*[_type == "media" && isFeatured == true] | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    type,
    url,
    description,
    "thumbnail": thumbnail.asset->url,
    duration,
    artist,
    genre,
    isFeatured,
    tags,
    publishedAt
  }`;

  return await client.fetch<MediaItem[]>(
    query,
    { limit },
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ["media"],
      },
    },
  );
};

// Fetch media by type
export const getMediaByType = async (
  type: string,
  limit = 20,
): Promise<MediaItem[]> => {
  const query = `*[_type == "media" && type == $type] | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    type,
    url,
    description,
    "thumbnail": thumbnail.asset->url,
    duration,
    artist,
    genre,
    isFeatured,
    tags,
    publishedAt
  }`;

  return await client.fetch<MediaItem[]>(
    query,
    { type, limit },
    {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ["media"],
      },
    },
  );
};
