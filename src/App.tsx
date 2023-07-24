import { Sprite, useApp, useTick } from "@pixi/react";
import { BlurFilter } from "pixi.js";
import { useEffect, useState } from "react";
import "./App.css";
import Birds from "./Birds";
import useStore from "./useStore";

import Player from "./Player";
import { sound } from "@pixi/sound";
import Rivals from "./Rivals";

function App() {
  const app = useApp();

  const viewport = useStore((state) => state.viewport);

  useEffect(() => {
    window.addEventListener("resize", () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      viewport?.resize(window.innerWidth, window.innerHeight);
    });
  }, [app, viewport]);

  const mode = useStore((state) => state.mode);

  useEffect(() => {
    if (mode === "play") {
      setHasStarted(true);
      sound.play("ambient", {
        loop: true,
        volume: 0.1,
      });
    }
  }, [mode]);

  useTick((_delta, ticker) => {
    if (mode === "play") {
      ticker.speed = 1;
    } else {
      ticker.speed = 0;
    }
  });

  const [hasStarted, setHasStarted] = useState(false);

  return (
    <>
      <Sprite
        image="elevatelol_top_down_pixel_art_town_view_from_directly_above_2f835eab-997a-4488-87b5-e690850e337a-jF59VqmRb-transformed.png"
        filters={[new BlurFilter(32, 32, 1, 5)]}
        tint={0xeeeeee}
        scale={{ x: 1.5, y: 1.5 }}
        anchor={0}
      />
      {hasStarted && (
        <>
          <Player />
          <Birds />
          <Rivals />
        </>
      )}
    </>
  );
}

export default App;
