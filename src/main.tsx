import { BlurFilter } from 'pixi.js';
import { Stage, Container, Sprite, Text, useTick } from '@pixi/react';
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import useStore from './useStore';


export const MyComponent = () =>
{
  return (
    <Stage >
      <App />
    </Stage>
  );
};

const container = document.createElement('div');
container.id = 'root';
document.body.appendChild(container);
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(<MyComponent />);
