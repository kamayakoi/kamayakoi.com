/**
 * CLI helper to trigger cache revalidation via the Next.js API route.
 *
 * Usage:
 *   pnpm revalidate              # revalidate all default tags
 *   pnpm revalidate:events       # revalidate events tag
 */

const TAG_PRESETS: Record<string, string[]> = {
  events: ['events'],
  posts: ['posts'],
  products: ['products'],
  homepage: ['homepage'],
};

async function main() {
  const arg = process.argv[2];
  const baseUrl =
    process.env.REVALIDATE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';

  const tags = arg ? TAG_PRESETS[arg] : undefined;
  if (arg && !tags) {
    console.error(
      `Unknown revalidation target "${arg}". Expected: events, posts, products, homepage`
    );
    process.exit(1);
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/revalidate`;
  const body = tags ? { tags } : {};

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`Revalidation failed (${response.status}):`, text);
    process.exit(1);
  }

  console.log('Revalidation successful:', text);
}

main().catch(error => {
  console.error('Revalidation error:', error);
  process.exit(1);
});
