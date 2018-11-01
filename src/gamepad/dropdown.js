let dropwdown = document.getElementById("dropdown");
let save = document.getElementById("saveSelection");

save.addEventListener("click", () => {
  closeDropdown();
});

function openDropdown(el, index) {
  dropwdown.style.display = "unset";
  console.log("open dropdown for: ", el.id);
}

function closeDropdown() {
  dropwdown.style.display = "none";
}
