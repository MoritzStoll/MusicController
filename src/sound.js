var context = new AudioContext();

var gainNode = context.createGain();


var oscillatorSingleNote;
var oscillatorChords = new Array(3);

//Um das Folgende anzusteuern brauchen wir noch slider auf der Website
var filter = context.createBiquadFilter();
var compressor = context.createDynamicsCompressor();

filter.connect(compressor);
compressor.connect(gainNode);
gainNode.connect(context.destination);
gainNode.gain.value = 0.9;
 


filter.type = "lowpass";
filter.frequency.value = 500;
filter.detune.value = 30;
filter.Q.value = 3;
filter.gain.value = 30;

compressor.threshold.value = -50;
compressor.ratio.value = 16;
compressor.knee.value = 30;
compressor.attack.value = 0;
compressor.release.value = 0.25;


// Play Chords and Notes
var playNoteButton = document.getElementById("button1");
var playChordButton = document.getElementById("button2");

//DropdownMenus
var noteSelect = document.getElementById("noteSelect");
var chordSelect = document.getElementById("chordSelect")
var chordAddonSelect = document.getElementById("chordAddonSelect");

//Eventlisteners for Buttons
playNoteButton.addEventListener("mousedown", function() {
    playNote(noteSelect.value)
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
    gainNode.gain.linearRampToValueAtTime(0.000000001, context.currentTime + 0.03)
    oscillatorSingleNote.stop();
}

function playNote(note) {
    var currentNote = teoria.note(note);
    oscillatorSingleNote = context.createOscillator();
    oscillatorSingleNote.frequency.value = currentNote.fq();
    console.log("Play Note" + currentNote.fq())
    gainNode.gain.linearRampToValueAtTime(0.9, context.currentTime + 0.03)
    oscillatorSingleNote.connect(filter)
    oscillatorSingleNote.start(context.currentTime);
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