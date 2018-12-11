let loading = document.getElementById('loading');
let mainScreen = document.getElementById('mainScreen');
let pianoMenu = document.getElementById('pianoMenu');
let pianoMenuOpenBtn = document.getElementById('pianoMenuOpenBtn');
let pianoMenuCloseBtn = document.getElementById('pianoMenuCloseBtn');

let pianoMenuState = false;

pianoMenuOpenBtn.addEventListener('click', () => {
  pianoMenuState = true;
  pianoMenu.style.width = '200px';
  mainScreen.style.marginRight = '200px';
  pianoMenuOpenBtn.style.visibility = 'hidden';
});

pianoMenuCloseBtn.addEventListener('click', () => {
  pianoMenuOpenBtn.style.visibility = 'visible';
  pianoMenuState = false;
  pianoMenu.style.width = '0px';
  mainScreen.style.marginRight = '0px';
});

stopLoading();
function stopLoading() {
  loading.style.opacity = 0;
  setTimeout(() => {
    loading.style.visibility = 'hidden';
  }, 500);
}
