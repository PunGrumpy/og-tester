// oxlint-disable-next-line no-control-regex
const EDGE_REFUSED_BY_NEXT_IMAGE = /^[\u0000-\u0020]|[\u0000-\u0020]$/u;

export const toImageSrc = (value: string | undefined): string | undefined => {
  if (!value) {
    return;
  }

  const trimmed = value.trim();
  if (!trimmed || EDGE_REFUSED_BY_NEXT_IMAGE.test(trimmed)) {
    return;
  }

  return trimmed;
};
