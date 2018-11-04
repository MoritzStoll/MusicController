class ViewController {
  constructor() {
    this.loading = document.getElementById("loadingScreen");
    this.main = document.getElementById("mainScreen");
    this.button = document.getElementById("startStopButton");
    this.dropdown = document.getElementById("dropdown");
    this.state = 0;
    this.init();
  }

  init() {
    //for developmemt hide loading screen
    this.state = 1;

    this.button.addEventListener("click", () => this.startStop());
    this.main.style.display = "flex";
    this.loading.style.display = "none";
  }

  startStop() {
    if (this.state === 1) {
      this.dropdown.style.display = "none";
      this.button.innerHTML = "stop";
      this.state = 2;
    } else if (this.state === 2) {
      this.button.innerHTML = "start";
      this.state = 1;
    }
  }
}

new ViewController();
