import { history } from "@umijs/max";

/** Use the router location so browser history and hash deployments stay in sync. */
export function replacePageQuery(patch: Record<string, string | null>) {
  const location = history.location;
  const query = new URLSearchParams(location.search);
  Object.entries(patch).forEach(([key, value]) => {
    if (value === null || value === "") query.delete(key);
    else query.set(key, value);
  });
  const search = query.toString() ? `?${query}` : "";
  if (search !== location.search) history.replace({ pathname: location.pathname, search, hash: location.hash }, location.state);
}
