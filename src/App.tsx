import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { AnimatedSprite, Sprite, useTick, useApp } from "@pixi/react";
import { BlurFilter, Point, Sprite as PixiSprite, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import Birds from "./Bird";
import Emitter from "./Emitter";
import { emitterConfig } from "./main";
import useStore from "./useStore";

import { Assets } from 'pixi.js';

function App() {
  const player = useStore((state) => state.player);
  const setPlayer = useStore((state) => state.setPlayer);
  const updatePlayer = useStore((state) => state.updatePlayer);
  const app = useApp();

  const viewport = useStore((state) => state.viewport);

  const [frames, setFrames] = useState<Texture[]>([]);

  useEffect(() => {
    (async () => {
      const sheet = Assets.get("jay_sheet.json");
      const frames = Object.keys(sheet.data.frames).map((frame) =>
        Texture.from(frame)
      );
      setFrames(frames);
    })();
  }, []);

  useEffect(() => {
    viewport?.follow(ref.current!, {
      acceleration: 5,
      speed: 7,
    });
  }, [viewport]);

  const ref = useRef<PixiSprite | null>(null);

  useTick((delta) => {
    const root = document.querySelector("canvas");
    const pointer = app.renderer.plugins.interaction.pointer;
    const rect = root?.getBoundingClientRect();
    const pos = viewport?.toLocal(new Point(pointer.x, pointer.y));
    const x = (pos?.x || 0) - (rect?.x || 0);
    const y = (pos?.y || 0) - (rect?.y || 0);

    setPlayer((player) => {
      player.destination = { x, y };
    });
    updatePlayer(delta);
  });

  if (frames.length === 0) return null;

  return (
    <>
      <Sprite
        image="elevatelol_top_down_pixel_art_town_view_from_directly_above_07128aeb-caed-4289-8d96-4f9a8f86d0e4.png"
        x={0}
        y={0}
        filters={[new BlurFilter(16, 16)]}
        scale={{ x: 2, y: 2 }}
      />
      <Emitter config={emitterConfig} onCreate={(emitter: PixiEmitter) => setPlayer((player) => {
        player.emitter = emitter;
      })} />
      <AnimatedSprite
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        isPlaying
        animationSpeed={Math.min(0.5, (1 - Math.pow(Math.min(player.acceleration / 250, 250), 2)))}
        textures={frames}
        x={player.position.x}
        y={player.position.y}
        rotation={player.rotation}
        anchor={{ x: 0.5, y: 0.5 }}
        scale={{ x: 1 + Math.min((player.acceleration * .02 || 0) * .1, 1), y: 1 - Math.min((player.torque || 0) * 2, 0.5) }}
      />
      <Birds />
    </>
  );
}

export default App;
