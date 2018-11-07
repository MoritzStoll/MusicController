let dropwdown = document.getElementById("dropdown");
let gamepad = document.getElementById("gamepad");

function openDropdown() {
  dropwdown.style.display = "unset";
  dropwdown.style.opacity = 0.9;
  gamepad.style.opacity = 0.4;
  let items = ["C#", "D", "F", "C-dur"];
  createList(items);
}

function createList(items) {
  items.forEach((item, i) => {
    let el = document.createElement("li");
    el.innerHTML = item;
    el.id = `item_${i}`;
    el.addEventListener("click", e => {
      selectItem(e);
    });
    dropwdown.appendChild(el);
  });
}

function selectItem(e) {
  console.log("selected", e);
  closeDropdown();
}

function closeDropdown() {
  dropwdown.style.opacity = 0;
  gamepad.style.opacity = 0.8;
  setTimeout(() => {
    dropwdown.style.display = "none";
  }, 300);
}
