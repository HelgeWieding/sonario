/**
 * Strips HTML tags from content while preserving meaningful text.
 * Handles common email HTML patterns.
 */
export function stripHtml(html: string): string {
  if (!html) return ''

  let text = html

  // Remove style, script, and head blocks entirely (including content)
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // Replace common block elements with newlines for readability
  text = text.replace(/<(br|p|div|h[1-6]|li|tr)[^>]*>/gi, '\n')

  // Replace horizontal rules
  text = text.replace(/<hr[^>]*>/gi, '\n---\n')

  // Convert links to text format: text (url) or just the URL
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, (_, url, linkText) => {
    const trimmedText = linkText?.trim()
    const trimmedUrl = url?.trim()
    if (trimmedText && trimmedUrl && trimmedText !== trimmedUrl) {
      return `${trimmedText} (${trimmedUrl})`
    }
    return trimmedUrl || trimmedText || ''
  })

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')

  // Decode HTML entities
  text = decodeHtmlEntities(text)

  // Clean up whitespace
  text = text
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' ') // Collapse spaces
    .replace(/^\s+|\s+$/gm, '') // Trim lines
    .trim()

  return text
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': '\'',
    '&apos;': '\'',
    '&ndash;': '-',
    '&mdash;': '--',
    '&hellip;': '...',
    '&copy;': '(c)',
    '&reg;': '(R)',
    '&trade;': '(TM)',
  }

  // Named entities
  for (const [entity, char] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, 'gi'), char)
  }

  // Numeric entities (decimal)
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))

  // Numeric entities (hex)
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))

  return text
}
