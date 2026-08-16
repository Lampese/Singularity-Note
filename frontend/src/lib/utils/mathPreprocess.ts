const CODE_REGION_PATTERN = /(```[\s\S]*?```|~~~[\s\S]*?~~~|``[^`]*``|`[^`]*`)/g;
const PROTECTED_PLACEHOLDER_PREFIX = "\x00CB";
const PROTECTED_PLACEHOLDER_SUFFIX = "\x00";
const MARKDOWN_BOUNDARY_HINT = "\u200b";

function withProtectedMarkdownCodeRegions(
  content: string,
  transform: (content: string) => string,
): string {
  const codeBlocks: string[] = [];
  const placeholder = (idx: number) => (
    `${PROTECTED_PLACEHOLDER_PREFIX}${idx}${PROTECTED_PLACEHOLDER_SUFFIX}`
  );

  let processed = content.replace(CODE_REGION_PATTERN, (match) => {
      codeBlocks.push(match);
      return placeholder(codeBlocks.length - 1);
  });

  processed = transform(processed);

  const restorePattern = new RegExp(
    `${PROTECTED_PLACEHOLDER_PREFIX}(\\d+)${PROTECTED_PLACEHOLDER_SUFFIX}`,
    "g",
  );
  return processed.replace(restorePattern, (_, idx: string) => {
    return codeBlocks[parseInt(idx, 10)] ?? "";
  });
}

function preprocessLaTeXUnprotected(content: string): string {
  let processed = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, inner: string) => `$$${inner}$$`,
  );

  processed = processed.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, inner: string) => `$${inner}$`,
  );

  return processed;
}

/**
 * Preprocess markdown to normalise LaTeX delimiters so that remark-math
 * (which only understands `$` / `$$`) can pick them up.
 *
 * Converts:
 *  - `\(...\)` -> `$...$`   (inline)
 *  - `\[...\]` -> `$$...$$` (display)
 *
 * Protected regions (never converted):
 *  - Fenced code blocks (``` or ~~~)
 *  - Inline code (single or multi-backtick)
 */
export function preprocessLaTeX(content: string): string {
  return withProtectedMarkdownCodeRegions(content, preprocessLaTeXUnprotected);
}

function preprocessCjkStrongEmphasisUnprotected(content: string): string {
  return content.replace(
    /([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}，。！？；：、（）《》“”‘’])\*\*([^*\n][^*\n]*?[^*\n])\*\*([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}，。！？；：、（）《》“”‘’])/gu,
    `$1${MARKDOWN_BOUNDARY_HINT}**${MARKDOWN_BOUNDARY_HINT}$2${MARKDOWN_BOUNDARY_HINT}**${MARKDOWN_BOUNDARY_HINT}$3`,
  );
}

export function preprocessCjkStrongEmphasis(content: string): string {
  return withProtectedMarkdownCodeRegions(content, preprocessCjkStrongEmphasisUnprotected);
}

export function preprocessMarkdownCompatibility(content: string): string {
  return preprocessLaTeX(preprocessCjkStrongEmphasis(content));
}
