import { createClient } from 'next-sanity';
import { projectId, dataset, apiVersion } from '@/sanity.config';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Always use direct API for consistency
});

export const config = {
  projectId,
  dataset,
  apiVersion,
};
