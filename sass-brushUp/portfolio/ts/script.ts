const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
const navItems = document.querySelectorAll(".nav__item");

menuBtn.addEventListener("click", () => {
  menuBtn.classList.value.includes("open")
    ? menuBtn.classList.remove("open")
    : menuBtn.classList.add("open");

  nav.classList.value.includes("open")
    ? nav.classList.remove("open")
    : nav.classList.add("open");

  navItems.forEach(item => {
    item.classList.value.includes("open")
      ? item.classList.remove("open")
      : item.classList.add("open");
  });
});
