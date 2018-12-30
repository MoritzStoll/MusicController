function initPianoConfig() {

}


let modal = document.getElementById('modal');
let keySelector = document.getElementById('keySelector');
let main = document.getElementById('main');
let octaveSlider = document.getElementById('octaveNumber');
let keySeletion = document.getElementById('keySeletion');
let scaleSelection = document.getElementById('scaleSelection');
let pianoSVG = document.getElementById('piano');
let button = null;
let chordList = ['C', 'G', 'Am', 'F', 'Em', 'Cmaj7', 'D7', 'F#m', 'E'];
let noteList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'];
let listType = null;
let octaveNumber = null;
let scaleSelected = false;
let gamepadMenuCloseBtn = document.getElementById('gamepadMenuCloseBtn');
let chordBuilder = {
  scale: {
    id: 'scale',
    value: ['major', 'minor']
  },
  notes: {
    id: 'notes',
    value: [
      'Cb',
      'C',
      'C#',
      'Db',
      'D',
      'Eb',
      'E',
      'F',
      'F#',
      'Gb',
      'G',
      'Ab',
      'A',
      'Bb',
      'B'
    ]
  },
  currentChord: new Array(2)
};

octaveSlider.addEventListener('input', e => {
  octaveNumber = e.target.value;
});

keySelector.addEventListener('input', () => {
  createList(chordBuilder, listType);
});

scaleSelector.addEventListener('input', () => {
  createList(chordBuilder, listType);
});

gamepadMenuCloseBtn.addEventListener('click', () => {
  closeModal();
});

function openDropdown(btn) {
  gamepadMenuCloseBtn.style.visibility = 'visible';
  button = btn;
  modal.style.display = 'unset';
  modal.style.opacity = 0.9;
  octaveSlider.style.visibility = 'visible';
  octaveNumber = octaveSlider.value;
  main.style.opacity = 0.4;
  let items = ['chord', 'note'];
  createList(items);
}

