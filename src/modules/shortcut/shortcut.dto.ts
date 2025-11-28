export class ShortcutListSearchDto {
  name?: string;
  ids?: number[];
}

export class ShortcutCreateDto {
  name: string;
  alias: string;
  path: string;
  icon: string;
  description: string;
  sort: number;
}
