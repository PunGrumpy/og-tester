import { create } from "zustand";

import type { OgData } from "@/lib/schemas/og";

export type OgStatus = "loading" | "ready" | "error";

interface OgStore {
  url: string;
  data: OgData;
  status: OgStatus;
  errorMessage: string;
  setResult: (url: string, data: OgData) => void;
  setLoading: (url: string) => void;
  setError: (message: string) => void;
}

export const useOgStore = create<OgStore>((set) => ({
  data: {},
  errorMessage: "",
  setError: (errorMessage) => set({ errorMessage, status: "error" }),
  setLoading: (url) =>
    set({ data: {}, errorMessage: "", status: "loading", url }),
  setResult: (url, data) =>
    set({ data, errorMessage: "", status: "ready", url }),
  status: "loading",
  url: "",
}));
