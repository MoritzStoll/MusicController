createEventListener()
/*
These are the states needed for the pianoConfiguration
*/
let configStates = {
  button: null,
  listType: null,
  octaveNumber: null,
  scaleSelected: false,
  currentChord: new Array(2)
};

/*
Returns an Object containing all the needed DOM-Elements in this document
*/
function getPianoConfigDOMObjects() {
  let pianoConfigDOMObjects = {
    modal: document.getElementById('modal'),
    keySelector: document.getElementById('keySelector'),
    scaleSelector: document.getElementById('scaleSelector'),
    keySelection: document.getElementById('keySelection'),
    scaleSelection: document.getElementById('scaleSelection'),
    main: document.getElementById('main'),
    octaveSlider: document.getElementById('octaveNumber'),
    pianoSVG:  document.getElementById('piano'),
    gamepadMenuCloseBtn: document.getElementById('gamepadMenuCloseBtn')
  };
  return pianoConfigDOMObjects;
}

/*
Returns an Object containing all needed Information to create the lists for scale, 
key, chord and note selection.
*/
function getChordBuilder() {
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
    }
  };
  return chordBuilder;  
}

/*
Adds Eventlistener to the different DOM-Objects. 
*/
function createEventListener() {
  let domObjects = getPianoConfigDOMObjects();
  let chordBuilder = getChordBuilder();

  domObjects.octaveSlider.addEventListener('input', e => {
    configStates.octaveNumber = e.target.value;
  });
  
  domObjects.keySelector.addEventListener('input', () => {
    createList(chordBuilder, configStates.listType);
  });
  
  domObjects.scaleSelector.addEventListener('input', () => {
    createList(chordBuilder, configStates.listType);
  });
  
  domObjects.gamepadMenuCloseBtn.addEventListener('click', () => {
    closeModal();
  });
  
}
/*
Opens the dropdown selection for the tones on the controller buttons
*/
function openDropdown(btn) {
  let domObjects = getPianoConfigDOMObjects()
  domObjects.gamepadMenuCloseBtn.style.visibility = 'visible';
  configStates.button = btn;
  domObjects.modal.style.display = 'unset';
  domObjects.modal.style.opacity = 0.9;
  domObjects.octaveSlider.style.visibility = 'visible';
  configStates.octaveNumber = domObjects.octaveSlider.value;
  domObjects.main.style.opacity = 0.4;
  let items = ['chord', 'note'];
  createList(items);
}

