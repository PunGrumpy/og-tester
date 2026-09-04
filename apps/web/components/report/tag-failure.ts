const TERMINAL = /[.!?…]$/u;

const sentence = (text: string): string => {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }
  return TERMINAL.test(trimmed) ? trimmed : `${trimmed}.`;
};

/**
 * The failure copy under Previews and Tags. The cause comes from the
 * server and may be a bare phrase, so it is closed as a sentence before
 * the instruction that follows it.
 */
export const describeTagFailure = (
  errorMessage: string,
  canRescan: boolean
): string => {
  const cause = sentence(errorMessage) || "Unable to read this page’s tags.";
  return canRescan
    ? `${cause} Rescan above once the page responds.`
    : `${cause} The scan is still running; you can rescan once it finishes.`;
};
