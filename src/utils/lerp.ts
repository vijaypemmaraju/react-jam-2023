const lerp = (start: number, end: number, t: number) => {
  return (1 - t) * start + t * end;
};

export default lerp;
