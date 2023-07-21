import { Stage } from "@pixi/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import useStore from "./useStore";
import Viewport from "./Viewport";
import Emitter from "./Emitter";
import { EmitterConfigV3 } from "@pixi/particle-emitter";
import { Assets, Texture } from "pixi.js";

export const emitterConfig: EmitterConfigV3 = {
  lifetime: {
    min: 0.1,
    max: 1,
  },
  frequency: .1,
  // spawnChance: 1,
  particlesPerWave: 1,
  // emitterLifetime: 3,
  maxParticles: 250,
  pos: {
    x: 0,
    y: 0,
  },
  addAtBack: false,
  behaviors: [
    {
      type: "scale",
      config: {
        scale: {
          list: [
            {
              value: 0.1,
              time: 0,
            },
            {
              value: 0.09,
              time: 1,
            },
          ],
        },
      },
    },
    {
      type: 'alpha',
      config: {
        alpha: {
          list: [
            {
              value: 0.2,
              time: 0,
            },
            {
              value: 0,
              time: 1,
            },
          ],
        },
      },
    },
    {
      type: "moveSpeed",
      config: {
        speed: {
          list: [
            {
              value: 50,
              time: 0,
            },
            {
              value: 49,
              time: 1,
            },
          ],
          isStepped: false,
        },
      },
    },
    {
      type: "spawnPoint",
      config: {},
    },
    {
      type: "animatedSingle",
      config: {
        anim:
        {
          framerate: 16,
          loop: false,
          textures: [
            "wind/W401-1.png",
            "wind/W401-2.png",
            "wind/W401-3.png",
            "wind/W401-4.png",
            "wind/W401-5.png",
            "wind/W401-6.png",
            "wind/W401-7.png",
            "wind/W401-8.png",
            "wind/W401-9.png",
            "wind/W401-10.png",
            "wind/W401-11.png",
            "wind/W401-12.png",
            "wind/W401-13.png",
            "wind/W401-14.png",
            "wind/W401-15.png",
            "wind/W401-16.png",
          ],
        },
      },
    },
  ],
};

export const MyComponent = () => {
  const WEIGHTS = useStore((state) => state.WEIGHTS);
  return (
    <div className="w-[100vw] h-[100vh] flex items-center justify-center">
      {/* <div>
        <div className="text-2xl font-bold">Weights</div>
        <div className="flex flex-col">
          <label>Alignment</label>
          <input type="range" value={WEIGHTS.ALIGNMENT} min={0} max={100} step={1} onChange={(e) => useStore.setState({ WEIGHTS: { ...WEIGHTS, ALIGNMENT: parseInt(e.target.value) } })} />
          <label>Cohesion</label>
          <input type="range" value={WEIGHTS.COHESION} min={0} max={100} step={1} onChange={(e) => useStore.setState({ WEIGHTS: { ...WEIGHTS, COHESION: parseInt(e.target.value) } })} />
          <label>Separation</label>
          <input type="range" value={WEIGHTS.SEPARATION} min={0} max={100} step={1} onChange={(e) => useStore.setState({ WEIGHTS: { ...WEIGHTS, SEPARATION: parseInt(e.target.value) } })} />
        </div>
      </div> */}
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Viewport width={window.innerWidth} height={window.innerHeight}>
          <App />
        </Viewport>
      </Stage>
    </div>
  );
};

const container = document.createElement("div");
container.id = "root";
document.body.appendChild(container);
const root = createRoot(container); // createRoot(container!) if you use TypeScript

Promise.all([
  Assets.load("jay_sheet.json"),
  Assets.load("female_jay_sheet.json"),
]).then(() => root.render(<MyComponent />));