/*
Creates the different lists. If the listtype is chord the list has to be build up different.
*/
function createList(items, type) {
  console.log(type)
  let domObjects = getPianoConfigDOMObjects()
  //create the Scale based on the scale and key selection
  var keyBasedScale = teoria
    .note(domObjects.keySelector.childNodes[1].value)
    .scale(domObjects.scaleSelector.childNodes[1].value);
  clearModal();


  if (type == 'chord') {
    //If the type of the current list is chord the scaleSelector and keySelector are enabled
    domObjects.scaleSelector.style.opacity = 1;
    domObjects.keySelector.style.opacity = 1;
    domObjects.scaleSelection.removeAttribute('disabled');
    domObjects.keySelection.removeAttribute('disabled');
    domObjects.modal.style.display = 'flex';
    
    //Divs for the scale and the note selection are created and appended to the modal
    let divScale = document.createElement('div');
    let divNotes = document.createElement('div');

    divScale.id = 'divScale';
    divNotes.id = 'divNotes';

    divScale.classList.add('listwrapper');
    divNotes.classList.add('listwrapper');

    divNotes.style.opacity = 0;

    domObjects.modal.appendChild(divScale);
    domObjects.modal.appendChild(divNotes);
    
    //Scale selection is created
    let titleScale = document.createElement('h3');
    titleScale.innerHTML = items.scale.id;
    titleScale.classList.add('listTitle');
    titleScale.id = `titleScale_${items.scale.id}`;
    divScale.appendChild(titleScale);

    let listScale = document.createElement('ul');
    listScale.id = `listScale_${items.scale.id}`;
    listScale.classList.add('list');

    divScale.appendChild(listScale);

    //append an item for each value in the scales value array
    items.scale.value.forEach((item, i) => {
      let elScale = document.createElement('li');
      elScale.innerHTML = item;
      elScale.id = `item_${i}`;
      //eventlistener for selecting scale --> the current scale is added to configStates and Note selection gets visible
      elScale.addEventListener('click', e => {
        e.srcElement.style.background = 'rosybrown';
        document.getElementById(`item_${i === 0 ? 1 : 0}`).style.background =
          'pink';
        configStates.scaleSelected = i;
        divNotes.style.opacity = 1;
        selectItem(e);
      });

      listScale.appendChild(elScale);
    });

    //Note selection is created 
    let titleNotes = document.createElement('h3');
    titleNotes.innerHTML = items.notes.id;
    titleNotes.id = `titleNotes_${items.notes.id}`;
    titleNotes.classList.add('listTitle');
    divNotes.appendChild(titleNotes);

    let listNotes = document.createElement('ul');
    listNotes.id = `listNotes_${items.notes.id}`;
    listNotes.classList.add('list');
    divNotes.appendChild(listNotes);

    //create and append list item for each note
    items.notes.value.forEach((item, i) => {
      let elNotes = document.createElement('li');
      elNotes.innerHTML = item;
      elNotes.id = `item_${i}`;

      //as long as item is not the chord or note selection button check if the note or chord is in the keyBasedScale
      //if yes --> highlight it 
      if (item != 'chord' && item != 'note') {
        if (
          keyBasedScale.simple().includes(item.toLowerCase()) ||
          keyBasedScale
            .simple()
            .includes(sameNotes[item.toUpperCase()].toLowerCase())
        ) {
          elNotes.style.background = '#c6d379';
        }
      }
      //adding eventlistener for selected item
      elNotes.addEventListener('click', e => {
        selectItem(e);
      });

      //hovering over listitems
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
          elNotes.style.background = '#c6d379';
        } else {
          elNotes.style.background = 'pink';
        }
      });
      listNotes.appendChild(elNotes);
    });

    //works for note selection but also for the first selection where user has to decide between chord and note
  } else {
    //If the type of the current list is note the scaleSelector and keySelector are enabled
    if (type === 'note') {
      domObjects.scaleSelector.style.opacity = 1;
      domObjects.keySelector.style.opacity = 1;
      domObjects.scaleSelection.removeAttribute('disabled');
      domObjects.keySelection.removeAttribute('disabled');
    }
    //create list item for each item in given items 
    items.forEach((item, i) => {
      let el = document.createElement('li');
      el.innerHTML = item;
      el.id = `item_${i}`;
      
      //as long as item is not the chord or note selection button check if the note or chord is in the keyBasedScale
      //if yes --> highlight it 
      if (item != 'chord' && item != 'note') {
        if (
          keyBasedScale.simple().includes(item.toLowerCase()) ||
          keyBasedScale
            .simple()
            .includes(sameNotes[item.toUpperCase()].toLowerCase())
        ) {
          el.style.background = '#c6d379';
        }
      }

      el.addEventListener('click', e => {
        selectItem(e);
      });
      domObjects.modal.appendChild(el);
    });
  }
}

/*
Clears the modal and resets it
*/
function clearModal() {
  let domObjects = getPianoConfigDOMObjects();
  domObjects.modal.innerHTML = '';
}

/*
Function for selecting an item in al list. The actions differ by the current listType stored in the configStates Object
*/
function selectItem(e) {
  let chordBuilder = getChordBuilder();
  let item = e.srcElement.innerHTML;
  switch (item) {
    case 'chord':
      configStates.listType = 'chord';
      createList(chordBuilder, 'chord');
      break;
    case 'note':
      configStates.listType = 'note';
      createList(chordBuilder.notes.value, 'note');
      break;
    //if user selects a chord the 2 chord parts are stored in config state
    default:
      let chordPart = e.srcElement.parentNode.id.split('_')[1];
      switch (chordPart) {
        case 'scale':
          configStates.currentChord[0] = item;
          break;
        case 'notes':
          configStates.currentChord[1] = item;
          break;
        default:
          //only excecuted if the selection wasn't for chord selection. Note sound is set an modal closed 
          setSound(configStates.listType, item, configStates.octaveNumber, configStates.button);
          closeModal();
          break;
      }
      //if both chord parts are chosen the chord sound is set in gamepad.js and modal is closed
      if (configStates.currentChord[0] && configStates.currentChord[1]) {
        setSound(configStates.listType, configStates.currentChord, configStates.octaveNumber, configStates.button);
        configStates.currentChord = new Array(2);
        closeModal();
      } else {
      }

      break;
  }
}

/*
Closes Modal
*/
function closeModal() {
  let domObjects = getPianoConfigDOMObjects()
  if (configStates.button) {
    changeButtonColor(configStates.button.element);
  }
  configStates.scaleSelected = false;
  domObjects.scaleSelector.style.opacity = 0;
  domObjects.keySelector.style.opacity = 0;
  domObjects.gamepadMenuCloseBtn.style.visibility = 'hidden';
  domObjects.scaleSelection.setAttribute('disabled', '');
  domObjects.keySelection.setAttribute('disabled', '');
  configStates.listType = null;
  domObjects.modal.style.opacity = 0;
  domObjects.main.style.opacity = 0.8;
  domObjects.octaveSlider.style.visibility = 'hidden';
  domObjects.pianoSVG.style.opacity = 1;
  setTimeout(() => {
    domObjects.modal.style.display = 'none';
  }, 300);
}
