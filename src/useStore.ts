import { create } from "zustand";
import { produce } from "immer";
import { PLAYER_SPEED, WEIGHTS } from "./constants";

type GameObject = {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  lastVelocity: { x: number; y: number };
  destination: { x: number; y: number };
  rotation: number;
};

type Store = {
  player: GameObject;
  birds: GameObject[];
  setPlayer: (fn: (draft: Store["player"]) => void) => void;
  setBirds: (fn: (draft: Store["birds"]) => void) => void;
  updatePlayer: (delta: number) => void;
  updateBirds: (delta: number) => void;
};

const useStore = create<Store>((set, get) => ({
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
  birds: [],
  setBirds: (fn) =>
    set(
      produce((draft) => {
        fn(draft.birds);
      })
    ),
  updatePlayer: (delta: number) => {
    const { player, setPlayer } = get();
    const { position, destination, lastVelocity } = player;
    const newVelocity = {
      x: destination.x - position.x,
      y: destination.y - position.y,
    };
    const length = Math.sqrt(
      Math.pow(newVelocity.x, 2) + Math.pow(newVelocity.y, 2)
    );
    if (length < 0.1) {
      return;
    }
    newVelocity.x /= length;
    newVelocity.y /= length;

    const velocity = {
      x: lastVelocity.x * 0.97 + newVelocity.x * 0.03,
      y: lastVelocity.y * 0.97 + newVelocity.y * 0.03,
    };

    const rotation = Math.atan2(velocity.y, velocity.x);

    setPlayer((player) => {
      player.position = {
        x: position.x + velocity.x * delta * PLAYER_SPEED,
        y: position.y + velocity.y * delta * PLAYER_SPEED,
      };
      player.velocity = velocity;
      player.lastVelocity = velocity;
      player.rotation = rotation;
    });
  },
  updateBirds: (delta: number) => {
    const { player, setBirds } = get();
    setBirds((birds) => {
      for (let i = 0; i < birds.length; i++) {
        const bird = birds[i];
        const { position, lastVelocity } = bird;
        const playerAttraction = {
          x: player.position.x - position.x,
          y: player.position.y - position.y,
        };

        const attractionLength = Math.sqrt(
          Math.pow(playerAttraction.x, 2) + Math.pow(playerAttraction.y, 2)
        );

        if (attractionLength > WEIGHTS.ATTRACTION_RADIUS()) {
          playerAttraction.x = 0;
          playerAttraction.y = 0;
        }
        const root = document.querySelector("canvas");
        const rect = root!.getBoundingClientRect();
        const center = {
          x: rect.width / 2 + rect.left,
          y: rect.height / 2 + rect.top,
        };
        const centerOfScreenAttraction = {
          x: center.x - position.x,
          y: center.y - position.y,
        };

        const cohesion = birds
          .filter((b) => b !== bird)
          .reduce(
            (acc, bird) => {
              acc.x += bird.position.x;
              acc.y += bird.position.y;
              return acc;
            },
            { x: 0, y: 0 }
          );
        cohesion.x /= birds.length;
        cohesion.y /= birds.length;
        cohesion.x = cohesion.x - position.x;
        cohesion.y = cohesion.y - position.y;

        const alignment = birds
          .filter((b) => b !== bird)
          .reduce(
            (acc, bird) => {
              acc.x += bird.velocity.x;
              acc.y += bird.velocity.y;
              return acc;
            },
            { x: 0, y: 0 }
          );
        alignment.x /= birds.length;
        alignment.y /= birds.length;

        const separation = birds
          .filter((b) => b !== bird)
          .reduce(
            (acc, bird) => {
              const distance = Math.sqrt(
                Math.pow(bird.position.x - position.x, 2) +
                  Math.pow(bird.position.y - position.y, 2)
              );
              acc.x += (bird.position.x - position.x) / distance;
              acc.y += (bird.position.y - position.y) / distance;
              return acc;
            },
            { x: 0, y: 0 }
          );
        separation.x *= -1;
        separation.y *= -1;

        const newVelocity = {
          x:
            playerAttraction.x * WEIGHTS.PLAYER_ATTRACTION +
            centerOfScreenAttraction.x * WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.x * WEIGHTS.COHESION +
            alignment.x * WEIGHTS.ALIGNMENT +
            separation.x * WEIGHTS.SEPARATION,
          y:
            playerAttraction.y * WEIGHTS.PLAYER_ATTRACTION +
            centerOfScreenAttraction.y * WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.y * WEIGHTS.COHESION +
            alignment.y * WEIGHTS.ALIGNMENT +
            separation.y * WEIGHTS.SEPARATION,
        };

        const length = Math.sqrt(
          Math.pow(newVelocity.x, 2) + Math.pow(newVelocity.y, 2)
        );
        if (length < 0.01) {
          return;
        }
        newVelocity.x /= length;
        newVelocity.y /= length;

        const velocity = {
          x: lastVelocity.x * 0.985 + newVelocity.x * 0.015,
          y: lastVelocity.y * 0.985 + newVelocity.y * 0.015,
        };

        const velocityLength = Math.sqrt(
          Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2)
        );
        velocity.x /= velocityLength;
        velocity.y /= velocityLength;

        velocity.x *= 0.2;
        velocity.y *= 0.2;

        const rotation = Math.atan2(velocity.y, velocity.x);

        bird.position = {
          x: position.x + velocity.x * delta * (25 + Math.random() - 0.5),
          y: position.y + velocity.y * delta * (25 + Math.random() - 0.5),
        };
        bird.velocity = velocity;
        bird.lastVelocity = velocity;
        bird.rotation = rotation;
      }
    });
  },
}));

export default useStore;
