class Gamepad {
  constructor(mapping) {
    this.mapping = mapping;
    console.log(mapping.length)
    this.update = null;
    window.addEventListener("gamepadconnected", () => this.startGamepad());
    window.addEventListener("gamepaddisconnected", () => this.stopGamepad());
    this.initGamepad();
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
    if (gp.buttons.some(button => button.pressed)) {
      gp.buttons.forEach((button, i) => {
        if (button.pressed) {
          console.log(i)
          let key = this.mapping.find(button => button.gamepadKeyIndex == i);
          if (key) {
            this.clickedButton(key);
          }
        }
      });
    }
    this.update = requestAnimationFrame(() => this.loop());
  }

  //Hier note wieder stoppem
  releasedButton(key) {
    if (key.note) {
      console.log("play note: ", key.note);
      stopNote(key);
    } else if (key.chord) {
      console.log("play chord: ", key.chord);
    } else if (key.synthesizer) {
      console.log("call synthesizer function: ", key.synthesizer);
    }
  }

  clickedButton(key) {
    key.element.setAttribute("style", `fill: ${key.playColor};`);
    setTimeout(() => {
      key.element.setAttribute("style", `fill: ${key.defaultColor};`);
    }, 100);

    if (key.note) {
      console.log("play note: ", key.note);
      playNote(key);
    } else if (key.chord) {
      console.log("play chord: ", key.chord);
    } else if (key.synthesizer) {
      console.log("call synthesizer function: ", key.synthesizer);
    }
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
