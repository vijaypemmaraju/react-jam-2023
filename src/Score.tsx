import React, { FC, useCallback, useEffect } from "react";
import { Graphics, Text } from "@pixi/react";
import { Graphics as PixiGraphics, TextStyle } from "pixi.js";
import useStore from "./useStore";

const Score: FC = (props) => {
  const birds = useStore((state) => state.birds);

  return (
    <>
      <Text text={`Birds acquired by player: ${birds.filter(bird => bird.acquiredBy === 'player').length}`} style={new TextStyle({ fill: 0xFFFFFF })} x={50} y={50} />
      <Text text={`Birds acquired by rival: ${birds.filter(bird => bird.acquiredBy === 'rival').length}`} style={new TextStyle({ fill: 0xFFFFFF })} x={50} y={100} />
    </>
  );
};

export default Score;
