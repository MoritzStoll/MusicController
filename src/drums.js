TIME_HUMANIZATION = 0.01;

var state,
  Tone,
  sampleBaseUrl,
  reverb,
  context,
  gainNodeDrums,
  gainSlider,
  compressor,
  compressorSlider,
  distortionDrums,
  distortionSlider,
  filterDrums,
  filterDrumsSlider,
  drumCompSwitch,
  drumEqSwitch,
  drumMenu,
  compActive,
  eqActive,
  ready,
  midiDrums,
  reverseMidiMapping,
  snarePanner,
  outputs,
  drumKit,
  temperature,
  rnn,
  pattern,
  clock,
  stepCounter,
  oneEighth;

function initDrums() {
  //init global variables
  state = {
    patternLength: 32,
    seedLength: 4,
    swing: 0.55,
    pattern: null,
    tempo: 120,
    startSeed: [[0], [], [2], []]
  };
  Tone = mm.Player.tone;
  sampleBaseUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699';
  reverb = new Tone.Convolver(`${sampleBaseUrl}/small-drum-room.wav`);
  reverb.wet.value = 0.35;
  context = Tone.context;
  compActive = false;
  eqActive = false;
  ready = false;

  //drumMenu for postion of pattern
  drumMenu = document.getElementById('drumMenu');

  //init seed pattern for drums
  createSeedPattern();

  //drum active switch for eq and compressor
  drumCompSwitch = document.getElementById('drumCompSwitch').children[0];
  drumEqSwitch = document.getElementById('drumEqSwitch').children[0];
  drumCompSwitch.checked = false;
  drumEqSwitch.checked = false;

  //drums active switch listener
  drumCompSwitch.addEventListener('change', () => {
    compActive = !compActive;
    drumSwitches(drumCompSwitch, compActive);
  });
  drumEqSwitch.addEventListener('change', () => {
    eqActive = !eqActive;
    drumSwitches(drumEqSwitch, eqActive);
  });

  //create drum gain with default value = 1
  gainNodeDrums = context.createGain();
  gainNodeDrums.gain.value = 1;
  gainSlider = document.getElementById('drumGain');
  gainSlider.addEventListener('input', e => {
    gainNodeDrums.gain.value = e.srcElement.value;
  });

  //create drum compressor with default values
  compressorDrums = context.createDynamicsCompressor();
  compressorDrums.threshold.value = -24;
  compressorDrums.ratio.value = 12;
  compressorDrums.knee.value = 30;
  compressorDrums.attack.value = 0.003;
  compressorDrums.release.value = 0.25;
  compressorSlider = document.getElementById('drumCompressorSlider').children;

  for (let i = 0; i < compressorSlider.length; i++) {
    compressorSlider[i].addEventListener('input', e => {
      //ignore active switch checkbox input
      e.srcElement.id !== 'drumCompSwitchInput'
        ? (compressorDrums[e.srcElement.id].value = e.srcElement.value)
        : null;
    });
  }

  //create drum distortionDrums
  distortionDrums = context.createWaveShaper();
  distortionDrums.curve = makeDistortionCurve(0);
  distortionDrums.oversample = '4x';
  distortionSlider = document.getElementById('drumDistortion');

  distortionSlider.addEventListener('input', e => {
    distortionDrums.curve = makeDistortionCurve(parseInt(e.srcElement.value));
  });

  //create drum Equalizer
  filterDrums = context.createBiquadFilter();
  filterDrums.type = 'lowpass';
  filterDrums.frequency.value = 500;
  filterDrums.detune.value = 30;
  filterDrums.Q.value = 1;
  filterDrums.gain.value = 25;

  //compressor slider listener
  filterDrumsSlider = document.getElementById('drumEqualizerSlider').children;
  for (let i = 0; i < filterDrumsSlider.length; i++) {
    filterDrumsSlider[i].addEventListener('input', e => {
      filterDrums[e.srcElement.id].value = e.srcElement.value;
    });
  }

  //connect drum rever, gain & distortion
  reverb.connect(gainNodeDrums);
  gainNodeDrums.connect(distortionDrums);
  distortionDrums.toMaster();

  //create drum machine
  midiDrums = [36, 38, 42, 46, 41, 43, 45, 49, 51];
  reverseMidiMapping = new Map([
    [36, 0],
    [35, 0],
    [38, 1],
    [27, 1],
    [28, 1],
    [31, 1],
    [32, 1],
    [33, 1],
    [34, 1],
    [37, 1],
    [39, 1],
    [40, 1],
    [56, 1],
    [65, 1],
    [66, 1],
    [75, 1],
    [85, 1],
    [42, 2],
    [44, 2],
    [54, 2],
    [68, 2],
    [69, 2],
    [70, 2],
    [71, 2],
    [73, 2],
    [78, 2],
    [80, 2],
    [46, 3],
    [67, 3],
    [72, 3],
    [74, 3],
    [79, 3],
    [81, 3],
    [45, 4],
    [29, 4],
    [41, 4],
    [61, 4],
    [64, 4],
    [84, 4],
    [48, 5],
    [47, 5],
    [60, 5],
    [63, 5],
    [77, 5],
    [86, 5],
    [87, 5],
    [50, 6],
    [30, 6],
    [43, 6],
    [62, 6],
    [76, 6],
    [83, 6],
    [49, 7],
    [55, 7],
    [57, 7],
    [58, 7],
    [51, 8],
    [52, 8],
    [53, 8],
    [59, 8],
    [82, 8]
  ]);
  snarePanner = new Tone.Panner().connect(reverb);
  new Tone.LFO(0.13, -0.25, 0.25).connect(snarePanner.pan).start();
  outputs = {
    internal: {
      play: (drumIdx, velocity, time) => {
        drumKit[drumIdx].get(velocity).start(time);
      }
    }
  };

  //init drum sounds
  drumKit = [
    new Tone.Players({
      high: `${sampleBaseUrl}/808-kick-vh.mp3`,
      med: `${sampleBaseUrl}/808-kick-vm.mp3`,
      low: `${sampleBaseUrl}/808-kick-vl.mp3`
    }).connect(gainNodeDrums),
    new Tone.Players({
      high: `${sampleBaseUrl}/flares-snare-vh.mp3`,
      med: `${sampleBaseUrl}/flares-snare-vm.mp3`,
      low: `${sampleBaseUrl}/flares-snare-vl.mp3`
    }).connect(snarePanner),
    new Tone.Players({
      high: `${sampleBaseUrl}/808-hihat-vh.mp3`,
      med: `${sampleBaseUrl}/808-hihat-vm.mp3`,
      low: `${sampleBaseUrl}/808-hihat-vl.mp3`
    }).connect(new Tone.Panner(-0.5).connect(reverb)),
    new Tone.Players({
      high: `${sampleBaseUrl}/808-hihat-open-vh.mp3`,
      med: `${sampleBaseUrl}/808-hihat-open-vm.mp3`,
      low: `${sampleBaseUrl}/808-hihat-open-vl.mp3`
    }).connect(new Tone.Panner(-0.5).connect(reverb)),
    new Tone.Players({
      high: `${sampleBaseUrl}/slamdam-tom-low-vh.mp3`,
      med: `${sampleBaseUrl}/slamdam-tom-low-vm.mp3`,
      low: `${sampleBaseUrl}/slamdam-tom-low-vl.mp3`
    }).connect(new Tone.Panner(-0.4).connect(reverb)),
    new Tone.Players({
      high: `${sampleBaseUrl}/slamdam-tom-mid-vh.mp3`,
      med: `${sampleBaseUrl}/slamdam-tom-mid-vm.mp3`,
      low: `${sampleBaseUrl}/slamdam-tom-mid-vl.mp3`
    }).connect(reverb),
    new Tone.Players({
      high: `${sampleBaseUrl}/slamdam-tom-high-vh.mp3`,
      med: `${sampleBaseUrl}/slamdam-tom-high-vm.mp3`,
      low: `${sampleBaseUrl}/slamdam-tom-high-vl.mp3`
    }).connect(new Tone.Panner(0.4).connect(reverb)),
    new Tone.Players({
      high: `${sampleBaseUrl}/909-clap-vh.mp3`,
      med: `${sampleBaseUrl}/909-clap-vm.mp3`,
      low: `${sampleBaseUrl}/909-clap-vl.mp3`
    }).connect(new Tone.Panner(0.5).connect(reverb)),
    new Tone.Players({
      high: `${sampleBaseUrl}/909-rim-vh.wav`,
      med: `${sampleBaseUrl}/909-rim-vm.wav`,
      low: `${sampleBaseUrl}/909-rim-vl.wav`
    }).connect(new Tone.Panner(0.5).connect(reverb))
  ];

  //drum note type
  oneEighth = Tone.Time('8n').toSeconds();

  //drum sound temperature
  temperature = 1.0;

  //drum seed pazzern
  pattern = [[], [], [], []];

  //drum play clock
  clock = new Tone.Clock(function(time) {
    tick();
  }, 4);
  stepCounter = 0;

  //init music ai
  rnn = new mm.MusicRNN(
    'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn'
  );

  //stop loading screen if ai is ready
  rnn.initialize().then(() => {
    ready = true;
    stopLoading();
    startDrumMachine();
  });
}

