(() => {
  "use strict";

  /* Header compacto ao rolar */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Menu mobile */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  const closeNav = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* Reveal ao entrar na viewport */
  const targets = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
  );
  targets.forEach((el) => observer.observe(el));

  /* Link ativo conforme a seção visível */
  const links = [...document.querySelectorAll(".nav__link")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((link) => {
          if (link.getAttribute("href") === `#${entry.target.id}`) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => spy.observe(section));

  /* Formulário — validação local; troque por seu endpoint real */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      status.textContent = "Preencha os campos obrigatórios para continuar.";
      form.reportValidity();
      return;
    }

    status.textContent = "Solicitação registrada. Entraremos em contato em breve.";
    form.reset();
  });

  document.getElementById("year").textContent = String(new Date().getFullYear());
})();
