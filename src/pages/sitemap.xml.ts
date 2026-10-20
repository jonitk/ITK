import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absolute } from '../lib/site';

// Every page search engines should index. Unfinished pages marked `noindex`
// (like /articles/category-leadership/) are left out on purpose.
export const GET: APIRoute = async () => {
  const articles = (await getCollection('deep-reads')).sort((a, b) => a.data.order - b.data.order);

  const pages: Array<{ path: string; lastmod?: string }> = [
    { path: '/' },
    { path: '/deep-reads/' },
    ...articles.map((article) => ({
      path: `/deep-reads/${article.id}/`,
      lastmod: article.data.date.toISOString().slice(0, 10),
    })),
    { path: '/contact-us/' },
  ];

  const urls = pages
    .map(
      ({ path, lastmod }) =>
        `  <url>\n    <loc>${absolute(path)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
