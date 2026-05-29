export class SnippetListSearchDto {
  keyword?: string;
  language?: string;
  category?: string;
  tag?: string;
}

export class SnippetCreateDto {
  title: string;
  language: string;
  content: string;
  description: string;
  category: string;
  tags: string;
  isPinned: number;
  sort?: number;
}
