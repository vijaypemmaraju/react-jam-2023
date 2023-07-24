import { create } from "zustand";
import { produce } from "immer";
import { PLAYER_SPEED } from "./constants";
import { Viewport as PixiViewport } from "pixi-viewport";
import { Emitter } from "@pixi/particle-emitter";
import { ColorSource, Rectangle } from "pixi.js";
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
};

type Player = GameObject & {
  zone?: Rectangle;
};

type Rival = GameObject & {
  zone?: Rectangle;
};

type Store = {
  mode: "main" | "play" | "pause";
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
  },
  updateBirds: (delta: number) => {
    const { player, rivals, setBirds, WEIGHTS } = get();
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
          !bird.attractionPoint &&
          playerAttractionLength < WEIGHTS.ATTRACTION_RADIUS;

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
              (isCloseToPlayer &&
              closestSuitor.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? 10
                : 1) *
              WEIGHTS.PLAYER_ATTRACTION +
            (bird.attractionPoint ? 1000000 : 1) * pointAttraction.x +
            WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.x * (bird.attractionPoint ? 1000 : 1) * WEIGHTS.COHESION +
            alignment.x * WEIGHTS.ALIGNMENT +
            separation.x * WEIGHTS.SEPARATION,
          y:
            closestSuitorAttraction.y *
              (isCloseToPlayer &&
              closestSuitor.acceleration > WEIGHTS.HIGH_SPEED_THRESHOLD
                ? 100
                : 1) *
              WEIGHTS.PLAYER_ATTRACTION +
            (bird.attractionPoint ? 1000000 : 1) * pointAttraction.y +
            WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.y * (bird.attractionPoint ? 1000 : 1) * WEIGHTS.COHESION +
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

        velocity.x *= bird.attractionPoint ? 0.1 : 0.2;
        velocity.y *= bird.attractionPoint ? 0.1 : 0.2;

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

        if (player.zone?.contains(bird.position.x, bird.position.y)) {
          bird.attractionPoint = {
            x: player.zone.x + player.zone.width / 2,
            y: player.zone.y + player.zone.height / 2,
          };
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

        const fanLoop = sound.find(`fan_loop_${bird.id}`);
        if (fanLoop) {
          fanLoop.volume = Math.pow(volumeRelativeToPlayer, 2) * 1000;
          fanLoop.speed = length / 2000;
          fanLoop.filters = fanLoopFilters;
        }

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
    const { player, setRivals, WEIGHTS } = get();
    setRivals((rivals) => {
      let rival,
        position,
        lastVelocity,
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

      for (let i = 0; i < rivals.length; i++) {
        rival = rivals[i];
        rival.timeUntilNextFlapSound -= delta;
        position = rival.position;
        lastVelocity = rival.lastVelocity;

        centerOfScreenAttraction = {
          x: center.x - position.x,
          y: center.y - position.y,
        };

        cohesion = { x: 0, y: 0 };
        alignment = { x: 0, y: 0 };
        separation = { x: 0, y: 0 };
        let count = 0;

        for (let j = 0; j < rivals.length; j++) {
          if (i !== j) {
            distance = Math.sqrt(
              Math.pow(rivals[j].position.x - position.x, 2) +
                Math.pow(rivals[j].position.y - position.y, 2)
            );
            if (distance < WEIGHTS.FORCE_RADIUS) {
              cohesion.x += rivals[j].position.x;
              cohesion.y += rivals[j].position.y;

              alignment.x += rivals[j].velocity.x;
              alignment.y += rivals[j].velocity.y;

              separation.x += (rivals[j].position.x - position.x) / distance;
              separation.y += (rivals[j].position.y - position.y) / distance;
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
            centerOfScreenAttraction.x * WEIGHTS.CENTER_OF_SCREEN_ATTRACTION +
            cohesion.x * WEIGHTS.COHESION +
            alignment.x * WEIGHTS.ALIGNMENT +
            separation.x * WEIGHTS.SEPARATION,
          y:
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

        rival.position = {
          x: position.x + velocity.x * delta * 25 + Math.random() - 0.5,
          y: position.y + velocity.y * delta * 25 + Math.random() - 0.5,
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

        const playerAttraction = {
          x: player.position.x - position.x,
          y: player.position.y - position.y,
        };

        attractionLength = Math.sqrt(
          Math.pow(playerAttraction.x, 2) + Math.pow(playerAttraction.y, 2)
        );

        const volumeRelativeToPlayer = Math.max(
          0,
          (0.03 + Math.random() * 0.01) *
            (1 - attractionLength / WEIGHTS.ATTRACTION_RADIUS)
        );

        const fanLoop = sound.find(`fan_loop_${rival.id}`);
        if (fanLoop) {
          fanLoop.volume =
            Math.pow(volumeRelativeToPlayer, 2) * 1000 + length / 800000;
          fanLoop.speed = length / 2000;
          fanLoop.filters = fanLoopFilters;
        }

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
          Math.max((length - 5000000) / 5000000, 0) +
          Math.min(rival.torque * 0.1, 0.01);
      }
    });
  },
  viewport: null,
  setViewport: (viewport) => set({ viewport }),
}));

export default useStore;
