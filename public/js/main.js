(() => {
  // <stdin>
  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var themeBtn = document.getElementById("themeToggle");
  var systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", (e) => {
    let saved = null;
    try {
      saved = localStorage.getItem("ldz-theme");
    } catch (err) {
    }
    if (!saved) root.setAttribute("data-theme", e.matches ? "dark" : "light");
  });
  themeBtn?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || (systemDark() ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ldz-theme", next);
    } catch (e) {
    }
  });
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  navToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks?.querySelectorAll("a").forEach(
    (a) => a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    })
  );
  var nav = document.getElementById("nav");
  var progress = document.getElementById("scrollProgress");
  var timeline = document.getElementById("timeline");
  var cableFill = document.getElementById("cableFill");
  var nodes = [...document.querySelectorAll("[data-node]")];
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = scrollY;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav?.classList.toggle("is-scrolled", y > 8);
    if (timeline && cableFill) {
      const r = timeline.getBoundingClientRect();
      const probe = innerHeight * 0.6;
      const fill = Math.min(1, Math.max(0, (probe - r.top) / r.height));
      cableFill.parentElement.style.setProperty("--fill", fill.toFixed(3));
      cableFill.style.setProperty("--fill", fill.toFixed(3));
      nodes.forEach((n) => {
        const nr = n.getBoundingClientRect();
        n.classList.toggle("is-lit", nr.top + 30 < probe);
      });
    }
  }
  var ticking = false;
  addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    if (!isFinite(target) || reduced) return;
    const start = target > 1e3 ? target - 12 : 0;
    const t0 = performance.now();
    const dur = 1100;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(start + (target - start) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add("is-in");
        el.querySelectorAll("[data-count]").forEach(countUp);
        el.querySelectorAll(".meter").forEach((m) => m.classList.add("is-on"));
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
    document.querySelectorAll(".meter").forEach((m) => m.classList.add("is-on"));
  }
  var tagEl = document.getElementById("tagline");
  if (tagEl && !reduced) {
    const lines = (tagEl.dataset.lines || "").split("|").filter(Boolean);
    let li = 0, ci = lines[0]?.length || 0, deleting = false;
    const tick = () => {
      const line = lines[li];
      if (!deleting) {
        ci++;
        tagEl.textContent = line.slice(0, ci);
        if (ci >= line.length) {
          deleting = true;
          return setTimeout(tick, 2600);
        }
        return setTimeout(tick, 45);
      }
      ci--;
      tagEl.textContent = line.slice(0, ci);
      if (ci <= 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        return setTimeout(tick, 300);
      }
      setTimeout(tick, 22);
    };
    if (lines.length > 1) {
      deleting = true;
      setTimeout(tick, 3200);
    }
  }
  var house = document.getElementById("house");
  var person = document.getElementById("person");
  if (house && person) {
    const signal = document.getElementById("signal");
    const gw = house.querySelector(".bldg__gw");
    const hint = document.getElementById("houseHint");
    let on = false;
    const restart = (el, cls) => {
      el.classList.remove(cls);
      void el.getBoundingClientRect();
      el.classList.add(cls);
    };
    const toggle = () => {
      on = !on;
      person.classList.add("is-used", "is-tap");
      setTimeout(() => person.classList.remove("is-tap"), 250);
      if (!reduced) {
        restart(signal, "is-sending");
        restart(gw, "is-rx");
      }
      house.querySelectorAll("[data-zone]").forEach((el) => {
        const delay = reduced ? 0 : el.dataset.zone === "giorno" ? 450 : 650;
        setTimeout(() => el.classList.toggle("is-on", on), delay);
      });
      person.setAttribute("aria-pressed", String(on));
      hint?.classList.add("is-done");
    };
    person.setAttribute("aria-pressed", "false");
    person.addEventListener("click", toggle);
    person.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  }
})();
