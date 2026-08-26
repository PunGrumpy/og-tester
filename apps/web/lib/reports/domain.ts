const PROTOCOL_REGEX = /^[a-z][a-z0-9+.-]*:\/\//iu;
const WWW_REGEX = /^www\./iu;
const HOSTNAME_REGEX =
  /^[a-z0-9](?<label>[a-z0-9-]*[a-z0-9])?(?<rest>\.[a-z0-9-]+)+$/iu;

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

export const domainToUrl = (domain: string): string => `https://${domain}`;
