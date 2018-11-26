function changeVolume(value) {
  value = value / 2 + 0.5;
  pianoGain.gain.value = value;
}

function changeTremolo(value) {
  value = value / 2 + 0.5;

  if (value < 0.5 && value > 0.49) {
    tremolo.wet.value = 0;
  } else {
    tremolo.wet.value = value;
  }
}
