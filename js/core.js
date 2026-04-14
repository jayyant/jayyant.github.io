document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("xmb-track");
  const navLeft = document.getElementById("nav-left");
  const navRight = document.getElementById("nav-right");
  const resumeOverlay = document.getElementById("resume-overlay");
  const resumeClose = document.getElementById("resume-close");

  const projectPopup = document.getElementById("project-popup");
  const popupClose = document.getElementById("project-popup-close");
  const popupTitle = document.getElementById("popup-title");
  const popupDesc = document.getElementById("popup-desc");
  const popupTech = document.getElementById("popup-tech");
  const popupLink = document.getElementById("popup-link");

  const gamePopup = document.getElementById("game-popup");
  const gamePopupClose = document.getElementById("game-popup-close");
  const gamePopupLogo = document.getElementById("game-popup-logo");
  const gamePopupTitle = document.getElementById("game-popup-title");
  const gamePopupDesc = document.getElementById("game-popup-desc");
  const gamePopupEngine = document.getElementById("game-popup-engine");
  const gamePopupTech = document.getElementById("game-popup-tech");
  const gamePopupLink = document.getElementById("game-popup-link");

  const aboutOverlay = document.getElementById("about-overlay");
  const aboutClose = document.getElementById("about-close");

  const ROW_H = 84;
  const ITEM_SLOT = 170;

  const items = Array.from(track.querySelectorAll(".xmb-item"));
  let current = 0;
  let activeSubMenu = null;
  let subItems = [];
  let subIndex = 0;
  let subMenuFocused = false;

  // ── Carousel ──────────────────────────────────────────────
  function updateCarousel() {
    items.forEach((el, i) => {
      el.classList.remove("active", "adjacent");
      const dist = Math.abs(i - current);
      if (dist === 0) el.classList.add("active");
      else if (dist === 1) el.classList.add("adjacent");
    });
    const wrapWidth = track.parentElement.offsetWidth;
    const offset = wrapWidth / 2 - current * ITEM_SLOT - ITEM_SLOT / 2;
    track.style.transform = `translateX(${offset}px)`;
    syncSubMenu();
  }

  function syncSubMenu() {
    const submenuId = items[current].dataset.submenu;
    const targetMenu = submenuId ? document.getElementById(submenuId) : null;
    if (activeSubMenu && activeSubMenu !== targetMenu) {
      activeSubMenu.classList.remove("open");
      activeSubMenu = null;
      subItems = [];
      subIndex = 0;
      subMenuFocused = false;
    }
    if (targetMenu && !targetMenu.classList.contains("open")) {
      targetMenu.classList.add("open");
      activeSubMenu = targetMenu;
      subItems = Array.from(targetMenu.querySelectorAll(".sub-item"));
      subIndex = 0;
      subMenuFocused = false;
      updateSubMenu();
    }
  }

  function updateSubMenu() {
    const windowCentre = 126;
    const offset = windowCentre - subIndex * ROW_H - ROW_H / 2;
    activeSubMenu.querySelector(".sub-menu-track").style.transform =
      `translateY(${offset}px)`;
    subItems.forEach((el, i) => {
      el.dataset.dist = String(Math.min(Math.abs(i - subIndex), 5));
    });
  }

  function navigate(dir) {
    current = Math.max(0, Math.min(items.length - 1, current + dir));
    updateCarousel();
  }

  // ── About Me overlay sequence ─────────────────────────────
  function openAbout() {
    // 1. Show overlay
    aboutOverlay.classList.add("visible");

    // 2. Instantly flash white (PSP boot)
    aboutOverlay.classList.add("flash");

    // 3. Flash fades out after 300ms
    setTimeout(() => aboutOverlay.classList.remove("flash"), 300);

    // 4. "About Me" hero title fades in
    setTimeout(() => aboutOverlay.classList.add("show-hero"), 400);

    // 5. Hero fades out
    setTimeout(() => {
      aboutOverlay.classList.remove("show-hero");
      aboutOverlay.classList.add("hide-hero");
    }, 1800);

    // 6. Content + close button fade in
    setTimeout(() => {
      aboutOverlay.classList.remove("hide-hero");
      aboutOverlay.classList.add("show-content");
    }, 2400);
  }

  function closeAbout() {
    aboutOverlay.classList.remove(
      "visible",
      "show-content",
      "show-hero",
      "hide-hero",
      "flash",
    );
  }

  aboutClose.addEventListener("click", closeAbout);

  // ── Keyboard ──────────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeResume();
      closeProjectPopup();
      closeGamePopup();
      closeAbout();
      subMenuFocused = false;
      return;
    }
    if (aboutOverlay.classList.contains("visible")) return;
    if (projectPopup.classList.contains("visible")) return;
    if (gamePopup.classList.contains("visible")) return;
    if (resumeOverlay.classList.contains("visible")) return;

    if (e.key === "ArrowLeft") {
      subMenuFocused = false;
      navigate(-1);
    } else if (e.key === "ArrowRight") {
      subMenuFocused = false;
      navigate(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (activeSubMenu) {
        subMenuFocused = true;
        subIndex = Math.min(subItems.length - 1, subIndex + 1);
        updateSubMenu();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (activeSubMenu && subMenuFocused) {
        subIndex = Math.max(0, subIndex - 1);
        updateSubMenu();
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (subMenuFocused && activeSubMenu) openSubItem(subItems[subIndex]);
      else activateItem();
    }
  });

  // ── Scroll wheel ──────────────────────────────────────────
  document.addEventListener(
    "wheel",
    (e) => {
      if (!activeSubMenu) return;
      if (projectPopup.classList.contains("visible")) return;
      if (gamePopup.classList.contains("visible")) return;
      e.preventDefault();
      subMenuFocused = true;
      subIndex =
        e.deltaY > 0
          ? Math.min(subItems.length - 1, subIndex + 1)
          : Math.max(0, subIndex - 1);
      updateSubMenu();
    },
    { passive: false },
  );

  // ── Clicks ────────────────────────────────────────────────
  navLeft.addEventListener("click", () => {
    subMenuFocused = false;
    navigate(-1);
  });
  navRight.addEventListener("click", () => {
    subMenuFocused = false;
    navigate(1);
  });

  items.forEach((el, i) => {
    el.addEventListener("click", () => {
      if (i !== current) {
        current = i;
        updateCarousel();
      } else activateItem();
    });
  });

  document.addEventListener("click", (e) => {
    const subItem = e.target.closest(".sub-item");
    if (!subItem || !subItem.closest(".sub-menu.open")) return;
    const idx = subItems.indexOf(subItem);
    if (idx === subIndex) openSubItem(subItem);
    else {
      subIndex = idx;
      subMenuFocused = true;
      updateSubMenu();
    }
  });

  // ── XMB Actions ───────────────────────────────────────────
  function activateItem() {
    const action = items[current].dataset.action;
    if (action === "resume") openResume();
    if (action === "about-me") openAbout();
    if (action === "github")
      window.open("https://github.com/jayyant", "_blank");
    if (action === "linkedin")
      window.open(
        "https://www.linkedin.com/in/jayyant-jaju-58341a265/",
        "_blank",
      );
    if (action === "leetcode")
      window.open("https://leetcode.com/u/ScuffyD/", "_blank");
    if (action === "submenu" && activeSubMenu) {
      subMenuFocused = true;
      openSubItem(subItems[subIndex]);
    }
  }

  function openResume() {
    resumeOverlay.classList.add("visible");
  }
  function closeResume() {
    resumeOverlay.classList.remove("visible");
  }
  resumeClose.addEventListener("click", closeResume);

  function openSubItem(el) {
    const type = el.dataset.type || "project";
    if (type === "game") openGamePopup(el);
    else openProjectPopup(el);
  }

  function openProjectPopup(el) {
    popupTitle.textContent = el.dataset.title || "";
    popupDesc.textContent = el.dataset.desc || "";
    popupTech.innerHTML = "";
    buildTags(el.dataset.tech, popupTech);
    const link = el.dataset.link || "";
    if (link) {
      popupLink.href = link;
      popupLink.classList.remove("hidden");
    } else popupLink.classList.add("hidden");
    projectPopup.classList.add("visible");
  }
  function closeProjectPopup() {
    projectPopup.classList.remove("visible");
  }
  popupClose.addEventListener("click", closeProjectPopup);
  projectPopup.addEventListener("click", (e) => {
    if (e.target === projectPopup) closeProjectPopup();
  });

  function openGamePopup(el) {
    gamePopupLogo.src = el.dataset.logo || "";
    gamePopupTitle.textContent = el.dataset.title || "";
    gamePopupDesc.textContent = el.dataset.desc || "";
    gamePopupEngine.textContent = el.dataset.engine || "";
    gamePopupTech.innerHTML = "";
    buildTags(el.dataset.tech, gamePopupTech);
    const link = el.dataset.link || "";
    if (link) {
      gamePopupLink.href = link;
      gamePopupLink.classList.remove("hidden");
    } else gamePopupLink.classList.add("hidden");
    gamePopup.classList.add("visible");
  }
  function closeGamePopup() {
    gamePopup.classList.remove("visible");
  }
  gamePopupClose.addEventListener("click", closeGamePopup);
  gamePopup.addEventListener("click", (e) => {
    if (e.target === gamePopup) closeGamePopup();
  });

  function buildTags(techString, container) {
    (techString || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => {
        const tag = document.createElement("span");
        tag.className = "tech-tag";
        tag.textContent = t;
        container.appendChild(tag);
      });
  }

  updateCarousel();
});
