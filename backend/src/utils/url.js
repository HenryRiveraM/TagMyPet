export function frontendUrl(path = '') {
  const base = (process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:4200').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}/#${normalizedPath}`;
}

export function publicPetUrl(code) {
  return frontendUrl(`/pet/public/${encodeURIComponent(code)}`);
}
