WHITE_KEYS = 21;
BLACK_KEYS = 15;
MIN_OCTAVE = 3;
MAX_OCTAVE = 5;
let keys = [...document.getElementById('piano').children];
let white = keys.slice(0, 21);
let black = keys.slice(21, keys.length);
let notesWhite = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
let notesBlack = ['C#', 'D#', 'F#', 'G#', 'A#'];

let context = Tone.context;
let piano;
let gainNode;
let gainSlider;
let compressor;
let compressorSlider;
let distortion;
let distortionSlider;

window.onload = function() {
  init();
};

white.reverse();
black.reverse();

function init() {
  //piano-key listeners
  for (let i = MIN_OCTAVE; i <= MAX_OCTAVE; i++) {
    white.forEach((key, index) => {
      key.id = notesWhite[index % 7] + i;
    });
    black.forEach((key, index) => {
      key.id = notesBlack[index % 5] + i;
    });
    white.splice(0, 7);
    black.splice(0, 5);
  }
  keys.forEach(key => {
    key.addEventListener('click', () => playNote(key.id));
  });

  //create piano gain with default value = 1
  gainNode = context.createGain();
  gainNode.gain.value = 1;
  gainSlider = document.getElementById('gainValue');
  gainSlider.addEventListener('input', e => {
    gainNode.gain.value = e.srcElement.value;
  });

  //create piano compressor with default values
  compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.ratio.value = 12;
  compressor.knee.value = 30;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;
  compressorSlider = document.getElementById('compressorSlider').children;
  for (let i = 0; i < compressorSlider.length; i++) {
    compressorSlider[i].addEventListener('input', e => {
      compressor[e.srcElement.id].value = e.srcElement.value;
    });
  }

  //create piano distortion
  distortion = context.createWaveShaper();
  distortion.curve = makeDistortionCurve(0);
  distortion.oversample = '4x';
  distortionSlider = document.getElementById('distortion');
  distortionSlider.addEventListener('input', e => {
    distortion.curve = makeDistortionCurve(parseInt(e.srcElement.value));
  });

  //create piano sounds
  piano = new Tone.Sampler(
    {
      C3: 'C3.[mp3|ogg]',
      'D#3': 'Ds3.[mp3|ogg]',
      'F#3': 'Fs3.[mp3|ogg]',
      A3: 'A3.[mp3|ogg]',
      C4: 'C4.[mp3|ogg]',
      'D#4': 'Ds4.[mp3|ogg]',
      'F#4': 'Fs4.[mp3|ogg]',
      A4: 'A4.[mp3|ogg]',
      C5: 'C5.[mp3|ogg]',
      'D#5': 'Ds5.[mp3|ogg]',
      'F#5': 'Fs5.[mp3|ogg]',
      A5: 'A5.[mp3|ogg]'
    },
    {
      release: 1,
      baseUrl: './src/salamander/'
    }
  ).connect(gainNode);
  gainNode.connect(compressor);
  compressor.connect(distortion);
  distortion.toMaster();
}

function changeGain(value) {
  gainNode.gain.value = value;
}

function playNote(note) {
  let key = document.getElementById(note);
  key.style.opacity = 0.5;
  piano.triggerAttack(note);
  setTimeout(() => {
    key.style.opacity = 1;
  }, 100);
}

function stopPianoNote(note) {
  //piano.triggerRelease(note + "5");
}

function playChord(chord, octaveNumber) {
  var c = teoria.chord(chord).simple();
  c.forEach(note => {
    playNote(note.toUpperCase() + octaveNumber);
  });
}

function stopPianoChord(chord) {
  chord.forEach(note => {
    //piano.triggerRelease(note);
  });
}

function makeDistortionCurve(amount) {
  var n_samples = 44100,
    curve = new Float32Array(n_samples);

  for (var i = 0; i < n_samples; ++i) {
    var x = (i * 2) / n_samples - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}
