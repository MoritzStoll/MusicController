let Tone = mm.Player.tone;
let sampleBaseUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699';
let reverb = new Tone.Convolver(
  `${sampleBaseUrl}/small-drum-room.wav`
).toMaster();
reverb.wet.value = 0.35;

let ready = false;
const TIME_HUMANIZATION = 0.01;

let midiDrums = [36, 38, 42, 46, 41, 43, 45, 49, 51];
let reverseMidiMapping = new Map([
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
let snarePanner = new Tone.Panner().connect(reverb);
new Tone.LFO(0.13, -0.25, 0.25).connect(snarePanner.pan).start();

let outputs = {
  internal: {
    play: (drumIdx, velocity, time) => {
      drumKit[drumIdx].get(velocity).start(time);
    }
  }
};

let drumKit = [
  new Tone.Players({
    high: `${sampleBaseUrl}/808-kick-vh.mp3`,
    med: `${sampleBaseUrl}/808-kick-vm.mp3`,
    low: `${sampleBaseUrl}/808-kick-vl.mp3`
  }).toMaster(),
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

let temperature = 1.0;
let rnn = new mm.MusicRNN(
  'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn'
);

rnn.initialize().then(() => {
  ready = true;
  //stopLoading();
  start();
});

let state = {
  patternLength: 32,
  seedLength: 4,
  swing: 0.55,
  pattern: null, //35 columns
  tempo: 120,
  startSeed: [[0], [], [2], []]
};

function start() {
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

let stepCounter = 0;
let oneEighth = Tone.Time('8n').toSeconds();

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

var clock = new Tone.Clock(function(time) {
  tick();
}, 4);

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

function getSeedPattern() {
  return state.startSeed;
}
