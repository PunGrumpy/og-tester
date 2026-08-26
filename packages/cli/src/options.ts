import { InvalidArgumentError } from "commander";

const toWholeNumber = (val: string): number => {
  const parsed = Math.trunc(Number(val));
  if (!Number.isFinite(parsed)) {
    throw new InvalidArgumentError("Expected a whole number.");
  }
  return parsed;
};

export const parseCount = (val: string): number => {
  const parsed = toWholeNumber(val);
  if (parsed < 1) {
    throw new InvalidArgumentError("Expected a whole number of 1 or more.");
  }
  return parsed;
};

export const parseScore = (val: string): number => {
  const parsed = toWholeNumber(val);
  if (parsed < 0 || parsed > 100) {
    throw new InvalidArgumentError(
      "Expected a whole number between 0 and 100."
    );
  }
  return parsed;
};
