export const controlClass = (error) =>
  `w-full h-11 rounded-lg border bg-surface text-ink text-base sm:text-sm placeholder:text-muted transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 ${
    error
      ? 'border-bad focus:ring-bad/30'
      : 'border-line-strong hover:border-muted focus:border-primary focus:ring-primary/25'
  }`;

export const describedBy = (id, error, hint) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
