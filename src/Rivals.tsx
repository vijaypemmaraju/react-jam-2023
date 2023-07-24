import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { useTick, useApp, AnimatedSprite } from "@pixi/react";
import { filters, sound } from "@pixi/sound";
import { Assets, Texture } from "pixi.js";
import { Fragment, useEffect, useState } from "react";
import "./App.css";
import Emitter from "./Emitter";
import { emitterConfig } from "./emitterConfig";
import useStore from "./useStore";

function Rivals() {
  const app = useApp();

  const rivals = useStore((state) => state.rivals);
  const setRivals = useStore((state) => state.setRivals);
  const updateRivals = useStore((state) => state.updateRivals);

  const [frames, setFrames] = useState<Texture[]>([]);

  useEffect(() => {
    (async () => {
      const sheet = Assets.get("rival_sheet.json");
      const frames = Object.keys(sheet.data.frames).map((frame) =>
        Texture.from(frame),
      );
      setFrames(frames);
    })();
  }, []);

  useEffect(() => {
    setRivals((rivals) => {
      for (let i = 0; i < 1; i++) {
        const random = Math.random();
        sound.add(`fan_loop_rival_${i}`, "sounds/fan_loop.ogg");
        sound.play(`fan_loop_rival_${i}`, {
          loop: true,
          filters: [new filters.TelephoneFilter(), new filters.ReverbFilter()],
          volume: 0.1,
        });
        rivals.push({
          id: i,
          position: {
            x: Math.random() * app.screen.width,
            y: Math.random() * app.screen.height,
          },
          velocity: {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
          },
          lastVelocity: {
            x: 0,
            y: 0,
          },
          destination: {
            x: 0,
            y: 0,
          },
          rotation: 0,
          acceleration: 0,
          torque: 0,
          tint: `rgb(${255 - random * 100}, ${255 - random * 100}, ${255 - random * 100
            })`,
          timeUntilNextFlapSound: 0,
        });
      }
    });
  }, [app, setRivals]);

  useTick((delta) => {
    updateRivals(delta);
  });

  if (frames.length === 0) return null;

  return (
    <>
      {rivals.map((bird, i) => (
        <Fragment key={i}>
          <Emitter
            config={emitterConfig}
            onCreate={(emitter: PixiEmitter) =>
              setRivals((rivals) => {
                rivals[i].emitter = emitter;
              })
            }
          />
          <AnimatedSprite
            isPlaying
            animationSpeed={Math.min(
              0.5,
              1 - Math.pow(Math.min(bird.acceleration / 250, 250), 2),
            )}
            textures={frames}
            tint={bird.tint}
            x={bird.position.x}
            y={bird.position.y}
            rotation={bird.rotation}
            anchor={{ x: 0.5, y: 0.5 }}
            scale={{
              x: 1 + Math.min((bird.acceleration * 0.001 || 0) * 0.1, 0.1),
              y: 1 - Math.min((bird.torque || 0) * 2, 0.5),
            }}
          />
        </Fragment>
      ))}
    </>
  );
}

export default Rivals;
