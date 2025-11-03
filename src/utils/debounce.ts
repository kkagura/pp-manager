export function debounce<T extends Function>(func: T, wait: number = 10): T {
  let timeout: NodeJS.Timeout;
  return function (...args: unknown[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(args), wait);
  } as unknown as T;
}
