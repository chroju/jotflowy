export function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isPrivateIP(hostname: string): boolean {
  // Check for IPv4 private addresses
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  
  if (match) {
    const [, a, b, c, d] = match.map(Number);
    return (
      // 10.0.0.0/8
      a === 10 ||
      // 172.16.0.0/12
      (a === 172 && b >= 16 && b <= 31) ||
      // 192.168.0.0/16
      (a === 192 && b === 168) ||
      // 127.0.0.0/8 (localhost)
      a === 127 ||
      // 169.254.0.0/16 (link-local)
      (a === 169 && b === 254)
    );
  }
  
  // Check for localhost and common private hostnames
  const privateDomains = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
  return privateDomains.includes(hostname.toLowerCase());
}

function isSafeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Block private/internal IPs
    if (isPrivateIP(parsedUrl.hostname)) {
      return false;
    }
    
    // Block non-standard ports (except 80, 443, 8080, 8443)
    if (parsedUrl.port && !['80', '443', '8080', '8443', ''].includes(parsedUrl.port)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function getTitleFromUrl(url: string): Promise<string | null> {
  try {
    // SSRF protection: validate URL safety
    if (!isSafeUrl(url)) {
      console.warn('Blocked potentially unsafe URL:', url);
      return null;
    }
    
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
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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