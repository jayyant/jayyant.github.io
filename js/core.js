document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("xmb-track");
  const xmbWrap = document.getElementById("xmb-wrap");
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

  const ROW_H = 98; // matches CSS .sub-item height (desktop)
  const ITEM_SLOT = 170; // icon width + gap

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

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 60;
    const slotWidth = itemWidth + gap;

    // Reset transform first so getBoundingClientRect is accurate
    track.style.transform = "none";
    const trackLeft = track.getBoundingClientRect().left;

    const offset =
      window.innerWidth / 2 - trackLeft - current * slotWidth - slotWidth / 2;
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
    // Window height from CSS: 294px (desktop) or 300px (mobile)
    const windowH = activeSubMenu.offsetHeight;
    const centre = windowH / 2;
    const offset = centre - subIndex * ROW_H - ROW_H / 2;
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

  // ── Touch swipe — carousel ────────────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;
  let swipeHandled = false;

  xmbWrap.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      swipeHandled = false;
    },
    { passive: true },
  );

  xmbWrap.addEventListener(
    "touchend",
    (e) => {
      if (swipeHandled) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Only handle if horizontal swipe is dominant
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
        swipeHandled = true;
        navigate(dx < 0 ? 1 : -1);
      }
    },
    { passive: true },
  );

  // ── Touch scroll — submenu ────────────────────────────────
  let subTouchStartY = 0;

  document.querySelectorAll(".sub-menu").forEach((menu) => {
    menu.addEventListener(
      "touchstart",
      (e) => {
        subTouchStartY = e.touches[0].clientY;
      },
      { passive: true },
    );

    menu.addEventListener(
      "touchend",
      (e) => {
        if (!activeSubMenu) return;
        const dy = e.changedTouches[0].clientY - subTouchStartY;
        if (Math.abs(dy) > 20) {
          subMenuFocused = true;
          subIndex =
            dy < 0
              ? Math.min(subItems.length - 1, subIndex + 1)
              : Math.max(0, subIndex - 1);
          updateSubMenu();
        }
      },
      { passive: true },
    );
  });

  // ── About Me scroll (touch) ───────────────────────────────
  // #about-content already has -webkit-overflow-scrolling: touch
  // so native momentum scroll works — nothing extra needed.

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

  // ── Scroll wheel (desktop) ────────────────────────────────
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

  // ── Button clicks ─────────────────────────────────────────
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
    if (action === "behance")
      window.open(
        "https://www.behance.net/gallery/161921441/Design-Portfolio",
        "_blank",
      );
    if (action === "submenu" && activeSubMenu) {
      subMenuFocused = true;
      openSubItem(subItems[subIndex]);
    }
  }

  // ── Resume ────────────────────────────────────────────────
  function openResume() {
    resumeOverlay.classList.add("visible");
  }
  function closeResume() {
    resumeOverlay.classList.remove("visible");
  }
  resumeClose.addEventListener("click", closeResume);

  // ── Sub-item routing ──────────────────────────────────────
  function openSubItem(el) {
    const type = el.dataset.type || "project";
    if (type === "game") openGamePopup(el);
    else openProjectPopup(el);
  }

  // ── Project popup ─────────────────────────────────────────
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

  // ── Game popup ────────────────────────────────────────────
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

  // ── About Me sequence ─────────────────────────────────────
  function openAbout() {
    aboutOverlay.classList.add("visible", "flash");
    setTimeout(() => aboutOverlay.classList.remove("flash"), 300);
    setTimeout(() => aboutOverlay.classList.add("show-hero"), 400);
    setTimeout(() => {
      aboutOverlay.classList.remove("show-hero");
      aboutOverlay.classList.add("hide-hero");
    }, 1800);
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

  // ── Shared tag builder ────────────────────────────────────
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

  // ── Init ──────────────────────────────────────────────────
  updateCarousel();
});
