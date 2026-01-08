export function getLoggedInUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('loggedInUser');
  return raw ? JSON.parse(raw) : null;
}
