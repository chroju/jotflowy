export function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function getTitleFromUrl(url: string): Promise<string | null> {
  try {
    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    
    // Extract title using regex
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      // Clean up the title - decode HTML entities and trim
      let title = titleMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();

      // Remove common suffixes
      title = title
        .replace(/ - YouTube$/, '')
        .replace(/ \| Twitter$/, '')
        .replace(/ \| X$/, '')
        .replace(/ - Wikipedia$/, '')
        .replace(/ \(.*\)$/, '') // Remove anything in parentheses at the end
        .trim();

      return title || null;
    }

    // Fallback: try to extract from Open Graph tags
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      return ogTitleMatch[1].trim();
    }

    // Fallback: try to extract from meta title
    const metaTitleMatch = html.match(/<meta[^>]*name=["']title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    if (metaTitleMatch && metaTitleMatch[1]) {
      return metaTitleMatch[1].trim();
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('URL title fetch timed out');
    } else {
      console.warn('Error fetching URL title:', error);
    }
    return null;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 1000); // Limit length
}

export function formatTimestamp(includeDate: boolean = false): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  if (includeDate) {
    options.year = 'numeric';
    options.month = '2-digit';
    options.day = '2-digit';
  }

  return now.toLocaleString('sv-SE', options);
}

export function validateWorkflowyUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'workflowy.com' && parsedUrl.hash.startsWith('#/');
  } catch {
    return false;
  }
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}