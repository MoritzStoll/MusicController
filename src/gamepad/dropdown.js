let list = document.getElementById("dropdown");
let gamepad = document.getElementById("gamepad");
let button = null;
let chordList = ["C", "G", "Am", "F"];
let noteList = [
  "C",
  "Cis",
  "D",
  "Dis",
  "E",
  "F",
  "Fis",
  "G",
  "Gis",
  "A",
  "B",
  "H"
];

let listType;

function openDropdown(btn) {
  button = btn;
  list.style.display = "unset";
  list.style.opacity = 0.9;
  gamepad.style.opacity = 0.4;
  let items = ["chord", "note"];
  createList(items);
}

function createList(items) {
  clearList();
  items.forEach((item, i) => {
    let el = document.createElement("li");
    el.innerHTML = item;
    el.id = `item_${i}`;
    el.addEventListener("click", e => {
      selectItem(e);
    });
    list.appendChild(el);
  });
}

function clearList() {
  list.innerHTML = "";
}

function selectItem(e) {
  let item = e.srcElement.innerHTML;
  switch (item) {
    case "chord":
      listType = "chord";
      createList(chordList);
      break;
    case "note":
      listType = "note";
      createList(noteList);
      break;
    default:
      setSound(listType, item, button);
      closeDropdown();
      break;
  }
}

function closeDropdown() {
  list.style.opacity = 0;
  gamepad.style.opacity = 0.8;
  setTimeout(() => {
    list.style.display = "none";
  }, 300);
}
