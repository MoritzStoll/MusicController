var synth = new Tone.Synth().toMaster();
synth.triggerAttackRelease("C4", "8n");


// Play Chords and Notes
var playNoteButton = document.getElementById("button1");
var playChordButton = document.getElementById("button2");

//DropdownMenus
var noteSelect = document.getElementById("noteSelect");
var chordSelect = document.getElementById("chordSelect")
var chordAddonSelect = document.getElementById("chordAddonSelect");
var octave = document.getElementById("octave")
//Eventlisteners for Buttons
playNoteButton.addEventListener("mousedown", function() {
    playNote(noteSelect.value + octave.value)
    console.log(noteSelect.value + octave.value)
});
playNoteButton.addEventListener("mouseup", function() {
    stopNote()
});


playChordButton.addEventListener("mousedown", function() {
    console.log(chordSelect.value + ", " + chordAddonSelect.value)
    playChord(chordSelect.value + chordAddonSelect.value + "")
});
playChordButton.addEventListener("mouseup", function() {
    stopChord();
});



function stopNote() {
    console.log("stop")
    synth.triggerRelease();
}

function playNote(note) {
    synth.triggerAttack(note)
}


function stopChord() {
    console.log("stop")
    for (let i = 0; i < oscillatorChords.length; i++) {
        gainNode.gain.linearRampToValueAtTime(0.000000001, context.currentTime + 0.03)
        oscillatorChords[i].stop();
        oscillatorChords[i] = null;
    }
    console.log(oscillatorChords)

}

function playChord(chord) {
    var chord = teoria.chord(chord)
    var notes = chord.notes();

    for (let i = 0; i < oscillatorChords.length; i++) {
        oscillatorChords[i] = context.createOscillator();
        oscillatorChords[i].frequency.value = notes[i].fq();
        oscillatorChords[i].connect(filter);
        gainNode.gain.linearRampToValueAtTime(0.9, context.currentTime + 0.03)
        oscillatorChords[i].start();
    }
    console.log(oscillatorChords)


 
}