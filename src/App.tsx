import { Bezier, Point } from "bezier-js";

import { Sprite, useTick, useApp } from "@pixi/react";
import { useEffect, useState } from "react";
import "./App.css";
import useStore from "./useStore";

function App() {
  // const blurFilter = useMemo(() => new BlurFilter(4), []);
  const [position, setPosition] = useState({ x: 400, y: 270 });
  const [curve, setCurve] = useState<Point[]>();
  const app = useApp();

  useEffect(() => {
    const root = document.querySelector("canvas");
    const listener = (e: MouseEvent) => {
      const rect = root?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);
      const length = Math.sqrt(
        Math.pow(position.x - x, 2) + Math.pow(position.y - y, 2)
      );
      const curveAmount = length / 4;
      const bezier =
        new Bezier([
          { x: position.x, y: position.y },
          // choose a random point near the midpoint of the line
          {
            x:
              (position.x + x) / 2 +
              Math.random() * curveAmount -
              curveAmount / 2,
            y:
              (position.y + y) / 2 +
              Math.random() * curveAmount -
              curveAmount / 2,
          },
          { x: x, y: y },
        ])
      setCurve(bezier.getLUT(length * 0.2));
    };
    document.addEventListener("mousedown", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [app, position.x, position.y]);

  useTick((_delta) => {
    if (curve) {
      if (curve.length === 0) {
        setCurve(undefined);
        return;
      }
      const position = curve.shift();
      setPosition({
        x: position!.x,
        y: position!.y,
      });
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
