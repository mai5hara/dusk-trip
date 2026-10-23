function _isAuthQueryError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.message === 'Unauthorized') {
    return true;
  }
  const match = error.message.match(/HTTP error! status: (\d+)/);
  if (match?.[1] === '401' || match?.[1] === '403') {
    return true;
  }
  return false;
}

export function shouldRetryAdminQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (_isAuthQueryError(error)) {
    return false;
  }
  return failureCount < 3;
}
