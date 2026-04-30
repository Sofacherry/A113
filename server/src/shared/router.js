function toSegments(pathname) {
  return pathname.split("/").filter(Boolean);
}

function matchPath(pattern, pathname) {
  const patternSegments = toSegments(pattern);
  const pathSegments = toSegments(pathname);
  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternSegments.length; i += 1) {
    const expected = patternSegments[i];
    const actual = pathSegments[i];
    if (expected.startsWith(":")) {
      params[expected.slice(1)] = actual;
      continue;
    }
    if (expected !== actual) {
      return null;
    }
  }
  return params;
}

export function createRouter(routes) {
  return function resolve(method, pathname) {
    for (const route of routes) {
      if (route.method !== method) {
        continue;
      }
      const params = matchPath(route.path, pathname);
      if (params) {
        return { handler: route.handler, params };
      }
    }
    return null;
  };
}
