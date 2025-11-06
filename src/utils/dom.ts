export function isChildOf(
  target: HTMLElement,
  filter: (element: HTMLElement) => boolean
) {
  if (!target) return false;
  if (target === document.body) return false;
  if (filter(target)) return true;
  return isChildOf(target.parentElement as HTMLElement, filter);
}
