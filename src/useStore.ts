import { create } from "zustand";
import { produce } from "immer";

type Store = {
  player: {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    lastVelocity: { x: number; y: number };
    destination: { x: number; y: number };
    rotation: number;
  };
  setPlayer: (fn: (draft: Store["player"]) => void) => void;
};

const useStore = create<Store>((set, _get) => ({
  player: {
    position: { x: 400, y: 270 },
    velocity: { x: 0, y: 0 },
    lastVelocity: { x: 0, y: 0 },
    destination: { x: 400, y: 270 },
    rotation: 0,
  },
  setPlayer: (fn) =>
    set(
      produce((draft) => {
        fn(draft.player);
      })
    ),
}));

export default useStore;
