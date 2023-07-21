import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { Sprite, useTick, useApp, AnimatedSprite } from "@pixi/react";
import { Assets, Texture } from "pixi.js";
import { Fragment, useEffect } from "react";
import "./App.css";
import Emitter from "./Emitter";
import { emitterConfig } from "./main";
import useStore from "./useStore";

const sheet = await Assets.load('public/female_jay_sheet.json');
const frames = Object.keys(sheet.data.frames).map(frame => Texture.from(frame));


function Birds() {
  const app = useApp();

  const birds = useStore((state) => state.birds);
  const setBirds = useStore((state) => state.setBirds);
  const updateBirds = useStore((state) => state.updateBirds);

  useEffect(() => {
    setBirds((birds) => {
      for (let i = 0; i < 25; i++) {
        birds.push({
          position: {
            x: Math.random() * app.screen.width,
            y: Math.random() * app.screen.height,
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
        });
      }
    });
  }, [app, setBirds]);

  useTick((delta) => {
    updateBirds(delta);
  });

  return (
    <>
      {birds.map((bird, i) => (
        <Fragment key={i}>
          <Emitter config={emitterConfig} onCreate={(emitter: PixiEmitter) => setBirds((birds) => {
            birds[i].emitter = emitter;
          })} />
          <AnimatedSprite
            isPlaying
            animationSpeed={Math.min(0.1, (1 - Math.pow(bird.acceleration, 2))) + Math.random() * 0.1}
            textures={frames}
            x={bird.position.x}
            y={bird.position.y}
            rotation={bird.rotation}
            anchor={{ x: 0.5, y: 0.5 }}
            scale={{ x: 1, y: 1 - Math.min((bird.torque || 0) * 20, 0.5) }}
          />

        </Fragment>
      ))}
    </>
  );
}

export default Birds;
