export const CodeTypes = {
  NUMERIC: 'NUMERIC',
  ALPHABETIC: 'ALPHABETIC',
  ALPHANUMERIC: 'ALPHANUMERIC',
  HEX: 'HEX',
} as const;

export type CodeTypes = (typeof CodeTypes)[keyof typeof CodeTypes];
