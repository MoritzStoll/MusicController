WHITE_KEYS = 21;
BLACK_KEYS = 15;
MIN_OCTAVE = 3;
MAX_OCTAVE = 5;
let keys = [...document.getElementById("piano").children];
let white = keys.slice(0, 21);
let black = keys.slice(21, keys.length);
let notesWhite = ["C", "D", "E", "F", "G", "A", "B"];
let notesBlack = ["C#", "D#", "F#", "G#", "A#"];
let sameNotes = {
  "CB": "B",
  "DB": "C#",
  "EB": "D#",
  "FB": "E",
  "GB": "F#",
  "AB": "G#",
  "BB": "A#",
  "C#": "DB",
  "D#": "EB",
  "E#": "F",
  "F#": "GB",
  "G#": "AB",
  "A#": "BB",
  "B#": "C",
  "C": "C",
  "D": "D",
  "E": "E",
  "F": "F",
  "G": "G",
  "A": "A",
  "B": "B",
  "H": "B"
}

white.reverse();
black.reverse();

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
  key.addEventListener("click", () => playNote(key.id));
});

var pianoGain = new Tone.Gain();
pianoGain.toMaster();

let tremolo = new Tone.Tremolo(9, 0.75).connect(pianoGain);
tremolo.start();

var piano = new Tone.Sampler(
  {
    C3: "C3.[wav]",
    "D#3": "Ds3.[wav]",
    "F#3": "Fs3.[wav]",
    A3: "A3.[wav]",
    C4: "C4.[wav]",
    "D#4": "Ds4.[wav]",
    "F#4": "Fs4.[wav]",
    A4: "A4.[wav]",
    C5: "C5.[wav]",
    "D#5": "Ds5.[wav]",
    "F#5": "Fs5.[wav]",
    A5: "A5.[wav]"
  },
  {
    release: 1,
    baseUrl: "./src/salamander/"
  }
).connect(tremolo);

function playNote(note) {
  if (note) {
    let key;
    if (note[1] == "B") {
      var note2 = note.slice(0,2)
      console.log(sameNotes[note2]+note[2])
      key = document.getElementById(sameNotes[note2] + note[2])
      console.log(key)

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

function stopPianoNote(note) {
  //piano.triggerRelease(note + "5");
}

function playChord(chord, octaveNumber) {

  if (chord) {
    var c = teoria.chord(chord).simple();
    console.log(c)
    c.forEach(note => {
      console.log(note)
      playNote(note.toUpperCase() + octaveNumber);
    });
  }
  
}

function stopPianoChord(chord) {
  chord.forEach(note => {
    //piano.triggerRelease(note);
  });
}