function startDrumMachine() {
  state.pattern = state.startSeed.concat(_.times(state.patternLength, i => []));
  let seed = _.take(state.pattern, state.seedLength);
  return generatePattern(seed, state.patternLength - seed.length).then(
    result => {
      var sequence = toNoteSequence(result);
      state.pattern = fromNoteSequence(sequence, state.patternLength);
    }
  );
}

function humanizeTime(time) {
  return time - TIME_HUMANIZATION / 2 + Math.random() * TIME_HUMANIZATION;
}

function getStepVelocity(step) {
  if (step % 4 === 0) {
    return 'high';
  } else if (step % 2 === 0) {
    return 'med';
  } else {
    return 'low';
  }
}

function tick(time = Tone.now() - Tone.context.lookAhead) {
  if (_.isNumber(stepCounter) && state.pattern) {
    stepCounter++;

    let stepIdx = stepCounter % state.pattern.length;
    let isSwung = stepIdx % 2 !== 0;
    if (isSwung) {
      time += (state.swing - 0.5) * oneEighth;
    }
    let velocity = getStepVelocity(stepIdx);
    let drums = state.pattern[stepIdx];
    drums.forEach(d => {
      let humanizedTime = stepIdx === 0 ? time : humanizeTime(time);
      outputs['internal'].play(d, velocity, humanizedTime);
    });
  }
}

