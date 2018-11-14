let list = document.getElementById("dropdown");
let main = document.getElementById("main");
let octaveSlider = document.getElementById("octaveNumber");
let button = null;
let chordList = ["C", "G", "Am", "F", "Em", "Cmaj7", "D7", "F#m", "E"];
let noteList = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "B", "H"];
let listType = null;
let octaveNumber = null;

octaveSlider.addEventListener("input", e => {
  octaveNumber = e.target.value;
});

function openDropdown(btn) {
  button = btn;
  list.style.display = "unset";
  list.style.opacity = 0.9;
  octaveSlider.style.visibility = "visible";
  octaveNumber = octaveSlider.value;
  main.style.opacity = 0.4;
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
      setSound(listType, item, octaveNumber, button);
      closeDropdown();
      break;
  }
}

function closeDropdown() {
  changeButtonColor(button.element);
  listType = null;
  list.style.opacity = 0;
  main.style.opacity = 0.8;
  octaveSlider.style.visibility = "hidden";
  setTimeout(() => {
    list.style.display = "none";
  }, 300);
}
