import { Stage } from "@pixi/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import useStore from "./useStore";
import Viewport from "./Viewport";

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
      <Stage width={1024} height={768}>
        <Viewport width={1024} height={768}>
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

root.render(<MyComponent />);
