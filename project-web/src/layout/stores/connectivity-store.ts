import { create } from "zustand";

interface ConnectivityStore {
  isOffline: boolean;
  setOffline: (value: boolean) => void;
}

export const useConnectivityStore = create<ConnectivityStore>((set) => ({
  isOffline: false,
  setOffline: (value) => set({ isOffline: value }),
}));
