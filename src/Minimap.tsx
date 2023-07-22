import React, { FC, useCallback } from "react";
import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import useStore from "./useStore";

export interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  alpha: number;
}

const Minimap: FC<RectangleProps> = (props) => {
  const birds = useStore((state) => state.birds);
  const player = useStore((state) => state.player);
  const viewport = useStore((state) => state.viewport);
  const drawBackground = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      g.beginFill(props.color);
      g.alpha = props.alpha;
      g.drawRect(props.x, props.y, props.width, props.height);
      g.endFill();
    },
    [props],
  );

  const drawEntities = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      g.alpha = 0.8;
      for (let i = 0; i < birds.length; i++) {
        const bird = birds[i];
        // map bird position to minimap position
        const x = (bird.position.x / viewport!.width) * props.width + props.x;
        const y = (bird.position.y / viewport!.height) * props.height + props.y;
        g.beginFill("0xFFFFFF");
        g.drawRect(x, y, 1, 1);
        g.endFill();
      }

      // map player position to minimap position
      const x = (player.position.x / viewport!.width) * props.width + props.x;
      const y = (player.position.y / viewport!.height) * props.height + props.y;
      g.beginFill("0x0000FA");
      g.drawRect(x, y, 4, 4);
      g.endFill();
    },
    [props, birds, player, viewport],
  );

  return (
    <>
      <Graphics draw={drawBackground} />
      <Graphics draw={drawEntities} />
    </>
  );
};

export default Minimap;
