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
      let bird,
        position,
        lastVelocity,
        playerAttraction,
        attractionLength,
        centerOfScreenAttraction,
        newVelocity,
        length,
        velocity,
        velocityLength,
        rotation;
      let cohesion, alignment, separation, distance;
      let center = { x: 0, y: 0 };
      const root = document.querySelector("canvas");
      const rect = root!.getBoundingClientRect();
      center.x = rect.width / 2;
      center.y = rect.height / 2;

      for (let i = 0; i < birds.length; i++) {
        bird = birds[i];
        position = bird.position;
        lastVelocity = bird.lastVelocity;

        playerAttraction = {
          x: player.position.x - position.x,
          y: player.position.y - position.y,
        };

        attractionLength = Math.sqrt(
          Math.pow(playerAttraction.x, 2) + Math.pow(playerAttraction.y, 2)
        );
        if (attractionLength > WEIGHTS.ATTRACTION_RADIUS()) {
          playerAttraction.x = 0;
          playerAttraction.y = 0;
        }

        centerOfScreenAttraction = {
          x: center.x - position.x,
          y: center.y - position.y,
        };

        cohesion = { x: 0, y: 0 };
        alignment = { x: 0, y: 0 };
        separation = { x: 0, y: 0 };
        let count = 0;

        for (let j = 0; j < birds.length; j++) {
          if (i !== j) {
            distance = Math.sqrt(
              Math.pow(birds[j].position.x - position.x, 2) +
                Math.pow(birds[j].position.y - position.y, 2)
            );
            if (distance < WEIGHTS.FORCE_RADIUS()) {
              cohesion.x += birds[j].position.x;
              cohesion.y += birds[j].position.y;

              alignment.x += birds[j].velocity.x;
              alignment.y += birds[j].velocity.y;

              separation.x += (birds[j].position.x - position.x) / distance;
              separation.y += (birds[j].position.y - position.y) / distance;
              count++;
            }
          }
        }

        if (count > 0) {
          cohesion.x = cohesion.x / count - position.x;
          cohesion.y = cohesion.y / count - position.y;

          alignment.x /= count;
          alignment.y /= count;

          separation.x *= -1;
          separation.y *= -1;
        }

        newVelocity = {
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

        length = Math.sqrt(
          Math.pow(newVelocity.x, 2) + Math.pow(newVelocity.y, 2)
        );
        if (length < 0.01) {
          continue;
        }

        newVelocity.x /= length;
        newVelocity.y /= length;

        velocity = {
          x: lastVelocity.x * 0.985 + newVelocity.x * 0.015,
          y: lastVelocity.y * 0.985 + newVelocity.y * 0.015,
        };

        velocityLength = Math.sqrt(
          Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2)
        );
        velocity.x /= velocityLength;
        velocity.y /= velocityLength;

        velocity.x *= 0.2;
        velocity.y *= 0.2;

        rotation = Math.atan2(velocity.y, velocity.x);

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
