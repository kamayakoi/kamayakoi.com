/**
 * Mock Stories Data
 *
 * This file contains placeholder stories data inspired by Oroko radio's article structure.
 * These stories are displayed when no content is available from the Sanity CMS.
 *
 * The data structure follows a similar pattern to Oroko radio's ArticleInterface:
 * - Stories have titles, excerpts, publication dates, authors, and categories
 * - Featured stories are displayed prominently with larger images
 * - All stories are shown in a grid layout below the featured selection
 * - Individual story pages display full content with rich text formatting
 *
 * To replace with real content:
 * 1. Add stories to your Sanity CMS
 * 2. The stories pages will automatically use real data when available
 * 3. Mock data serves as fallback when CMS is empty or during development
 */
export interface MockStory {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any; // PortableText content
}

// Mock stories data
export const mockStories: MockStory[] = [
  {
    _id: "1",
    title: "The Birth of Kamayakoi: A Journey Through Sound",
    slug: "birth-of-kamayakoi-journey-through-sound",
    excerpt: "Discover the origins of Kamayakoi, from underground gatherings to becoming Dakar’s premier electronic music collective. A story of passion, innovation, and cultural fusion.",
    publishedAt: "2024-01-15T10:00:00.000Z",
    author: {
      name: "Babacar Diop"
    },
    mainImage: {
      url: "/placeholder.webp",
      alt: "Kamayakoi founders at an early event"
    },
    categories: [
      { title: "History" },
      { title: "Founders" }
    ],
    body: [
      {
        _type: "block",
        _key: "1",
        children: [
          {
            _type: "span",
            _key: "1",
            text: "It all began in the vibrant streets of Dakar, where a group of passionate music lovers decided to create something extraordinary. Kamayakoi wasn't just about playing music—it was about building a community.",
            marks: [],
          }
        ]
      },
      {
        _type: "block",
        _key: "2",
        children: [
          {
            _type: "span",
            _key: "2",
            text: "What started as small gatherings in hidden venues has evolved into one of West Africa's most influential electronic music movements. Our journey has been filled with challenges, triumphs, and unforgettable moments that have shaped who we are today.",
            marks: [],
          }
        ]
      }
    ]
  },
  {
    _id: "2",
    title: "Behind the Decks: Meet Our Resident DJs",
    slug: "behind-the-decks-resident-djs",
    excerpt: "An exclusive look into the lives and creative processes of Kamayakoi's talented resident DJs. From track selection to live performance techniques.",
    publishedAt: "2024-01-10T14:30:00.000Z",
    author: {
      name: "Marie Konaté"
    },
    mainImage: {
      url: "/placeholder.webp",
      alt: "Resident DJs preparing for a live set"
    },
    categories: [
      { title: "Artists" },
      { title: "Behind the Scenes" }
    ],
    body: [
      {
        _type: "block",
        _key: "3",
        children: [
          {
            _type: "span",
            _key: "3",
            text: "Every great performance starts with hours of preparation. Our resident DJs share their secrets for creating unforgettable sets that keep the crowd moving all night long.",
            marks: [],
          }
        ]
      }
    ]
  },
  {
    _id: "3",
    title: "Festival Season: Kamayakoi Takes the Stage",
    slug: "festival-season-kamayakoi-stage",
    excerpt: "From beach parties to rooftop gatherings, follow Kamayakoi as we bring our signature sound to festivals across Senegal and beyond.",
    publishedAt: "2024-01-05T09:15:00.000Z",
    author: {
      name: "Ahmed Faye"
    },
    mainImage: {
      url: "/placeholder.webp",
      alt: "Kamayakoi performing at a beach festival"
    },
    categories: [
      { title: "Events" },
      { title: "Festival" }
    ],
    body: [
      {
        _type: "block",
        _key: "4",
        children: [
          {
            _type: "span",
            _key: "4",
            text: "The festival season brings new energy and new challenges. This year, we're taking our sound to new heights with performances that blend traditional Senegalese rhythms with cutting-edge electronic production.",
            marks: [],
          }
        ]
      }
    ]
  },
  {
    _id: "4",
    title: "The Sound of Dakar: How Local Culture Influences Our Music",
    slug: "sound-of-dakar-local-culture-music",
    excerpt: "Exploring the deep connections between Dakar's rich cultural heritage and Kamayakoi's innovative sound design. A celebration of our roots and our evolution.",
    publishedAt: "2023-12-28T16:45:00.000Z",
    author: {
      name: "Fatou Diop"
    },
    mainImage: {
      url: "/placeholder.webp",
      alt: "Traditional Dakar street scene with modern music elements"
    },
    categories: [
      { title: "Culture" },
      { title: "Music Production" }
    ],
    body: [
      {
        _type: "block",
        _key: "5",
        children: [
          {
            _type: "span",
            _key: "5",
            text: "Dakar's vibrant culture is the heartbeat of Kamayakoi. From the rhythms of traditional drumming to the energy of street performers, every element of our city influences our creative process.",
            marks: [],
          }
        ]
      }
    ]
  },
  {
    _id: "5",
    title: "Community Spotlight: The People Behind Kamayakoi",
    slug: "community-spotlight-people-behind-kamayakoi",
    excerpt: "Meet the incredible community members who make Kamayakoi possible. From volunteers to fans, discover the human stories that power our movement.",
    publishedAt: "2023-12-20T11:20:00.000Z",
    author: {
      name: "Ibrahima Sow"
    },
    mainImage: {
      url: "/placeholder.webp",
      alt: "Kamayakoi community members gathered together"
    },
    categories: [
      { title: "Community" },
      { title: "People" }
    ],
    body: [
      {
        _type: "block",
        _key: "6",
        children: [
          {
            _type: "span",
            _key: "6",
            text: "Kamayakoi isn't just about music—it's about the people who believe in our vision. Our community is diverse, passionate, and united by a love for electronic music and cultural innovation.",
            marks: [],
          }
        ]
      }
    ]
  },
  {
    _id: "6",
    title: "Techno in the Tropics: Adapting Electronic Music to West African Climate",
    slug: "techno-in-tropics-adapting-electronic-music",
    excerpt: "How Kamayakoi has mastered the art of outdoor electronic music performance in Dakar's unique tropical environment. Challenges, solutions, and innovations.",
    publishedAt: "2023-12-15T13:10:00.000Z",
    author: {
      name: "Samba Ndiaye"
    },
    mainImage: {
      url: "/placeholder.webp",
      alt: "Outdoor electronic music setup in tropical setting"
    },
    categories: [
      { title: "Technology" },
      { title: "Performance" }
    ],
    body: [
      {
        _type: "block",
        _key: "7",
        children: [
          {
            _type: "span",
            _key: "7",
            text: "Performing electronic music outdoors in tropical climates presents unique challenges. From equipment protection to crowd engagement, we've developed innovative solutions that enhance rather than hinder our performances.",
            marks: [],
          }
        ]
      }
    ]
  },
  {
    _id: "7",
    title: "Collaborations That Shaped Our Sound",
    slug: "collaborations-shaped-our-sound",
    excerpt: "Exploring the key collaborations that have influenced Kamayakoi's musical direction, from local artists to international producers.",
    publishedAt: "2023-12-08T15:30:00.000Z",
    author: {
      name: "Amina Diallo"
    },
    mainImage: {
      url: "/placeholder.webp",
      alt: "Artists collaborating in the studio"
    },
    categories: [
      { title: "Collaborations" },
      { title: "Production" }
    ],
    body: [
      {
        _type: "block",
        _key: "8",
        children: [
          {
            _type: "span",
            _key: "8",
            text: "Great music is born from collaboration. Over the years, we've had the privilege of working with incredible artists from across Africa and around the world, each bringing their unique perspective to our sound.",
            marks: [],
          }
        ]
      }
    ]
  },
  {
    _id: "8",
    title: "The Future of Electronic Music in West Africa",
    slug: "future-electronic-music-west-africa",
    excerpt: "Kamayakoi's vision for the future of electronic music in West Africa. Innovation, education, and building sustainable music ecosystems.",
    publishedAt: "2023-12-01T10:45:00.000Z",
    author: {
      name: "Babacar Diop"
    },
    mainImage: {
      url: "/placeholder.webp",
      alt: "Futuristic vision of electronic music in Africa"
    },
    categories: [
      { title: "Future" },
      { title: "Innovation" }
    ],
    body: [
      {
        _type: "block",
        _key: "9",
        children: [
          {
            _type: "span",
            _key: "9",
            text: "As we look to the future, we're excited about the possibilities for electronic music in West Africa. With new technologies, growing audiences, and increasing international recognition, the future is bright.",
            marks: [],
          }
        ]
      }
    ]
  }
];

// Helper functions to get mock data
export const getMockStories = (): MockStory[] => {
  return mockStories.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

export const getFeaturedMockStories = (limit = 4): MockStory[] => {
  return mockStories.slice(0, limit);
};

export const getMockStoryBySlug = (slug: string): MockStory | null => {
  return mockStories.find(story => story.slug === slug) || null;
};
