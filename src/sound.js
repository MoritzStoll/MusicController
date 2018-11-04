
//schedule a series of notes, one per seco
var polySynths = [];
var monoSynths = [];
for (let i = 0; i < 16; i++) {
    polySynths[i] = new Tone.PolySynth(3, Tone.MonoSynth).toMaster();
    monoSynths[i] = new Tone.Synth().toMaster();
}


var playNote = (key) => {
    console.log("GamePad: " + key.gamepadKeyIndex)
    //Sobald Release Button eingebauzt ist nur noch Attack
    monoSynths[key.gamepadKeyIndex].triggerAttackRelease(key.note + '4', '8n', Tone.Time())
}

//braucht den kompletten key um den richtigen synth zu stoppen
var stopNote = (key) => {
    monoSynths[key.gamepadKeyIndex].triggerRelease();
}



var playChord = (key) => {
    var chord = teoria.chord(key.chord).simple();   // Returns a Chord object, representing a Ab#5b9 chord
    console.log(chord)
    var playableChord = []
    for (let i = 0; i < chord.length; i++) {
        playableChord = chord[i] + "2";
    }
    polySynths[key.gamepadKeyIndex].triggerAttackRelease(playableChord, '4n', Tone.Time())
}