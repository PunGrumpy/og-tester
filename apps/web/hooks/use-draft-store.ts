import { create } from "zustand";

interface DraftStore {
  /** Exactly what is in the entry field, before any validation. */
  input: string;
  setInput: (input: string) => void;
}

/**
 * The entry field's live value, so the command in the header can echo it.
 *
 * A store rather than a prop or a context because the two live in different
 * subtrees — the field is in the hero, the command is in the header — and
 * neither is an ancestor of the other.
 */
export const useDraftStore = create<DraftStore>((set) => ({
  input: "",
  setInput: (input) => set({ input }),
}));
