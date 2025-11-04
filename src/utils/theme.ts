import { getDarkColor, getLightColor, setHtmlProperty } from "./color";

const themes = [
  {
    name: "浅色模式",
    key: "light",
    cssVars: {
      "--app-bg-color": "#F0F0F0",
      "--menu-hover-bg-color": "#E4E4E4",
      "--main-section-bg-color": "#fff",
      "--main-section-bg-color-secondary": "#F8F8F8",
      "--main-section-bg-color-third": "#F0F0F0",
      "--main-section-border-color": "#E4E4E4",
      "--text-color": "#333",
      "--text-color-secondary": "#8E8E8E",
    },
  },
  {
    name: "深色模式",
    key: "dark",
    cssVars: {
      "--app-bg-color": "#242424",
      "--menu-hover-bg-color": "#313131",
      "--main-section-bg-color": "#1B1B1B",
      "--main-section-bg-color-secondary": "#262626",
      "--main-section-bg-color-third": "#333333",
      "--main-section-border-color": "#E4E4E4",
      "--text-color": "#E0E0E0",
      "--text-color-secondary": "#7F7F7F",
    },
  },
];

export function setTheme(themeKey: string) {
  const theme = themes.find((theme) => theme.key === themeKey);
  if (theme) {
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      setHtmlProperty(key, value);
    });
    if (themeKey === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

export const themeColors = [
  { color: "#409eff", themeName: "道奇蓝" },
  { color: "#eb2f96", themeName: "深粉色" },
  { color: "#f5222d", themeName: "猩红色" },
  { color: "#fa541c", themeName: "橙红色" },
  { color: "#13c2c2", themeName: "绿宝石" },
  { color: "#52c41a", themeName: "酸橙绿" },
  { color: "#722ed1", themeName: "深紫罗兰色" },
];

const EL_PRIMARY_COLOR_WEIGHT = [100, 200, 300, 400, 500, 600, 700, 800, 900];
export function setThemeColor(color: string, isDark: boolean = false) {
  setHtmlProperty("--el-color-primary", color);
  setHtmlProperty(`--el-color-primary-dark-2`, getDarkColor(color, 0.2));

  for (const weight of EL_PRIMARY_COLOR_WEIGHT) {
    setHtmlProperty(
      `--el-color-primary-light-${weight / 100}`,
      getLightColor(color, weight / 1000, isDark)
    );
  }
}
