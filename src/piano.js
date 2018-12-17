WHITE_KEYS = 21;
BLACK_KEYS = 15;
MIN_OCTAVE = 3;
MAX_OCTAVE = 5;
let keys = [...document.getElementById('piano').children];
let white = keys.slice(0, 21);
let black = keys.slice(21, keys.length);

var context = Tone.context;
var piano;
var gainNode;
var gainSlider;
var compressor;
var compressorSlider;
var distortion;
var distortionSlider;

var filter;
var filterSlider;

let pianoCompSwitch, pianoEqSwitch;

var compActive = true, eqActive = true;
pianoCompSwitch = document.getElementById('pianoCompSwitch').children[0]
pianoEqSwitch = document.getElementById('pianoEqSwitch').children[0]

pianoCompSwitch.addEventListener("change", () => {
  compActive = !compActive;
  pianoSwitches(pianoCompSwitch, compActive)
});

pianoEqSwitch.addEventListener("change", () => {
  eqActive = !eqActive;
  pianoSwitches(pianoEqSwitch, eqActive)
});


pianoCompSwitch.checked = true;
pianoEqSwitch.checked = true;
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
  gainSlider = document.getElementById('pianoGain');
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
  compressorSlider = document.getElementById('pianoCompressorSlider').children;

  for (let i = 0; i < compressorSlider.length; i++) {
    compressorSlider[i].addEventListener('input', e => {
      compressor[e.srcElement.id].value = e.srcElement.value;
    });
  }

  //create piano distortion
  distortion = context.createWaveShaper();
  distortion.curve = makeDistortionCurve(0);
  distortion.oversample = '4x';
  distortionSlider = document.getElementById('pianoDistortion');
  distortionSlider.addEventListener('input', e => {
    distortion.curve = makeDistortionCurve(parseInt(e.srcElement.value));
  });

  //Create Equalizer
  filter = context.createBiquadFilter();
  filter.type ="lowpass";
  filter.frequency.value = 500;
  filter.detune.value = 30;
  filter.Q.value = 1;
  filter.gain.value = 25;

  filterSlider = document.getElementById('pianoEqualizerSlider').children;
  for (let i = 0; i < filterSlider.length; i++) {
    filterSlider[i].addEventListener('input', e => {
      filter[e.srcElement.id].value = e.srcElement.value;
    });
  }



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
  gainNode.connect(distortion);
  distortion.connect(compressor);
  compressor.connect(filter);
  filter.toMaster();
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
      console.log("Key",key);
    } else {
      key = document.getElementById(note);
      console.log(key)
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


function pianoSwitches(checkedSwitch) {
  
  if (compActive && eqActive) {
    gainNode.connect(distortion);
    distortion.connect(compressor);
    compressor.connect(filter);
    filter.toMaster();

  } else if (!compActive && !eqActive) {
    compressor.disconnect()
    filter.disconnect()
    gainNode.connect(distortion);
    distortion.toMaster();

  } else if (!compActive && eqActive) {
    compressor.disconnect()
    gainNode.connect(distortion);
    distortion.connect(filter);
    filter.toMaster();

  } else if (compActive && !eqActive) {
    filter.disconnect()
    gainNode.connect(distortion);
    distortion.connect(compressor);
    compressor.toMaster();
  
  }
  console.log(checkedSwitch.parentNode.id)
}


