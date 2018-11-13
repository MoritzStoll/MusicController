//schedule a series of notes, one per seco
var playNote = note => {
  playPianoNote(note);
};

//braucht den kompletten key um den richtigen synth zu stoppen
var stopNote = note => {
  stopPianoNote(note);
};

var playChord = chord => {
  var c = teoria.chord(chord).simple(); // Returns a Chord object, representing a Ab#5b9 chord
  playPianoChord(c);
};

var stopChord = chord => {
  var c = teoria.chord(chord).simple(); // Returns a Chord object, representing a Ab#5b9 chord
  stopPianoChord(c);
};
