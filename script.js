// Change the logo here once and it updates everywhere on the site.
const LOGO = "https://i.postimg.cc/4dbyWT4x/1.png";

// Short names for the nav tabs, in page order
const LABELS = ["Cover", "Overview", "About", "Mission", "Values", "Services", "Industries", "Difference", "Why us", "Contact"];

document.querySelectorAll("img[data-logo]").forEach(img => (img.src = LOGO));
const icon = document.createElement("link");
icon.rel = "icon";
icon.href = LOGO;
document.head.appendChild(icon);

const pages = [...document.querySelectorAll(".page")];

// Build each page's header band and page number from its data-title
pages.forEach((page, i) => {
  const title = page.dataset.title;
  if (title) {
    page.insertAdjacentHTML(
      "afterbegin",
      `<div class="band"><h2>${title}</h2>
         <div class="pills"><i></i><i></i><i></i><i></i></div><div class="bar"></div>
         <img src="${LOGO}" alt=""></div>`
    );
  }
  if (i > 0) page.insertAdjacentHTML("beforeend", `<div class="num">${i + 1}</div>`);
});

// Build the top nav
const topnav = document.getElementById("topnav");
topnav.innerHTML =
  `<button class="nav-logo" aria-label="Back to cover"><img src="${LOGO}" alt=""></button>
   <nav class="tabs" aria-label="Profile sections"></nav>`;
const tabsEl = topnav.querySelector(".tabs");
pages.forEach((_, i) => {
  const b = document.createElement("button");
  b.textContent = LABELS[i] || `Page ${i + 1}`;
  b.addEventListener("click", () => go(i));
  tabsEl.appendChild(b);
});
topnav.querySelector(".nav-logo").addEventListener("click", () => go(0));
const tabs = [...tabsEl.children];

// Track which page is on screen
const count = document.getElementById("count");
const fill = document.querySelector(".progress i");
let current = 0;

function setCurrent(i) {
  current = i;
  count.textContent = `${i + 1} / ${pages.length}`;
  fill.style.width = `${((i + 1) / pages.length) * 100}%`;
  tabs.forEach((t, j) => {
    t.classList.toggle("on", j === i);
    if (j === i) t.setAttribute("aria-current", "page");
    else t.removeAttribute("aria-current");
  });
  const t = tabs[i];
  tabsEl.scrollTo({ left: t.offsetLeft - tabsEl.clientWidth / 2 + t.clientWidth / 2, behavior: "smooth" });
}
setCurrent(0);

const seen = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) setCurrent(pages.indexOf(e.target));
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);
pages.forEach(p => seen.observe(p));

// Go to a page (used by tabs, previous/next and arrow keys)
function go(i) {
  const n = Math.max(0, Math.min(pages.length - 1, i));
  pages[n].scrollIntoView({ behavior: "smooth", block: "start" });
}
document.getElementById("prev").addEventListener("click", () => go(current - 1));
document.getElementById("next").addEventListener("click", () => go(current + 1));
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") go(current + 1);
  if (e.key === "ArrowLeft") go(current - 1);
});

// Save as PDF (uses the print styles in style.css)
document.getElementById("print").addEventListener("click", () => window.print());
