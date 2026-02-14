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
