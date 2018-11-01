var request = new XMLHttpRequest();
request.open("GET", "/src/gamepad/gamepadMapping.json", true);
request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    keys = JSON.parse(request.responseText);
    initGamepad();
  } else {
    console.log("reached target server but return error");
  }
};

request.send();

function initGamepad() {
  keys.forEach((key, index) => {
    let element = document.getElementById(key.id);
    addListener(element, index);
    keys[index].element = element;
  });
}

function addListener(button, index) {
  button.addEventListener("click", () => {
    let key = keys[index];
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
