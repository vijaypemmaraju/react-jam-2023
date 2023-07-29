import { create } from "zustand";
import { produce } from "immer";
import { PLAYER_SPEED } from "./constants";
import { Viewport as PixiViewport } from "pixi-viewport";
import { Emitter } from "@pixi/particle-emitter";
import { Circle, ColorSource } from "pixi.js";
import { sound } from "@pixi/sound";
import { fanLoopFilters } from "./sounds";

type GameObject = {
  id?: number;
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
  timeUntilNextFlapSound: number;
};

type Bird = GameObject & {
  attractionPoint?: { x: number; y: number };
  acquiredBy?: "player" | "rival" | null;
};

type Player = GameObject & {
  zone?: Circle;
};

export type Rival = GameObject & {
  zone?: Circle;
  attractionPoint?: { x: number; y: number };
};

type Store = {
  mode: "main" | "play" | "pause" | "end";
  setMode: (mode: Store["mode"]) => void;
  player: Player;
  birds: Bird[];
  rivals: Rival[];
  setPlayer: (fn: (draft: Store["player"]) => void) => void;
  setBirds: (fn: (draft: Store["birds"]) => void) => void;
  setRivals: (fn: (draft: Store["rivals"]) => void) => void;
  updatePlayer: (delta: number) => void;
  updateBirds: (delta: number) => void;
  updateRivals: (delta: number) => void;
  viewport: PixiViewport | null;
  setViewport: (viewport: PixiViewport) => void;
  audioDataArray: Uint8Array;
  setAudioDataArray: (audioDataArray: Uint8Array) => void;
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
  mode: "main",
  setMode: (mode) => set({ mode }),
  audioDataArray: new Uint8Array(0),
  setAudioDataArray: (audioDataArray) => set({ audioDataArray }),
  WEIGHTS: {
    PLAYER_ATTRACTION: 20,
    CENTER_OF_SCREEN_ATTRACTION: 1,
    ATTRACTION_RADIUS: 300,
    FORCE_RADIUS: 400,
    COHESION: 5,
    ALIGNMENT: 5,
    SEPARATION: 100,
    HIGH_SPEED_THRESHOLD: 250,
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
    timeUntilNextFlapSound: 0,
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
  rivals: [],
  setRivals: (fn) =>
    set(
      produce((draft) => {
        fn(draft.rivals);
      })
    ),
  updatePlayer: (delta: number) => {
    const { player, setPlayer, WEIGHTS, audioDataArray } = get();

    const { position, destination, lastVelocity } = player;
    const newVelocity = {
      x: destination.x - position.x,
      y: destination.y - position.y,
    };
    const length = Math.sqrt(
      Math.pow(newVelocity.x, 2) + Math.pow(newVelocity.y, 2)
    );
    const fanLoop = sound.find("fan_loop");
    if (fanLoop) {
      fanLoop.volume = 0.1 + (length / 500) * 0.2;
      fanLoop.speed = length / 1000;
      fanLoop.filters = fanLoopFilters;
    }

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

    if (player.torque > 0.1 && player.timeUntilNextFlapSound <= 0) {
      sound.play("woosh", {
        volume: 0.03,
        speed: 1 + Math.random() * 0.2 - 0.1,
      });
      setPlayer((player) => {
        player.timeUntilNextFlapSound = Math.random() * 5 + 10;
      });
    }
    setPlayer((player) => {
      player.timeUntilNextFlapSound -= delta;
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

    player.zone!.x +=
      (Math.random() - 0.5) * ((audioDataArray[0] || 0) / 2048) * delta * 25;
    player.zone!.y +=
      (Math.random() - 0.5) * ((audioDataArray[0] || 0) / 2048) * delta * 25;
  },
  updateBirds: (delta: number) => {
    const { player, rivals, setBirds, WEIGHTS, audioDataArray } = get();
    setBirds((birds) => {
      let cohesion, alignment, separation, distance;
      const center = { x: 0, y: 0 };
      const root = document.querySelector("canvas");
      const rect = root!.getBoundingClientRect();
      center.x = rect.width / 2;
      center.y = rect.height / 2;

      for (let i = 0; i < birds.length; i++) {
        const bird = birds[i];
        const suitors = bird.attractionPoint ? [] : [player, ...rivals];
        let closestSuitor = null;
        let closestDistance = Infinity;
        if (!bird.attractionPoint) {
          for (let j = 0; j < suitors.length; j++) {
            const suitor = suitors[j];
            const distance = Math.sqrt(
              Math.pow(suitor.position.x - birds[i].position.x, 2) +
                Math.pow(suitor.position.y - birds[i].position.y, 2)
            );

            if (distance < closestDistance) {
              closestDistance = distance;
              closestSuitor = suitor;
            }
          }
        }
        if (!closestSuitor) {
          closestSuitor = player;
        }

        bird.timeUntilNextFlapSound -= delta;
        const position = bird.position;
        const lastVelocity = bird.lastVelocity;

        const closestSuitorAttraction = {
          x: closestSuitor.position.x - position.x,
          y: closestSuitor.position.y - position.y,
        };

        const playerAttraction = {
          x: player.position.x - position.x,
          y: player.position.y - position.y,
        };

        const playerAttractionLength = Math.sqrt(
          Math.pow(playerAttraction.x, 2) + Math.pow(playerAttraction.y, 2)
        );

        const isCloseToPlayer =
          closestSuitor === player &&
          !bird.attractionPoint &&
          playerAttractionLength < WEIGHTS.ATTRACTION_RADIUS;

        const isActuallyCloseToPlayer =
          closestSuitor === player &&
          playerAttractionLength < WEIGHTS.ATTRACTION_RADIUS / 2;

        if (
          bird.attractionPoint ||
          (closestSuitor === player && !isCloseToPlayer)
        ) {
          closestSuitorAttraction.x = 0;
          closestSuitorAttraction.y = 0;
        }
        if (
          closestSuitor === player &&
          closestSuitor.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
        ) {
          closestSuitorAttraction.x *= -10;
          closestSuitorAttraction.y *= -10;
        }

        const pointAttraction = {
          x: (bird.attractionPoint?.x || center.x) - position.x,
          y: (bird.attractionPoint?.y || center.y) - position.y,
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

        const newVelocity = {
          x:
            closestSuitorAttraction.x *
              (closestSuitor === player &&
              isActuallyCloseToPlayer &&
              player.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? 10
                : 1) *
              WEIGHTS.PLAYER_ATTRACTION +
            (bird.attractionPoint ? 1000000 : 1) * pointAttraction.x +
            WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.x *
              (bird.attractionPoint ? 4000 : 1) *
              WEIGHTS.COHESION *
              (isActuallyCloseToPlayer && bird.attractionPoint ? 100 : 1) +
            alignment.x * WEIGHTS.ALIGNMENT +
            separation.x * WEIGHTS.SEPARATION,
          y:
            closestSuitorAttraction.y *
              (closestSuitor === player &&
              isActuallyCloseToPlayer &&
              player.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? 100
                : 1) *
              WEIGHTS.PLAYER_ATTRACTION +
            (bird.attractionPoint ? 1000000 : 1) * pointAttraction.y +
            WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.y *
              (bird.attractionPoint ? 4000 : 1) *
              WEIGHTS.COHESION *
              (isActuallyCloseToPlayer && bird.attractionPoint ? 100 : 1) +
            alignment.y * WEIGHTS.ALIGNMENT +
            separation.y * WEIGHTS.SEPARATION,
        };

        const length = Math.sqrt(
          Math.pow(newVelocity.x, 2) + Math.pow(newVelocity.y, 2)
        );
        const cappedLength = Math.min(length, 500000);
        if (length < 0.01) {
          continue;
        }

        newVelocity.x /= length;
        newVelocity.y /= length;

        const velocity = {
          x: lastVelocity.x * 0.989 + newVelocity.x * 0.011,
          y: lastVelocity.y * 0.989 + newVelocity.y * 0.011,
        };

        const velocityLength = Math.sqrt(
          Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2)
        );
        velocity.x /= velocityLength;
        velocity.y /= velocityLength;

        if (
          isActuallyCloseToPlayer &&
          player.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
        ) {
        } else {
          velocity.x *= bird.attractionPoint
            ? Math.pow(audioDataArray[0] / 2048, 5) *
              (isActuallyCloseToPlayer ? 8000 : 10000)
            : 0.2;
          velocity.y *= bird.attractionPoint
            ? Math.pow(audioDataArray[0] / 2048, 5) *
              (isActuallyCloseToPlayer ? 8000 : 10000)
            : 0.2;
        }

        const rotation = Math.atan2(velocity.y, velocity.x);

        bird.position = {
          x:
            position.x +
            velocity.x *
              delta *
              ((isCloseToPlayer &&
              closestSuitor.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? closestSuitor.acceleration / 19
                : 25) +
                Math.random() -
                0.5),
          y:
            position.y +
            velocity.y *
              delta *
              ((isCloseToPlayer &&
              closestSuitor.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? closestSuitor.acceleration / 19
                : 25) +
                Math.random() -
                0.5),
        };

        let inAZone = false;

        if (player.zone?.contains(bird.position.x, bird.position.y)) {
          if (!bird.attractionPoint) {
            sound.play("chirp", {
              volume: 0.02 + Math.random() * 0.02,
              speed: 1.0 + Math.random() * 0.2 - 0.1,
            });
          }
          bird.attractionPoint = {
            x: player.zone.x,
            y: player.zone.y,
          };
          bird.acquiredBy = "player";

          inAZone = true;
        }

        for (let j = 0; j < rivals.length; j++) {
          const rival = rivals[j];
          if (rival.zone?.contains(bird.position.x, bird.position.y)) {
            if (!bird.attractionPoint) {
              sound.play("chirp", {
                volume: 0.02 + Math.random() * 0.02,
                speed: 0.9 + Math.random() * 0.2 - 0.1,
              });
            }
            bird.attractionPoint = {
              x: rival.zone.x,
              y: rival.zone.y,
            };
            bird.acquiredBy = "rival";
            inAZone = true;
          }
        }

        if (!inAZone) {
          if (bird.attractionPoint) {
            sound.play("chirp", {
              volume: 0.05 + Math.random() * 0.05,
              speed: 0.5 + Math.random() * 0.2 - 0.1,
            });
          }
          bird.attractionPoint = undefined;
          bird.acquiredBy = null;
        }

        bird.velocity = velocity;
        bird.lastVelocity = velocity;
        bird.rotation = rotation;
        bird.torque = Math.abs(bird.rotation - (bird.lastRotation || 0));
        while (bird.torque > Math.PI) {
          bird.torque -= Math.PI * 2;
        }
        bird.lastRotation = rotation;
        bird.acceleration = length;

        const volumeRelativeToPlayer = Math.max(
          0,
          (0.01 + Math.random() * 0.01) *
            (1 - playerAttractionLength / WEIGHTS.ATTRACTION_RADIUS)
        );

        if (bird.timeUntilNextFlapSound <= 0) {
          sound.play(
            ["wing_flap", "wing_flap_2"][Math.floor(Math.random() * 2)],
            {
              volume: volumeRelativeToPlayer,
              speed: 3 + Math.random() * 0.5 - 0.25,
            }
          );
          bird.timeUntilNextFlapSound = Math.random() * 60 + 25;
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
          Math.max((cappedLength - 5000000) / 5000000, 0) +
          Math.min(bird.torque * 0.1, 0.01) +
          (bird.attractionPoint ? 0.1 : 0);
      }
    });
  },
  updateRivals: (delta: number) => {
    const { player, birds, setRivals, WEIGHTS, audioDataArray } = get();
    setRivals((rivals) => {
      let cohesion, alignment, separation, distance;
      const center = { x: 0, y: 0 };
      const root = document.querySelector("canvas");
      const rect = root!.getBoundingClientRect();
      center.x = rect.width / 2;
      center.y = rect.height / 2;

      for (let i = 0; i < rivals.length; i++) {
        const rival = rivals[i];

        rival.timeUntilNextFlapSound -= delta;
        const position = rival.position;
        const lastVelocity = rival.lastVelocity;

        const unacquiredBirds = birds.filter((bird) => !bird.attractionPoint);

        const numberOfNearbyUnacquiredBirds = unacquiredBirds.filter(
          (bird) =>
            Math.sqrt(
              Math.pow(bird.position.x - position.x, 2) +
                Math.pow(bird.position.y - position.y, 2)
            ) < 200
        ).length;

        if (
          rival.zone &&
          (numberOfNearbyUnacquiredBirds > unacquiredBirds.length * 0.25 ||
            unacquiredBirds.length === 0)
        ) {
          rival.attractionPoint = {
            x: rival.zone.x + rival.zone.radius,
            y: rival.zone.y + rival.zone.radius,
          };
        } else {
          rival.attractionPoint = undefined;
        }

        const playerAttraction = {
          x: player.position.x - position.x,
          y: player.position.y - position.y,
        };

        const playerAttractionLength = Math.sqrt(
          Math.pow(playerAttraction.x, 2) + Math.pow(playerAttraction.y, 2)
        );

        const pointAttraction = {
          x: (rival.attractionPoint?.x || center.x) - position.x,
          y: (rival.attractionPoint?.y || center.y) - position.y,
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

        const distanceFromPlayerZone = {
          x: player.zone!.x + player.zone!.radius - position.x,
          y: player.zone!.y + player.zone!.radius - position.y,
        };

        const distanceFromPlayerZoneLength = Math.sqrt(
          Math.pow(distanceFromPlayerZone.x, 2) +
            Math.pow(distanceFromPlayerZone.y, 2)
        );

        const newVelocity = {
          x:
            (1 - distanceFromPlayerZoneLength / 1000) *
              distanceFromPlayerZone.x *
              0.1 +
            WEIGHTS.PLAYER_ATTRACTION +
            pointAttraction.x +
            WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.x * WEIGHTS.COHESION +
            alignment.x * WEIGHTS.ALIGNMENT +
            separation.x * WEIGHTS.SEPARATION,
          y:
            (1 - distanceFromPlayerZoneLength / 1000) *
              distanceFromPlayerZone.y *
              0.1 +
            WEIGHTS.PLAYER_ATTRACTION +
            pointAttraction.y +
            WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.y * WEIGHTS.COHESION +
            alignment.y * WEIGHTS.ALIGNMENT +
            separation.y * WEIGHTS.SEPARATION,
        };

        const length = Math.sqrt(
          Math.pow(newVelocity.x, 2) + Math.pow(newVelocity.y, 2)
        );
        const cappedLength = Math.min(length, 500000);
        if (length < 0.01) {
          continue;
        }

        newVelocity.x /= length;
        newVelocity.y /= length;

        const velocity = {
          x: lastVelocity.x * 0.989 + newVelocity.x * 0.011,
          y: lastVelocity.y * 0.989 + newVelocity.y * 0.011,
        };

        const velocityLength = Math.sqrt(
          Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2)
        );
        velocity.x /= velocityLength;
        velocity.y /= velocityLength;

        velocity.x *= rival.attractionPoint ? 0.1 : 0.2;
        velocity.y *= rival.attractionPoint ? 0.1 : 0.2;

        const rotation = Math.atan2(velocity.y, velocity.x);

        rival.position = {
          x: position.x + velocity.x * delta * (25 + Math.random() - 0.5),
          y: position.y + velocity.y * delta * (25 + Math.random() - 0.5),
        };

        rival.velocity = velocity;
        rival.lastVelocity = velocity;
        rival.rotation = rotation;
        rival.torque = Math.abs(rival.rotation - (rival.lastRotation || 0));
        while (rival.torque > Math.PI) {
          rival.torque -= Math.PI * 2;
        }
        rival.lastRotation = rotation;
        rival.acceleration = length;

        const volumeRelativeToPlayer = Math.max(
          0,
          (0.01 + Math.random() * 0.01) *
            (1 - playerAttractionLength / WEIGHTS.ATTRACTION_RADIUS)
        );

        if (rival.timeUntilNextFlapSound <= 0) {
          sound.play(
            ["wing_flap", "wing_flap_2"][Math.floor(Math.random() * 2)],
            {
              volume: volumeRelativeToPlayer,
              speed: 3 + Math.random() * 0.5 - 0.25,
            }
          );
          rival.timeUntilNextFlapSound = Math.random() * 60 + 25;
        }

        rival.emitter?.rotate(rotation + Math.PI);
        rival.emitter!.particlesPerWave = 1;
        rival.emitter!.spawnPos.x =
          position.x -
          Math.cos(rotation + Math.PI / 4) * 16 -
          Math.cos(rotation) * 4;
        rival.emitter!.spawnPos.y =
          position.y -
          Math.sin(rotation + Math.PI / 4) * 16 -
          Math.sin(rotation) * 4;
        rival.emitter!.emitNow();
        rival.emitter!.spawnPos.x =
          position.x -
          Math.cos(rotation - Math.PI / 4) * 16 -
          Math.cos(rotation) * 4;
        rival.emitter!.spawnPos.y =
          position.y -
          Math.sin(rotation - Math.PI / 4) * 16 -
          Math.sin(rotation) * 4;
        rival.emitter!.emitNow();
        rival.emitter!.spawnChance =
          Math.max((cappedLength - 5000000) / 5000000, 0) +
          Math.min(rival.torque * 0.1, 0.01);
        rival.zone!.x +=
          (Math.random() - 0.5) *
          ((audioDataArray[0] || 0) / 2048) *
          delta *
          25;
        rival.zone!.y +=
          (Math.random() - 0.5) *
          ((audioDataArray[0] || 0) / 2048) *
          delta *
          25;
      }
    });
  },
  viewport: null,
  setViewport: (viewport) => set({ viewport }),
}));

export default useStore;
