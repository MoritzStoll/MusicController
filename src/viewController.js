let loadingScreen,
  setupScreen,
  playScreen,
  nextScreen,
  prevScreen,
  actScreen,
  loading;

function init() {
  loadingScreen = document.getElementById("loadingScreen");
  setupScreen = document.getElementById("setupScreen");
  playScreen = document.getElementById("playScreen");

  nextScreen = document.getElementById("nextScreen");
  prevScreen = document.getElementById("prevScreen");

  loadingScreen.style.display = "none";
  setupScreen.style.display = "flex";
  playScreen.style.display = "none";

  //set controller to playscreen (hacked)
  playScreen.innerHTML = setupScreen.innerHTML;

  actScreen = 1; // because loading = false

  nextScreen.addEventListener("click", () => {
    if (actScreen < 2) {
      actScreen++;
      loadingScreen.style.display = "none";
      setupScreen.style.display = "none";
      playScreen.style.display = "flex";
    }
    console.log("next");
  });

  prevScreen.addEventListener("click", () => {
    if (actScreen > 0) {
      actScreen--;
      loadingScreen.style.display = "none";
      setupScreen.style.display = "flex";
      playScreen.style.display = "none";
    }
    console.log("prev");
  });
}

init();
