import { Sprite, Text, useApp, useTick } from "@pixi/react";
import { BlurFilter, TextStyle } from "pixi.js";
import { useEffect, useState } from "react";
import "./App.css";
import Birds from "./Birds";
import useStore from "./useStore";

import Player from "./Player";
import { sound } from "@pixi/sound";
import Rivals from "./Rivals";
import { fanLoopFilters } from "./sounds";

let isPlaying = false;

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
      setTimeout(() => {
        setShowRivals(true);
      }, 1000);
      sound.play("ambient", {
        loop: true,
        volume: 0.05,
      });
    }
  }, [mode]);

  const [difference, setDifference] = useState(0);
  const player = useStore((state) => state.player);

  useTick((_delta, ticker) => {
    if (mode === "play") {
      if (!isPlaying) {
        sound.play("song_lower", {
          loop: true,
          volume: 0.1,
        });
        sound.play("song_upper", {
          loop: true,
          volume: 0.1,
        });
        isPlaying = true;
      }
      const upper = sound.find("song_upper");
      const lower = sound.find("song_lower");
      if (upper && lower) {
        // check user agent to see if user is on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(
          navigator.userAgent,
        );
        if (isMobile) {
          setDifference(upper.instances[0].progress - lower.instances[0].progress)
        }
        const zone = player.zone;
        if (zone) {
          const distanceFromZone = Math.sqrt(
            Math.pow(zone.x - player.position.x, 2) +
            Math.pow(zone.y - player.position.y, 2),
          );
          const maxDistance = 700;
          lower.volume = Math.max(
            0,
            1 - Math.min(distanceFromZone / maxDistance, 1),
          );
        } else {
          lower.volume = 0;
        }
      }
      const fanLoop = sound.find("fan_loop");
      if (fanLoop) {
        const length = player.acceleration;
        fanLoop.volume = 0.1 + (length / 500) * 0.2;
        fanLoop.speed = length / 1000;
        fanLoop.filters = fanLoopFilters;
      }
      ticker.speed = 1;
      sound.unmuteAll();
    } else {
      ticker.speed = 0;
      sound.muteAll();
    }
  });

  const [hasStarted, setHasStarted] = useState(false);
  const [showRivals, setShowRivals] = useState(false);

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
          {showRivals && <Rivals />}
        </>
      )}
    </>
  );
}

export default App;
