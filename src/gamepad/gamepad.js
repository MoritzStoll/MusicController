class Gamepad {
  constructor(mapping) {
    this.mapping = mapping;
    console.log(mapping.length);
    this.update = null;
    window.addEventListener("gamepadconnected", () => this.startGamepad());
    window.addEventListener("gamepaddisconnected", () => this.stopGamepad());
    this.initGamepad();
    this.pressedButtons = [];
  }

  startGamepad() {
    console.log("gamepad connected");
    this.update = requestAnimationFrame(() => this.loop());
  }

  stopGamepad() {
    console.log("gamepad disconnected");
    cancelAnimationFrame(this.update);
  }

  loop() {
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
    for (let i = 0; i < this.pressedButtons.length; i++) {
      buttonCache[i] = this.pressedButtons[i];
    }
    this.pressedButtons = [];

    for (let i = 0; i < gp.buttons.length; i++) {
      if (gp.buttons[i].pressed) {
        let buttonPressed = {
          button: gp.buttons[i],
          index: i
        };
        this.pressedButtons.push(buttonPressed);
        if (this.newPress(buttonPressed, buttonCache)) {
          let key = this.mapping.find(button => button.gamepadKeyIndex == i);
          playNote(key);
        }
        console.log(this.newPress(buttonPressed, buttonCache));
      }
    }
    this.update = requestAnimationFrame(() => this.loop());
  }

  newPress(button, buttonCache) {
    var newPress = false;

    // loop through pressed buttons
    for (let i = 0; i < this.pressedButtons.length; i++) {
      // if we found the button we're looking for...
      if (this.pressedButtons[i].index == button.index) {
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

  initGamepad() {
    this.mapping.forEach((key, index) => {
      let element = document.getElementById(key.id);
      this.addListener(element, index);
      this.mapping[index].element = element;
    });
  }

  addListener(button, index) {
    button.addEventListener("click", () => {
      let key = this.mapping[index];
      switch (key.status) {
        case 0:
          this.changeButtonColor(key.element, key.setupColor);
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

  changeButtonColor(el, color) {
    el.setAttribute("style", `fill: ${color};`);
  }
}

var request = new XMLHttpRequest();
request.open("GET", "/src/gamepad/gamepadMapping.json", true);
request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    new Gamepad(JSON.parse(request.responseText));
  } else {
    console.log("reached target server but return error");
  }
};
request.send();
