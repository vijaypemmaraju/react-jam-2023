import { Stage } from "@pixi/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Viewport from "./Viewport";
import { Assets } from "pixi.js";
import "./sounds";
import Minimap from "./Minimap";

export const Root = () => {
  return (
    <div
      className="w-[100vw] min-h-[100vh] flex items-center justify-center"
      style={{
        minHeight: "-webkit-fill-available",
      }}
    >
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Viewport width={window.innerWidth} height={window.innerHeight}>
          <App />
        </Viewport>
        <Minimap
          x={window.innerWidth * 0.85}
          y={window.innerWidth * 0.01}
          width={window.innerWidth * 0.14}
          height={window.innerWidth * 0.1}
          color={0x131313}
          alpha={0.2}
        />
      </Stage>{" "}
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
]).then(() => root.render(<Root />));
