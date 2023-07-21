import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { Sprite, useTick, useApp } from "@pixi/react";
import { BlurFilter, Point, Sprite as PixiSprite } from "pixi.js";
import { useEffect, useRef } from "react";
import "./App.css";
import Birds from "./Bird";
import Emitter from "./Emitter";
import { emitterConfig } from "./main";
import useStore from "./useStore";

function App() {
  const player = useStore((state) => state.player);
  const setPlayer = useStore((state) => state.setPlayer);
  const updatePlayer = useStore((state) => state.updatePlayer);
  const app = useApp();

  const viewport = useStore((state) => state.viewport);

  useEffect(() => {
    viewport?.follow(ref.current!, {
      acceleration: 5,
      speed: 7,
    });
  }, [viewport]);

  const ref = useRef<PixiSprite | undefined>();

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

  return (
    <>
      <Sprite
        image="public/elevatelol_top_down_pixel_art_town_view_from_directly_above_07128aeb-caed-4289-8d96-4f9a8f86d0e4.png"
        x={0}
        y={0}
        filters={[new BlurFilter(4, 4)]}
        scale={{ x: 2, y: 2 }}
      />
      <Emitter config={emitterConfig} onCreate={(emitter: PixiEmitter) => setPlayer((player) => {
        player.emitter = emitter;
      })} />
      <Sprite
        ref={ref}
        image="public/jay.png"
        x={player.position.x}
        y={player.position.y}
        rotation={player.rotation}
        anchor={{ x: 0.5, y: 0.5 }}
        scale={{ x: 1, y: 1 - Math.min((player.torque || 0) * 20, 0.5) }}
      />
      <Birds />
    </>
  );
}

export default App;
