import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { AnimatedSprite, useTick, useApp, Graphics, Text } from "@pixi/react";
import {
  TextStyle,
  Graphics as PixiGraphics,
  Point,
  Sprite as PixiSprite,
  TextMetrics,
  Texture,
  Circle,
} from "pixi.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Emitter from "./Emitter";
import { emitterConfig } from "./emitterConfig";
import useStore from "./useStore";

import { Assets } from "pixi.js";
import { filters, sound } from "@pixi/sound";
import { WebAudioContext } from "@pixi/sound/lib/webaudio";

function Player() {
  const player = useStore((state) => state.player);
  const setPlayer = useStore((state) => state.setPlayer);
  const updatePlayer = useStore((state) => state.updatePlayer);
  const app = useApp();

  const viewport = useStore((state) => state.viewport);
  const dataArray = useStore((state) => state.audioDataArray);
  const setDataArray = useStore((state) => state.setAudioDataArray);

  const [frames, setFrames] = useState<Texture[]>([]);

  useEffect(() => {
    (async () => {
      const sheet = Assets.get("jay_sheet.json");
      const frames = Object.keys(sheet.data.frames).map((frame) =>
        Texture.from(frame),
      );
      setFrames(frames);
    })();
  }, []);

  useEffect(() => {
    if (ref.current) {
      viewport?.follow(ref.current!, {});
    }
  }, [player.acceleration, viewport]);

  useEffect(() => {
    sound.play("fan_loop", {
      loop: true,
      filters: [new filters.TelephoneFilter(), new filters.ReverbFilter()],
    });
    const newPlayer = { ...player };
    newPlayer.zone = new Circle(
      Math.random() * 2048 + 512,
      Math.random() * 768 + (2304 - 512),
      256,
    );

    setPlayer(newPlayer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPlayer]);

  const ref = useRef<PixiSprite | null>(null);

  const rect = useMemo(() => {
    const root = document.querySelector("canvas");
    return root?.getBoundingClientRect();
  }, []);

  useTick((delta) => {
    const pointer = app.renderer.plugins.interaction.pointer;
    const pos = viewport?.toLocal(new Point(pointer.x, pointer.y));
    const x = (pos?.x || 0) - (rect?.x || 0);
    const y = (pos?.y || 0) - (rect?.y || 0);

    setPlayer({
      ...player,
      destination: { x, y },
    });
    updatePlayer(delta);
    const context = sound.context as WebAudioContext;
    const analyser = context.analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    setDataArray(dataArray);
  });

  const drawZone = useCallback(
    (g: PixiGraphics) => {
      if (!player.zone) return;
      g.clear();
      g.lineStyle(1, 0x566ae6, 1);
      g.beginFill(0x566ae6, 0.1);
      const rect = new Circle(player.zone.x, player.zone.y, player.zone.radius);

      // draw a perimeter on the rect with 100 points and perturb the points by the frequency data
      const center = new Point(rect.x, rect.y);
      const points: Point[] = [];
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;

        const perturbation =
          (dataArray[
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
    [dataArray, player.zone],
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
      <Emitter
        config={emitterConfig}
        onCreate={(emitter: PixiEmitter) =>
          setPlayer({
            ...player,
            emitter,
          })
        }
      />
      <AnimatedSprite
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        isPlaying
        animationSpeed={Math.min(
          0.25,
          1 - Math.pow(Math.min(player.acceleration / 500, 500), 2),
        )}
        textures={frames}
        x={player.position.x}
        y={player.position.y}
        rotation={player.rotation}
        anchor={{ x: 0.5, y: 0.5 }}
        scale={{
          x: 1 + Math.min(player.acceleration * 0.1, 0.1),
          y: 1 - Math.min((player.torque || 0) * 2, 0.5),
        }}
      />
      <Graphics draw={drawZone} />
      {player.zone && (
        <Text
          x={player.zone.x - metrics.width / 2}
          y={player.zone.y - metrics.height / 2}
          text="Party Zone"
          style={style}
        />
      )}
    </>
  );
}

export default Player;
