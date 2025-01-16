import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: "Jost" },
      },
      colors: {
        doenet_blue: {
          100: { value: "#a6f19f" }, //Ghost/Outline Click
          200: { value: "#c1292e" }, //Normal Button - Dark Mode - Background
          300: { value: "#f5ed85" }, //Normal Button - Dark Mode - Hover
          400: { value: "#949494" }, //Normal Button - Dark Mode - Click
          500: { value: "#1a5a99" }, //Normal Button - Light Mode - Background
          600: { value: "#757c0d" }, //Normal Button - Light Mode - Hover //Ghost/Outline BG
          700: { value: "#d1e6f9" }, //Normal Button - Light Mode - Click
          800: { value: "#6d4445" },
          900: { value: "#4a03d9" },
        },
        doenet: {
          mainBlue: { value: "#1a5a99" },
          lightBlue: { value: "#b8d2ea" },
          solidLightBlue: { value: "#8fb8de" },
          mainGray: { value: "#e3e3e3" },
          mediumGray: { value: "#949494" },
          lightGray: { value: "#e7e7e7" },
          donutBody: { value: "#eea177" },
          donutTopping: { value: "#6d4445" },
          mainRed: { value: "#c1292e" },
          lightRed: { value: "#eab8b8" },
          mainGreen: { value: "#459152" },
          canvas: { value: "#ffffff" },
          canvastext: { value: "#000000" },
          lightGreen: { value: "#a6f19f" },
          lightYellow: { value: "#f5ed85" },
          whiteBlankLink: { value: "#6d4445" },
          mainYellow: { value: "#94610a" },
          mainPurple: { value: "#4a03d9" },
        },
      },
    },
  },
});

export default createSystem(defaultConfig, config);
