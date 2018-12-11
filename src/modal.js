let modal = document.getElementById("modal");
let keySelector = document.getElementById("keySelector");
let scaleSelector = document.getElementById("scaleSelector");
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
  

let chordBuilder = {
  scale: {
    id: "scale",
    value: [
      "major",
      "minor"
    ]
  },
  notes: {
    id: "notes",
    value: ["Cb", "C","C#","Db", "D", "Eb", "E","F","F#","Gb", "G","Ab", "A", "Bb", "B"]
  },
  currentChord: new Array(2)
} 



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

function createList(items, type) {
  var keyBasedScale = teoria.note(keySelector.childNodes[1].value).scale(scaleSelector.childNodes[1].value)
  console.log(keyBasedScale.simple())
  clearModal();
  if (type == "chord") {
    modal.style.display = "flex";

    let divScale = document.createElement('div')
    let divNotes = document.createElement('div')

    divScale.id = 'divScale'
    divNotes.id = 'divNotes'

    divScale.classList.add('listwrapper')
    divNotes.classList.add('listwrapper')
    
    modal.appendChild(divScale)
    modal.appendChild(divNotes)
    //Scale
    let titleScale = document.createElement('h3');
    titleScale.innerHTML = items.scale.id
    titleScale.classList.add("listTitle")
    titleScale.id = `titleScale_${items.scale.id}`
    divScale.appendChild(titleScale)

    let listScale = document.createElement('ul');
    listScale.id = `listScale_${items.scale.id}`
    listScale.classList.add('list')

    divScale.appendChild(listScale)

    items.scale.value.forEach((item, i)=> {
      let elScale = document.createElement("li");
      elScale.innerHTML = item;
      elScale.id = `item_${i}`;
      elScale.addEventListener("click", e => {
        selectItem(e);
      });
      listScale.appendChild(elScale);
    })

    //Note
    let titleNotes = document.createElement('h3');
    titleNotes.innerHTML = items.notes.id
    titleNotes.id = `titleNotes_${items.notes.id}`
    titleNotes.classList.add("listTitle")
    divNotes.appendChild(titleNotes)

    let listNotes = document.createElement('ul');
    listNotes.id = `listNotes_${items.notes.id}`
    listNotes.classList.add('list')
    divNotes.appendChild(listNotes)
 

    items.notes.value.forEach((item, i)=> {
      let elNotes = document.createElement("li");
      elNotes.innerHTML = item;
      elNotes.id = `item_${i}`;
      if (item != "chord" && item != "note") {
        if ((keyBasedScale.simple().includes(item.toLowerCase()) || keyBasedScale.simple().includes(sameNotes[item.toUpperCase()].toLowerCase()))) {
          console.log("inscale")
          elNotes.style.background = 'green'
        }
      }       
     
      elNotes.addEventListener("click", e => {
        selectItem(e);
      });
      listNotes.appendChild(elNotes);
    })
    
  } else {
    items.forEach((item, i) => {
      let el = document.createElement("li");
      el.innerHTML = item;
      el.id = `item_${i}`;

      if (item != "chord" && item != "note") {
        if ((keyBasedScale.simple().includes(item.toLowerCase()) || keyBasedScale.simple().includes(sameNotes[item.toUpperCase()].toLowerCase()))) {
          console.log("inscale")
          el.style.background = 'green'
        }
      }       

      el.addEventListener("click", e => {
        selectItem(e);
      });
      modal.appendChild(el);
    });
  
  }
    
  
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
  console.log("Clicked Item:",item)
  switch (item) {
    case "chord":
      listType = "chord";
      createList(chordBuilder, "chord");
      break;
    case "note":
      listType = "note";
      createList(noteList,"note");
      break;
    default:
      let chordPart = e.srcElement.parentNode.id.split("_")[1]
      switch(chordPart) {
        case "scale":
          chordBuilder.currentChord[0] = item
          break
        case "notes":
          chordBuilder.currentChord[1] = item
          break
        default:
        setSound(listType, item, octaveNumber, button);
        closeModal();
        break;    
      }
      if (chordBuilder.currentChord[0] && chordBuilder.currentChord[1]) {
        console.log("Chord builded", chordBuilder.currentChord)
        setSound(listType, chordBuilder.currentChord, octaveNumber, button) 
        chordBuilder.currentChord = new Array(2)
        closeModal();
      } else {
        console.log("Chord not builded", chordBuilder.currentChord)
      }
    
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
