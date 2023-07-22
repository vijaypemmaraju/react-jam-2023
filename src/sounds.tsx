import { sound, filters } from "@pixi/sound";

sound.add("wing_flap", "sounds/wing_flap.wav");
sound.add("wing_flap_2", "sounds/wing_flap_2.wav");
sound.add("woosh", "sounds/woosh.flac");
sound.add("fan_loop", "sounds/fan_loop.ogg");
sound.play("fan_loop", {
  loop: true,
  filters: [new filters.TelephoneFilter(), new filters.ReverbFilter()],
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    //
  } else {
    sound.find("fan_loop")!.filters = [
      new filters.TelephoneFilter(),
      new filters.ReverbFilter(),
    ];
  }
});
