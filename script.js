if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);
window.addEventListener("load", () => window.scrollTo(0, 0));

const NAME = "Fabian Hysen Patti";
const GITHUB_USERNAME = "hys3n";

const bootLines = [
  "INIZIALIZZAZIONE PORTFOLIO_OS...",
  "CARICAMENTO MODULI: about, skills, certifications, projects...",
  "VERIFICA CREDENZIALI... OK",
  "CONNESSIONE STABILITA",
  "ACCESSO CONSENTITO_",
];

const bootScreen = document.getElementById("boot-screen");
const bootLog = document.getElementById("boot-log");
const site = document.getElementById("site");

function runBoot() {
  let i = 0;
  function nextLine() {
    if (i < bootLines.length) {
      bootLog.textContent += (i > 0 ? "\n" : "") + bootLines[i];
      i++;
      setTimeout(nextLine, 220);
    } else {
      setTimeout(() => {
        bootScreen.style.transition = "opacity 0.4s ease";
        bootScreen.style.opacity = "0";
        setTimeout(() => {
          bootScreen.remove();
          site.classList.remove("hidden");
          startHeroAnimations();
        }, 400);
      }, 350);
    }
  }
  nextLine();
}

if (sessionStorage.getItem("bootDone") === "1") {
  bootScreen.remove();
  site.classList.remove("hidden");
  startHeroAnimations();
} else {
  runBoot();
  sessionStorage.setItem("bootDone", "1");
}

function startHeroAnimations() {
  const fill = document.querySelector(".hero__scan-fill");
  if (fill)
    requestAnimationFrame(() => {
      fill.style.width = "100%";
    });

  const typedEl = document.getElementById("typed-name");
  if (typedEl) {
    let idx = 0;
    function type() {
      if (idx <= NAME.length) {
        typedEl.textContent = NAME.slice(0, idx);
        idx++;
        setTimeout(type, 55);
      }
    }
    type();
  }

  animateSkillBars();
}

function animateSkillBars() {
  const skills = document.querySelectorAll(".skill");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const level = el.getAttribute("data-level") || "0";
          const fill = el.querySelector(".skill__fill");
          if (fill) fill.style.width = level + "%";
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.3 },
  );
  skills.forEach((s) => observer.observe(s));
}

function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
updateClock();
setInterval(updateClock, 1000);

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  siteNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const navLinks = document.querySelectorAll(".topbar__nav a");
const sections = Array.from(navLinks)
  .map((a) => document.getElementById(a.dataset.target))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = document.querySelector(`.topbar__nav a[data-target="${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px" },
);
sections.forEach((s) => sectionObserver.observe(s));

async function loadGithubProjects() {
  const grid = document.getElementById("project-grid");
  if (!grid) return;

  if (!GITHUB_USERNAME) return;

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?per_page=100&type=owner`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    const repos = await res.json();

    const top3 = repos
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3);

    if (top3.length === 0) throw new Error("Nessun repository pubblico trovato");

    grid.insertAdjacentHTML("beforeend", top3.map(repoToCardHtml).join(""));
  } catch (err) {
    console.warn("Impossibile caricare i progetti da GitHub, resta il messaggio di riserva:", err);
  }
}

function repoToCardHtml(repo) {
  const year = new Date(repo.pushed_at || repo.created_at).getFullYear();
  const description = repo.description
    ? escapeHtml(repo.description)
    : "Nessuna descrizione fornita su GitHub per questo repository.";
  const stack = [repo.language, `★ ${repo.stargazers_count}`].filter(Boolean);
  const demoLink = repo.homepage
    ? `<a href="${escapeAttr(repo.homepage)}" target="_blank" rel="noopener">DEMO →</a>`
    : "";

  return `
    <article class="project-card">
      <div class="project-card__head">
        <span class="project-card__status">GITHUB</span>
        <span class="project-card__year">${year}</span>
      </div>
      <h3>${escapeHtml(repo.name)}</h3>
      <p>${description}</p>
      <div class="project-card__stack">
        ${stack.map((s) => `<span>${escapeHtml(String(s))}</span>`).join("")}
      </div>
      <div class="project-card__links">
        <a href="${escapeAttr(repo.html_url)}" target="_blank" rel="noopener">CODICE →</a>
        ${demoLink}
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

loadGithubProjects();
