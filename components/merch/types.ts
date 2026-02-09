export interface PortableTextBlock {
  _key: string;
  _type: string;
  children: Array<{
    _key: string;
    _type: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: unknown[];
  style?: string;
}

export interface SanityProduct {
  _id: string;
  name: string;
  slug: string | { current: string };
  mainImage?: string;
  price: number;
  stock?: number;
  description?: string | PortableTextBlock[];
  shippingFee?: number; // deprecated: shipping is now global, kept for backwards compatibility
  requiresShipping?: boolean;
  categories?: Array<{
    title: string;
    slug: string;
  }>;
  tags?: string[];
  images?: Array<{
    asset: {
      url: string;
      metadata?: {
        dimensions?: {
          width: number;
          height: number;
        };
        lqip?: string;
      };
    };
    alt?: string;
    caption?: string;
  }>;
  colors?: Array<{
    name: string;
    image?: string;
    available: boolean;
  }>;
  sizes?: Array<{
    name: string;
    available: boolean;
  }>;
}
