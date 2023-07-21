export const WEIGHTS = {
  PLAYER_ATTRACTION: 10,
  CENTER_OF_SCREEN_ATTRACTION: 1,
  ATTRACTION_RADIUS: () => {
    const root = document.querySelector("canvas");
    const rect = root!.getBoundingClientRect();
    return rect.width / 6;
  },
  COHESION: 1,
  ALIGNMENT: 5,
  SEPARATION: 50,
};

export const PLAYER_SPEED = 15;
