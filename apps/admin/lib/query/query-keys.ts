export const queryKeys = {
  users: {
    all: (page: number, limit: number, search: string) => ['users', page, limit, search] as const,
    detail: (id: string) => ['users', id] as const,
  },
};