function createList(items, type) {
  var keyBasedScale = teoria
    .note(keySelector.childNodes[1].value)
    .scale(scaleSelector.childNodes[1].value);
  clearModal();

  if (type == 'chord') {
    scaleSelector.style.opacity = 1;
    keySelector.style.opacity = 1;
    scaleSelection.removeAttribute('disabled');
    keySeletion.removeAttribute('disabled');
    modal.style.display = 'flex';

    let divScale = document.createElement('div');
    let divNotes = document.createElement('div');

    divScale.id = 'divScale';
    divNotes.id = 'divNotes';

    divScale.classList.add('listwrapper');
    divNotes.classList.add('listwrapper');

    divNotes.style.opacity = 0;

    modal.appendChild(divScale);
    modal.appendChild(divNotes);
    //Scale
    let titleScale = document.createElement('h3');
    titleScale.innerHTML = items.scale.id;
    titleScale.classList.add('listTitle');
    titleScale.id = `titleScale_${items.scale.id}`;
    divScale.appendChild(titleScale);

    let listScale = document.createElement('ul');
    listScale.id = `listScale_${items.scale.id}`;
    listScale.classList.add('list');

    divScale.appendChild(listScale);

    items.scale.value.forEach((item, i) => {
      let elScale = document.createElement('li');
      elScale.innerHTML = item;
      elScale.id = `item_${i}`;
      elScale.addEventListener('click', e => {
        e.srcElement.style.background = 'rosybrown';
        document.getElementById(`item_${i === 0 ? 1 : 0}`).style.background =
          'pink';
        scaleSelected = i;
        divNotes.style.opacity = 1;
        selectItem(e);
      });

      listScale.appendChild(elScale);
    });

    //Note
    let titleNotes = document.createElement('h3');
    titleNotes.innerHTML = items.notes.id;
    titleNotes.id = `titleNotes_${items.notes.id}`;
    titleNotes.classList.add('listTitle');
    divNotes.appendChild(titleNotes);

    let listNotes = document.createElement('ul');
    listNotes.id = `listNotes_${items.notes.id}`;
    listNotes.classList.add('list');
    divNotes.appendChild(listNotes);

    items.notes.value.forEach((item, i) => {
      let elNotes = document.createElement('li');
      elNotes.innerHTML = item;
      elNotes.id = `item_${i}`;
      if (item != 'chord' && item != 'note') {
        if (
          keyBasedScale.simple().includes(item.toLowerCase()) ||
          keyBasedScale
            .simple()
            .includes(sameNotes[item.toUpperCase()].toLowerCase())
        ) {
          console.log('inscale');
          elNotes.style.background = '#c6d379';
        }
      }

      elNotes.addEventListener('click', e => {
        selectItem(e);
      });

      elNotes.addEventListener('mouseenter', e => {
        elNotes.style.background = 'rosybrown';
      });
      elNotes.addEventListener('mouseout', e => {
        if (
          keyBasedScale.simple().includes(item.toLowerCase()) ||
          keyBasedScale
            .simple()
            .includes(sameNotes[item.toUpperCase()].toLowerCase())
        ) {
          console.log('inscale');
          elNotes.style.background = '#c6d379';
        } else {
          elNotes.style.background = 'pink';
        }
      });
      listNotes.appendChild(elNotes);
    });
  } else {
    if (type === 'note') {
      scaleSelector.style.opacity = 1;
      keySelector.style.opacity = 1;
      scaleSelection.removeAttribute('disabled');
      keySeletion.removeAttribute('disabled');
    }
    items.forEach((item, i) => {
      let el = document.createElement('li');
      el.innerHTML = item;
      el.id = `item_${i}`;

      if (item != 'chord' && item != 'note') {
        if (
          keyBasedScale.simple().includes(item.toLowerCase()) ||
          keyBasedScale
            .simple()
            .includes(sameNotes[item.toUpperCase()].toLowerCase())
        ) {
          console.log('inscale');
          el.style.background = '#c6d379';
        }
      }

      el.addEventListener('click', e => {
        selectItem(e);
      });
      modal.appendChild(el);
    });
  }
}

function clearModal() {
  modal.innerHTML = '';
}

function selectItem(e) {
  let item = e.srcElement.innerHTML;
  console.log('Clicked Item:', item);
  switch (item) {
    case 'chord':
      listType = 'chord';
      createList(chordBuilder, 'chord');
      break;
    case 'note':
      listType = 'note';
      createList(chordBuilder.notes.value, 'note');
      break;
    default:
      let chordPart = e.srcElement.parentNode.id.split('_')[1];
      switch (chordPart) {
        case 'scale':
          chordBuilder.currentChord[0] = item;
          break;
        case 'notes':
          chordBuilder.currentChord[1] = item;
          break;
        default:
          setSound(listType, item, octaveNumber, button);
          closeModal();
          break;
      }
      if (chordBuilder.currentChord[0] && chordBuilder.currentChord[1]) {
        console.log('Chord builded', chordBuilder.currentChord);
        setSound(listType, chordBuilder.currentChord, octaveNumber, button);
        chordBuilder.currentChord = new Array(2);
        closeModal();
      } else {
        console.log('Chord not builded', chordBuilder.currentChord);
      }

      break;
  }
}

function closeModal() {
  if (button) {
    changeButtonColor(button.element);
  }
  scaleSelected = false;
  scaleSelector.style.opacity = 0;
  keySelector.style.opacity = 0;
  gamepadMenuCloseBtn.style.visibility = 'hidden';
  scaleSelection.setAttribute('disabled', '');
  keySeletion.setAttribute('disabled', '');
  listType = null;
  modal.style.opacity = 0;
  main.style.opacity = 0.8;
  octaveSlider.style.visibility = 'hidden';
  pianoSVG.style.opacity = 1;
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}
