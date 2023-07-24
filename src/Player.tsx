import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { AnimatedSprite, useTick, useApp, Graphics, Text } from "@pixi/react";
import { Graphics as PixiGraphics, Point, Rectangle, Sprite as PixiSprite, Texture } from "pixi.js";
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Emitter from "./Emitter";
import { emitterConfig } from "./emitterConfig";
import useStore from "./useStore";

import { Assets } from "pixi.js";
import { filters, sound } from "@pixi/sound";

function Player() {
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
    setPlayer((player) => {
      // find a random rectangle within the world of 0, 0, to 3072, 3072
      player.zone = new Rectangle(
        Math.random() * (3072 - 512),
        Math.random() * (3072 - 512),
        512,
        512,
      );
    });
  }, [setPlayer]);

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


  const drawZone = useCallback(
    (g: PixiGraphics) => {
      if (!player.zone) return;
      g.clear();
      g.lineStyle(1, 0x0000ff, 1);
      g.drawRect(
        player.zone.x,
        player.zone.y,
        player.zone.width,
        player.zone.height,
      );
    },
    [player.zone],
  );

  if (frames.length === 0) return null;

  return (
    <>
      <Emitter
        config={emitterConfig}
        onCreate={(emitter: PixiEmitter) =>
          setPlayer((player) => {
            player.emitter = emitter;
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
        <Text x={player.zone.x} y={player.zone.y} text="Party Zone" />
      )}
    </>
  );
}

export default Player;
