let mapping, update, pressedbuttons;

update = null;
window.addEventListener("gamepadconnected", () => startGamepad());
window.addEventListener("gamepaddisconnected", () => stopGamepad());
pressedButtons = [];

initGamepad();

async function initGamepad() {
  mapping = await loadMapping();
  mapping.forEach((key, index) => {
    let element = document.getElementById(key.id);
    addListener(element, index);
    mapping[index].element = element;
  });
}

function loadMapping() {
  return new Promise(mapping => {
    let request = new XMLHttpRequest();
    let result;
    request.open("GET", "/src/gamepad/gamepadMappingPS4.json", true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        mapping(JSON.parse(request.responseText));
      } else {
        console.log("reached target server but return error");
      }
    };
    request.send();
  });
}

function startGamepad() {
  console.log("gamepad connected");
  update = requestAnimationFrame(() => loop());
}

function stopGamepad() {
  console.log("gamepad disconnected");
  cancelAnimationFrame(update);
}

function loop() {
  var gamepads = navigator.getGamepads
    ? navigator.getGamepads()
    : navigator.webkitGetGamepads
    ? navigator.webkitGetGamepads
    : [];
  if (!gamepads) {
    return;
  }
  var gp = gamepads[0];

  let buttonCache = [];
  for (let i = 0; i < pressedButtons.length; i++) {
    buttonCache[i] = pressedButtons[i];
  }
  pressedButtons = [];

  for (let i = 0; i < gp.buttons.length; i++) {
    let key = mapping.find(button => button.gamepadKeyIndex == i);
    if (gp.buttons[i].pressed) {
      let buttonPressed = {
        button: gp.buttons[i],
        index: i
      };
      pressedButtons.push(buttonPressed);

      if (newPress(buttonPressed, buttonCache)) {
        startAction(key);
      }
    }
  }

  for (let m = 0; m < buttonCache.length; m++) {
    var cindex = buttonCache[m].index;
    if (!pressedButtons.find(button => button.index == cindex)) {
      let key = mapping.find(button => button.gamepadKeyIndex == cindex);
      stopAction(key);
    }
  }
  update = requestAnimationFrame(() => loop());
}

function startAction(key) {
  key.element.setAttribute("style", `fill: ${key.playColor};`);
  if (key.id == "l2") {
    receiveChord("c#");
  } else if (key.note) {
    playNote(key);
  } else if (key.chord) {
    playChord(key);
  }
}

function stopAction(key) {
  key.element.setAttribute("style", `fill: ${key.defaultColor};`);
  if (key.note) {
    stopNote(key);
  } else if (key.chord) {
    stopChord(key);
  }
}

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

function addListener(button, index) {
  button.addEventListener("click", () => {
    let key = mapping[index];
    switch (key.status) {
      case 0:
        changeButtonColor(key.element, key.setupColor);
        openDropdown(key);
        break;
      case 1:
        console.log("run action for: ", key.id);
        break;
      case 2:
        console.log("play action for: ", key.id);
        break;
    }
  });
}

function changeButtonColor(el, color) {
  el.setAttribute("style", `fill: ${color};`);
}

function setSound(type, sound, btn) {
  let i = mapping.findIndex(button => (button.id = btn.id));
  if (type === "chord") {
    mapping[i].chord = sound;
    mapping[i].note = null;
  } else {
    mapping[i].sound = sound;
    mapping[i].note = null;
  }
}
