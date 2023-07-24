import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const fullReloadAlways = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleHotUpdate({ server }: { server: any }) {
    server.ws.send({ type: "full-reload" });
    return [];
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fullReloadAlways],
  base: "/react-jam-2023",
});
