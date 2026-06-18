let accessToken: string | null = null;

const REFRESH_TOKEN_KEY = 'refreshToken';

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getRefreshToken() {
  if(typeof window === 'undefined') return null;
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  if(typeof window === 'undefined') return;
  if(token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}