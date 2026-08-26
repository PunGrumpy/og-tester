import { create } from "zustand";

interface DraftStore {
  input: string;
  setInput: (input: string) => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  input: "",
  setInput: (input) => set({ input }),
}));
