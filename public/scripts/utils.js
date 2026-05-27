// Template expansion: applies at send time, wrapping content
export function applyTemplate(template, content, date = new Date()) {
  let result = template
    .replace(/\{YYYY\}/g, String(date.getFullYear()))
    .replace(/\{MM\}/g, String(date.getMonth() + 1).padStart(2, "0"))
    .replace(/\{DD\}/g, String(date.getDate()).padStart(2, "0"))
    .replace(/\{HH\}/g, String(date.getHours()).padStart(2, "0"))
    .replace(/\{mm\}/g, String(date.getMinutes()).padStart(2, "0"))
    .replace(/\{ss\}/g, String(date.getSeconds()).padStart(2, "0"));

  if (result.includes("{content}")) {
    result = result.replace(/\{content\}/g, content);
  } else {
    result = result + content;
  }
  return result;
}

// Parse editor content: split name and note by empty line
export function parseContent(text) {
  const parts = text.split(/\n\s*\n/);
  const name = parts[0].trim();
  const note = parts.length > 1 ? parts.slice(1).join("\n\n").trim() : undefined;
  return { name, note };
}

// Escape special regex characters
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Escape HTML special characters
export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Strip HTML tags from string
export function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

// Sanitize HTML: allow only <a> tags with safe href (http/https), strip everything else
export function sanitizeHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;

  const walk = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "A") {
        const href = child.getAttribute("href") || "";
        if (/^https?:\/\//i.test(href)) {
          const safe = document.createElement("a");
          safe.href = href;
          safe.target = "_blank";
          safe.rel = "noopener noreferrer";
          safe.textContent = child.textContent;
          child.replaceWith(safe);
        } else {
          child.replaceWith(document.createTextNode(child.textContent));
        }
      } else {
        child.replaceWith(document.createTextNode(child.textContent));
      }
    }
  };

  walk(div);
  return div.innerHTML;
}

export const FONT_FAMILY_MAP = {
  gothic: '"Yu Gothic", "游ゴシック", YuGothic, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans CJK JP", "Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif',
  hiragino: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "游ゴシック", YuGothic, "Noto Sans CJK JP", "Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif',
  mincho: '"Yu Mincho", "游明朝", YuMincho, "Hiragino Mincho ProN", "Noto Serif CJK JP", serif',
};

export function applyTypographySettings(settings) {
  const fontSize = settings.fontSize ?? 16;
  const lineHeight = settings.lineHeight ?? 1.8;
  const fontFamily = FONT_FAMILY_MAP[settings.fontFamily] ?? FONT_FAMILY_MAP.gothic;
  document.documentElement.style.setProperty("--font-size", `${fontSize}px`);
  document.documentElement.style.setProperty("--line-height", String(lineHeight));
  document.documentElement.style.setProperty("--font-family", fontFamily);
}
