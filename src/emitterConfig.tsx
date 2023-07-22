import { EmitterConfigV3 } from "@pixi/particle-emitter";


export const emitterConfig: EmitterConfigV3 = {
  lifetime: {
    min: 0.5,
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
        anim: {
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
