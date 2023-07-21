import { Stage } from "@pixi/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

export const MyComponent = () => {
  return (
    <div className="w-[100vw] h-[100vh] flex items-center justify-center">
      <Stage width={800} height={600}>
        <App />
      </Stage>
    </div>
  );
};

const container = document.createElement("div");
container.id = "root";
document.body.appendChild(container);
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(<MyComponent />);
