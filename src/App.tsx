import { Sprite, useTick, useApp } from "@pixi/react";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // const blurFilter = useMemo(() => new BlurFilter(4), []);
  const [position, setPosition] = useState({ x: 400, y: 270 });
  const [destination, setDestination] = useState({ x: 400, y: 270 });
  const [lastVelocity, setLastVelocity] = useState({ x: 0, y: 0 });
  // const [curve, setCurve] = useState<Point[]>();
  const app = useApp();

  useEffect(() => {
    const root = document.querySelector("canvas");
    const listener = (e: MouseEvent) => {
      const rect = root?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);
      setDestination({ x, y });
    };
    document.addEventListener("mousemove", listener);

    return () => {
      document.removeEventListener("mousemove", listener);
    };
  }, [app, position.x, position.y]);

  useTick((delta) => {
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

    setPosition((position) => ({
      x: position.x + velocity.x * delta * 20,
      y: position.y + velocity.y * delta * 20,
    }));
    setLastVelocity(velocity);
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
