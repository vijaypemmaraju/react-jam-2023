import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { useTick, useApp, AnimatedSprite, Graphics, Text } from "@pixi/react";
import { filters, sound } from "@pixi/sound";
import { WebAudioContext } from "@pixi/sound/lib/webaudio";
import {
  Graphics as PixiGraphics,
  Assets,
  Texture,
  Circle,
  Point,
  TextStyle,
  TextMetrics,
} from "pixi.js";
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
  const dataArray = useStore((state) => state.audioDataArray);
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
        let zone: Circle | null = null;
        while (
          !zone ||
          Math.sqrt(
            Math.pow(zone.x - player.zone!.x, 2) +
            Math.pow(zone.y - player.zone!.y, 2),
          ) < 1024
        ) {
          zone = new Circle(
            Math.random() * 2048 + 512,
            Math.random() * 768 + (2304 - 512),
            256,
          );
        }
        const random = Math.random();
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
          zone,
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
      g.beginFill(0xff0000, 0.1);
      const rect = new Circle(rival.zone.x, rival.zone.y, rival.zone.radius);

      // draw a perimeter on the rect with 100 points and perturb the points by the frequency data
      const center = new Point(rect.x, rect.y);
      const points: Point[] = [];
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        const perturbation = (dataArray[
          Math.floor((i + dataArray.length / 6) % (dataArray.length / 2))
        ] /
          255) *
          200;
        const x = center.x + Math.cos(angle) * (rect.radius + perturbation);
        const y = center.y + Math.sin(angle) * (rect.radius + perturbation);

        points.push(new Point(x, y));
      }

      g.drawPolygon(points);
      g.endFill();
    },
    [dataArray],
  );
  if (frames.length === 0) return null;

  const text = "Party Zone";

  const style = new TextStyle({
    fill: `rgb(${(dataArray[0] || 0) % 255}, ${(dataArray[10] || 0) % 255}, ${(dataArray[20] || 0) % 255
      })`,
  });
  const metrics = TextMetrics.measureText(text, style);

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
            <Text
              x={rival.zone.x - metrics.width / 2}
              y={rival.zone.y - metrics.height / 2}
              text="Party Zone"
              style={style}
            />
          )}
        </Fragment>
      ))}
    </>
  );
}

export default Rivals;
