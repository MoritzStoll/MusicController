WHITE_KEYS = 21;
BLACK_KEYS = 15;
MIN_OCTAVE = 3;
MAX_OCTAVE = 5;
let keys = [...document.getElementById("piano").children];
let white = keys.slice(0, 21);
let black = keys.slice(21, keys.length);
let notesWhite = ["C", "D", "E", "F", "G", "A", "B"];
let notesBlack = ["C#", "D#", "F#", "G#", "A#"];

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
    C3: "C3.[mp3|ogg]",
    "D#3": "Ds3.[mp3|ogg]",
    "F#3": "Fs3.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    "D#4": "Ds4.[mp3|ogg]",
    "F#4": "Fs4.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    C5: "C5.[mp3|ogg]",
    "D#5": "Ds5.[mp3|ogg]",
    "F#5": "Fs5.[mp3|ogg]",
    A5: "A5.[mp3|ogg]"
  },
  {
    release: 1,
    baseUrl: "./src/salamander/"
  }
).connect(tremolo);

function playNote(note) {
  let key = document.getElementById(note);
  console.log(key)
  key.style.opacity = 0.5;
  piano.triggerAttack(note);
  setTimeout(() => {
    key.style.opacity = 1;
  }, 100);
}

function stopPianoNote(note) {
  //piano.triggerRelease(note + "5");
}

function playChord(chord, octaveNumber) {
  var c = teoria.chord(chord).simple();
  c.forEach(note => {
    playNote(note.toUpperCase() + octaveNumber);
  });
}

function stopPianoChord(chord) {
  chord.forEach(note => {
    //piano.triggerRelease(note);
  });
}
