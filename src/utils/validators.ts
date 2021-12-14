export const isValidDate = (d: any) => d instanceof Date && !isNaN(d as any);

export const isValidString = (s: string | undefined | null): s is string =>
  Boolean(s && s.length > 0);
