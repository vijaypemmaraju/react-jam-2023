import { Sprite, useTick, useApp } from "@pixi/react";
import { useEffect, useState } from "react";
import "./App.css";
import useStore from "./useStore";

function App() {
  // const blurFilter = useMemo(() => new BlurFilter(4), []);
  const [position, setPosition] = useState({ x: 400, y: 270 });
  const destination = useStore((state) => state.destination);
  const setDestination = useStore((state) => state.setDestination);
  const app = useApp();

  useEffect(() => {
    const root = document.querySelector("canvas");
    const listener = (e: MouseEvent) => {
      const rect = root?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);
      setDestination(x, y);
    };
    document.addEventListener("mousedown", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [app, setDestination]);

  useTick(() => {
    // console.log(app.renderer.plugins.interaction.pointer);
    if (destination) {
      setPosition((position) => ({
        x: position.x + (destination.x - position.x) * 0.1,
        y: position.y + (destination.y - position.y) * 0.1,
      }));
    }
  });

  return (
    <>
      <Sprite
        image="https://pixijs.io/pixi-react/img/bunny.png"
        x={position.x}
        y={position.y}
        anchor={{ x: 0.5, y: 0.5 }}
      />
    </>
  );
}

export default App;
