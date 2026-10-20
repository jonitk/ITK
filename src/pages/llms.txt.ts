import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { faqs } from '../data/faqs';
import { BOOKING_URL, EMAIL, NEWSLETTER_URL, ORGANIZATION_DESCRIPTION, absolute } from '../lib/site';

// A plain-text summary of the site for AI assistants (the llms.txt convention).
// It is generated from the same content as the pages, so it never goes stale.
export const GET: APIRoute = async () => {
  const articles = (await getCollection('deep-reads')).sort((a, b) => a.data.order - b.data.order);

  const lines = [
    '# In The Kitchen',
    '',
    `> ${ORGANIZATION_DESCRIPTION}`,
    '',
    'In The Kitchen is run by Jon Itkin, a former copywriter, strategist, and product marketing leader for companies from Google and Salesforce to early-stage startups. It works with founders and executives of growth-stage and at-scale B2B technology companies on positioning, messaging, and category leadership.',
    '',
    `- Website: ${absolute('/')}`,
    `- Book a call: ${BOOKING_URL}`,
    `- Email: ${EMAIL}`,
    `- Newsletter: ${NEWSLETTER_URL}`,
    '',
    '## Deep Reads',
    '',
    ...articles.map(
      (article) => `- [${article.data.title}](${absolute(`/deep-reads/${article.id}/`)}): ${article.data.description}`,
    ),
    '',
    '## Frequently asked questions',
    '',
    ...faqs.flatMap(({ question, answer }) => [`### ${question}`, '', answer, '']),
  ];

  return new Response(`${lines.join('\n').trim()}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
