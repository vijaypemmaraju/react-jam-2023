import { FC } from "react";
import { Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import useStore from "./useStore";

const Score: FC = () => {
  const birds = useStore((state) => state.birds);

  return (
    <>
      <Text
        text={`Player: ${
          birds.filter((bird) => bird.acquiredBy === "player").length
        }`}
        style={new TextStyle({ fill: 0x0000ff })}
        x={50}
        y={50}
      />
      <Text
        text={`Rival: ${
          birds.filter((bird) => bird.acquiredBy === "rival").length
        }`}
        style={new TextStyle({ fill: 0xff0000 })}
        x={50}
        y={100}
      />
    </>
  );
};

export default Score;
