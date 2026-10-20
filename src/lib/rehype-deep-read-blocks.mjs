/**
 * Shapes rendered Deep Read Markdown into the site's article layout.
 *
 * - A Markdown quote (a paragraph starting with "> ") becomes a yellow
 *   call-out box.
 * - Everything between call-outs is grouped into a rich-text block, which
 *   controls the spacing between paragraphs, headings and lists.
 * - Lists keep role="list" so screen readers still announce them as lists
 *   (the site's styles remove the bullets).
 */

const element = (tagName, className, children, extra = {}) => ({
  type: 'element',
  tagName,
  properties: { className, ...extra },
  children,
});

const isElement = (node, tagName) => node.type === 'element' && node.tagName === tagName;

function calloutFrom(blockquote) {
  const paragraphs = blockquote.children.filter((child) => isElement(child, 'p'));
  const inline = paragraphs.flatMap((paragraph, index) =>
    index === 0
      ? paragraph.children
      : [{ type: 'element', tagName: 'br', properties: {}, children: [] }, ...paragraph.children],
  );
  return element('div', ['quote-block'], [element('div', ['text-block-3'], inline)]);
}

function markLists(node) {
  if (isElement(node, 'ul') || isElement(node, 'ol')) {
    node.properties = { ...node.properties, role: 'list' };
  }
  node.children?.forEach(markLists);
}

export function rehypeDeepReadBlocks() {
  return (tree) => {
    markLists(tree);

    const blocks = [];
    let current = null;

    for (const node of tree.children) {
      if (isElement(node, 'blockquote')) {
        current = null;
        blocks.push(calloutFrom(node));
        continue;
      }

      if (node.type === 'text' && !node.value.trim()) continue;

      if (!current) {
        current = element('div', ['blog-rich-text-2', 'w-richtext'], []);
        blocks.push(current);
      }
      current.children.push(node);
    }

    tree.children = blocks;
  };
}
