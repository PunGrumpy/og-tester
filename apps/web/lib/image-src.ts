/**
 * Characters `next/image` refuses at either end of a src.
 *
 * Mirrors its own guard exactly — `/^[\x00-\x20]/` and `/[\x00-\x20]$/` in
 * `get-img-props` — so this accepts precisely what it accepts. Written with
 * Unicode escapes rather than literal control characters, which is what the
 * lint rule against control-character classes asks for.
 */
// Matching control characters is the whole point here, and next/image
// carries the identical disable above the guard this mirrors.
// oxlint-disable-next-line no-control-regex
const EDGE_REFUSED_BY_NEXT_IMAGE = /^[\u0000-\u0020]|[\u0000-\u0020]$/u;

/**
 * A src `next/image` can be handed without throwing, or `undefined`.
 *
 * Every image on a report comes from the site being scanned, so the value is
 * whatever that site's author typed. `next/image` does not treat a bad src as
 * a broken image — it throws during render, which takes the whole page down
 * rather than the one card. A trailing newline is enough, and a meta tag on
 * its own line is ordinary formatting.
 *
 * The parser trims at the source now, but reports are stored, so ones written
 * before that fix are still on disk. This is the guard on the render side that
 * does not depend on when the report was scanned. Callers already have a "no
 * image" branch; `undefined` sends them down it.
 */
export const toImageSrc = (value: string | undefined): string | undefined => {
  if (!value) {
    return;
  }

  // `trim` clears whitespace but leaves the low control characters, which
  // `next/image` refuses just as firmly.
  const trimmed = value.trim();
  if (!trimmed || EDGE_REFUSED_BY_NEXT_IMAGE.test(trimmed)) {
    return;
  }

  return trimmed;
};
