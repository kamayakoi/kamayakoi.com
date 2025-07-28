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
        "image": image.asset->url,
        socialLink,
        isResident
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

// Blog
export async function getLatestBlogPosts(limit = 2) {
  return client.fetch(
    `
    *[_type == "post"] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      excerpt,
      "mainImage": {
        "url": mainImage.asset->url
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
      "slug": slug.current,
      publishedAt,
      excerpt,
      "mainImage": {
        "url": mainImage.asset->url
      }
    }
  `);
}

export async function getBlogPostBySlug(slug: string) {
  const post = await client.fetch(
    `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      "mainImage": {
        "url": mainImage.asset->url
      },
      "author": author->{name, "image": image.asset->url},
      body,
      "categories": categories[]->{title}
    }
  `,
    { slug },
  );

  return post;
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
      price,
      stock
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
      "images": images[].asset->{
        url,
        metadata {
          dimensions,
          lqip // Low Quality Image Placeholder
        }
       },
      price,
      stock,
      // Fetch referenced categories if needed
      "categories": categories[]->{title, slug}
      // Fetch variants if implemented
      // variants
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
  imageUrl?: string;
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
    "imageUrl": image.asset->url,
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
    "imageUrl": image.asset->url,
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
