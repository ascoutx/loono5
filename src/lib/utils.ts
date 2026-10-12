export { cn } from "cn";

/**
 * A random identifier for client-side bookkeeping.
 *
 * `crypto.randomUUID()` only exists in a secure context, so it is absent on
 * `http://192.168.x.x:3000` — which is exactly how an H5 build gets opened on a
 * phone during mobile testing, and `localhost` is not a guarantee here. A
 * missing `randomUUID` would throw inside a realtime channel name and take the
 * subscription down with it, so the fallback keeps that a non-event.
 *
 * The result only has to be unique within one browser session: it names
 * optimistic rows and realtime channels, neither of which is a security
 * boundary or persisted.
 */
export function randomId(): string {
  const webCrypto = globalThis.crypto;

  if (webCrypto && typeof webCrypto.randomUUID === "function") {
    return webCrypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
