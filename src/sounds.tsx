import { sound, filters } from "@pixi/sound";

sound.add("ambient", "sounds/ambient.mp3");
sound.add("wing_flap", "sounds/wing_flap.wav");
sound.add("wing_flap_2", "sounds/wing_flap_2.wav");
sound.add("woosh", "sounds/woosh.flac");
sound.add("fan_loop", "sounds/fan_loop.mp3");
sound.add("song_upper", "sounds/jaybae_upper.mp3");
sound.add("song_lower", "sounds/jaybae_lower.mp3");
sound.add("chirp", "sounds/chirp.wav");
sound.add("chirp2", "sounds/chirp2.wav");

export const fanLoopFilters = [
  new filters.TelephoneFilter(),
  new filters.ReverbFilter(),
];

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("hidden");
    sound.pauseAll();
    //
  } else {
    sound.resumeAll();
    sound.find("fan_loop")!.filters = fanLoopFilters;
  }
});
