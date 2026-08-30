import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 10_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const OCTET = 256;
const IPV4_BITS = 32;

const ipv4ToNumber = (ip: string): number =>
  ip.split(".").reduce((acc, octet) => acc * OCTET + Number(octet), 0);

const ipv4InRange = (ip: string, prefix: string, bits: number): boolean => {
  const size = 2 ** (IPV4_BITS - bits);
  const base = Math.floor(ipv4ToNumber(prefix) / size) * size;
  const value = ipv4ToNumber(ip);
  return value >= base && value < base + size;
};

const BLOCKED_IPV4: [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const MAPPED_DOTTED = /^::ffff:(?<dotted>\d+\.\d+\.\d+\.\d+)$/u;
const MAPPED_HEX = /^::ffff:(?<hi>[0-9a-f]{1,4}):(?<lo>[0-9a-f]{1,4})$/u;
const UNIQUE_LOCAL = /^f[cd]/u;
const LINK_LOCAL = /^fe[89ab]/u;
const IPV6_BRACKETS = /^\[|\]$/gu;

const isBlockedAddress = (address: string): boolean => {
  const version = isIP(address);

  if (version === 4) {
    return BLOCKED_IPV4.some(([prefix, bits]) =>
      ipv4InRange(address, prefix, bits)
    );
  }

  if (version !== 6) {
    return true;
  }

  const normalized = address.toLowerCase();

  const dotted = MAPPED_DOTTED.exec(normalized);
  if (dotted?.[1]) {
    return isBlockedAddress(dotted[1]);
  }

  const hex = MAPPED_HEX.exec(normalized);
  if (hex?.[1] && hex[2]) {
    const high = Number.parseInt(hex[1], 16);
    const low = Number.parseInt(hex[2], 16);
    const quad = [
      Math.floor(high / OCTET),
      high % OCTET,
      Math.floor(low / OCTET),
      low % OCTET,
    ].join(".");
    return isBlockedAddress(quad);
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    UNIQUE_LOCAL.test(normalized) ||
    LINK_LOCAL.test(normalized)
  );
};

export class BlockedUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockedUrlError";
  }
}

const assertPublicUrl = async (rawUrl: string): Promise<URL> => {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BlockedUrlError("That URL could not be parsed.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new BlockedUrlError("Only http and https URLs can be checked.");
  }

  const host = url.hostname.replaceAll(IPV6_BRACKETS, "");

  if (isIP(host)) {
    if (isBlockedAddress(host)) {
      throw new BlockedUrlError(
        "That URL points at a private or reserved address."
      );
    }
    return url;
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true });
  } catch {
    throw new BlockedUrlError("That host could not be resolved.");
  }

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isBlockedAddress(address))
  ) {
    throw new BlockedUrlError(
      "That URL resolves to a private or reserved address."
    );
  }

  return url;
};

export const safeFetch = async (
  rawUrl: string,
  init?: RequestInit
): Promise<Response> => {
  let target = rawUrl;
  // One shared budget across every redirect hop, not a fresh timeout per hop.
  const signal = init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- hops are sequential
    const url = await assertPublicUrl(target);
    // oxlint-disable-next-line eslint/no-await-in-loop -- hops are sequential
    const response = await fetch(url, { ...init, redirect: "manual", signal });

    if (!REDIRECT_STATUSES.has(response.status)) {
      return response;
    }

    const location = response.headers.get("location");
    if (!location) {
      return response;
    }

    target = new URL(location, url).toString();
  }

  throw new BlockedUrlError("That URL redirected too many times.");
};
