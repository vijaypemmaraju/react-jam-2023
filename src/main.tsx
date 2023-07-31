import { motion } from "framer-motion";
import { Stage } from "@pixi/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Viewport from "./Viewport";
import { Assets } from "pixi.js";
import "./sounds";
import useStore from "./useStore";
import { useEffect, useState } from "react";
import Score from "./Score";

export const Root = () => {
  const mode = useStore((state) => state.mode);
  const [isLoading, setIsLoading] = useState(false);
  const birds = useStore((state) => state.birds);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode === "play") {
        useStore.getState().setMode("pause");
      }
      if (e.key === "Escape" && mode === "pause") {
        useStore.getState().setMode("play");
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
        <Score />
      </Stage>
      <div
        className="fixed w-[100vw] h-[100vh] flex items-center justify-center"
        style={{ pointerEvents: mode === "play" ? "none" : "auto" }}
      >
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
            opacity: ["main", "pause", "end"].includes(mode) ? 1 : 0,
          }}
        >
          <motion.div
            className="flex flex-col items-center justify-center"
            animate={{
              height: mode === "main" ? "auto" : 0,
            }}
          >
            <motion.div
              className="text-white text-9xl logo is-animation"
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
              <span>F</span>
              <span>l</span>
              <span>o</span>
              <span>c</span>
              <span>k</span>
            </motion.div>
            <motion.button
              className="mt-8 btn btn-primary"
              disabled={isLoading}
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
                setIsLoading(true);
                Promise.all([
                  Assets.load("jay_sheet.json"),
                  Assets.load("female_jay_sheet.json"),
                  Assets.load("rival_sheet.json"),
                  Assets.load(
                    "elevatelol_top_down_pixel_art_town_view_from_directly_above_2f835eab-997a-4488-87b5-e690850e337a.png",
                  ),
                ]).then(() => {
                  useStore.getState().setMode("play");
                  setIsLoading(false);
                });
              }}
            >
              {!isLoading && "Play"}
              {isLoading && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
            </motion.button>
            <motion.button
              className="mt-8 btn btn-secondary"
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
                (
                  document.getElementById("howToPlayModal") as HTMLDialogElement
                ).showModal();
              }}
            >
              How to Play
            </motion.button>
            <motion.button
              className="mt-8 btn btn-secondary"
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
                (
                  document.getElementById("hintsModal") as HTMLDialogElement
                ).showModal();
              }}
            >
              Hints
            </motion.button>
            <dialog id="howToPlayModal" className="modal">
              <form method="dialog" className="modal-box">
                <h3 className="text-lg font-bold">How to Play</h3>
                <div className="mt-8 font-serif text-xl">
                  <ol>
                    <li className="mt-2">
                      1. Control{" "}
                      <img
                        src="./jay.png"
                        className="inline-block w-6 rocking"
                      />{" "}
                      with{" "}
                      <img
                        src="./cursor.png"
                        className="inline-block w-6 rocking"
                      />{" "}
                    </li>
                    <li className="mt-2">
                      2. Guide{" "}
                      <img
                        src="./female_jay.png"
                        className="inline-block w-6 rocking"
                      />{" "}
                      to{" "}
                      <span className="text-blue-600 logo is-animation">
                        <span>P</span>
                        <span>a</span>
                        <span>r</span>
                        <span>t</span>
                        <span>i</span>
                        <span>e</span>
                        <span>s</span>
                      </span>
                    </li>
                    <li className="mt-2">
                      3. Get more{" "}
                      <img
                        src="./female_jay.png"
                        className="inline-block w-6 rocking"
                      />{" "}
                      than your{" "}
                      <span className="text-red-600 logo is-animation">
                        <span>R</span>
                        <span>i</span>
                        <span>v</span>
                        <span>a</span>
                        <span>l</span>
                      </span>{" "}
                      (
                      <img
                        src="./rival.png"
                        className="inline-block w-6 rocking"
                      />
                      )
                    </li>
                  </ol>
                </div>
                <div className="modal-action">
                  <button className="btn">Got it</button>
                </div>
              </form>
            </dialog>
            <dialog id="hintsModal" className="modal">
              <form method="dialog" className="modal-box">
                <h3 className="text-lg font-bold">Hints</h3>
                <div className="mt-8 font-serif text-xl">
                  <div className="border collapse collapse-arrow border-base-300 bg-base-200">
                    <input type="checkbox" />
                    <div className="text-xl font-medium collapse-title">
                      Basic Hints
                    </div>
                    <div className="collapse-content">
                      <ul className="list-disc list-inside">
                        <li>
                          <img
                            src="./female_jay.png"
                            className="inline-block w-6 rocking"
                          />{" "}
                          get scared if you go too fast!
                        </li>
                        <li>
                          <img
                            src="./female_jay.png"
                            className="inline-block w-6 rocking"
                          />{" "}
                          have a tendency to leave parties that aren't very
                          active. Your presence helps.
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="border collapse collapse-arrow border-base-300 bg-base-200">
                    <input type="checkbox" />
                    <div className="text-xl font-medium collapse-title">
                      Advanced Hints
                    </div>
                    <div className="collapse-content">
                      <ul className="list-disc list-inside">
                        <li>
                          Birds can be scared out of your{" "}
                          <img
                            src="./rival.png"
                            className="inline-block w-6 rocking"
                          />
                          's party.
                        </li>
                        <li>
                          <img
                            src="./female_jay.png"
                            className="inline-block w-6 rocking"
                          />{" "}
                          like traveling in large groups. It's difficult to
                          influence smaller groups. If you have some stragglers,
                          try to get some{" "}
                          <img
                            src="./female_jay.png"
                            className="inline-block w-6 rocking"
                          />{" "}
                          out of your party to help.
                        </li>
                        <li>
                          If all else fails, you can always try scaring{" "}
                          <img
                            src="./female_jay.png"
                            className="inline-block w-6 rocking"
                          />{" "}
                          into your party.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="modal-action">
                  <button className="btn">Got it</button>
                </div>
              </form>
            </dialog>
          </motion.div>
          <motion.div
            className="flex flex-col items-center justify-center"
            animate={{
              height: mode === "main" ? "auto" : 0,
              pointerEvents: mode === "pause" ? "auto" : "none",
            }}
          >
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
            <motion.button
              className="mt-8 btn btn-secondary"
              initial={{
                opacity: 0,
                position: "relative",
                top: 100,
              }}
              animate={{
                opacity: mode === "pause" ? 1 : 0,
                top: mode === "pause" ? 0 : -100,
                height: mode === "pause" ? "auto" : 0,
              }}
              onClick={() => {
                (
                  document.getElementById("hintsModal") as HTMLDialogElement
                ).showModal();
              }}
            >
              Hints
            </motion.button>
            <motion.button
              className="mt-8 btn btn-secondary"
              initial={{
                opacity: 0,
                position: "relative",
                top: 100,
              }}
              animate={{
                opacity: mode === "pause" ? 1 : 0,
                top: mode === "pause" ? 0 : -100,
                height: mode === "pause" ? "auto" : 0,
              }}
              onClick={() => {
                (
                  document.getElementById("howToPlayModal") as HTMLDialogElement
                ).showModal();
              }}
            >
              How to Play
            </motion.button>
          </motion.div>
          <motion.div
            className="flex flex-col items-center justify-center"
            animate={{
              height: mode === "end" ? "auto" : 0,
              pointerEvents: mode === "end" ? "auto" : "none",
            }}
          >
            <motion.div
              className="text-4xl text-center text-white select-none"
              initial={{
                opacity: 0,
                position: "relative",
                top: -100,
                fontFamily: "Lumanosimo",
                fontSize: 18,
              }}
              animate={{
                opacity: mode === "end" ? 1 : 0,
                top: mode === "end" ? 0 : -100,
                height: mode === "end" ? "auto" : 0,
              }}
            >
              You got{" "}
              {birds.filter((bird) => bird.acquiredBy === "player").length}{" "}
              <img
                src="./female_jay.png"
                className="inline-block w-6 rocking"
              />
              s.
              <br />
              Your rival got{" "}
              {birds.filter((bird) => bird.acquiredBy === "rival").length}{" "}
              <img
                src="./female_jay.png"
                className="inline-block w-6 rocking"
              />
              s.
            </motion.div>
            <motion.div
              className="text-4xl text-white select-none"
              initial={{
                opacity: 0,
                position: "relative",
                top: -100,
                fontFamily: "Lumanosimo",
              }}
              animate={{
                opacity: mode === "end" ? 1 : 0,
                top: mode === "end" ? 0 : -100,
                height: mode === "end" ? "auto" : 0,
              }}
            >
              {birds.filter((bird) => bird.acquiredBy === "player").length >
                birds.filter((bird) => bird.acquiredBy === "rival").length
                ? "You won!"
                : "You lost!"}
            </motion.div>
            <motion.button
              className="mt-8 btn btn-primary"
              initial={{
                opacity: 0,
                position: "relative",
                top: 100,
              }}
              animate={{
                opacity: mode === "end" ? 1 : 0,
                top: mode === "end" ? 0 : 100,
                minHeight: mode === "end" ? "auto" : 0,
              }}
              onClick={() => {
                location.reload();
              }}
            >
              Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const container = document.createElement("div");
container.id = "root";
document.body.appendChild(container);
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(<Root />);
