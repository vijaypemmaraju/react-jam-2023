import { FC } from "react";
import { Graphics, Text } from "@pixi/react";
import { TextStyle, Graphics as PixiGraphics } from "pixi.js";
import useStore from "./useStore";

const Score: FC = () => {
  const birds = useStore((state) => state.birds);
  const mode = useStore((state) => state.mode);

  if (mode !== "play") {
    return null;
  }

  const drawBackground = (g: PixiGraphics) => {
    g.clear();
    g.alpha = 0.1;
    g.beginFill(0xaaaaaa);
    g.drawRect(25, 25, 80, 100);
    g.endFill();
  };

  return (
    <>
      <Graphics draw={drawBackground} />
      <Text
        text={birds
          .filter((bird) => bird.acquiredBy === "player")
          .length.toString()}
        style={new TextStyle({ fill: 0x566ae6, fontFamily: "Lumanosimo" })}
        x={50}
        y={35}
      />
      <Text
        text={birds
          .filter((bird) => bird.acquiredBy === "rival")
          .length.toString()}
        style={new TextStyle({ fill: 0xe65665, fontFamily: "Lumanosimo" })}
        x={50}
        y={75}
      />
    </>
  );
};

export default Score;
