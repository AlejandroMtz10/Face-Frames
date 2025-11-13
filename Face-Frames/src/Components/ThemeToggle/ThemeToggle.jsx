import { useEffect, useState } from "react";
import { BsMoonStarsFill } from "react-icons/bs"; // Moon icon for dark mode
import { RxSun } from "react-icons/rx"; // Sun icon for light mode

function ToggleTheme() {
  const [theme, setTheme] = useState(() => {
    // Leer el tema desde localStorage o preferencia del sistema
    if (localStorage.theme === "dark") return "dark";
    if (localStorage.theme === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Aplica la clase 'dark' al elemento <html>
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      html.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition duration-300 ${
        theme === "dark"
          ? "text-amber-400 hover:bg-emerald-700"
          : "text-white hover:bg-emerald-700"
      }`}
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? <RxSun size={24} /> : <BsMoonStarsFill size={24} />}
    </button>
  );
}

export default ToggleTheme;