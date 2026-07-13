import { describe, it, expect } from "vitest";

// Import utils - we'll need to handle ES modules
// Since utils.js uses DOM APIs, we need jsdom environment (configured in vitest.config.ts)
const { applyTemplate, parseContent, escapeRegex, escapeHtml, stripHtml, sanitizeHtml, migrateSettings } = await import(
  "../../public/scripts/utils.js"
);

describe("migrateSettings", () => {
  it("converts dailyNoteEnabled:true destination to calendar type without nodeId", () => {
    const { settings, changed } = migrateSettings({
      destinations: [
        { id: "d1", nodeId: "n1", name: "Journal", dailyNoteEnabled: true, defaultText: "" },
      ],
      selectedDestinationId: "d1",
    });
    expect(changed).toBe(true);
    expect(settings.destinations[0]).toEqual({
      id: "d1",
      type: "calendar",
      name: "Journal",
      defaultText: "",
    });
  });

  it("converts dailyNoteEnabled:false destination to node type keeping nodeId", () => {
    const { settings, changed } = migrateSettings({
      destinations: [
        { id: "d1", nodeId: "n1", name: "Inbox", dailyNoteEnabled: false, defaultText: "x" },
      ],
      selectedDestinationId: "d1",
    });
    expect(changed).toBe(true);
    expect(settings.destinations[0]).toEqual({
      id: "d1",
      type: "node",
      nodeId: "n1",
      name: "Inbox",
      defaultText: "x",
    });
  });

  it("leaves already-migrated destinations untouched", () => {
    const input = {
      destinations: [
        { id: "d1", type: "calendar", name: "Daily", defaultText: "" },
        { id: "d2", type: "node", nodeId: "n2", name: "Inbox", defaultText: "" },
      ],
      selectedDestinationId: "d1",
    };
    const { settings, changed } = migrateSettings(input);
    expect(changed).toBe(false);
    expect(settings).toEqual(input);
  });

  it("handles empty or missing destinations", () => {
    expect(migrateSettings({ destinations: [] }).changed).toBe(false);
    expect(migrateSettings({}).changed).toBe(false);
  });
});

describe("applyTemplate", () => {
  const fixedDate = new Date(2026, 1, 14, 9, 30, 45); // 2026-02-14 09:30:45

  it("replaces date placeholders", () => {
    const result = applyTemplate("{YYYY}-{MM}-{DD}", "test", fixedDate);
    expect(result).toBe("2026-02-14test");
  });

  it("replaces time placeholders", () => {
    const result = applyTemplate("{HH}:{mm}:{ss}", "test", fixedDate);
    expect(result).toBe("09:30:45test");
  });

  it("replaces {content} placeholder", () => {
    const result = applyTemplate("**{HH}:{mm}** {content}", "Hello world", fixedDate);
    expect(result).toBe("**09:30** Hello world");
  });

  it("appends content if no {content} placeholder", () => {
    const result = applyTemplate("Prefix: ", "Hello", fixedDate);
    expect(result).toBe("Prefix: Hello");
  });

  it("handles multiple {content} placeholders", () => {
    const result = applyTemplate("{content} - {content}", "test", fixedDate);
    expect(result).toBe("test - test");
  });

  it("handles empty template", () => {
    const result = applyTemplate("", "content", fixedDate);
    expect(result).toBe("content");
  });
});

describe("parseContent", () => {
  it("parses single line as name only", () => {
    const result = parseContent("Hello world");
    expect(result).toEqual({ name: "Hello world", note: undefined });
  });

  it("splits name and note by empty line", () => {
    const result = parseContent("Title\n\nNote content");
    expect(result).toEqual({ name: "Title", note: "Note content" });
  });

  it("handles multiple paragraphs in note", () => {
    const result = parseContent("Title\n\nParagraph 1\n\nParagraph 2");
    expect(result).toEqual({ name: "Title", note: "Paragraph 1\n\nParagraph 2" });
  });

  it("trims whitespace", () => {
    const result = parseContent("  Title  \n\n  Note  ");
    expect(result).toEqual({ name: "Title", note: "Note" });
  });

  it("handles empty line with spaces", () => {
    const result = parseContent("Title\n   \nNote");
    expect(result).toEqual({ name: "Title", note: "Note" });
  });
});

describe("escapeRegex", () => {
  it("escapes special regex characters", () => {
    expect(escapeRegex("hello.world")).toBe("hello\\.world");
    expect(escapeRegex("a*b+c?")).toBe("a\\*b\\+c\\?");
    expect(escapeRegex("(test)")).toBe("\\(test\\)");
    expect(escapeRegex("[abc]")).toBe("\\[abc\\]");
    expect(escapeRegex("a|b")).toBe("a\\|b");
    expect(escapeRegex("^start$end")).toBe("\\^start\\$end");
    expect(escapeRegex("path\\to\\file")).toBe("path\\\\to\\\\file");
  });

  it("handles URLs", () => {
    const url = "https://example.com/path?query=value";
    const escaped = escapeRegex(url);
    expect(escaped).toBe("https://example\\.com/path\\?query=value");
  });
});

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("preserves quotes (textContent method)", () => {
    // Note: textContent-based escaping doesn't escape quotes
    expect(escapeHtml('"quoted"')).toBe('"quoted"');
  });

  it("handles plain text", () => {
    expect(escapeHtml("Hello world")).toBe("Hello world");
  });
});

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<b>bold</b>")).toBe("bold");
    expect(stripHtml("<p>paragraph</p>")).toBe("paragraph");
  });

  it("handles nested tags", () => {
    expect(stripHtml("<div><span>nested</span></div>")).toBe("nested");
  });

  it("handles plain text", () => {
    expect(stripHtml("plain text")).toBe("plain text");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });
});

describe("sanitizeHtml", () => {
  it("preserves <a> tags with href", () => {
    expect(sanitizeHtml('<a href="https://example.com">link</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>'
    );
  });

  it("strips non-<a> tags but keeps text", () => {
    expect(sanitizeHtml("<b>bold</b>")).toBe("bold");
    expect(sanitizeHtml("<script>alert(1)</script>")).toBe("alert(1)");
  });

  it("strips dangerous attributes from <a> tags", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">bad</a>')).toBe("bad");
    expect(sanitizeHtml('<a href="https://example.com" onclick="evil()">link</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>'
    );
  });

  it("handles mixed content", () => {
    expect(sanitizeHtml('text <a href="https://example.com">link</a> more text')).toBe(
      'text <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a> more text'
    );
  });

  it("handles plain text", () => {
    expect(sanitizeHtml("plain text")).toBe("plain text");
  });

  it("handles empty string", () => {
    expect(sanitizeHtml("")).toBe("");
  });
});
