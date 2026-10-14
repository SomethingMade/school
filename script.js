// Change the logo here once and it updates everywhere on the site.
const LOGO = "https://i.postimg.cc/4dbyWT4x/1.png";

// Contact form settings
const EMAIL = "info@raregradetech.co.za";
// Optional: paste a form-service URL (for example from Formspree) to send messages
// straight to your inbox. While this is empty, the form opens the visitor's email
// app with the message already written.
const ENDPOINT = "";

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
  // Don't change page while someone is typing in the form
  if (e.target.matches("input, textarea, select")) return;
  if (e.key === "ArrowRight") go(current + 1);
  if (e.key === "ArrowLeft") go(current - 1);
});

// Save as PDF (uses the print styles in style.css)
document.getElementById("print").addEventListener("click", () => window.print());

/* ---------- Contact form ---------- */
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const sendBtn = form.querySelector(".send");

const rules = {
  name: v => v.trim().length >= 2 || "Enter your full name.",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter a valid email address.",
  phone: v => !v.trim() || /^[+\d][\d\s()-]{6,}$/.test(v.trim()) || "Enter a valid phone number, or leave it empty.",
  service: v => !!v || "Choose a service.",
  message: v => v.trim().length >= 10 || "Write at least 10 characters."
};

function check(field) {
  const rule = rules[field.name];
  if (!rule) return true;
  const result = rule(field.value);
  const ok = result === true;
  field.setAttribute("aria-invalid", ok ? "false" : "true");
  field.parentElement.querySelector(".err").textContent = ok ? "" : result;
  return ok;
}

function setStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = "status" + (type ? " " + type : "");
}

// Re-check a field as the person fixes it
form.addEventListener("input", e => {
  if (e.target.getAttribute("aria-invalid") === "true") check(e.target);
});
form.addEventListener("focusout", e => {
  if (rules[e.target.name] && e.target.value !== "") check(e.target);
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  setStatus("");

  const fields = [...form.elements].filter(f => rules[f.name]);
  const invalid = fields.filter(f => !check(f));
  if (invalid.length) {
    invalid[0].focus();
    setStatus("Please fix the highlighted fields.", "error");
    return;
  }

  // Hidden spam trap: real visitors never fill this in
  if (form.elements.website.value) return;

  const data = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim(),
    service: form.elements.service.value,
    message: form.elements.message.value.trim()
  };

  sendBtn.disabled = true;
  sendBtn.textContent = "Sending…";

  if (ENDPOINT) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Request failed");
      form.reset();
      setStatus("Thank you. Your message has been sent and we will reply soon.", "ok");
    } catch (err) {
      setStatus(`The message could not be sent. Please email us at ${EMAIL} or call 061 527 0749.`, "error");
    }
  } else {
    const subject = `Website enquiry: ${data.service}`;
    const body =
      `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "-"}\nService: ${data.service}\n\n${data.message}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("Your email app should open with the message ready. Press send there to finish.", "ok");
  }

  sendBtn.disabled = false;
  sendBtn.textContent = "Send message";
});
