import { create } from "zustand";

type Store = {
  destination: {
    x: number;
    y: number;
  } | null;
  setDestination: (x: number, y: number) => void;
}

const useStore = create<Store>((set, get) => ({
  destination: null,
  setDestination: ( x, y) => set({ destination: { x, y } })
}));


export default useStore;
