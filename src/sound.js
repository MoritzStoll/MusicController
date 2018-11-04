
//schedule a series of notes, one per seco
var synths = [];

var synthtest = new Tone.PolySynth(3, Tone.MonoSynth).toMaster();
synthtest.triggerAttackRelease('C4', '4n', Tone.Time())

for (let i = 0; i < 16; i++) {
    synths[i] = new Tone.PolySynth(3, Tone.MonoSynth).toMaster();
}
var playNote = (key) => {
    console.log("GamePad: " + key.gamepadKeyIndex)
    //Sobald Release Button eingebauzt ist nur noch Attack
    synths[key.gamepadKeyIndex].triggerAttackRelease(key.note + '4', '8n', Tone.Time())
}

//braucht den kompletten key um den richtigen synth zu stoppen
var stopNote = (key) => {
    synths[key.gamepadKeyIndex].triggerRelease();
}
