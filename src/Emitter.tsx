/* eslint-disable @typescript-eslint/no-explicit-any */
import { Emitter as PixiEmitter } from "@pixi/particle-emitter";
import { PixiComponent } from "@pixi/react";
import { Container } from "pixi.js";

const Emitter = PixiComponent("Emitter", {
  create() {
    return new Container();
  },
  applyProps(instance, oldProps, newProps) {
    const { config, onCreate } = newProps;

    let emitter = (this as any)._emitter;

    if (!emitter) {
      emitter = new PixiEmitter(instance, config);

      let elapsed = Date.now();

      const t = () => {
        emitter!.raf = requestAnimationFrame(t);
        const now = Date.now();

        emitter!.update((now - elapsed) * 0.001);

        elapsed = now;
      };

      emitter.emit = true;
      (this as any)._emitter = emitter;
      onCreate?.(emitter);
      t();
    }
  },
  willUnmount() {
    const emitter = (this as any)._emitter;
    if (emitter) {
      emitter.emit = false;
      cancelAnimationFrame(emitter.raf);
    }
  },
});

export default Emitter;
