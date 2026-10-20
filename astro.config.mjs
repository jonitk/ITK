import { defineConfig } from 'astro/config';
import { rehypeDeepReadBlocks } from './src/lib/rehype-deep-read-blocks.mjs';

export default defineConfig({
  site: 'https://www.inthekitchen.is',
  output: 'static',
  build: {
    format: 'directory',
  },
  markdown: {
    // Articles are written with typographic punctuation already; don't let
    // the Markdown renderer rewrite quotes or turn bare URLs into links.
    smartypants: false,
    gfm: false,
    rehypePlugins: [rehypeDeepReadBlocks],
  },
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
});
