var loading,
  mainScreen,
  pianoMenu,
  pianoMenuOpenBtn,
  pianoMenuCloseBtn,
  pianoMenuState,
  info,
  drumMenu,
  drumMenuOpenBtn,
  drumMenuCloseBtn,
  drumMenuState;

window.onload = function() {
  initView();
  initDrums();
  initGamepad();
  initPiano();
};

function initView() {
  //init view gloabl variables
  loading = document.getElementById('loading');
  mainScreen = document.getElementById('mainScreen');
  pianoMenu = document.getElementById('pianoMenu');
  pianoMenuOpenBtn = document.getElementById('pianoMenuOpenBtn');
  pianoMenuCloseBtn = document.getElementById('pianoMenuCloseBtn');
  pianoMenuState = false;
  info = document.createElement('div');
  info.id = 'infoBox';
  document.getElementById('mainScreen').appendChild(info);
  drumMenu = document.getElementById('drumMenu');
  drumMenuOpenBtn = document.getElementById('drumMenuOpenBtn');
  drumMenuCloseBtn = document.getElementById('drumMenuCloseBtn');
  drumMenuState = false;

  //listener for mouse move
  document.getElementsByTagName('html')[0].addEventListener('mousemove', e => {
    info.style.top = `${e.layerY}px`;
    info.style.left = `${e.layerX + 20}px`;
  });

  //listener for view control
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
}

/*
  hide loading overlay
*/
function stopLoading() {
  loading.style.opacity = 0;
  loading.style.visibility = 'hidden';
}
