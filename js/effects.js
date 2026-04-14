document.addEventListener("DOMContentLoaded", () => {
  const bgVideo = document.getElementById("bg-video");
  const splashText = document.getElementById("splash-text");
  const mainContent = document.getElementById("main-content");
  const contactStrip = document.getElementById("contact-button");

  requestAnimationFrame(() => bgVideo.classList.add("visible"));

  setTimeout(() => splashText.classList.add("visible"), 400);
  setTimeout(() => splashText.classList.add("fade-out"), 2800);
  setTimeout(() => contactStrip.classList.add("visible"), 3400);
  setTimeout(() => mainContent.classList.add("visible"), 3600);
});
