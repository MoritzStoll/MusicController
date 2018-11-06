//schedule a series of notes, one per seco
var polySynths = [];
var monoSynths = [];
for (let i = 0; i < 16; i++) {
  polySynths[i] = new Tone.PolySynth(3, Tone.AMSynth).toMaster();
  monoSynths[i] = new Tone.AMSynth().toMaster();
}

var playNote = key => {
  console.log("GamePad: " + key.gamepadKeyIndex);
  //Sobald Release Button eingebauzt ist nur noch Attack
  monoSynths[key.gamepadKeyIndex].triggerAttack(key.note + "4", Tone.Time());
};

//braucht den kompletten key um den richtigen synth zu stoppen
var stopNote = key => {
  console.log("Stop", key);
  monoSynths[key.gamepadKeyIndex].triggerRelease();
};

var playChord = key => {
  var chord = teoria.chord(key.chord).simple(); // Returns a Chord object, representing a Ab#5b9 chord
  console.log(chord);
  var playableChord = [];
  for (let i = 0; i < chord.length; i++) {
    playableChord = chord[i] + "2";
  }
  polySynths[key.gamepadKeyIndex].triggerAttack(playableChord, Tone.Time());
};

var stopChord = key => {
  console.log("Stop Chord");

  var chord = teoria.chord(key.chord).simple(); // Returns a Chord object, representing a Ab#5b9 chord
  console.log(chord);
  var playableChord = [];
  for (let i = 0; i < chord.length; i++) {
    playableChord = chord[i] + "2";
  }
  polySynths[key.gamepadKeyIndex].triggerRelease(playableChord);
};
