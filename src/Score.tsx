import { FC } from "react";
import { Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import useStore from "./useStore";

const Score: FC = () => {
  const birds = useStore((state) => state.birds);

  return (
    <>
      <Text
        text={`Birds acquired by player: ${birds.filter((bird) => bird.acquiredBy === "player").length
          }`}
        style={new TextStyle({ fill: 0xffffff })}
        x={50}
        y={50}
      />
      <Text
        text={`Birds acquired by rival: ${birds.filter((bird) => bird.acquiredBy === "rival").length
          }`}
        style={new TextStyle({ fill: 0xffffff })}
        x={50}
        y={100}
      />
    </>
  );
};

export default Score;
