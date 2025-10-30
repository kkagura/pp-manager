export class ShortcutListSearchDto {
  name?: string;
}

export class ShortcutCreateDto {
  name: string;
  path: string;
  icon: string;
  description: string;
}
