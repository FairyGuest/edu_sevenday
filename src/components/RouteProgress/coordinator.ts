type Listener = (state: { id: number; pending: boolean; route: string }) => void;

type Navigation = { id: number; route: string; controller: AbortController };

let current: Navigation | null = null;
let nextId = 0;
const listeners = new Set<Listener>();

export function cancelNavigation() {
  current?.controller.abort();
}

export function beginNavigation(route: string) {
  current?.controller.abort();
  const navigation: Navigation = {
    id: ++nextId,
    route,
    controller: new AbortController(),
  };
  current = navigation;
  listeners.forEach((listener) => listener({ id: navigation.id, pending: true, route }));
  return { id: navigation.id, signal: navigation.controller.signal };
}

export function finishNavigation(id: number) {
  if (!current || current.id !== id) return false;
  listeners.forEach((listener) => listener({ id, pending: false, route: current!.route }));
  return true;
}

export function getNavigationSignal() {
  return current?.controller.signal;
}

export function subscribeNavigation(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
