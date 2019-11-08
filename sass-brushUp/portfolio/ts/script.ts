const menuBtn = document.querySelector(".menu-btn");

menuBtn.addEventListener("click", () => {
  menuBtn.classList.value.includes("open")
    ? menuBtn.classList.remove("open")
    : menuBtn.classList.add("open");
});