function playDrums() {
  ready && clock.start();
}

function stopDrums() {
  clock.stop();
}

function generatePattern(seed, length) {
  let seedSeq = toNoteSequence(seed);
  return rnn
    .continueSequence(seedSeq, length, temperature)
    .then(r => seed.concat(fromNoteSequence(r, length)));
}

function toNoteSequence(pattern) {
  return mm.sequences.quantizeNoteSequence(
    {
      ticksPerQuarter: 120,
      totalTime: pattern.length / 2,
      timeSignatures: [
        {
          time: 0,
          numerator: 4,
          denominator: 4
        }
      ],
      tempos: [
        {
          time: 0,
          qpm: 120
        }
      ],
      notes: _.flatMap(pattern, (step, index) =>
        step.map(d => ({
          pitch: midiDrums[d],
          startTime: index * 0.5,
          endTime: (index + 1) * 0.5
        }))
      )
    },
    1
  );
}

function fromNoteSequence(seq, patternLength) {
  let res = _.times(patternLength, () => []);
  for (let { pitch, quantizedStartStep } of seq.notes) {
    res[quantizedStartStep].push(reverseMidiMapping.get(pitch));
  }
  return res;
}

function setSeedPattern(pattern) {
  state.startSeed = pattern;
  start();
}

function createSeedPattern() {
  pattern = state.startSeed;
  let container = document.createElement('div');
  container.className = 'pattern';
  pattern.forEach((col, index) => {
    var col = document.createElement('div');
    col.className = 'col';
    for (let i = 0; i < 9; i++) {
      let pad = document.createElement('div');
      pad.className = 'pad';
      pad.id = `${index}_${i}`;
      if (pattern[index].includes(i)) {
        pad.style.background = 'white';
        pad.className += ' selected';
      }
      pad.addEventListener('click', e => {
        var colIndex = pad.id.charAt(0);
        var padIndex = pad.id.charAt(2);
        if (!pad.className.includes('selected')) {
          pad.style.background = 'white';
          pad.className += ' selected';
          pattern[colIndex].push(Number(padIndex));
        } else {
          pad.className = 'pad';
          pad.style.background = 'lightslategray';
          pattern[colIndex] = pattern[colIndex].filter(pad => pad != padIndex);
        }
        setSeedPattern(pattern);
      });

      col.appendChild(pad);
    }
    container.appendChild(col);
  });
  drumMenu.insertBefore(container, document.getElementById('firstDrumSound'));
}

function drumSwitches(checkedSwitch) {
  if (compActive && eqActive) {
    gainNodeDrums.connect(distortionDrums);
    distortionDrums.connect(compressorDrums);
    compressorDrums.connect(filterDrums);
    filterDrums.toMaster();
  } else if (!compActive && !eqActive) {
    compressorDrums.disconnect();
    filterDrums.disconnect();
    gainNodeDrums.connect(distortionDrums);
    distortionDrums.toMaster();
  } else if (!compActive && eqActive) {
    compressorDrums.disconnect();
    gainNodeDrums.connect(distortionDrums);
    distortionDrums.connect(filterDrums);
    filterDrums.toMaster();
  } else if (compActive && !eqActive) {
    filterDrums.disconnect();
    gainNodeDrums.connect(distortionDrums);
    distortionDrums.connect(compressorDrums);
    compressorDrums.toMaster();
  }
}
