import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Удаление сторонних бейджей/плашек, внедряемых сборщиком (напр. «built with arena»)
function purgeBadges() {
  const kill = () => {
    document
      .querySelectorAll<HTMLElement>(
        '[id*="arena"], [class*="arena"], a[href*="arena"], [data-arena], [data-builder-badge], [id*="builder-badge"], [class*="builder-badge"]'
      )
      .forEach((el) => {
        // не трогаем элементы внутри #root
        if (!document.getElementById("root")?.contains(el)) {
          el.style.display = "none";
        }
      });
  };
  kill();
  const obs = new MutationObserver(kill);
  obs.observe(document.body, { childList: true, subtree: true });
}
purgeBadges();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
