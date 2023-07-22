import { create } from "zustand";
import { produce } from "immer";
import { PLAYER_SPEED } from "./constants";
import { Viewport as PixiViewport } from "pixi-viewport";
import { Emitter } from "@pixi/particle-emitter";
import { ColorSource } from "pixi.js";
import { sound } from "@pixi/sound";

type GameObject = {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: number;
  lastVelocity: { x: number; y: number };
  destination: { x: number; y: number };
  rotation: number;
  lastRotation?: number;
  torque: number;
  emitter?: Emitter;
  speedBoost?: number;
  tint?: ColorSource;
  playingSound?: boolean;
};

type Store = {
  player: GameObject;
  birds: GameObject[];
  setPlayer: (fn: (draft: Store["player"]) => void) => void;
  setBirds: (fn: (draft: Store["birds"]) => void) => void;
  updatePlayer: (delta: number) => void;
  updateBirds: (delta: number) => void;
  viewport: PixiViewport | null;
  setViewport: (viewport: PixiViewport) => void;
  WEIGHTS: {
    PLAYER_ATTRACTION: number;
    CENTER_OF_SCREEN_ATTRACTION: number;
    ATTRACTION_RADIUS: number;
    FORCE_RADIUS: number;
    COHESION: number;
    ALIGNMENT: number;
    SEPARATION: number;
    HIGH_SPEED_THRESHOLD: number;
  };
};

