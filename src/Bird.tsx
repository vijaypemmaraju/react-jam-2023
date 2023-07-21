import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { Sprite, useTick, useApp } from "@pixi/react";
import { Fragment, useEffect } from "react";
import "./App.css";
import Emitter from "./Emitter";
import { emitterConfig } from "./main";
import useStore from "./useStore";

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
          <Sprite
            image="public/female_jay.png"
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
