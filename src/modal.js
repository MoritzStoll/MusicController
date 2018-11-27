let modal = document.getElementById("modal");
let main = document.getElementById("main");
let octaveSlider = document.getElementById("octaveNumber");
let pianoSVG = document.getElementById("piano");
let patternBtn = document.getElementById("patternButton");
let button = null;
let chordList = ["C", "G", "Am", "F", "Em", "Cmaj7", "D7", "F#m", "E"];
let noteList = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "B", "H"];
let listType = null;
let octaveNumber = null;
let pattern = [[], [], [], []];

octaveSlider.addEventListener("input", e => {
  octaveNumber = e.target.value;
});

patternBtn.addEventListener("click", e => {
  if (e.srcElement.innerHTML !== "save") {
    openSeed();
  } else {
    closeModal();
    patternBtn.innerHTML = "drum machine";
  }
});

function openSeed() {
  modal.style.display = "unset";
  modal.style.opacity = 0.9;
  main.style.opacity = 0.4;
  pianoSVG.style.opacity = 0.4;
  patternBtn.innerHTML = "save";
  createSeedPattern();
}

function openDropdown(btn) {
  button = btn;
  modal.style.display = "unset";
  modal.style.opacity = 0.9;
  octaveSlider.style.visibility = "visible";
  octaveNumber = octaveSlider.value;
  main.style.opacity = 0.4;
  let items = ["chord", "note"];
  createList(items);
}

function createList(items) {
  clearModal();
  items.forEach((item, i) => {
    let el = document.createElement("li");
    el.innerHTML = item;
    el.id = `item_${i}`;
    el.addEventListener("click", e => {
      selectItem(e);
    });
    modal.appendChild(el);
  });
}

function clearModal() {
  modal.innerHTML = "";
}

function createSeedPattern() {
  clearModal();
  pattern = getSeedPattern();
  let container = document.createElement("div");
  container.className = "pattern";
  pattern.forEach((col, index) => {
    var col = document.createElement("div");
    col.className = "col";
    for (let i = 0; i < 9; i++) {
      let pad = document.createElement("div");
      pad.className = "pad";
      pad.id = `${index}_${i}`;
      if (pattern[index].includes(i)) {
        pad.style.background = "white";
        pad.className += " selected";
      }
      pad.addEventListener("click", e => {
        var colIndex = pad.id.charAt(0);
        var padIndex = pad.id.charAt(2);
        if (!pad.className.includes("selected")) {
          pad.style.background = "white";
          pad.className += " selected";
          pattern[colIndex].push(Number(padIndex));
        } else {
          pad.className = "pad";
          pad.style.background = "lightslategray";
          pattern[colIndex] = pattern[colIndex].filter(pad => pad != padIndex);
        }
        setSeedPattern(pattern);
      });

      col.appendChild(pad);
    }
    container.appendChild(col);
  });
  modal.appendChild(container);
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
      closeModal();
      break;
  }
}

function closeModal() {
  if (button) {
    changeButtonColor(button.element);
  }
  listType = null;
  modal.style.opacity = 0;
  main.style.opacity = 0.8;
  octaveSlider.style.visibility = "hidden";
  pianoSVG.style.opacity = 1;
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}
