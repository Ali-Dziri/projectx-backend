import { Transform } from 'class-transformer';

export const ToStringArray = () =>
  Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') return [value];
    return [];
  });
