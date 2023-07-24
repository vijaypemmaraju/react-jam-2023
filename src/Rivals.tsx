import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { useTick, useApp, AnimatedSprite, Graphics, Text } from "@pixi/react";
import { filters, sound } from "@pixi/sound";
import { Graphics as PixiGraphics, Assets, Texture, Rectangle } from "pixi.js";
import { Fragment, useCallback, useEffect, useState } from "react";
import "./App.css";
import Emitter from "./Emitter";
import { emitterConfig } from "./emitterConfig";
import useStore, { Rival } from "./useStore";

function Rivals() {
  const app = useApp();

  const rivals = useStore((state) => state.rivals);
  const player = useStore((state) => state.player);
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
        // generate a rectangle that does not overlap with player.zone
        let zone: Rectangle | null = null;
        while (!zone || zone.intersects(player.zone!)) {
          zone = new Rectangle(
            Math.random() * (1536) + (1536 - 512),
            Math.random() * (1536) + (1536 - 512),
            512,
            512,
          );
        }
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
            x: -100,
            y: -100,
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
          zone
        });
      }
    });
  }, [app, player.zone, setRivals]);

  useTick((delta) => {
    updateRivals(delta);
  });

  const drawZone = useCallback(
    (g: PixiGraphics, rival: Rival) => {
      if (!rival.zone) return;
      g.clear();
      g.lineStyle(1, 0xff0000, 1);
      g.drawRect(
        rival.zone.x,
        rival.zone.y,
        rival.zone.width,
        rival.zone.height,
      );
    },
    [],
  );

  if (frames.length === 0) return null;

  return (
    <>
      {rivals.map((rival, i) => (
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
              1 - Math.pow(Math.min(rival.acceleration / 250, 250), 2),
            )}
            textures={frames}
            tint={rival.tint}
            x={rival.position.x}
            y={rival.position.y}
            rotation={rival.rotation}
            anchor={{ x: 0.5, y: 0.5 }}
            scale={{
              x: 1 + Math.min((rival.acceleration * 0.001 || 0) * 0.1, 0.1),
              y: 1 - Math.min((rival.torque || 0) * 2, 0.5),
            }}
          />
          <Graphics draw={(graphics) => drawZone(graphics, rival)} />
          {rival.zone && (
            <Text x={rival.zone.x} y={rival.zone.y} text="Party Zone" />
          )}
        </Fragment>
      ))}
    </>
  );
}

export default Rivals;
