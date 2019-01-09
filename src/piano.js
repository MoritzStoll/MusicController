WHITE_KEYS = 21;
BLACK_KEYS = 15;
MIN_OCTAVE = 3;
MAX_OCTAVE = 5;

var pianoContext,
  piano,
  gainNode,
  gainSlider,
  compressor,
  compressorSlider,
  distortion,
  distortionSlider,
  filter,
  filterSlider,
  pianoCompSwitch,
  pianoEqSwitch,
  pianoCompSlider,
  pianoEqslider,
  compActive,
  eqActive,
  notesWhite,
  notesBlack,
  sameNotes;

/*
Initializes all the needed variables for piano to play and connects all
necessary audio nodes
*/
function initPiano() {
  //init gloabl variables
  pianoContext = Tone.context;
  compActive = false;
  eqActive = false;
  notesWhite = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  notesBlack = ['C#', 'D#', 'F#', 'G#', 'A#'];
  sameNotes = {
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

  //create array for piano keyboard with 3 octaves
  let keys = [...document.getElementById('piano').children];
  let white = keys.slice(0, 21);
  let black = keys.slice(21, keys.length);
  white.reverse();
  black.reverse();

  //piano button listeners
  createEventListener();

  //piano active switch for eq and compressor
  pianoCompSwitch = document.getElementById('pianoCompSwitch').children[0];
  pianoEqSwitch = document.getElementById('pianoEqSwitch').children[0];
  pianoCompSwitch.checked = false;
  pianoEqSwitch.checked = false;

  //piano comp & eq slider
  pianoCompSlider = document.getElementById('pianoCompressorSlider');
  pianoEqSlider = document.getElementById('pianoEqualizerSlider');

  //piano active switch listener
  pianoCompSwitch.addEventListener('change', () => {
    compActive = !compActive;
    pianoSwitches(compActive);
  });
  pianoEqSwitch.addEventListener('change', () => {
    eqActive = !eqActive;
    pianoSwitches(eqActive);
  });

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
  gainNode = pianoContext.createGain();
  gainNode.gain.value = 1;
  gainSlider = document.getElementById('pianoGain');
  gainSlider.addEventListener('input', e => {
    gainNode.gain.value = e.srcElement.value;
  });

  //create piano compressor with default values
  compressor = pianoContext.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.ratio.value = 12;
  compressor.knee.value = 30;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  //compressor slider listener
  compressorSlider = document.getElementById('pianoCompressorSlider').children;
  for (let i = 0; i < compressorSlider.length; i++) {
    compressorSlider[i].addEventListener('input', e => {
      //ignore active switch checkbox input
      e.srcElement.id !== 'pianoCompSwitchInput'
        ? (compressor[e.srcElement.id].value = e.srcElement.value)
        : null;
    });
  }

  //create piano distortion
  distortion = pianoContext.createWaveShaper();
  distortion.curve = makeDistortionCurve(0);
  distortion.oversample = '4x';
  distortionSlider = document.getElementById('pianoDistortion');
  distortionSlider.addEventListener('input', e => {
    distortion.curve = makeDistortionCurve(parseInt(e.srcElement.value));
  });

  //Create Equalizer
  filter = pianoContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  filter.detune.value = 30;
  filter.Q.value = 1;
  filter.gain.value = 25;

  //listener for piano filter slider input
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
  distortion.toMaster();
}

/*
plays a Note given by the gamepad.js
*/
function playNote(note) {
  if (note) {
    let key;
    //Notes with a B dont work with the Tone.Player Object here. 
    //We have to find the equivalent Note in the sameNotes Object
    if (note[1] == 'B') {
      var note2 = note.slice(0, 2);
      key = document.getElementById(sameNotes[note2] + note[2]);
    } else {
      key = document.getElementById(note);
    }
    //setting the opacity of the played note
    key.style.opacity = 0.5;

    //actually play the note
    piano.triggerAttack(note);
    setTimeout(() => {
      key.style.opacity = 1;
    }, 100);
  }
}

/*
playing a chord
*/
function playChord(chord, octaveNumber) {
  if (chord) {
    //split the chord into its three notes and calls playNote for each of them
    var c = teoria.chord(chord).simple();
    c.forEach(note => {
      playNote(note.toUpperCase() + octaveNumber);
    });
  }
}

/*
Creates a distortioncurve for the distortion effect
*/
function makeDistortionCurve(amount) {
  var n_samples = 44100,
    curve = new Float32Array(n_samples);

  for (var i = 0; i < n_samples; ++i) {
    var x = (i * 2) / n_samples - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

/*
Based on what switches are activated, the audio nodes have to be
connected different
*/
function pianoSwitches(checkedSwitch) {
  if (compActive && eqActive) {
    gainNode.connect(distortion);
    distortion.connect(compressor);
    compressor.connect(filter);
    filter.toMaster();
  } else if (!compActive && !eqActive) {
    compressor.disconnect();
    filter.disconnect();
    gainNode.connect(distortion);
    distortion.toMaster();
  } else if (!compActive && eqActive) {
    compressor.disconnect();
    gainNode.connect(distortion);
    distortion.connect(filter);
    filter.toMaster();
  } else if (compActive && !eqActive) {
    filter.disconnect();
    gainNode.connect(distortion);
    distortion.connect(compressor);
    compressor.toMaster();
  }
}
