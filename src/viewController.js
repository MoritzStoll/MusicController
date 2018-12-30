let loading = document.getElementById('loading');
let mainScreen = document.getElementById('mainScreen');

let pianoMenu = document.getElementById('pianoMenu');
let pianoMenuOpenBtn = document.getElementById('pianoMenuOpenBtn');
let pianoMenuCloseBtn = document.getElementById('pianoMenuCloseBtn');
let pianoMenuState = false;

let info = document.createElement('div');
info.id = 'infoBox';
document.getElementById('mainScreen').appendChild(info);

let drumMenu = document.getElementById('drumMenu');
let drumMenuOpenBtn = document.getElementById('drumMenuOpenBtn');
let drumMenuCloseBtn = document.getElementById('drumMenuCloseBtn');
let drumMenuState = false;

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

drumMenuOpenBtn.addEventListener('click', () => {
  drumMenuState = true;
  drumMenu.style.width = '200px';
  mainScreen.style.marginLeft = '200px';
  drumMenuOpenBtn.style.visibility = 'hidden';
});

drumMenuCloseBtn.addEventListener('click', () => {
  drumMenuOpenBtn.style.visibility = 'visible';
  drumMenuState = false;
  drumMenu.style.width = '0px';
  mainScreen.style.marginLeft = '0px';
});

function stopLoading() {
  loading.style.opacity = 0;
  setTimeout(() => {
    loading.style.visibility = 'hidden';
  }, 500);
}

document.getElementsByTagName('html')[0].addEventListener('mousemove', e => {
  info.style.top = `${e.layerY}px`;
  info.style.left = `${e.layerX + 20}px`;
});





