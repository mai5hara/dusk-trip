export const queryKeys = {
  trips: {
    all: ['trips'] as const,
    detail: (id: string) => ['trips', id] as const,
  },
  itineraries: {
    all: ['itineraries'] as const,
    detail: (id: string) => ['itineraries', id] as const,
  },
};
