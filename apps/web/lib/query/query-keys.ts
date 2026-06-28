export const queryKeys = {
  trips: {
    all: ['trips'] as const,
    detail: (id: string) => ['trips', id] as const,
  },
};
