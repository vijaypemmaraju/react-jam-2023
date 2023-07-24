import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";

const fullReloadAlways: PluginOption = {
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" });
    return [];
  },
} as PluginOption;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fullReloadAlways],
  base: "/react-jam-2023",
});
