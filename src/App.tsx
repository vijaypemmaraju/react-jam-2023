import { Sprite, useTick, useApp } from "@pixi/react";
import { useEffect, useState } from "react";
import "./App.css";
import useStore from "./useStore";

function App() {
  const player = useStore((state) => state.player);
  const setPlayer = useStore((state) => state.setPlayer);
  const updatePlayer = useStore((state) => state.updatePlayer);
  const app = useApp();

  const birds = useStore((state) => state.birds);
  const setBirds = useStore((state) => state.setBirds);
  const updateBirds = useStore((state) => state.updateBirds);

  useEffect(() => {
    const handler = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handler);

    return () =>
      window.removeEventListener('resize', handler);
  }, [app]);

  useEffect(() => {
    setBirds((birds) => {
      for (let i = 0; i < 10; i++) {
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

  useEffect(() => {
    const root = document.querySelector("canvas");
    const listener = (e: MouseEvent) => {
      const rect = root?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);
      setPlayer((player) => {
        player.destination = { x, y };
      });
    };
    document.addEventListener("mousemove", listener);

    return () => {
      document.removeEventListener("mousemove", listener);
    };
  }, [app, player, setPlayer]);

  useTick((delta) => {
    updatePlayer(delta);
    updateBirds(delta);
  });

  return (
    <>
      <Sprite
        image="public/jay.png"
        x={player.position.x}
        y={player.position.y}
        rotation={player.rotation}
        anchor={{ x: 0.5, y: 0.5 }}
      />
      {birds.map((bird, i) => (
        <Sprite
          key={i}
          image="public/female_jay.png"
          x={bird.position.x}
          y={bird.position.y}
          rotation={bird.rotation}
          anchor={{ x: 0.5, y: 0.5 }}
        />
      ))}
    </>
  );
}

export default App;
