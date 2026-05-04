export function frontendUrl(path = '') {
  const base = process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:4200';
  return `${base}${path}`;
}
