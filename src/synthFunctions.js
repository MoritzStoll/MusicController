function changeVolume(value) {
    value = (value / 2) + 0.5
    pianoGain.gain.value = value
    console.log(value)
}