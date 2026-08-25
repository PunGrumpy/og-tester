const PROTOCOL_REGEX = /^[a-z][a-z0-9+.-]*:\/\//iu;
const WWW_REGEX = /^www\./iu;
const HOSTNAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9-]+)+$/iu;

/**
 * The canonical form of a site, and the only thing that ever appears in a
 * report URL or a storage key.
 *
 * One site has to resolve to one report, so `https://WWW.Example.com/pricing?x`
 * and `example.com` are the same key. Everything past the host is dropped —
 * the scan crawls the whole origin anyway, so a per-path report would be a
 * different report of the same thing.
 */
export const normalizeDomain = (input: string): string | null => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  let host: string;
  try {
    const withProtocol = PROTOCOL_REGEX.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    host = parsed.hostname;
  } catch {
    return null;
  }

  const withoutWww = host.replace(WWW_REGEX, "");
  return HOSTNAME_REGEX.test(withoutWww) ? withoutWww : null;
};

/** The URL a scan actually starts from, given a canonical domain. */
export const domainToUrl = (domain: string): string => `https://${domain}`;
