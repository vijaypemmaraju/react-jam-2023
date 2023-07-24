import React, { FC, useCallback, useEffect } from "react";
import { Graphics, Text } from "@pixi/react";
import { Graphics as PixiGraphics, TextStyle } from "pixi.js";
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
  const rivals = useStore((state) => state.rivals);
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
    [props]
  );

  const drawEntities = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      for (let i = 0; i < birds.length; i++) {
        const bird = birds[i];
        // map bird position to minimap position
        const x = (bird.position.x / viewport!.width) * props.width + props.x;
        const y = (bird.position.y / viewport!.height) * props.height + props.y;
        g.beginFill("0xFFFFFF");
        g.alpha = 0.8;
        g.drawRect(x, y, 1, 1);
        g.endFill();
      }

      for (let i = 0; i < rivals.length; i++) {
        const rival = rivals[i];
        const x = (rival.position.x / viewport!.width) * props.width + props.x;
        const y =
          (rival.position.y / viewport!.height) * props.height + props.y;
        g.beginFill("0xFA0000");
        g.alpha = 0.8;
        g.drawRect(x, y, 4, 4);
        g.endFill();
      }

      // map player position to minimap position
      const x = (player.position.x / viewport!.width) * props.width + props.x;
      const y = (player.position.y / viewport!.height) * props.height + props.y;
      g.beginFill("0x0000FA");
      g.alpha = 0.8;
      g.drawRect(x, y, 4, 4);
      g.endFill();
    },
    [props, birds, rivals, player, viewport]
  );

  const drawZones = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      if (player.zone) {
        const x = (player.zone.x / viewport!.width) * props.width + props.x;
        const y = (player.zone.y / viewport!.height) * props.height + props.y;
        g.beginFill("0x0000FA");
        g.alpha = 0.3;
        g.drawRect(
          x,
          y,
          (player.zone.width / viewport!.width) * props.width,
          (player.zone.height / viewport!.height) * props.height
        );
        g.endFill();
      }
      for (let i = 0; i < rivals.length; i++) {
        const rival = rivals[i];
        if (rival.zone) {
          const x = (rival.zone.x / viewport!.width) * props.width + props.x;
          const y = (rival.zone.y / viewport!.height) * props.height + props.y;
          g.beginFill("0xFA0000");
          g.alpha = 0.3;
          g.drawRect(
            x,
            y,
            (rival.zone.width / viewport!.width) * props.width,
            (rival.zone.height / viewport!.height) * props.height
          );
          g.endFill();
        }
      }
    },
    [props, player, viewport, rivals]
  );

  const [showZones, setShowZones] = React.useState(false);
  const mode = useStore((state) => state.mode);
  useEffect(() => {
    if (mode !== "play") return;
    setTimeout(() => {
      setShowZones(true);
    }, 2500);
  }, [mode]);

  return (
    <>
      <Graphics draw={drawBackground} />
      <Graphics draw={drawEntities} />
      {showZones && <Graphics draw={drawZones} />}
      {showZones && player.zone && (
        <Text
          x={
            (player.zone.x / viewport!.width) * props.width +
            props.x +
            (player.zone.width / viewport!.width) * props.width * 0.25
          }
          y={
            (player.zone.y / viewport!.height) * props.height +
            props.y +
            (player.zone.height / viewport!.height) * props.height * 0.0125
          }
          text="🎉"
          style={
            new TextStyle({
              align: "center",
              fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
              fontSize:
                ((player.zone.width / viewport!.width) * props.width) / 2,
              fontWeight: "400",
            })
          }
        />
      )}
      {showZones && rivals.map((rival, i) => {
        if (!rival.zone) return null;
        return (
          <Text
            key={i}
            x={
              (rival.zone.x / viewport!.width) * props.width +
              props.x +
              (rival.zone.width / viewport!.width) * props.width * 0.25
            }
            y={
              (rival.zone.y / viewport!.height) * props.height +
              props.y +
              (rival.zone.height / viewport!.height) * props.height * 0.0125
            }
            text="🎉"
            style={
              new TextStyle({
                align: "center",
                fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
                fontSize:
                  ((rival.zone.width / viewport!.width) * props.width) / 2,
                fontWeight: "400",
              })
            }
          />
        );
      })}
    </>
  );
};

export default Minimap;
