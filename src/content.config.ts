import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each Deep Read is one Markdown file in src/content/deep-reads/.
// The file name becomes the URL: my-article.md -> /deep-reads/my-article/
const deepReads = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/deep-reads' }),
  schema: z.object({
    title: z.string(),
    /** One or two sentences shown on the Deep Reads list and in search results. */
    description: z.string(),
    /** The subheading under the title on the article page. */
    dek: z.string(),
    date: z.coerce.date(),
    readTime: z.string(),
    /** Position on the Deep Reads list (1 = first). */
    order: z.number(),
    /** Card image, stored in public/assets/deep-reads/. */
    thumbnail: z.string(),
    /** Optional yellow summary box at the top of the article. */
    bottomLine: z.string().optional(),
  }),
});

export const collections = { 'deep-reads': deepReads };
