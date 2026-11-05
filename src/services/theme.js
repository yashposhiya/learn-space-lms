export const THEMES = [
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Calm blue with a violet gradient",
    solid: "#2563eb",
    gradient: "linear-gradient(135deg, #172554, #2563eb 55%, #4f46e5)",
  },
  {
    id: "blush",
    name: "Blush Sky",
    description: "White, pink, and blue gradient",
    solid: "#db2777",
    gradient: "linear-gradient(135deg, #fce7f3, #bfdbfe 55%, #dbeafe)",
  },
  {
    id: "lavender",
    name: "Lavender Mint",
    description: "Soft purple with a fresh green gradient",
    solid: "#7c3aed",
    gradient: "linear-gradient(135deg, #312e81, #7c3aed 55%, #14b8a6)",
  },
  {
    id: "sunset",
    name: "Warm Sunset",
    description: "Coral with an orange and rose gradient",
    solid: "#ea580c",
    gradient: "linear-gradient(135deg, #7c2d12, #ea580c 55%, #e11d48)",
  },
];

const THEME_KEY = "learnspace_theme";

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || THEMES[0].id;
}

export function applyTheme(themeId) {
  const theme = THEMES.some((item) => item.id === themeId) ? themeId : THEMES[0].id;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  return theme;
}
