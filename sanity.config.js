/**
 * This configuration file contains shared Sanity settings
 * that can be used by both the Next.js frontend and the Sanity Studio
 */

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'qziej56d';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
