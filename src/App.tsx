import { Sprite, useTick, useApp } from "@pixi/react";
import { useEffect, useState } from "react";
import "./App.css";
import useStore from "./useStore";

function App() {
  const player = useStore(state => state.player);
  const setPlayer = useStore(state => state.setPlayer);
  const app = useApp();

  useEffect(() => {
    const root = document.querySelector("canvas");
    const listener = (e: MouseEvent) => {
      const rect = root?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);
      setPlayer(player => {
        player.destination = { x, y };
      })
    };
    document.addEventListener("mousemove", listener);

    return () => {
      document.removeEventListener("mousemove", listener);
    };
  }, [app, player, setPlayer]);

  useTick((delta) => {
    const { position, destination, lastVelocity } = player;
    const newVelocity = {
      x: destination.x - position.x,
      y: destination.y - position.y,
    };
    const length = Math.sqrt(
      Math.pow(newVelocity.x, 2) + Math.pow(newVelocity.y, 2)
    );
    if (length < 1) {
      return;
    }
    newVelocity.x /= length;
    newVelocity.y /= length;

    const velocity = {
      x: lastVelocity.x * 0.95 + newVelocity.x * 0.05,
      y: lastVelocity.y * 0.95 + newVelocity.y * 0.05,
    };

    const rotation = Math.atan2(velocity.y, velocity.x);

    setPlayer((player) => {
      player.position = {
        x: position.x + velocity.x * delta * 20,
        y: position.y + velocity.y * delta * 20,
      }
      player.velocity = velocity;
      player.lastVelocity = velocity;
      player.rotation = rotation;
    });
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
    </>
  );
}

export default App;
