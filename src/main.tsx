import { Stage } from "@pixi/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

export const MyComponent = () => {
  return (
    <>
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <App />
    </Stage>
    </>
  );
};

const container = document.createElement("div");
container.id = "root";
document.body.appendChild(container);
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(<MyComponent />);
