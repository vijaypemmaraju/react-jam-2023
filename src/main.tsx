import { motion } from "framer-motion";
import { Stage } from "@pixi/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Viewport from "./Viewport";
import { Assets } from "pixi.js";
import "./sounds";
import Minimap from "./Minimap";
import useStore from "./useStore";
import { useEffect } from "react";

export const Root = () => {
  const mode = useStore((state) => state.mode);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode === "play") {
        useStore.getState().setMode("pause");
      }
    };
    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [mode]);

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
      </Stage>
      <div className="fixed w-[100vw] h-[100vh] flex items-center justify-center" style={{ pointerEvents: mode === "play" ? "none" : "auto" }}>
        <motion.div
          className="fixed bg-black w-[100vw] h-[100vh]"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: mode === "play" ? 0 : 0.5,
          }}
        ></motion.div>
      </div>
      <div
        className="fixed w-[100vw] h-[100vh] flex items-center justify-center"
        style={{ pointerEvents: mode === "play" ? "none" : "auto" }}
      >
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: ["main", "pause"].includes(mode) ? 1 : 0,
          }}
        >
          <motion.div
            className="flex flex-col items-center justify-center"
            animate={{
              height: mode === "main" ? "auto" : 0,
            }}
          >
            <motion.div
              className="text-4xl text-white"
              initial={{
                opacity: 0,
                position: "relative",
                top: -100,
                fontFamily: "Lumanosimo",
                minHeight: 0,
              }}
              animate={{
                opacity: mode === "main" ? 1 : 0,
                top: mode === "main" ? 0 : -100,
              }}
            >
              Jay Bae
            </motion.div>
            <motion.button
              className="mt-8 btn btn-primary"
              initial={{
                opacity: 0,
                position: "relative",
                top: 100,
              }}
              animate={{
                opacity: mode === "main" ? 1 : 0,
                top: mode === "main" ? 0 : 100,
              }}
              onClick={() => {
                useStore.getState().setMode("play");
              }}
            >
              Play
            </motion.button>
          </motion.div>
          <motion.div
            className="text-4xl text-white"
            initial={{
              opacity: 0,
              position: "relative",
              top: -100,
              fontFamily: "Lumanosimo",
            }}
            animate={{
              opacity: mode === "pause" ? 1 : 0,
              top: mode === "pause" ? 0 : -100,
              height: mode === "pause" ? "auto" : 0,
            }}
          >
            Paused
          </motion.div>
          <motion.button
            className="mt-8 btn btn-primary"
            initial={{
              opacity: 0,
              position: "relative",
              top: 100,
            }}
            animate={{
              opacity: mode === "pause" ? 1 : 0,
              top: mode === "pause" ? 0 : 100,
              minHeight: mode === "pause" ? "auto" : 0,
            }}
            onClick={() => {
              useStore.getState().setMode("play");
            }}
          >
            Resume
          </motion.button>
        </motion.div>
      </div>
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
