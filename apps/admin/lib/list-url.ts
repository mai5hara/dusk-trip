export function buildListUrl(
  basePath: string,
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
): string {
  const params = new URLSearchParams(searchParams.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
