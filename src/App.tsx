import { Sprite, useApp } from "@pixi/react";
import { BlurFilter } from "pixi.js";
import { useEffect } from "react";
import "./App.css";
import Birds from "./Bird";
import useStore from "./useStore";

import Player from "./Player";

function App() {
  const app = useApp();

  const viewport = useStore((state) => state.viewport);

  useEffect(() => {
    window.addEventListener('resize', () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      viewport?.resize(window.innerWidth, window.innerHeight);
    })
  }, [app, viewport]);

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
      <Player />
      <Birds />
    </>
  );
}

export default App;
