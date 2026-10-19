export function getHashRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path = 'home', query = ''] = raw.split('?');
  return {
    page: path.split('/')[0] || 'home',
    segments: path.split('/').filter(Boolean),
    params: new URLSearchParams(query),
  };
}

export function setHashQuery(key, value) {
  const { page, segments, params } = getHashRoute();
  if (value === null || value === undefined || value === '') params.delete(key);
  else params.set(key, value);
  const route = segments.length ? segments.join('/') : page;
  const query = params.toString();
  window.location.hash = `${route}${query ? `?${query}` : ''}`;
}