const useStore = create<Store>((set, get) => ({
  WEIGHTS: {
    PLAYER_ATTRACTION: 10,
    CENTER_OF_SCREEN_ATTRACTION: 1,
    ATTRACTION_RADIUS: 300,
    FORCE_RADIUS: 400,
    COHESION: 5,
    ALIGNMENT: 5,
    SEPARATION: 100,
    HIGH_SPEED_THRESHOLD: 500,
  },
  player: {
    position: { x: 400, y: 270 },
    velocity: { x: 0, y: 0 },
    lastVelocity: { x: 0, y: 0 },
    acceleration: 0,
    destination: { x: 400, y: 270 },
    speedBoost: 1,
    rotation: 0,
    torque: 0,
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
    const { player, setPlayer, WEIGHTS } = get();

    const { position, destination, lastVelocity } = player;
    const newVelocity = {
      x: destination.x - position.x,
      y: destination.y - position.y,
    };
    const length = Math.sqrt(
      Math.pow(newVelocity.x, 2) + Math.pow(newVelocity.y, 2)
    );
    const fanLoop = sound.find("fan_loop");
    fanLoop.volume = 0.1 + (length / 1000) * 0.4;
    fanLoop.speed = length / 1000;
    newVelocity.x /= length;
    newVelocity.y /= length;

    const velocity = {
      x: lastVelocity.x * 0.97 + newVelocity.x * 0.03,
      y: lastVelocity.y * 0.97 + newVelocity.y * 0.03,
    };
    const velocityMagnitude = Math.sqrt(
      Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2)
    );

    if (velocityMagnitude < 0.02) {
      velocity.x = 0;
      velocity.y = 0;
    }
    const rotation = Math.atan2(velocity.y, velocity.x);
    player.emitter?.rotate(rotation + Math.PI);
    player.emitter!.particlesPerWave = 1;

    player.emitter!.spawnPos.x =
      position.x -
      Math.cos(rotation + Math.PI / 4) * 16 -
      Math.cos(rotation) * 4;
    player.emitter!.spawnPos.y =
      position.y -
      Math.sin(rotation + Math.PI / 4) * 16 -
      Math.sin(rotation) * 4;
    player.emitter!.emitNow();
    player.emitter!.spawnPos.x =
      position.x -
      Math.cos(rotation - Math.PI / 4) * 16 -
      Math.cos(rotation) * 4;
    player.emitter!.spawnPos.y =
      position.y -
      Math.sin(rotation - Math.PI / 4) * 16 -
      Math.sin(rotation) * 4;
    player.emitter!.emitNow();
    player.emitter!.spawnChance =
      Math.max(
        (length - WEIGHTS.HIGH_SPEED_THRESHOLD) / WEIGHTS.HIGH_SPEED_THRESHOLD,
        0
      ) +
      Math.min(player.torque, 0.0) * 2;

    if (player.torque > 0.08 && !player.playingSound) {
      sound.play("woosh", {
        volume: 0.03,
        speed: 1 + Math.random() * 0.2 - 0.1,
        complete: () => {
          setPlayer((player) => {
            player.playingSound = false;
          });
        },
      });
      setPlayer((player) => {
        player.playingSound = true;
      });
    }
    setPlayer((player) => {
      player.position = {
        x:
          position.x +
          velocity.x *
            delta *
            Math.min(30, PLAYER_SPEED * length * (player.speedBoost || 1)),
        y:
          position.y +
          velocity.y *
            delta *
            Math.min(30, PLAYER_SPEED * length * (player.speedBoost || 1)),
      };
      player.velocity = velocity;
      player.lastVelocity = velocity;
      player.rotation = rotation;
      player.torque = Math.abs(player.rotation - (player.lastRotation || 0));
      while (player.torque > Math.PI) {
        player.torque -= Math.PI * 2;
      }
      player.lastRotation = rotation;
      player.acceleration = length;
    });
  },
  updateBirds: (delta: number) => {
    const { player, setBirds, WEIGHTS } = get();
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
      const center = { x: 0, y: 0 };
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

        const isCloseToPlayer = attractionLength < WEIGHTS.ATTRACTION_RADIUS;

        if (!isCloseToPlayer) {
          playerAttraction.x = 0;
          playerAttraction.y = 0;
        }
        if (player.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD) {
          playerAttraction.x *= -10;
          playerAttraction.y *= -10;
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
            if (distance < WEIGHTS.FORCE_RADIUS) {
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
            playerAttraction.x *
              (isCloseToPlayer &&
              player.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? 10
                : 1) *
              WEIGHTS.PLAYER_ATTRACTION +
            centerOfScreenAttraction.x * WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.x * WEIGHTS.COHESION +
            alignment.x * WEIGHTS.ALIGNMENT +
            separation.x * WEIGHTS.SEPARATION,
          y:
            playerAttraction.y *
              (isCloseToPlayer &&
              player.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? 100
                : 1) *
              WEIGHTS.PLAYER_ATTRACTION +
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
          x: lastVelocity.x * 0.989 + newVelocity.x * 0.011,
          y: lastVelocity.y * 0.989 + newVelocity.y * 0.011,
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
          x:
            position.x +
            velocity.x *
              delta *
              ((isCloseToPlayer &&
              player.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? player.acceleration / 19
                : 25) +
                Math.random() -
                0.5),
          y:
            position.y +
            velocity.y *
              delta *
              ((isCloseToPlayer &&
              player.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? player.acceleration / 19
                : 25) +
                Math.random() -
                0.5),
        };
        bird.velocity = velocity;
        bird.lastVelocity = velocity;
        bird.rotation = rotation;
        bird.torque = Math.abs(bird.rotation - (bird.lastRotation || 0));
        while (bird.torque > Math.PI) {
          bird.torque -= Math.PI * 2;
        }
        bird.lastRotation = rotation;
        bird.acceleration = length;

        if (!bird.playingSound) {
          sound.play(
            ["wing_flap", "wing_flap_2"][Math.floor(Math.random() * 2)],
            {
              volume: Math.max(
                0,
                (0.03 + Math.random() * 0.01) *
                  (1 - attractionLength / WEIGHTS.ATTRACTION_RADIUS)
              ),
              speed: 1.1 + Math.random() * 0.2 - 0.1,
              complete: () => {
                setBirds((birds) => {
                  birds[i].playingSound = false;
                });
              },
            }
          );
          bird.playingSound = true;
        }

        bird.emitter?.rotate(rotation + Math.PI);
        bird.emitter!.particlesPerWave = 1;
        bird.emitter!.spawnPos.x =
          position.x -
          Math.cos(rotation + Math.PI / 4) * 16 -
          Math.cos(rotation) * 4;
        bird.emitter!.spawnPos.y =
          position.y -
          Math.sin(rotation + Math.PI / 4) * 16 -
          Math.sin(rotation) * 4;
        bird.emitter!.emitNow();
        bird.emitter!.spawnPos.x =
          position.x -
          Math.cos(rotation - Math.PI / 4) * 16 -
          Math.cos(rotation) * 4;
        bird.emitter!.spawnPos.y =
          position.y -
          Math.sin(rotation - Math.PI / 4) * 16 -
          Math.sin(rotation) * 4;
        bird.emitter!.emitNow();
        bird.emitter!.spawnChance =
          Math.max((length - 100000) / 100000, 0) +
          Math.min(bird.torque * 0.1, 0.01);
      }
    });
  },
  viewport: null,
  setViewport: (viewport) => set({ viewport }),
}));

export default useStore;
