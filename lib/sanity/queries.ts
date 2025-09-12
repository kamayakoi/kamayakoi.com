import { client } from "./client";

// Helper function to get cache configuration based on environment
const getCacheConfig = (tags: string[]) => ({
  next: {
    revalidate: process.env.NODE_ENV === "production" ? 900 : 0, // No cache in development, 15 minutes in production
    tags,
  },
});

// Events
export async function getLatestEvents(limit = 3) {
  return client.fetch(
    `
    *[_type == "event"] | order(date desc) [0...$limit] {
      _id,
      title,
      slug,
      date,
      time,
      location,
      description,
      "flyer": {
        "url": flyer.asset->url
      },
      ticketsAvailable
    }
  `,
    { limit },
    getCacheConfig(["events"]),
  );
}

export const getAllEvents = async (): Promise<Event[]> => {
  const query = `*[_type == "event"] | order(date desc) {
    _id,
    title,
    slug,
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
    getCacheConfig([`event-${slug}`, "events"]),
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
      slug,
      publishedAt,
      excerpt,
      excerpt_fr,
      "tags": tags,
      "languages": languages,
      "mainImage": mainImage {
        asset->,
        alt,
        caption
      },
      "category": category,
      "categories": categories[]->{
        _id,
        title,
        slug,
        color
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
    getCacheConfig(["posts"]),
  );
}

export async function getAllBlogPosts() {
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      title_fr,
      slug,
      publishedAt,
      excerpt,
      excerpt_fr,
      "tags": tags,
      "languages": languages,
      "mainImage": mainImage {
        asset->,
        alt,
        caption
      },
      "category": category,
      "categories": categories[]->{
        _id,
        title,
        slug,
        color
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
      slug,
      publishedAt,
      excerpt,
      excerpt_fr,
      excerpt_es,
      excerpt_pt,
      excerpt_zh,
      "tags": tags,
      "languages": languages,
      "mainImage": mainImage {
        asset->,
        alt,
        caption
      },
      "category": category,
      "categories": categories[]->{
        _id,
        title,
        slug,
        color
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
        slug,
        publishedAt,
        excerpt,
        excerpt_fr,
        "tags": tags,
        "languages": languages,
        "mainImage": mainImage {
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
      slug,
      publishedAt,
      excerpt,
      excerpt_fr,
      "tags": tags,
      "languages": languages,
      "mainImage": mainImage {
        asset->,
        alt,
        caption
      },
      "category": category,
      "categories": categories[]->{
        _id,
        title,
        slug,
        color
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
  return client.fetch(
    `
    *[_type == "product"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      productId,
      "mainImage": images[0].asset->url,
      "price": basePrice,
      "stock": baseStock,
      description,
      "categories": categories[]->{
        _id,
        title,
        "slug": slug.current
      },
      tags,
      images[]{
        asset->{
          _id,
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
  `,
    {},
    getCacheConfig(["products"]),
  );
}

export async function getProductBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      "name": name,
      "slug": slug.current,
      productId,
      "mainImage": images[0].asset->url,
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
      "categories": categories[]->{
        title,
        "slug": slug.current
      },
      tags,
      requiresShipping,
      weight,
      dimensions
    }
  `,
    { slug },
    getCacheConfig([`product-${slug}`, "products"]),
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
    slug,
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
  const query = `*[_type == "event"] | order(date desc) [0...$limit] {
    _id,
    title,
    "slug": slug.current,
    "featuredImage": flyer.asset->url,
    "promoVideoUrl": promoVideo.asset->url,
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

// Interface for homepage audio settings
export interface HomepageAudioSettings {
  audioPlayerEnabled: boolean;
  autoPlayMusic: boolean;
  musicTracks: MusicTrack[];
}

// Fetch music tracks and audio settings from the singleton homepage document
export const getHomepageMusicTracks =
  async (): Promise<HomepageAudioSettings> => {
    try {
      // Query the single document of type 'homepage'
      // Select the music tracks with their audio files and cover images, plus audio settings
      const query = `*[_type == "homepage"][0] {
      audioPlayerEnabled,
      autoPlayMusic,
      "musicTracks": musicTracks[]{
        title,
        artist,
        "audioUrl": audioFile.asset->url,
        "coverImageUrl": coverImage.asset->url
      }
    }`;

      const result = await client.fetch<{
        audioPlayerEnabled?: boolean;
        autoPlayMusic?: boolean;
        musicTracks?: MusicTrack[];
      }>(query, {}, getCacheConfig(["homepage", "music"]));

      // Handle case when no homepage document exists
      if (!result) {
        return {
          audioPlayerEnabled: true,
          autoPlayMusic: false,
          musicTracks: [],
        };
      }

      return {
        audioPlayerEnabled: result.audioPlayerEnabled ?? true,
        autoPlayMusic: result.autoPlayMusic ?? false,
        musicTracks:
          result.musicTracks?.filter((track) => track.audioUrl) ?? [],
      };
    } catch (error) {
      console.error("Error fetching homepage music tracks:", error);
      // Return default values instead of throwing error to prevent app crash
      return {
        audioPlayerEnabled: true,
        autoPlayMusic: false,
        musicTracks: [],
      };
    }
  };

// ================================= Artists ================================

// Interface for artist data
export interface ArtistData {
  _id: string;
  name: string;
  slug: string;
  description?: {
    en?: string;
    fr?: string;
  };
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
    slug,
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
    getCacheConfig(["artists"]),
  );
};

// Fetch artist by slug
export const getArtistBySlug = async (
  slug: string,
): Promise<ArtistData | null> => {
  const query = `*[_type == "artist" && slug.current == $slug][0] {
    _id,
    name,
    slug,
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
    getCacheConfig([`artist-${slug}`, "artists"]),
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
      slug,
      "flyerUrl": flyer.asset->url,
      title
    }
  }`;
    const result = await client.fetch<{ promoEvent?: HomepagePromoEventData }>(
      query,
      {},
      getCacheConfig(["homepage", "events"]),
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

// Interface for homepage data
export interface HomepageData {
  heroContent?: HomepageHeroItem[];
  featuredEvents?: {
    _id: string;
    title: string;
    slug: { current: string };
    date: string;
    time?: string;
    location?:
      | string
      | {
          venueName?: string;
          address?: string;
        };
    description?: {
      en?: string;
      fr?: string;
    };
    flyer?: {
      url: string;
    };
    ticketsAvailable?: boolean;
  }[];
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
    featuredEvents[]->{
      _id,
      title,
      slug,
      date,
      time,
      location,
      description,
      "flyer": {
        "url": flyer.asset->url
      },
      ticketsAvailable
    }
  }`;

  const result = await client.fetch<HomepageData | null>(
    query,
    {},
    getCacheConfig(["homepage"]),
  );

  return result;
};

// ================================= Media Queries ================================

// Interface for media data
export interface MediaItem {
  _id: string;
  title: string;
  title_fr?: string;
  type:
    | "youtube"
    | "soundcloud"
    | "soundcloud_playlist"
    | "audio_url"
    | "video_url";
  url: string;
  description?: string;
  description_fr?: string;
  thumbnail?: string;
  duration?: string;
  artist?: string;
  genre?: string;
  tags?: string[];
  publishedAt?: string;
}

// Fetch all media items
export const getAllMedia = async (): Promise<MediaItem[]> => {
  const query = `*[_type == "media"] | order(publishedAt desc, _createdAt desc) {
    _id,
    title,
    title_fr,
    type,
    url,
    description,
    description_fr,
    "thumbnail": thumbnail.asset->url,
    duration,
    artist,
    genre,
    tags,
    publishedAt
  }`;

  return await client.fetch<MediaItem[]>(query, {}, getCacheConfig(["media"]));
};

// Fetch media items (chronological order)
export const getMedia = async (limit = 10): Promise<MediaItem[]> => {
  const query = `*[_type == "media"] | order(publishedAt desc, _createdAt desc) [0...$limit] {
    _id,
    title,
    title_fr,
    type,
    url,
    description,
    description_fr,
    "thumbnail": thumbnail.asset->url,
    duration,
    artist,
    genre,
    tags,
    publishedAt
  }`;

  return await client.fetch<MediaItem[]>(
    query,
    { limit },
    getCacheConfig(["media"]),
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
    title_fr,
    type,
    url,
    description,
    description_fr,
    "thumbnail": thumbnail.asset->url,
    duration,
    artist,
    genre,
    tags,
    publishedAt
  }`;

  return await client.fetch<MediaItem[]>(
    query,
    { type, limit },
    getCacheConfig(["media"]),
  );
};
