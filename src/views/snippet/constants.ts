export interface SnippetLanguageOption {
  label: string;
  value: string;
}

export interface SnippetFormPayload {
  id?: number;
  title: string;
  language: string;
  content: string;
  description: string;
  category: string;
  tags: string[];
  isPinned: number;
}

export const snippetLanguageOptions: SnippetLanguageOption[] = [
  { label: "Text", value: "text" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Vue", value: "vue" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Less", value: "less" },
  { label: "SCSS", value: "scss" },
  { label: "JSON", value: "json" },
  { label: "SQL", value: "sql" },
  { label: "Markdown", value: "markdown" },
  { label: "Shell", value: "shell" },
  { label: "PowerShell", value: "powershell" },
];

export function parseSnippetTags(tags: string | string[] | null | undefined) {
  if (Array.isArray(tags)) return tags;
  if (!tags) return [];

  try {
    const result = JSON.parse(tags);
    return Array.isArray(result) ? result.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function stringifySnippetTags(tags: string[]) {
  const normalizedTags = Array.from(
    new Set(tags.map((tag) => tag.trim()).filter(Boolean))
  );
  return JSON.stringify(normalizedTags);
}
