WHITE_KEYS = 21;
BLACK_KEYS = 15;
MIN_OCTAVE = 3;
MAX_OCTAVE = 5;
let keys = [...document.getElementById('piano').children];
let white = keys.slice(0, 21);
let black = keys.slice(21, keys.length);

let context = Tone.context;
let piano;
let gainNode;
let gainSlider;
let compressor;
let compressorSlider;
let distortion;
let distortionSlider;

let notesWhite = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
let notesBlack = ['C#', 'D#', 'F#', 'G#', 'A#'];
let sameNotes = {
  CB: 'B',
  DB: 'C#',
  EB: 'D#',
  FB: 'E',
  GB: 'F#',
  AB: 'G#',
  BB: 'A#',
  'C#': 'DB',
  'D#': 'EB',
  'E#': 'F',
  'F#': 'GB',
  'G#': 'AB',
  'A#': 'BB',
  'B#': 'C',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G',
  A: 'A',
  B: 'B',
  H: 'B'
};
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
      C3: 'C3.[wav]',
      'D#3': 'Ds3.[wav]',
      'F#3': 'Fs3.[wav]',
      A3: 'A3.[wav]',
      C4: 'C4.[wav]',
      'D#4': 'Ds4.[wav]',
      'F#4': 'Fs4.[wav]',
      A4: 'A4.[wav]',
      C5: 'C5.[wav]',
      'D#5': 'Ds5.[wav]',
      'F#5': 'Fs5.[wav]',
      A5: 'A5.[wav]'
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
  if (note) {
    let key;
    if (note[1] == 'B') {
      var note2 = note.slice(0, 2);
      console.log(sameNotes[note2] + note[2]);
      key = document.getElementById(sameNotes[note2] + note[2]);
      console.log(key);
    } else {
      key = document.getElementById(note);
    }
    key.style.opacity = 0.5;

    piano.triggerAttack(note);
    setTimeout(() => {
      key.style.opacity = 1;
    }, 100);
  }
}

function playChord(chord, octaveNumber) {
  if (chord) {
    var c = teoria.chord(chord).simple();
    console.log(c);
    c.forEach(note => {
      console.log(note);
      playNote(note.toUpperCase() + octaveNumber);
    });
  }
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
