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
    });
  }, [player.acceleration, viewport]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      viewport?.resize(window.innerWidth, window.innerHeight);
    })
  }, [app, viewport]);

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
        image="elevatelol_top_down_pixel_art_town_view_from_directly_above_2f835eab-997a-4488-87b5-e690850e337a-jF59VqmRb-transformed.png"
        x={0}
        y={0}
        filters={[new BlurFilter(32, 32)]}
        tint={0xEEEEEE}
        scale={{ x: 1.5, y: 1.5 }}
      />
      <Emitter config={emitterConfig} onCreate={(emitter: PixiEmitter) => setPlayer((player) => {
        player.emitter = emitter;
      })} />
      <AnimatedSprite
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        isPlaying
        animationSpeed={Math.min(0.25, (1 - Math.pow(Math.min(player.acceleration / 500, 500), 2)))}
        textures={frames}
        x={player.position.x}
        y={player.position.y}
        rotation={player.rotation}
        anchor={{ x: 0.5, y: 0.5 }}
        scale={{ x: 1 + Math.min(player.acceleration * .1, .1), y: 1 - Math.min((player.torque || 0) * 2, 0.5) }}
      />
      <Birds />
    </>
  );
}

export default App;
