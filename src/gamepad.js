var mapping, update, pressedbuttons, storage, gamepad, beatPlays;

async function initGamepad() {
  //init gloabl gamepad variabled
  update = null;
  pressedButtons = [];
  storage = window.localStorage;
  gamepad = document.getElementById('gamepad');
  localMapping = JSON.parse(localStorage.getItem('gamepadMapping'));
  mapping = localMapping || (await loadMapping());
  mapping.forEach((key, index) => {
    let element = document.getElementById(key.id);
    addListener(element, index);
    mapping[index].element = element;
  });
  beatPlays = false;

  //listener for gamepad conntected
  window.addEventListener('gamepadconnected', () => startGamepad());
  window.addEventListener('gamepaddisconnected', () => stopGamepad());
}

function loadMapping() {
  return new Promise(mapping => {
    let request = new XMLHttpRequest();
    let result;
    request.open('GET', '/src/gamepadMappingPS4.json', true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        mapping(JSON.parse(request.responseText));
      } else {
        console.log('reached target server but return error');
      }
    };
    request.send();
  });
}

function startGamepad() {
  console.log('gamepad connected');
  update = requestAnimationFrame(() => loop());
}

function stopGamepad() {
  console.log('gamepad disconnected');
  cancelAnimationFrame(update);
}

/*
  gamepad loop to check pressed buttons
*/
function loop() {
  //check gamepads
  var gamepads = navigator.getGamepads
    ? navigator.getGamepads()
    : navigator.webkitGetGamepads
    ? navigator.webkitGetGamepads
    : [];

  if (!gamepads) {
    return;
  }
  //init gamepad
  var gp = gamepads[0];
  var buttonCache = [];

  //get all pressed buttons
  for (let i = 0; i < pressedButtons.length; i++) {
    buttonCache[i] = pressedButtons[i];
  }
  pressedButtons = [];

  //check if button is pressed
  for (let i = 0; i < gp.buttons.length; i++) {
    let x = mapping.find(button => button.gamepadKeyIndex == i);
    if (gp.buttons[i].pressed) {
      let buttonPressed = {
        button: gp.buttons[i],
        index: i
      };
      pressedButtons.push(buttonPressed);

      if (newPress(buttonPressed, buttonCache)) {
        startAction(x);
      }
    }
  }
  //check if button is still pressed or released
  for (let m = 0; m < buttonCache.length; m++) {
    var cindex = buttonCache[m].index;
    if (!pressedButtons.find(button => button.index == cindex)) {
      let key = mapping.find(button => button.gamepadKeyIndex == cindex);
      stopAction(key);
    }
  }

  //loop in every frame
  update = requestAnimationFrame(() => loop());
}

//button press action
function startAction(key) {
  key.element.setAttribute('style', `fill: ${key.playColor};`);
  gamepad.classList.add('shake');

  if (key.id == 'l2') {
    //receiveChord("c#");
    if (beatPlays) {
      stopDrums();
      beatPlays = false;
    } else {
      playDrums();
      beatPlays = true;
    }
  }
  if (key.note) {
    playNote(key.note.sound + key.note.octaveNumber);
  }
  if (key.chord) {
    playChord(key.chord.chord, key.chord.octaveNumber);
  }
}

/*
  button release action
*/
function stopAction(key) {
  key.element.setAttribute('style', `fill: ${key.defaultColor};`);
  gamepad.classList.remove('shake');
}

/*
  check if button press is new
*/
function newPress(button, buttonCache) {
  var newPress = false;
  // loop through pressed buttons
  for (let i = 0; i < pressedButtons.length; i++) {
    // if we found the button we're looking for...
    if (pressedButtons[i].index == button.index) {
      // set the boolean variable to true
      newPress = true;
      // loop through the cached states from the previous frame
      for (let j = 0; j < buttonCache.length; j++) {
        // if the button was already pressed, ignore new press
        if (buttonCache[j].index == button.index) {
          newPress = false;
        }
      }
    }
  }
  return newPress;
}

/*
  listener for gamepad buttons
*/
function addListener(button, index) {
  button.addEventListener('click', () => {
    let key = mapping[index];
    changeButtonColor(key.element, key.setupColor);
    openDropdown(key);
  });

  button.addEventListener('mouseover', e => {
    var key = mapping[index];
    var value = key.chord ? key.chord.chord : key.note.sound;
    info.style.background = 'white';
    info.innerHTML = value == undefined ? '?' : value;
  });

  button.addEventListener('mouseout', e => {
    info.innerHTML = '';
    info.style.background = 'transparent';
  });
}

/*
  change button color e.g by blick
*/
function changeButtonColor(el, color) {
  el.setAttribute('style', `fill: ${color};`);
}

/*
  set sound to gamepad button
 */
function setSound(type, sound, octaveNumber, btn) {
  let i = mapping.findIndex(button => button.id === btn.id);
  if (type === 'chord') {
    var scale = sound[0];
    var note = sound[1];

    var chord = teoria.note(note).chord(scale).name;

    mapping[i].chord = { chord, octaveNumber };
    mapping[i].note = null;
  } else {
    mapping[i].note = { sound, octaveNumber };
    mapping[i].chord = null;
  }

  //save mapping to local storage
  let gamepad = JSON.stringify(mapping);
  localStorage.setItem('gamepadMapping', gamepad);
}
